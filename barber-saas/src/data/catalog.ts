import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';
import type { Salon, Service, Staff } from '@/src/types';

export async function getDefaultSalon(): Promise<Salon | null> {
  if (!isSupabaseConfigured) return null;
  const slug = process.env.EXPO_PUBLIC_DEFAULT_SALON_SLUG ?? 'demo-salon';
  const { data, error } = await supabase
    .from('salons')
    .select('id,slug,name,description,primary_color,logo_url,cover_url,phone,address')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  if (error) throw error;
  return data as Salon;
}

export async function getSalonServices(salonId: string): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return (data ?? []) as Service[];
}

export async function getSalonStaff(salonId: string): Promise<Staff[]> {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('display_name');
  if (error) throw error;
  return (data ?? []) as Staff[];
}
