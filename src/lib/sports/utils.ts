import type { Match } from "./types";

export function deriveStatus(dateMs?: number, strStatus?: string): string {
  if (strStatus?.toLowerCase() === "match finished" || strStatus?.toLowerCase() === "finished") return "finished";
  if (strStatus?.toLowerCase() === "in progress" || strStatus?.toLowerCase() === "live") return "inprogress";
  
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

export function normalizeMatches(raw: any): Match[] {
  let items: any[] = [];
  
  // TheSportsDB format
  if (raw && Array.isArray(raw.events)) {
    items = raw.events;
  } else if (Array.isArray(raw)) {
    items = raw;
  } else if (raw?.data && Array.isArray(raw.data)) {
    items = raw.data;
  }

  // Handle SportSRC v2 grouped format
  if (items.length > 0 && items[0].league && items[0].matches) {
    const flatMatches: any[] = [];
    for (const group of items) {
      if (Array.isArray(group.matches)) {
        for (const m of group.matches) {
          if (!m.league) m.league = group.league;
          flatMatches.push(m);
        }
      }
    }
    items = flatMatches;
  }

  return items.map((m) => {
    // Check if it's TheSportsDB format
    if (m.idEvent) {
      let dateMs = undefined;
      if (m.strTimestamp) {
        dateMs = new Date(m.strTimestamp).getTime();
      } else if (m.dateEvent && m.strTime) {
        dateMs = new Date(`${m.dateEvent}T${m.strTime}`).getTime();
      } else if (m.dateEvent) {
        dateMs = new Date(m.dateEvent).getTime();
      }

      return {
        id: m.idEvent,
        title: m.strEvent || `${m.strHomeTeam} vs ${m.strAwayTeam}`,
        status: deriveStatus(dateMs, m.strStatus),
        date: dateMs,
        time: formatMatchTime(dateMs),
        home: { name: m.strHomeTeam || "Team A", logo: m.strHomeTeamBadge, score: m.intHomeScore },
        away: { name: m.strAwayTeam || "Team B", logo: m.strAwayTeamBadge, score: m.intAwayScore },
        league: { name: m.strLeague },
        poster: m.strThumb,
      };
    }

    // Fallback for any residual old format data
    const dateMs = typeof m.timestamp === "number" ? m.timestamp : typeof m.date === "number" ? m.date : undefined;
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
      status: deriveStatus(dateMs, m.status),
      date: dateMs,
      time: formatMatchTime(dateMs),
      home: { name: homeName || "Team A", logo: m.teams?.home?.badge, score: m.score?.current?.home ?? m.teams?.home?.score },
      away: { name: awayName || "Team B", logo: m.teams?.away?.badge, score: m.score?.current?.away ?? m.teams?.away?.score },
      league: { name: m.league?.name || m.category },
    };
  });
}

export function extractStreamUrl(raw: any): string | null {
  // Try to extract SportSRC stream (v1 format)
  if (raw?.data?.sources && Array.isArray(raw.data.sources) && raw.data.sources.length > 0) {
    return raw.data.sources[0].embedUrl || null;
  }
  // Try to extract SportSRC stream (v2 format)
  if (raw?.sources && Array.isArray(raw.sources) && raw.sources.length > 0) {
    return raw.sources[0].embedUrl || null;
  }
  return null;
}
