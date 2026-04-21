interface SearchResult {
  title: string;
  url: string;
  description: string;
}

interface CacheEntry {
  results: SearchResult[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const CACHE_MAX_SIZE = 500;

export async function braveSearch(query: string): Promise<SearchResult[]> {
  const now = Date.now();
  const cached = cache.get(query);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.results;
  }

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn("[tavily] TAVILY_API_KEY is not set");
    return [];
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: 5,
        search_depth: "basic",
        include_answer: false,
      }),
      signal: controller.signal,
    });

    if (response.status === 429) {
      console.warn("[tavily] Rate limit hit for query:", query);
      return [];
    }

    if (!response.ok) {
      console.warn("[tavily] Non-OK response:", response.status, "for query:", query);
      return [];
    }

    const data = await response.json();
    const results: SearchResult[] = (data?.results ?? [])
      .slice(0, 5)
      .map((r: { title?: string; url?: string; content?: string }) => ({
        title: r.title ?? "",
        url: r.url ?? "",
        description: r.content ?? "",
      }));

    if (cache.size >= CACHE_MAX_SIZE) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey !== undefined) cache.delete(oldestKey);
    }
    cache.set(query, { results, timestamp: now });
    return results;
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      console.warn("[tavily] Request timed out for query:", query);
    } else {
      console.warn("[tavily] Fetch error for query:", query, err);
    }
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}
