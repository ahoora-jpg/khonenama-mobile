-- Demo-only seed data. Safe to delete before production.
insert into public.salons(id, slug, name, description, phone, address)
values (
  '00000000-0000-0000-0000-000000000001',
  'demo-salon',
  'آرایشگاه نمونه',
  'داده نمایشی برای تست اولیه محصول',
  '02100000000',
  'آدرس نمونه'
) on conflict (id) do nothing;

insert into public.salon_settings(salon_id)
values ('00000000-0000-0000-0000-000000000001')
on conflict (salon_id) do nothing;

insert into public.staff(id, salon_id, display_name, bio)
values (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'آرایشگر نمونه',
  'پروفایل نمایشی قابل حذف'
) on conflict (id) do nothing;

insert into public.services(id, salon_id, name, duration_minutes, sort_order) values
('00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000001','اصلاح مو',45,1),
('00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000001','اصلاح ریش',30,2),
('00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000001','اصلاح مو و ریش',60,3),
('00000000-0000-0000-0000-000000000104','00000000-0000-0000-0000-000000000001','پاکسازی پوست',45,4)
on conflict (id) do nothing;

insert into public.staff_services(staff_id, service_id)
select '00000000-0000-0000-0000-000000000002', id
from public.services
where salon_id = '00000000-0000-0000-0000-000000000001'
on conflict do nothing;

-- Postgres weekday: Sunday=0 ... Saturday=6. Friday=5 is closed in this demo.
insert into public.working_hours(salon_id, staff_id, weekday, is_open, open_time, close_time) values
('00000000-0000-0000-0000-000000000001',null,0,true,'09:00','20:00'),
('00000000-0000-0000-0000-000000000001',null,1,true,'09:00','20:00'),
('00000000-0000-0000-0000-000000000001',null,2,true,'09:00','20:00'),
('00000000-0000-0000-0000-000000000001',null,3,true,'09:00','20:00'),
('00000000-0000-0000-0000-000000000001',null,4,true,'09:00','20:00'),
('00000000-0000-0000-0000-000000000001',null,5,false,null,null),
('00000000-0000-0000-0000-000000000001',null,6,true,'09:00','20:00');
