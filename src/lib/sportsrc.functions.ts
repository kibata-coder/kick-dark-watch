// src/lib/sportsrc.functions.ts
import { createServerFn } from "@tanstack/react-start";
import { callSportsrc } from "./sportsrc.server";

const listCache = new Map<string, { timestamp: number; data: any }>();
const detailCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL = 5 * 60 * 1000;

function autoAssignDaddyChannelId(title: string, category: string): string | null {
  const checkText = `${title} ${category}`.toLowerCase();

  if (checkText.includes("lakers") || checkText.includes("celtics") || checkText.includes("warriors") || checkText.includes("nba tv")) {
    return "277"; 
  }
  if (checkText.includes("nba") || checkText.includes("espn") || checkText.includes("draft") || checkText.includes("basketball")) {
    return "302"; 
  }
  if (checkText.includes("euroleague") || checkText.includes("tnt sports")) {
    return "491"; 
  }
  if (checkText.includes("formula 1") || checkText.includes("f1") || checkText.includes("grand prix") || checkText.includes("qualifying")) {
    return "302"; 
  }
  if (checkText.includes("premier league") || checkText.includes("champions league") || checkText.includes("sky sports")) {
    return "302"; 
  }

  return null;
}

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
    const freshData = await callSportsrc(`data=matches&category=${encodeURIComponent(category)}`);
    
    // Using import.meta.env for Vite compatibility
    const daddyDomain = import.meta.env.VITE_DADDY_DOMAIN || "dlhd.pk";

    if (freshData && freshData.data && Array.isArray(freshData.data)) {
      freshData.data = freshData.data.map((match: any) => {
        const title = match.title || (match.teams ? `${match.teams.home?.name} vs ${match.teams.away?.name}` : "");
        const assignedId = autoAssignDaddyChannelId(title, category);
        
        return {
          ...match,
          daddyStreamUrl: assignedId ? `https://${daddyDomain}/stream/stream-${assignedId}.php` : null 
        };
      });
    }
    
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
      console.log(`[Cache Hit] Serving stream link for match ${data.id} from server memory`);
      return cached.data;
    }

    console.log(`[Cache Miss] Fetching fresh stream link for match ${data.id} from API`);
    const freshData = await callSportsrc(
      `data=detail&category=${encodeURIComponent(category)}&id=${encodeURIComponent(data.id)}`,
    );
    
    detailCache.set(cacheKey, { timestamp: Date.now(), data: freshData });
    return freshData;
  });
