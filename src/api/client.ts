import type { BusinessDetail, BusinessSummary } from "../types";
import { apiEndpoint } from "./endpoint";

export const API_BASE = process.env.EXPO_PUBLIC_API_URL || "https://khonenama.ir";

export class ApiError extends Error {
  constructor(public code: string, public status: number) {
    super(errorMessage(code, status));
  }
}

const errorMessages: Record<string, string> = {
  QUOTE_CHANGED: "قیمت یا مدت تغییر کرده؛ اشتراک‌ها را تازه کنید و دوباره مبلغ را بررسی کنید.",
  PAYMENT_PROVIDER_NOT_CONFIGURED: "درگاه هنوز فعال نشده است.",
  PLAN_PRICING_NOT_ACTIVE: "قیمت این اشتراک هنوز نهایی نشده است.",
  LOWER_PLAN_ACTIVE: "اشتراک بالاتر شما هنوز فعال است؛ خرید اشتراک پایین‌تر پس از پایان آن ممکن است.",
  INDEFINITE_PLAN_ACTIVE: "همین اشتراک بدون تاریخ پایان برای شما فعال است.",
  CHECKOUT_ALREADY_CREATED: "این درخواست قبلاً ثبت شده؛ سوابق پرداخت را بررسی کنید.",
  PAYMENT_REQUEST_FAILED: "ارتباط با درگاه انجام نشد؛ سوابق پرداخت را بررسی کنید.",
  GALLERY_LIMIT_REACHED: "ظرفیت تصاویر اشتراک شما تکمیل است.",
  PAID_PLAN_REQUIRED: "ساخت آلبوم به اشتراک حرفه‌ای یا ویژه نیاز دارد.",
  MEDIA_PROCESSING_FAILED: "پردازش عکس انجام نشد؛ عکس دیگری انتخاب کنید.",
  SLUG_TAKEN: "این لینک قبلاً انتخاب شده است.",
  SLUG_INVALID: "لینک فقط شامل حروف انگلیسی، عدد و خط تیره باشد.",
  SLUG_TOO_SHORT: "نام لینک بسیار کوتاه است.",
  SLUG_RESERVED: "این نام لینک رزرو شده است.",
  INVALID_CREDENTIALS: "شماره تلفن یا رمز عبور درست نیست.",
  UNAUTHORIZED: "نشست شما به پایان رسیده است؛ دوباره وارد شوید.",
  FORBIDDEN: "اجازه انجام این عملیات را ندارید.",
  NOT_FOUND: "اطلاعات درخواستی پیدا نشد.",
  TOO_MANY_ATTEMPTS: "تعداد تلاش‌ها زیاد بود؛ کمی بعد دوباره امتحان کنید.",
  VALIDATION_ERROR: "اطلاعات واردشده معتبر نیست.",
};

function errorMessage(code: string, status: number) {
  if (errorMessages[code]) return errorMessages[code];
  if (status === 401) return errorMessages.UNAUTHORIZED;
  if (status === 403) return errorMessages.FORBIDDEN;
  if (status === 404) return errorMessages.NOT_FOUND;
  if (status === 429) return errorMessages.TOO_MANY_ATTEMPTS;
  if (status >= 500) return "سرویس موقتاً در دسترس نیست؛ کمی بعد دوباره تلاش کنید.";
  return "انجام درخواست ممکن نشد؛ اطلاعات را بررسی و دوباره تلاش کنید.";
}

export function normalizeIranPhone(value: string) {
  const persian = "۰۱۲۳۴۵۶۷۸۹";
  const arabic = "٠١٢٣٤٥٦٧٨٩";
  let phone = value.trim().replace(/[۰-۹]/g, (digit) => String(persian.indexOf(digit))).replace(/[٠-٩]/g, (digit) => String(arabic.indexOf(digit))).replace(/[^\d+]/g, "");
  if (phone.startsWith("+98")) phone = `0${phone.slice(3)}`;
  else if (phone.startsWith("98") && phone.length === 12) phone = `0${phone.slice(2)}`;
  return phone;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, accessToken?: string | null): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.body instanceof FormData ? 90_000 : 12_000);
  try {
    const response = await fetch(apiEndpoint(API_BASE, path), {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) throw new ApiError(payload?.error || "REQUEST_FAILED", response.status);
    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error("در حال حاضر ارتباط با سرور برقرار نیست.");
  } finally {
    clearTimeout(timer);
  }
}

async function request<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(apiEndpoint(API_BASE, path), { headers: { Accept: "application/json" }, signal: controller.signal });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) throw new Error(payload?.error || "REQUEST_FAILED");
    return payload.data as T;
  } catch {
    throw new Error("در حال حاضر ارتباط با سرور برقرار نیست.");
  } finally {
    clearTimeout(timer);
  }
}

export function searchBusinesses(options: { q?: string; location?: string; category?: string } = {}) {
  const params = new URLSearchParams();
  if (options.q) params.set("q", options.q);
  if (options.location) params.set("location", options.location);
  if (options.category) params.set("category", options.category);
  params.set("limit", "30");
  return request<BusinessSummary[]>(`/api/v1/businesses?${params.toString()}`);
}

export function getBusiness(slug: string) {
  return request<BusinessDetail>(`/api/v1/businesses/${encodeURIComponent(slug)}`);
}
