import { createServerFn } from "@tanstack/react-start";

const API_BASE = "https://api.sportsrc.org/v2/";

async function callSportsrc(url: string): Promise<any> {
  const apiKey = process.env.VITE_SPORTSRC_API_KEY;
  if (!apiKey) throw new Error("VITE_SPORTSRC_API_KEY is not configured in environment variables");
  
  const res = await fetch(url, {
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
    const category = data.category || "football";
    const qs = new URLSearchParams();
    
    try {
      if (category === "football") {
        qs.set("type", "matches");
        qs.set("sport", "football");
        if (data.status) {
          qs.set("status", data.status);
        }
        qs.set("date", data.date);
        return await callSportsrc(`https://api.sportsrc.org/v2/?${qs.toString()}`);
      } else {
        qs.set("data", "matches");
        qs.set("category", category);
        return await callSportsrc(`https://api.sportsrc.org/?${qs.toString()}`);
      }
    } catch (err) {
      console.error(`Error fetching matches for ${category}:`, err);
      return [];
    }
  });

export const getMatchDetail = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string; category?: string }) => data)
  .handler(async ({ data }) => {
    const category = data.category || "football";
    const qs = new URLSearchParams();
    
    if (category === "football") {
      qs.set("type", "detail");
      qs.set("id", data.id);
      return callSportsrc(`https://api.sportsrc.org/v2/?${qs.toString()}`);
    } else {
      qs.set("data", "detail");
      qs.set("category", category);
      qs.set("id", data.id);
      return callSportsrc(`https://api.sportsrc.org/?${qs.toString()}`);
    }
  });

