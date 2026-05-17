import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy' });

const SYSTEM_PROMPT = `You are an intelligent hostel room allocation assistant.

Your task is to allocate the best possible room to a student based on:
- student preferences
- room availability
- compatibility
- budget
- room occupancy
- study environment
- personality match

Rules:
1. Never allocate full rooms (availability_status must be 'available')
2. Match budget carefully (room price must not exceed budget)
3. Match personality compatibility
4. Match study environment
5. Avoid smoker/non-smoker conflicts
6. Prioritize best compatibility

Return ONLY valid JSON in this exact format:
{
  "room_id": "uuid-of-best-room",
  "compatibility_score": 85,
  "reasons": ["reason 1", "reason 2", "reason 3"],
  "warnings": ["warning 1"]
}`;

function calculateLocalRecommendation(rooms: any[], prefs: any) {
  let bestRoom = rooms[0];
  let highestScore = -1;
  let bestReasons: string[] = [];
  let bestWarnings: string[] = [];

  for (const room of rooms) {
    let score = 70; // Baseline compatibility
    const reasons: string[] = [];
    const warnings: string[] = [];

    // 1. Budget check
    if (room.price <= prefs.budget) {
      const savings = prefs.budget - room.price;
      if (savings > 0) {
        score += 10;
        reasons.push(`Highly affordable! Saves you PKR ${savings.toLocaleString()}/month under your budget.`);
      } else {
        score += 5;
        reasons.push("Fits perfectly within your monthly budget.");
      }
    } else {
      score -= 20;
      warnings.push(`Slightly exceeds preferred budget of PKR ${prefs.budget.toLocaleString()}.`);
    }

    // 2. Room Type Match
    if (prefs.preferred_room_type) {
      if (room.category.toLowerCase().includes(prefs.preferred_room_type.toLowerCase())) {
        score += 15;
        reasons.push(`Matches your preferred room layout: ${room.category}.`);
      } else {
        score -= 10;
        warnings.push(`Not your preferred category (preferred ${prefs.preferred_room_type}, this is ${room.category}).`);
      }
    }

    // 3. AC Preference
    const hasAC = room.facilities?.some((f: string) => f.toUpperCase() === 'AC');
    if (prefs.ac_required) {
      if (hasAC) {
        score += 15;
        reasons.push("Equipped with Air Conditioning (AC) as requested.");
      } else {
        score -= 25;
        warnings.push("Does not have Air Conditioning (AC).");
      }
    } else if (!hasAC) {
      score += 5;
      reasons.push("Non-AC room aligns with your budget-focused preference.");
    }

    // 4. Quiet & Personality Preferences
    const isSingleOrPrivate = room.category.toLowerCase().includes('private') || room.category.toLowerCase().includes('single');
    if (prefs.quiet_environment) {
      if (isSingleOrPrivate) {
        score += 10;
        reasons.push("Private setting offers a quiet, noise-free study environment.");
      } else if (room.total_beds >= 3) {
        score -= 10;
        warnings.push("Shared room (3+ beds) may have occasional noise.");
      }
    }

    if (prefs.personality_type === 'introvert') {
      if (isSingleOrPrivate) {
        score += 10;
        reasons.push("Excellent match for your introvert personality, offering maximum privacy.");
      }
    } else if (prefs.personality_type === 'extrovert') {
      if (room.total_beds >= 2) {
        score += 10;
        reasons.push("Shared room offers great opportunities for socializing with roommates.");
      }
    }

    // 5. Floor Preference
    if (prefs.floor_preference) {
      if (Number(room.floor) === Number(prefs.floor_preference)) {
        score += 10;
        reasons.push(`Located on your preferred Floor ${room.floor}.`);
      } else {
        warnings.push(`Located on Floor ${room.floor} instead of preferred Floor ${prefs.floor_preference}.`);
      }
    }

    // Cap score at 98% and min at 50%
    score = Math.max(50, Math.min(98, score));

    if (score > highestScore) {
      highestScore = score;
      bestRoom = room;
      bestReasons = reasons;
      bestWarnings = warnings;
    }
  }

  // Add default reason if empty
  if (bestReasons.length === 0) {
    bestReasons.push("Generally matches your specified criteria and room category.");
  }

  return {
    room: bestRoom,
    compatibility_score: highestScore,
    reasons: bestReasons,
    warnings: bestWarnings
  };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      student_id,
      budget,
      preferred_room_type,
      ac_required,
      quiet_environment,
      smoking_preference,
      study_preference,
      personality_type,
      floor_preference,
      special_notes,
    } = body;

    // Save preferences
    await supabase.from('ai_preferences').upsert({
      student_id,
      budget,
      preferred_room_type: preferred_room_type || null,
      ac_required,
      quiet_environment,
      smoking_preference,
      study_preference,
      personality_type: personality_type || null,
      floor_preference: floor_preference || null,
      special_notes: special_notes || null,
    }, { onConflict: 'student_id' });

    // Fetch available rooms
    const { data: rooms } = await supabase
      .from('rooms')
      .select('*')
      .eq('availability_status', 'available')
      .lte('price', budget);

    if (!rooms || rooms.length === 0) {
      return NextResponse.json({ error: 'No rooms available within your budget.' }, { status: 404 });
    }

    let recommendedRoom;
    let compatibility_score = 75;
    let reasons: string[] = [];
    let warnings: string[] = [];

    const isDummyKey = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('your_') || process.env.OPENAI_API_KEY === 'dummy';

    if (isDummyKey) {
      console.warn('OpenAI API key is a placeholder. Using local allocation algorithm.');
      const localResult = calculateLocalRecommendation(rooms, body);
      recommendedRoom = localResult.room;
      compatibility_score = localResult.compatibility_score;
      reasons = localResult.reasons;
      warnings = localResult.warnings;
    } else {
      try {
        const prompt = `
Student Preferences:
- Budget: PKR ${budget}/month
- Preferred Room Type: ${preferred_room_type || 'No preference'}
- AC Required: ${ac_required}
- Quiet Environment: ${quiet_environment}
- Non-Smoking: ${!smoking_preference}
- Study Focused: ${study_preference}
- Personality Type: ${personality_type || 'Unknown'}
- Floor Preference: ${floor_preference || 'No preference'}
- Special Notes: ${special_notes || 'None'}

Available Rooms:
${JSON.stringify(rooms, null, 2)}

Select the best room from the available rooms above.`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        });

        const raw = completion.choices[0]?.message?.content;
        if (!raw) throw new Error('No response from AI');

        const aiResult = JSON.parse(raw);
        recommendedRoom = rooms.find(r => r.id === aiResult.room_id) || rooms[0];
        compatibility_score = aiResult.compatibility_score || 75;
        reasons = aiResult.reasons || [];
        warnings = aiResult.warnings || [];
      } catch (openaiErr) {
        console.error('OpenAI Error, falling back to local recommendation:', openaiErr);
        const localResult = calculateLocalRecommendation(rooms, body);
        recommendedRoom = localResult.room;
        compatibility_score = localResult.compatibility_score;
        reasons = localResult.reasons;
        warnings = localResult.warnings;
      }
    }

    return NextResponse.json({
      room: recommendedRoom,
      compatibility_score,
      reasons,
      warnings,
    });
  } catch (err: unknown) {
    console.error('AI Recommend General Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AI service error' },
      { status: 500 }
    );
  }
}
