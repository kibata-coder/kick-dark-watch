import type { Match } from "./types";

export function deriveStatus(dateMs?: number): string {
  if (!dateMs) return "upcoming";
  const diff = Date.now() - dateMs;
  if (diff >= 0 && diff < 2.5 * 60 * 60 * 1000) return "inprogress";
  if (diff >= 2.5 * 60 * 60 * 1000) return "finished";
  return "upcoming";
}

export function normalizeMatches(raw: any): Match[] {
  const items: any[] = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
  return items.map((m) => {
    const dateMs = typeof m.date === "number" ? m.date : undefined;
    return {
      id: m.id,
      title: m.title,
      status: deriveStatus(dateMs),
      date: dateMs,
      home: { name: m.teams?.home?.name || "Team A", logo: m.teams?.home?.badge },
      away: { name: m.teams?.away?.name || "Team B", logo: m.teams?.away?.badge },
      league: m.category ? { name: String(m.category) } : undefined,
      daddyStreamUrl: m.daddyStreamUrl,
    };
  });
}

export function extractStreamUrl(raw: any): string | null {
  if (!raw) return null;
  const c = [
    raw?.data?.sources?.[0]?.embedUrl,
    raw?.sources?.[0]?.embedUrl,
    raw.stream_url,
    raw.url,
    raw.embed,
    raw.data?.stream_url,
  ];
  return c.find((url) => typeof url === "string" && url.trim()) || null;
}