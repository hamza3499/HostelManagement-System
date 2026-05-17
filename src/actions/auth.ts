'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function signUp(formData: {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.full_name,
        phone: formData.phone || null,
        role: 'student',
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'Check your email to verify your account.' };
}

export async function signIn(formData: { email: string; password: string }) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return { error: error.message };
  }

  // Get user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  const role = profile?.role || 'student';

  // Set the user role in a secure cookie for ultra-fast middleware performance
  const cookieStore = await cookies();
  cookieStore.set('hms-user-role', role, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    secure: true,
    sameSite: 'lax',
  });

  revalidatePath('/', 'layout');

  if (role === 'admin') {
    redirect('/admin');
  } else {
    redirect('/student/dashboard');
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Delete the cached role cookie
  const cookieStore = await cookies();
  cookieStore.delete('hms-user-role');

  revalidatePath('/', 'layout');
  redirect('/auth/login');
}

export async function forgotPassword(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'Password reset email sent. Check your inbox.' };
}

export async function resetPassword(password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect('/auth/login');
}

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}
