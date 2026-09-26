# Barber SaaS

اپ نوبت‌دهی فارسی و RTL برای آرایشگاه‌ها با معماری multi-tenant / white-label.

## وضعیت

Phase 1 bootstrap روی شاخه `barber-saas-bootstrap` ایجاد شده تا بدون دست‌زدن به پروژه اصلی Khonenama توسعه شروع شود. هدف نهایی انتقال این پوشه به یک repository مستقل است.

## پشته فنی

- Expo SDK 57 + React Native + TypeScript
- Expo Router
- Supabase Auth + Postgres + Row Level Security
- Mobile-first, RTL, Persian UI

## اجرای محلی

```bash
cd barber-saas
cp .env.example .env
npm install
npm run start
```

متغیرهای محیطی:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_DEFAULT_SALON_SLUG=demo-salon
```

## اولویت‌های MVP

1. ورود با شماره موبایل
2. tenant isolation
3. خدمات و پرسنل
4. ساعات کاری و زمان‌های مسدود
5. رزرو با جلوگیری از double booking
6. پنل آرایشگر و ثبت دستی نوبت
7. اخبار، گالری و اعلان‌ها
8. Super Admin و subscription readiness

جزئیات در `docs/PRODUCT_SPEC.md` و `docs/ARCHITECTURE.md` است.
