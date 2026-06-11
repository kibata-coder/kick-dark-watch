import { createServerFn } from "@tanstack/react-start";

const API_BASE = "https://api.sportsrc.org/";

async function callSportsrc(qs: string): Promise<any> {
  const apiKey = process.env.SPORTSRC_API_KEY;
  const headers: Record<string, string> = {};
  if (apiKey) headers["X-API-KEY"] = apiKey;
  const res = await fetch(`${API_BASE}?${qs}`, { headers });
  if (!res.ok) throw new Error(`SportSRC request failed (${res.status})`);
  return res.json();
}

export const getMatches = createServerFn({ method: "GET" })
  .inputValidator((data: { date: string }) => data)
  .handler(async ({ data }) => {
    void data;
    return callSportsrc(`data=matches&category=football`);
  });

export const getMatchDetail = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return callSportsrc(`data=detail&category=football&id=${encodeURIComponent(data.id)}`);
  });