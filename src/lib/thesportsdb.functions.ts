import { createServerFn } from "@tanstack/react-start";
import { callTheSportsDB } from "./thesportsdb.server";

const listCache = new Map<string, { timestamp: number; data: any }>();
const detailCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL = 5 * 60 * 1000;

export const getMatches = createServerFn({ method: "GET" })
  .inputValidator((data: { category?: string }) => data ?? {})
  .handler(async ({ data }) => {
    const category = data?.category || "football";
    const cacheKey = category;
    const cached = listCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[Cache Hit] Serving ${category} list from server memory`);
      return cached.data;
    }

    console.log(`[Cache Miss] Fetching fresh ${category} list from API`);
    
    // Map internal categories to TheSportsDB sport names
    const sportMap: Record<string, string> = {
      football:   "Soccer",
      basketball: "Basketball",
      motorsport: "Motorsport",
      f1:         "Motorsport",
      mma:        "MMA",
      tennis:     "Tennis",
      cricket:    "Cricket",
      boxing:     "Boxing",
      rugby:      "Rugby",
      golf:       "Golf",
      icehockey:  "Ice_Hockey",
      baseball:   "Baseball",
      volleyball: "Volleyball",
    };
    const sport = sportMap[category.toLowerCase()] ?? "Soccer";

    const date = new Date().toISOString().split('T')[0];
    const freshData = await callTheSportsDB(`eventsday.php?d=${date}&s=${sport}`);
    
    listCache.set(cacheKey, { timestamp: Date.now(), data: freshData });
    return freshData;
  });

export const getMatchDetail = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string; category?: string }) => data)
  .handler(async ({ data }) => {
    const category = data.category || "football";
    const cacheKey = `${category}_${data.id}`;
    const cached = detailCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    // TheSportsDB event details
    const freshData = await callTheSportsDB(`lookupevent.php?id=${encodeURIComponent(data.id)}`);
    
    detailCache.set(cacheKey, { timestamp: Date.now(), data: freshData });
    return freshData;
  });

export const getStandings = createServerFn({ method: "GET" })
  .inputValidator((data: { league: string }) => data)
  .handler(async ({ data }) => {
    const league = data.league;
    const cacheKey = `standings_${league}`;
    const cached = listCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    
    // Get standings for the current season (Requires different endpoint logic based on league ID in TheSportsDB, but we'll try a generic approach if possible)
    const freshData = await callTheSportsDB(`lookuptable.php?l=${encodeURIComponent(league)}&s=2024-2025`);
    
    listCache.set(cacheKey, { timestamp: Date.now(), data: freshData });
    return freshData;
  });
