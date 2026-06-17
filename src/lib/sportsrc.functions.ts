// Add this to the bottom of src/lib/sportsrc.functions.ts

export const getStandings = createServerFn({ method: "GET" })
  .inputValidator((data: { league: string }) => data)
  .handler(async ({ data }) => {
    const league = data.league;
    const cacheKey = `standings_${league}`;
    const cached = listCache.get(cacheKey); // Reusing your existing listCache

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[Cache Hit] Serving standings for ${league} from server memory`);
      return cached.data;
    }

    console.log(`[Cache Miss] Fetching fresh standings for ${league} from API`);
    const freshData = await callSportsrc(
      `data=results&category=tables&league=${encodeURIComponent(league)}`
    );
    
    listCache.set(cacheKey, { timestamp: Date.now(), data: freshData });
    return freshData;
  });
