import { createServerFn } from "@tanstack/react-start";
import { callSportsrc } from "./sportsrc.server";

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
    const freshData = await callSportsrc(`data=matches&category=${encodeURIComponent(category)}`);
    
    // We removed the autoAssignDaddyChannelId mapping loop entirely here.
    // The data is passed cleanly exactly as SportSRC provides it.
    
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
