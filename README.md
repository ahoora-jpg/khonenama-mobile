# خونه‌نما موبایل

نسخه ۱.۲.۸ با تمرکز بر صاحب کسب‌وکار: ورود مستقیم به پنل، پیش‌نمایش و ویرایش غرفه، عکس و ویدیو، خدمات و محدوده فعالیت و صندوق درخواست‌های واقعی. مرور عمومی نیز از مسیر جدا قابل دسترسی است.

## اجرای محلی

```bash
npm ci
npm run typecheck
npx expo start
```

آدرس API از `EXPO_PUBLIC_API_URL` خوانده می‌شود و مقدار پیش‌فرض `https://khonenama.ir` است. درخواست‌ها Timeout دوازده‌ثانیه‌ای و حالت خطای قابل بازیابی دارند.

## وضعیت اتصال Backend

جست‌وجو و پروفایل عمومی از APIهای `/api/v1/businesses` استفاده می‌کنند. ورود، ثبت کسب‌وکار، داشبورد، درخواست‌ها، پیشنهاد قیمت، وضعیت نمایش، ویرایش پروفایل، حذف حساب و اعلان درخواست جدید به APIهای واقعی `khonenama.ir` متصل هستند. اپ هیچ مشتری یا گفت‌وگوی ساختگی در پنل صاحب کسب‌وکار نمایش نمی‌دهد.

اعلان فقط بعد از ورود صاحب کسب‌وکار و اجازهٔ صریح او فعال می‌شود. لمس اعلان، جزئیات همان درخواست را با Deep Link داخلی باز می‌کند.

## APK مستقل

Workflow با نام `Build Khonenama Android Release` نسخه `assembleRelease` می‌سازد؛ بنابراین JavaScript و Assets داخل APK قرار می‌گیرند و برنامه برخلاف APK Debug به Metro Server وابسته نیست. خروجی با نام `khonenama-production.apk` در GitHub Releases منتشر می‌شود.

امضای دائمی Production در GitHub Secrets نگهداری می‌شود و اثر انگشت گواهی در Workflow کنترل می‌شود.

## بسته Google Play

Workflow با نام `Build Android Store Bundle` فایل AAB امضاشده را می‌سازد و به‌عنوان Artifact نگه می‌دارد. قبل از هر Release این دستورات باید سبز باشند:

```bash
npm run typecheck
npm run lint
npm run validate:release
npx expo-doctor
```

متن فروشگاه، Data Safety، Content Rating و برنامه Closed Test در پوشه `store/` قرار دارند.

## وضعیت اعلان و ساخت ۱.۲.۸

کد صف ارسال، تلاش مجدد و رسید سرویس روی سایت منتشر شده است. دریافت روی گوشی هنوز آزمون نشده. فایل google-services.json باید برای ir.khonenama.app تنظیم شود و اعتبار FCM V1 در پروژه Expo ثبت شود. app.config.ts مسیر GOOGLE_SERVICES_JSON را می‌خواند؛ REQUIRE_PUSH_CONFIG=1 ساخت بدون تنظیم Firebase را متوقف می‌کند. کلید خصوصی سرویس را در Git ثبت نکنید. این دستگاه در EAS وارد حساب نیست؛ ساخت نسخه نصب‌شدنی نیازمند ورود معتبر است. موفقیت Expo export صرفاً بسته JavaScript است و APK نیست.
