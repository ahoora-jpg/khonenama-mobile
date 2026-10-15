export type SubscriptionPlan = { code: string; name: string; amountToman: number | null; durationDays: number | null; purchasable: boolean; features: string[];annual?:{amountToman:number|null;durationDays:number;purchasable:boolean}|null;billingPeriod?:"monthly"|"annual";customPacks?:number };
export function capacityQuote(plan:SubscriptionPlan,period:"monthly"|"annual",packs:number):SubscriptionPlan{
 if(!Number.isSafeInteger(packs)||packs<0)throw Error("تعداد بسته معتبر نیست.");
 if(packs&&plan.code!=="premium")throw Error("افزونه فقط برای پلن ویژه است.");
 const selected=period==="annual"&&plan.annual?{...plan,...plan.annual}:plan;
 const amount=selected.amountToman===null?null:selected.amountToman+packs*(period==="annual"?180000:15000);
 if(amount!==null&&(!Number.isSafeInteger(amount)||amount>100000000))throw Error("مبلغ انتخاب‌شده خارج از محدوده پرداخت است؛ با پشتیبانی تماس بگیرید.");
 return {...selected,amountToman:amount,billingPeriod:period,customPacks:packs};
}
export type BillingInvoice = { id: string; plan_code: string; duration_days: number; total_amount: number; status: string; payment_status: string; provider_reference: string | null; invoice_number: string };
export function checkoutRequestKey() { return `app-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
export function safeGatewayUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.hostname !== "www.zarinpal.com" || url.port || url.username || url.password || !/^\/pg\/StartPay\/A[a-zA-Z0-9]{35}$/.test(url.pathname) || url.search || url.hash) throw new Error("نشانی درگاه معتبر نیست.");
  return url.href;
}
