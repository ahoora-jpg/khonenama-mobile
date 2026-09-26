# Architecture

## تصمیم‌های پایه

- Mobile app: React Native + Expo Router
- Backend: Supabase (Postgres + Auth + RLS + Edge Functions when needed)
- SaaS model: shared database / shared schema with mandatory `salon_id` on tenant-owned tables
- Authorization: RLS at database level, not UI-only checks
- Booking consistency: database constraint/transaction must prevent overlapping appointments
- Notifications: asynchronous provider adapter; push first, SMS pluggable later

## Tenant isolation

هر داده عملیاتی متعلق به یک سالن باید `salon_id` داشته باشد. دسترسی مالک/پرسنل فقط از طریق `salon_memberships` مجاز می‌شود. Super Admin نقش platform-level دارد و باید جدا از نقش سالن نگهداری شود.

## Domain modules

- Identity & Auth
- Tenants / Salons
- Memberships & Staff
- Services
- Availability & Working Hours
- Appointments
- Customers
- News & Gallery
- Notifications
- Subscriptions

## قواعد رزرو

1. مدت پایان نوبت از `service.duration_minutes` محاسبه می‌شود.
2. نوبت‌های pending و confirmed نباید برای یک staff overlap داشته باشند.
3. blocked time و holiday باید قبل از درج نوبت کنترل شوند.
4. همه تغییرات حساس از طریق database transaction/RPC انجام می‌شوند.
5. owner می‌تواند manual booking بسازد، اما همان قواعد تداخل روی آن اعمال می‌شود.

## مسیر تجاری‌سازی

هویت سالن hardcode نمی‌شود. برند، رنگ، لوگو، سرویس‌ها، پرسنل، خبرها و تنظیمات از tenant config خوانده می‌شوند تا محصول برای سالن جدید بدون تغییر source code فعال شود.
