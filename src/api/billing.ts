export type SubscriptionPlan = { code: string; name: string; amountToman: number | null; durationDays: number | null; purchasable: boolean; features: string[] };
export type BillingInvoice = { id: string; plan_code: string; duration_days: number; total_amount: number; status: string; payment_status: string; provider_reference: string | null; invoice_number: string };
export function checkoutRequestKey() { return `app-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
export function safeGatewayUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.hostname !== "www.zarinpal.com" || url.port || url.username || url.password || !/^\/pg\/StartPay\/A[a-zA-Z0-9]{35}$/.test(url.pathname) || url.search || url.hash) throw new Error("نشانی درگاه معتبر نیست.");
  return url.href;
}
