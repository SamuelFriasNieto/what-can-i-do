import type { PlanType } from "./types";

const CATEGORY_FALLBACKS: Record<PlanType, string> = {
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

const CATEGORY_QUERIES: Record<PlanType, string> = {
  RESTAURANTS: "restaurant dining food",
  MUSEUMS: "museum art gallery",
  OUTDOOR: "nature park hiking outdoor",
  NIGHTLIFE: "nightlife bar city night",
  SHOPPING: "shopping street boutique",
  ENTERTAINMENT: "concert theater show",
  SPORTS: "sport active fitness",
  WELLNESS: "spa wellness yoga relax",
};

interface ImagePool {
  urls: string[];
  index: number;
  fetchedAt: number;
}

const pools = new Map<PlanType, ImagePool>();
const POOL_SIZE = 8;
const POOL_TTL_MS = 30 * 60 * 1000;

async function fetchPool(category: PlanType): Promise<string[]> {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!apiKey) return [];

  try {
    const query = encodeURIComponent(CATEGORY_QUERIES[category]);
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&count=${POOL_SIZE}&client_id=${apiKey}`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{ urls: { regular: string } }>;
    return data.map((p) => p.urls.regular).filter(Boolean);
  } catch {
    return [];
  }
}

async function getPool(category: PlanType): Promise<ImagePool | null> {
  const existing = pools.get(category);
  if (existing && Date.now() - existing.fetchedAt < POOL_TTL_MS && existing.urls.length > 0) {
    return existing;
  }
  const urls = await fetchPool(category);
  if (urls.length === 0) return null;
  const pool: ImagePool = { urls, index: 0, fetchedAt: Date.now() };
  pools.set(category, pool);
  return pool;
}

export async function getImageUrl(category: PlanType): Promise<string> {
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    return CATEGORY_FALLBACKS[category];
  }

  const pool = await getPool(category);
  if (!pool) return CATEGORY_FALLBACKS[category];

  const url = pool.urls[pool.index % pool.urls.length];
  pool.index++;
  return url;
}
