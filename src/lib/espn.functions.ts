import { createServerFn } from "@tanstack/react-start";

const CACHE_TTL = 5 * 60 * 1000;
const cache = new Map<string, { timestamp: number; data: any }>();

export const getEspnStandings = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const slug = data.slug || "eng.1";
    const cacheKey = `espn_standings_${slug}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const url = `https://site.api.espn.com/apis/v2/sports/soccer/${slug}/standings`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`ESPN Standings API failed: ${res.status}`);
    
    const freshData = await res.json();
    cache.set(cacheKey, { timestamp: Date.now(), data: freshData });
    return freshData;
  });

export const getEspnNews = createServerFn({ method: "GET" })
  .inputValidator((data: { slug?: string } | undefined) => data || {})
  .handler(async ({ data }) => {
    const slug = data.slug || "eng.1";
    const cacheKey = `espn_news_${slug}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/news`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`ESPN News API failed: ${res.status}`);
    
    const freshData = await res.json();
    cache.set(cacheKey, { timestamp: Date.now(), data: freshData });
    return freshData;
  });

export const getEspnScoreboard = createServerFn({ method: "GET" })
  .inputValidator((data: { slug?: string } | undefined) => data || {})
  .handler(async ({ data }) => {
    const slug = data.slug || "fifa.world";
    const cacheKey = `espn_scoreboard_${slug}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    let url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/scoreboard`;
    if (slug === "fifa.world") {
      // The World Cup Knockout stage runs from June 28 to July 19.
      // Fetch the entire range so the full 32-team bracket is populated, not just today's matches.
      url += `?dates=20260628-20260719`;
    }
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`ESPN Scoreboard API failed: ${res.status}`);
    
    const freshData = await res.json();
    cache.set(cacheKey, { timestamp: Date.now(), data: freshData });
    return freshData;
  });
