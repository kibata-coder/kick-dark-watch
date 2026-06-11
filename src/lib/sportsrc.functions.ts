import { createServerFn } from "@tanstack/react-start";

const API_BASE = "https://api.sportsrc.org/v2/";

async function callSportsrc(qs: string): Promise<unknown> {
  const apiKey = process.env.SPORTSRC_API_KEY;
  if (!apiKey) throw new Error("SPORTSRC_API_KEY is not configured");
  const res = await fetch(`${API_BASE}?${qs}`, {
    headers: { "X-API-KEY": apiKey },
  });
  if (!res.ok) throw new Error(`SportSRC request failed (${res.status})`);
  return res.json();
}

export const getMatches = createServerFn({ method: "GET" })
  .inputValidator((data: { date: string }) => data)
  .handler(async ({ data }) => {
    return callSportsrc(
      `type=matches&sport=football&status=inprogress&date=${encodeURIComponent(data.date)}`,
    );
  });

export const getMatchDetail = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return callSportsrc(`type=detail&id=${encodeURIComponent(data.id)}`);
  });