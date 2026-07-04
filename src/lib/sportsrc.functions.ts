import { createServerFn } from "@tanstack/react-start";

const API_BASE = "https://api.sportsrc.org/v2/";

async function callSportsrc(qs: string): Promise<any> {
  const apiKey = process.env.VITE_SPORTSRC_API_KEY;
  if (!apiKey) throw new Error("VITE_SPORTSRC_API_KEY is not configured in environment variables");
  
  const res = await fetch(`${API_BASE}?${qs}`, {
    headers: { "X-API-KEY": apiKey },
  });
  
  if (!res.ok) {
    const text = await res.text();
    console.error("SportSRC API Error:", text);
    throw new Error(`SportSRC request failed (${res.status})`);
  }
  return res.json();
}

export const getMatches = createServerFn({ method: "GET" })
  .inputValidator((data: { date: string; status?: string }) => data)
  .handler(async ({ data }) => {
    // We want to fetch all matches for the day, so we don't strict filter by inprogress unless requested
    // Usually 'all' or empty returns everything. Let's pass 'all' or omit status.
    const qs = new URLSearchParams();
    qs.set("type", "matches");
    qs.set("sport", "football");
    if (data.status) {
      qs.set("status", data.status);
    }
    qs.set("date", data.date);
    return callSportsrc(qs.toString());
  });

export const getMatchDetail = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return callSportsrc(`type=detail&id=${encodeURIComponent(data.id)}`);
  });

export const getDaddyLiveEvents = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const res = await fetch("https://daddylive.li/api/events");
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error("DaddyLive API fetch error:", e);
      return null;
    }
  });
