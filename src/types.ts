export type BusinessSummary = {
  slug: string; name: string; description: string; city: string; area: string;
  category: string; categoryName: string; services: string[]; coverUrl: string;
  verified: boolean; rating: number; reviewCount: number; promoted: boolean;
};

export type BusinessDetail = BusinessSummary & {
  address: string; phone: string; whatsapp: string; website: string; instagram: string;
  media: { id: number; kind: string; url: string; altText: string }[];
  hours: { weekday: number; opensAt: string; closesAt: string; isClosed: boolean }[];
  reviews: { id: number; name: string; rating: number; body: string; verifiedInteraction: boolean }[];
};
