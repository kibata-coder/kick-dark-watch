import { createServerFn } from "@tanstack/react-start";
import { callSportsrc } from "./sportsrc.server";

// 1. Create memory storage for our server cache
const listCache = new Map<string, { timestamp: number; data: any }>();
const detailCache = new Map<string, { timestamp: number; data: any }>();

// 2. Set cache life to 5 minutes (300,000 milliseconds)
const CACHE_TTL = 5 * 60 * 1000;

/**
 * AUTOMATION ENGINE:
 * Automatically maps a match title or team names to stable, public 
 * Daddy Live stream identifiers without using an API key.
 */
function autoAssignDaddyChannelId(title: string, category: string): string | null {
  const checkText = `${title} ${category}`.toLowerCase();

  // Basketball Mapping Matrix
  if (checkText.includes("lakers") || checkText.includes("celtics") || checkText.includes("warriors") || checkText.includes("nba tv")) {
    return "277"; // Directs to NBA TV HD network
  }
  if (checkText.includes("nba") || checkText.includes("espn") || checkText.includes("draft") || checkText.includes("basketball")) {
    return "302"; // Directs to ESPN primary network
  }
  if (checkText.includes("euroleague") || checkText.includes("tnt sports")) {
    return "491"; // Directs to international sports carrier
  }

  // F1 / Racing Mapping Matrix (Bonus for your F1 route!)
  if (checkText.includes("formula 1") || checkText.includes("f1") || checkText.includes("grand prix") || checkText.includes("qualifying")) {
    return "302"; // Maps to default motorsports coverage
  }
  
  // Football Mapping Matrix (Bonus for your Football route!)
  if (checkText.includes("premier league") || checkText.includes("champions league") || checkText.includes("sky sports")) {
    return "302"; // Maps to default high-profile soccer channel
  }

  return null; // Return null if no matches were found
}

export const getMatches = createServerFn({ method: "GET" })
  .inputValidator((data: { category?: string }) => data ?? {})
  .handler(async ({ data }) => {
    const category = data?.category || "football";
    const cacheKey = category;
    const cached = listCache.get(cacheKey);

    // If cache is fresh, return it immediately without calling the API
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[Cache Hit] Serving ${category} list from server memory`);
      return cached.data;
    }

    console.log(`[Cache Miss] Fetching fresh ${category} list from API`);
    const freshData = await callSportsrc(`data=matches&category=${encodeURIComponent(category)}`);
    
    // --- AUTOMATION INJECTION ---
    // Scan the incoming live matches and attach Daddy Live feeds where possible
    if (freshData && freshData.data && Array.isArray(freshData.data)) {
      freshData.data = freshData.data.map((match: any) => {
        const title = match.title || (match.teams ? `${match.teams.home?.name} vs ${match.teams.away?.name}` : "");
        const assignedId = autoAssignDaddyChannelId(title, category);
        
        return {
          ...match,
          // If an ID was found, create the direct public stream URL
          daddyStreamUrl: assignedId ? `https://dlhd.pk/stream/stream-${assignedId}.php` : null 
        };
      });
    }
    
    // Save to cache
    listCache.set(cacheKey, { timestamp: Date.now(), data: freshData });
    return freshData;
  });

export const getMatchDetail = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string; category?: string }) => data)
  .handler(async ({ data }) => {
    const category = data.category || "football";
    const cacheKey = `${category}_${data.id}`;
    const cached = detailCache.get(cacheKey);

    // If cache is fresh, serve the cached stream link!
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[Cache Hit] Serving stream link for match ${data.id} from server memory`);
      return cached.data;
    }

    console.log(`[Cache Miss] Fetching fresh stream link for match ${data.id} from API`);
    const freshData = await callSportsrc(
      `data=detail&category=${encodeURIComponent(category)}&id=${encodeURIComponent(data.id)}`,
    );
    
    // Save to cache
    detailCache.set(cacheKey, { timestamp: Date.now(), data: freshData });
    return freshData;
  });
