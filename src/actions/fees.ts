'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getContentType(ext?: string) {
  switch (ext?.toLowerCase()) {
    case 'pdf': return 'application/pdf';
    case 'png': return 'image/png';
    case 'webp': return 'image/webp';
    default: return 'image/jpeg';
  }
}

export async function uploadFeeProofAction(feeId: string, base64Data: string, fileName: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Verify the fee record exists, belongs to the student, and is unpaid/rejected
    const { data: fee, error: feeError } = await supabase
      .from('fees')
      .select('*')
      .eq('id', feeId)
      .single();

    if (feeError || !fee) {
      return { error: 'Fee record not found' };
    }

    if (fee.student_id !== user.id) {
      return { error: 'Unauthorized' };
    }

    if (fee.payment_status !== 'unpaid' && fee.payment_status !== 'rejected') {
      return { error: 'This fee is already paid or pending verification' };
    }

    // Convert base64 data to buffer
    const buffer = Buffer.from(base64Data, 'base64');
    const ext = fileName.split('.').pop();
    // Unique timestamped path to prevent overrides and cache issues
    const path = `${user.id}/${feeId}-${Date.now()}.${ext}`;

    // Initialize admin client with service role key to completely bypass storage RLS checks
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log(`Uploading fee proof to storage at path: ${path}`);
    const { error: uploadError } = await adminClient.storage
      .from('payment-screenshots')
      .upload(path, buffer, {
        contentType: getContentType(ext),
        duplex: 'half'
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { error: 'Storage Upload Failed: ' + uploadError.message };
    }

    // Get the public url
    const { data: urlData } = adminClient.storage
      .from('payment-screenshots')
      .getPublicUrl(path);

    console.log(`Updating database for fee ${feeId} with URL ${urlData.publicUrl}`);
    const { error: updateError } = await adminClient
      .from('fees')
      .update({
        transaction_screenshot: urlData.publicUrl,
        payment_status: 'pending_verification',
      })
      .eq('id', feeId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return { error: 'Database Update Failed: ' + updateError.message };
    }

    revalidatePath('/student/fees');
    return { success: true, publicUrl: urlData.publicUrl };
  } catch (err: unknown) {
    console.error('Action error:', err);
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred' };
  }
}
