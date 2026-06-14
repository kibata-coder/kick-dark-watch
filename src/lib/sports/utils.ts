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
  console.log("[Stream Extractor] Incoming SportSRC payload:", raw);

  // Normalize where the sources array might be hiding
  const sources = Array.isArray(raw?.data) ? raw.data : 
                  Array.isArray(raw?.sources) ? raw.sources : 
                  Array.isArray(raw?.data?.sources) ? raw.data.sources :
                  [raw?.data, raw].filter(Boolean); // fallback to the root object

  // Loop through potential source objects
  for (const src of sources) {
    if (!src) continue;
    
    // Check every conceivable key SportSRC might use
    const rawString = src.embedUrl || src.url || src.link || src.embed || src.stream_url;
    
    if (typeof rawString === "string" && rawString.trim()) {
       // If the API returns a raw HTML iframe instead of a neat URL, rip the src out of it
       if (rawString.includes("<iframe") && rawString.includes("src=")) {
         const match = rawString.match(/src=["'](.*?)["']/);
         if (match && match[1]) return match[1];
       }
       
       // Otherwise, return the clean URL string
       return rawString.trim();
    }
  }

  return null;
}
