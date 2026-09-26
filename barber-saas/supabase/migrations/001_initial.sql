create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create type public.platform_role as enum ('user', 'super_admin');
create type public.membership_role as enum ('owner', 'staff');
create type public.appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled');
create type public.subscription_status as enum ('trial', 'active', 'past_due', 'cancelled', 'suspended');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  platform_role public.platform_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.salons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  logo_url text,
  cover_url text,
  primary_color text not null default '#111111',
  secondary_color text not null default '#F7F7F5',
  phone text,
  address text,
  timezone text not null default 'Asia/Tehran',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.salon_memberships (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.membership_role not null,
  created_at timestamptz not null default now(),
  unique (salon_id, user_id)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes integer not null check (duration_minutes between 5 and 720),
  price numeric(12,2),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.staff (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  display_name text not null,
  bio text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (salon_id, user_id)
);

create table public.staff_services (
  staff_id uuid not null references public.staff(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (staff_id, service_id)
);

create table public.working_hours (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  staff_id uuid references public.staff(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  is_open boolean not null default true,
  open_time time,
  close_time time,
  check ((is_open = false) or (open_time is not null and close_time is not null and close_time > open_time))
);

create index working_hours_lookup_idx on public.working_hours(salon_id, staff_id, weekday);

create table public.holidays (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  day date not null,
  title text,
  is_closed boolean not null default true,
  unique (salon_id, day)
);

create table public.blocked_times (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  staff_id uuid references public.staff(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check (end_at > start_at)
);

create index blocked_times_lookup_idx on public.blocked_times(salon_id, staff_id, start_at, end_at);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (salon_id, user_id)
);

create index customers_phone_idx on public.customers(salon_id, phone);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  staff_id uuid not null references public.staff(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status public.appointment_status not null default 'pending',
  source text not null default 'customer' check (source in ('customer', 'admin')),
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at > start_at)
);

alter table public.appointments
  add constraint appointments_no_overlap
  exclude using gist (
    salon_id with =,
    staff_id with =,
    tstzrange(start_at, end_at, '[)') with &&
  ) where (status in ('pending', 'confirmed', 'rescheduled'));

create index appointments_salon_start_idx on public.appointments(salon_id, start_at);
create index appointments_customer_idx on public.appointments(customer_id, start_at desc);
create index appointments_staff_idx on public.appointments(staff_id, start_at);

create table public.news (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  title text not null,
  body text not null,
  image_url text,
  is_pinned boolean not null default false,
  publish_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.gallery (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  image_url text not null,
  caption text,
  category text,
  published_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references public.salons(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  kind text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.salon_settings (
  salon_id uuid primary key references public.salons(id) on delete cascade,
  require_booking_confirmation boolean not null default true,
  allow_customer_cancel boolean not null default true,
  cancel_before_minutes integer not null default 180,
  slot_interval_minutes integer not null default 15 check (slot_interval_minutes in (5, 10, 15, 20, 30, 60)),
  reminder_minutes integer[] not null default array[1440, 180],
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null unique references public.salons(id) on delete cascade,
  plan_code text not null default 'basic',
  status public.subscription_status not null default 'trial',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles(id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.phone
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.platform_role = 'super_admin'
  );
$$;

create or replace function public.has_salon_role(target_salon uuid, allowed_roles public.membership_role[])
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select public.is_super_admin() or exists (
    select 1 from public.salon_memberships m
    where m.salon_id = target_salon
      and m.user_id = auth.uid()
      and m.role = any(allowed_roles)
  );
$$;

create or replace function public.validate_appointment()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_duration integer;
  v_timezone text;
begin
  select s.duration_minutes into v_duration
  from public.services s
  where s.id = new.service_id and s.salon_id = new.salon_id and s.is_active;

  if v_duration is null then
    raise exception 'Invalid service for salon';
  end if;

  if not exists (select 1 from public.staff st where st.id = new.staff_id and st.salon_id = new.salon_id and st.is_active) then
    raise exception 'Invalid staff for salon';
  end if;

  if not exists (select 1 from public.customers c where c.id = new.customer_id and c.salon_id = new.salon_id) then
    raise exception 'Invalid customer for salon';
  end if;

  new.end_at := new.start_at + make_interval(mins => v_duration);

  if exists (
    select 1 from public.blocked_times b
    where b.salon_id = new.salon_id
      and (b.staff_id is null or b.staff_id = new.staff_id)
      and tstzrange(b.start_at, b.end_at, '[)') && tstzrange(new.start_at, new.end_at, '[)')
  ) then
    raise exception 'Requested time is blocked';
  end if;

  select timezone into v_timezone from public.salons where id = new.salon_id;
  if exists (
    select 1 from public.holidays h
    where h.salon_id = new.salon_id
      and h.is_closed
      and h.day = (new.start_at at time zone v_timezone)::date
  ) then
    raise exception 'Salon is closed on requested day';
  end if;

  return new;
end;
$$;

create trigger appointments_validate_before_write
before insert or update of salon_id, customer_id, staff_id, service_id, start_at
on public.appointments
for each row execute procedure public.validate_appointment();

create or replace function public.book_appointment(
  p_salon_id uuid,
  p_service_id uuid,
  p_staff_id uuid,
  p_start_at timestamptz,
  p_notes text default null
)
returns public.appointments
language plpgsql
security definer set search_path = public
as $$
declare
  v_customer public.customers;
  v_profile public.profiles;
  v_appointment public.appointments;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (select 1 from public.salons where id = p_salon_id and is_active) then
    raise exception 'Salon is unavailable';
  end if;

  select * into v_profile from public.profiles where id = auth.uid();

  insert into public.customers(salon_id, user_id, full_name, phone)
  values (
    p_salon_id,
    auth.uid(),
    coalesce(nullif(v_profile.full_name, ''), 'مشتری'),
    coalesce(nullif(v_profile.phone, ''), auth.jwt() ->> 'phone')
  )
  on conflict (salon_id, user_id)
  do update set
    full_name = excluded.full_name,
    phone = coalesce(excluded.phone, public.customers.phone),
    updated_at = now()
  returning * into v_customer;

  insert into public.appointments(
    salon_id, customer_id, staff_id, service_id, start_at, end_at, status, source, notes, created_by
  )
  values (
    p_salon_id, v_customer.id, p_staff_id, p_service_id, p_start_at, p_start_at + interval '5 minutes',
    'pending', 'customer', p_notes, auth.uid()
  )
  returning * into v_appointment;

  return v_appointment;
end;
$$;

create or replace function public.get_available_slots(
  p_salon_id uuid,
  p_staff_id uuid,
  p_service_id uuid,
  p_day date
)
returns table(start_at timestamptz, end_at timestamptz)
language plpgsql
stable
security definer set search_path = public
as $$
declare
  v_duration integer;
  v_timezone text;
  v_open time;
  v_close time;
  v_interval integer;
  v_open_ts timestamptz;
  v_close_ts timestamptz;
begin
  select sv.duration_minutes into v_duration
  from public.services sv
  where sv.id = p_service_id and sv.salon_id = p_salon_id and sv.is_active;

  select s.timezone into v_timezone from public.salons s where s.id = p_salon_id and s.is_active;
  select coalesce(ss.slot_interval_minutes, 15) into v_interval from public.salon_settings ss where ss.salon_id = p_salon_id;
  v_interval := coalesce(v_interval, 15);

  if v_duration is null or v_timezone is null then return; end if;
  if not exists (select 1 from public.staff st where st.id = p_staff_id and st.salon_id = p_salon_id and st.is_active) then return; end if;
  if exists (select 1 from public.holidays h where h.salon_id = p_salon_id and h.day = p_day and h.is_closed) then return; end if;

  select wh.open_time, wh.close_time into v_open, v_close
  from public.working_hours wh
  where wh.salon_id = p_salon_id
    and wh.weekday = extract(dow from p_day)::smallint
    and wh.is_open
    and (wh.staff_id = p_staff_id or wh.staff_id is null)
  order by (wh.staff_id is not null) desc
  limit 1;

  if v_open is null or v_close is null then return; end if;

  v_open_ts := (p_day + v_open) at time zone v_timezone;
  v_close_ts := (p_day + v_close) at time zone v_timezone;

  return query
  select slot as start_at, slot + make_interval(mins => v_duration) as end_at
  from generate_series(
    v_open_ts,
    v_close_ts - make_interval(mins => v_duration),
    make_interval(mins => v_interval)
  ) slot
  where slot >= now()
    and not exists (
      select 1 from public.blocked_times b
      where b.salon_id = p_salon_id
        and (b.staff_id is null or b.staff_id = p_staff_id)
        and tstzrange(b.start_at, b.end_at, '[)') && tstzrange(slot, slot + make_interval(mins => v_duration), '[)')
    )
    and not exists (
      select 1 from public.appointments a
      where a.salon_id = p_salon_id
        and a.staff_id = p_staff_id
        and a.status in ('pending', 'confirmed', 'rescheduled')
        and tstzrange(a.start_at, a.end_at, '[)') && tstzrange(slot, slot + make_interval(mins => v_duration), '[)')
    )
  order by slot;
end;
$$;

alter table public.profiles enable row level security;
alter table public.salons enable row level security;
alter table public.salon_memberships enable row level security;
alter table public.services enable row level security;
alter table public.staff enable row level security;
alter table public.staff_services enable row level security;
alter table public.working_hours enable row level security;
alter table public.holidays enable row level security;
alter table public.blocked_times enable row level security;
alter table public.customers enable row level security;
alter table public.appointments enable row level security;
alter table public.news enable row level security;
alter table public.gallery enable row level security;
alter table public.notifications enable row level security;
alter table public.salon_settings enable row level security;
alter table public.subscriptions enable row level security;

create policy profiles_self_read on public.profiles for select using (id = auth.uid() or public.is_super_admin());
create policy profiles_self_update on public.profiles for update using (id = auth.uid() or public.is_super_admin()) with check (id = auth.uid() or public.is_super_admin());

create policy salons_public_read on public.salons for select using (is_active or public.is_super_admin() or public.has_salon_role(id, array['owner','staff']::public.membership_role[]));
create policy salons_owner_write on public.salons for update using (public.has_salon_role(id, array['owner']::public.membership_role[])) with check (public.has_salon_role(id, array['owner']::public.membership_role[]));

create policy memberships_member_read on public.salon_memberships for select using (user_id = auth.uid() or public.has_salon_role(salon_id, array['owner']::public.membership_role[]));
create policy memberships_owner_write on public.salon_memberships for all using (public.has_salon_role(salon_id, array['owner']::public.membership_role[])) with check (public.has_salon_role(salon_id, array['owner']::public.membership_role[]));

create policy services_public_read on public.services for select using (is_active or public.has_salon_role(salon_id, array['owner','staff']::public.membership_role[]));
create policy services_owner_write on public.services for all using (public.has_salon_role(salon_id, array['owner']::public.membership_role[])) with check (public.has_salon_role(salon_id, array['owner']::public.membership_role[]));

create policy staff_public_read on public.staff for select using (is_active or public.has_salon_role(salon_id, array['owner','staff']::public.membership_role[]));
create policy staff_owner_write on public.staff for all using (public.has_salon_role(salon_id, array['owner']::public.membership_role[])) with check (public.has_salon_role(salon_id, array['owner']::public.membership_role[]));

create policy staff_services_public_read on public.staff_services for select using (exists (select 1 from public.staff st where st.id = staff_id and st.is_active));
create policy staff_services_owner_write on public.staff_services for all using (exists (select 1 from public.staff st where st.id = staff_id and public.has_salon_role(st.salon_id, array['owner']::public.membership_role[]))) with check (exists (select 1 from public.staff st where st.id = staff_id and public.has_salon_role(st.salon_id, array['owner']::public.membership_role[])));

create policy working_hours_public_read on public.working_hours for select using (true);
create policy working_hours_owner_write on public.working_hours for all using (public.has_salon_role(salon_id, array['owner']::public.membership_role[])) with check (public.has_salon_role(salon_id, array['owner']::public.membership_role[]));
create policy holidays_public_read on public.holidays for select using (true);
create policy holidays_owner_write on public.holidays for all using (public.has_salon_role(salon_id, array['owner']::public.membership_role[])) with check (public.has_salon_role(salon_id, array['owner']::public.membership_role[]));

create policy blocked_members_read on public.blocked_times for select using (public.has_salon_role(salon_id, array['owner','staff']::public.membership_role[]));
create policy blocked_members_write on public.blocked_times for all using (public.has_salon_role(salon_id, array['owner','staff']::public.membership_role[])) with check (public.has_salon_role(salon_id, array['owner','staff']::public.membership_role[]));

create policy customers_read on public.customers for select using (user_id = auth.uid() or public.has_salon_role(salon_id, array['owner','staff']::public.membership_role[]));
create policy customers_member_write on public.customers for all using (public.has_salon_role(salon_id, array['owner','staff']::public.membership_role[])) with check (public.has_salon_role(salon_id, array['owner','staff']::public.membership_role[]));

create policy appointments_read on public.appointments for select using (
  public.has_salon_role(salon_id, array['owner','staff']::public.membership_role[])
  or exists (select 1 from public.customers c where c.id = customer_id and c.user_id = auth.uid())
);
create policy appointments_member_write on public.appointments for all using (public.has_salon_role(salon_id, array['owner','staff']::public.membership_role[])) with check (public.has_salon_role(salon_id, array['owner','staff']::public.membership_role[]));

create policy news_public_read on public.news for select using (publish_at <= now() and (expires_at is null or expires_at > now()));
create policy news_owner_write on public.news for all using (public.has_salon_role(salon_id, array['owner']::public.membership_role[])) with check (public.has_salon_role(salon_id, array['owner']::public.membership_role[]));
create policy gallery_public_read on public.gallery for select using (true);
create policy gallery_owner_write on public.gallery for all using (public.has_salon_role(salon_id, array['owner']::public.membership_role[])) with check (public.has_salon_role(salon_id, array['owner']::public.membership_role[]));

create policy notifications_user_read on public.notifications for select using (user_id = auth.uid() or public.is_super_admin());
create policy notifications_user_update on public.notifications for update using (user_id = auth.uid() or public.is_super_admin()) with check (user_id = auth.uid() or public.is_super_admin());

create policy settings_public_read on public.salon_settings for select using (true);
create policy settings_owner_write on public.salon_settings for all using (public.has_salon_role(salon_id, array['owner']::public.membership_role[])) with check (public.has_salon_role(salon_id, array['owner']::public.membership_role[]));
create policy subscriptions_owner_read on public.subscriptions for select using (public.has_salon_role(salon_id, array['owner']::public.membership_role[]) or public.is_super_admin());
create policy subscriptions_admin_write on public.subscriptions for all using (public.is_super_admin()) with check (public.is_super_admin());

grant execute on function public.book_appointment(uuid, uuid, uuid, timestamptz, text) to authenticated;
grant execute on function public.get_available_slots(uuid, uuid, uuid, date) to anon, authenticated;
