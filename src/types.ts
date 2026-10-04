export type BusinessSummary = {
  slug: string; name: string; description: string; city: string; area: string;
  category: string; categoryName: string; services: string[]; coverUrl: string;
  verified: boolean; rating: number; reviewCount: number; promoted: boolean;
};

export type BusinessDetail = BusinessSummary & {
  albums?: { id: number; title: string; description: string; project?: {service:string;materials:string;area:string}|null; media: { id: number; url: string; altText: string }[] }[];
  address: string; phone: string; whatsapp: string; website: string; instagram: string;
  media: { id: number; kind: string; url: string; altText: string }[];
  hours: { weekday: number; opensAt: string; closesAt: string; isClosed: boolean }[];
  reviews: { id: number; name: string; rating: number; body: string; reply?: string; verifiedInteraction: boolean }[];
};
