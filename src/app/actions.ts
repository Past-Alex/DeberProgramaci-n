'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createHabit(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const name = formData.get('name') as string;
  const color = formData.get('color') as string;

  if (!name || !color) {
    throw new Error('Missing required fields');
  }

  const { data, error } = await supabase.from('habits').insert({
    name,
    color,
    user_id: user.id
  }).select().single();

  if (error) {
    throw new Error('Failed to create habit: ' + error.message);
  }

  // Refresh dashboard and explorar pages
  revalidatePath('/dashboard');
  revalidatePath('/explorar');

  return data;
}

export async function updateHabit(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const color = formData.get('color') as string;

  if (!id || !name || !color) {
    throw new Error('Missing required fields');
  }

  const { error } = await supabase
    .from('habits')
    .update({ name, color })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error('Failed to update habit: ' + error.message);
  }

  revalidatePath('/dashboard');
  revalidatePath(`/habito/${id}`);
  revalidatePath('/explorar');
}

export async function deleteHabit(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const id = formData.get('id') as string;

  if (!id) {
    throw new Error('Missing habit id');
  }

  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error('Failed to delete habit: ' + error.message);
  }

  revalidatePath('/dashboard');
  revalidatePath('/explorar');
}
