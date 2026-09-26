import { supabase } from '@/src/lib/supabase';

export interface AvailableSlot {
  start_at: string;
  end_at: string;
}

export async function getAvailableSlots(input: {
  salonId: string;
  staffId: string;
  serviceId: string;
  day: string;
}): Promise<AvailableSlot[]> {
  const { data, error } = await supabase.rpc('get_available_slots', {
    p_salon_id: input.salonId,
    p_staff_id: input.staffId,
    p_service_id: input.serviceId,
    p_day: input.day
  });
  if (error) throw error;
  return (data ?? []) as AvailableSlot[];
}

export async function bookAppointment(input: {
  salonId: string;
  staffId: string;
  serviceId: string;
  startAt: string;
  notes?: string;
}) {
  const { data, error } = await supabase.rpc('book_appointment', {
    p_salon_id: input.salonId,
    p_service_id: input.serviceId,
    p_staff_id: input.staffId,
    p_start_at: input.startAt,
    p_notes: input.notes ?? null
  });
  if (error) throw error;
  return data;
}
