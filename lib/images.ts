import type { PlanType } from "./types";

// Stable Unsplash CDN photo IDs per category — no runtime API call needed
const CATEGORY_IMAGES: Record<PlanType, string> = {
  RESTAURANTS:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  MUSEUMS:
    "https://images.unsplash.com/photo-1565060169194-19fabf63012c?w=800&q=80",
  OUTDOOR:
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
  NIGHTLIFE:
    "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80",
  SHOPPING:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
  ENTERTAINMENT:
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
  SPORTS:
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
  WELLNESS:
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
};

export function getImageUrl(category: PlanType): string {
  return CATEGORY_IMAGES[category];
}
