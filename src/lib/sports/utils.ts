import type { Match } from "./types";

export function deriveStatus(dateMs?: number): string {
  if (!dateMs) return "upcoming";
  const diff = Date.now() - dateMs;
  if (diff >= 0 && diff < 2.5 * 60 * 60 * 1000) return "inprogress";
  if (diff >= 2.5 * 60 * 60 * 1000) return "finished";
  return "upcoming";
}

export function formatMatchTime(dateMs?: number): string | undefined {
  if (!dateMs) return undefined;
  const d = new Date(dateMs);
  if (Number.isNaN(d.getTime())) return undefined;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  const dayDiff = Math.floor((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - startOfToday) / oneDay);

  const time = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", hour12: false }).format(d);

  if (dayDiff === 0) return `Today ${time}`;
  if (dayDiff === 1) return `Tomorrow ${time}`;
  if (dayDiff === -1) return `Yesterday ${time}`;

  const date = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short" }).format(d);
  return `${date} ${time}`;
}

function deriveLeagueName(m: any): string | undefined {
  if (m.league?.name) return String(m.league.name);
  
  if (m.category === "basketball") {
    const id = String(m.id || "").toLowerCase();
    const title = String(m.title || "").toLowerCase();
    const home = String(m.teams?.home?.name || "").toLowerCase();
    const away = String(m.teams?.away?.name || "").toLowerCase();
    
    if (id.includes("ncaa") || title.includes("ncaa")) return "NCAA";
    if (id.includes("euroleague") || title.includes("euroleague")) return "EuroLeague";
    if (home.endsWith(" w") || away.endsWith(" w") || title.includes("wnba")) return "WNBA";
    
    const nbaTeams = ["lakers", "warriors", "celtics", "heat", "bulls", "knicks", "nets", "76ers", "bucks", "suns", "nuggets", "mavericks", "clippers", "spurs", "timberwolves"];
    if (nbaTeams.some(t => home.includes(t) || away.includes(t))) return "NBA";
    
    return "NBA / Basketball";
  }

  return m.category ? String(m.category) : undefined;
}

export function normalizeMatches(raw: any): Match[] {
  let items: any[] = [];
  if (Array.isArray(raw?.data)) {
    if (raw.data.length > 0 && Array.isArray(raw.data[0].matches)) {
      raw.data.forEach((group: any) => {
        const leagueName = group.league?.name || "Unknown League";
        group.matches.forEach((m: any) => {
          items.push({ ...m, category: leagueName });
        });
      });
    } else {
      items = raw.data;
    }
  } else if (Array.isArray(raw)) {
    items = raw;
  }

  return items.map((m) => {
    const dateMs = typeof m.timestamp === "number" ? m.timestamp : typeof m.date === "number" ? m.date : undefined;
    
    // Fallback logic for missing team names (frequently missing in some V1 basketball streams)
    let homeName = m.teams?.home?.name;
    let awayName = m.teams?.away?.name;
    if (!homeName || !awayName) {
      if (m.title) {
        let parts = String(m.title).split(" vs ");
        if (parts.length !== 2) parts = String(m.title).split(" - ");
        if (parts.length === 2) {
          homeName = homeName || parts[0].trim();
          awayName = awayName || parts[1].trim();
        }
      }
    }

    return {
      id: m.id,
      title: m.title,
      status: deriveStatus(dateMs),
      date: dateMs,
      time: formatMatchTime(dateMs),
      home: { name: homeName || "Team A", logo: m.teams?.home?.badge, score: m.score?.current?.home ?? m.teams?.home?.score },
      away: { name: awayName || "Team B", logo: m.teams?.away?.badge, score: m.score?.current?.away ?? m.teams?.away?.score },
      league: { name: deriveLeagueName(m) },
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
