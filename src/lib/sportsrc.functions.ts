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
  .inputValidator((data: { date: string; status?: string; category?: string }) => data)
  .handler(async ({ data }) => {
    const qs = new URLSearchParams();
    qs.set("type", "matches");
    qs.set("sport", data.category || "football");
    if (data.status) {
      qs.set("status", data.status);
    }
    qs.set("date", data.date);
    return callSportsrc(qs.toString());
  });

export const getMatchDetail = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string; category?: string }) => data)
  .handler(async ({ data }) => {
    const qs = new URLSearchParams();
    qs.set("type", "detail");
    qs.set("id", data.id);
    if (data.category) {
      qs.set("sport", data.category);
    }
    return callSportsrc(qs.toString());
  });

