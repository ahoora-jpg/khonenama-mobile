export type RequestStatus = "new" | "following" | "accepted" | "doing" | "done" | "closed" | "rejected";
export type ServiceRequest = {
  id: string; title: string; customer: string; area: string; createdAt: string;
  urgency: "عادی" | "فوری"; status: RequestStatus; description: string; budget?: string;
};

export const statusLabels: Record<RequestStatus, string> = {
  new: "جدید", following: "در حال پیگیری", accepted: "پذیرفته‌شده", doing: "در حال انجام",
  done: "انجام‌شده", closed: "بسته‌شده", rejected: "ردشده",
};

export const mockRequests: ServiceRequest[] = [
  { id: "REQ-1042", title: "نصب پرده زبرا", customer: "مریم احمدی", area: "گوهردشت، کرج", createdAt: "امروز، ۸:۴۰", urgency: "فوری", status: "new", description: "برای پذیرایی دو پنجره دارم و اندازه‌گیری و نصب کامل می‌خواهم.", budget: "نیازمند پیشنهاد قیمت" },
  { id: "REQ-1037", title: "طراحی دیوار تلویزیون", customer: "حامد رضایی", area: "عظیمیه، کرج", createdAt: "دیروز، ۱۸:۱۰", urgency: "عادی", status: "following", description: "طراحی مینیمال با فضای ذخیره‌سازی و نور مخفی.", budget: "۳۰ تا ۵۰ میلیون تومان" },
  { id: "REQ-1029", title: "اجرای کفپوش اتاق", customer: "سارا یوسفی", area: "مهرشهر، کرج", createdAt: "۲ روز پیش", urgency: "عادی", status: "doing", description: "کفپوش مقاوم برای اتاق کودک، حدود ۱۸ متر.", budget: "توافقی" },
  { id: "REQ-1018", title: "نصب کاغذ دیواری", customer: "رضا اکبری", area: "جهانشهر، کرج", createdAt: "هفته قبل", urgency: "عادی", status: "done", description: "نصب یک دیوار شاخص در اتاق خواب.", budget: "۱۲ میلیون تومان" },
];

export const mockChats = [
  { id: "REQ-1042", name: "مریم احمدی", preview: "چه ساعتی برای بازدید می‌رسید؟", unread: 2, time: "۹:۱۲" },
  { id: "REQ-1037", name: "حامد رضایی", preview: "نمونه طرح را دیدم، ممنون.", unread: 0, time: "دیروز" },
];
