export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled';

export type MembershipRole = 'owner' | 'staff';

export interface Salon {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  primary_color: string;
  logo_url: string | null;
  cover_url: string | null;
  phone: string | null;
  address: string | null;
}

export interface Service {
  id: string;
  salon_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number | null;
  is_active: boolean;
}

export interface Staff {
  id: string;
  salon_id: string;
  user_id: string | null;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  is_active: boolean;
}
