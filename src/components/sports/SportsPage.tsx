// src/components/sports/SportsPage.tsx
import { Suspense, lazy, useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Pin } from "lucide-react";
import { MatchCard } from "./MatchCard";
import { ChannelCard } from "./ChannelCard";
import { matchesQueryOptions, matchDetailQueryOptions } from "@/lib/sports/query";
import { normalizeMatches, extractStreamUrl } from "@/lib/sports/utils";
import { getMatchDetail } from "@/lib/sportsrc.functions";
import type { Match } from "@/lib/sports/types";

// ─── DaddyLive: module-level cache (shared across all sport pages) ───────────
let _daddyCache: { data: any[]; ts: number } | null = null;
const DADDY_TTL = 3 * 60 * 1000; // 3 minutes

async function fetchDaddyEvents(): Promise<any[]> {
  if (_daddyCache && Date.now() - _daddyCache.ts < DADDY_TTL) {
    return _daddyCache.data;
  }
  try {
    const res = await fetch("https://daddylive.li/api/events");
    if (!res.ok) return _daddyCache?.data ?? [];
    const data = await res.json();
    if (Array.isArray(data)) {
      _daddyCache = { data, ts: Date.now() };
      return data;
    }
  } catch {}
  return _daddyCache?.data ?? [];
}

/** Normalize a team/player name for fuzzy matching across all sports */
function normalizeName(raw: string): string {
  return raw
    .toLowerCase()
    // strip common football/sports suffixes and articles
    .replace(/\b(fc|cf|afc|sc|ac|bk|sk|if|ff|fk|hk|ok|ik|united|utd|city|town|rovers|wanderers|athletic|atlético|atletico|real|sporting|club|de|the|and|vs)\b/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Keywords to pre-filter DaddyLive events by sport category */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  football:   ["football", "soccer"],
  basketball: ["basketball", "nba", "wnba"],
  tennis:     ["tennis", "wimbledon", "atp", "wta"],
  cricket:    ["cricket"],
  mma:        ["mma", "ufc", "combat", "boxing"],
  boxing:     ["boxing", "combat", "mma"],
  rugby:      ["rugby"],
  golf:       ["golf"],
  icehockey:  ["hockey", "nhl"],
  baseball:   ["baseball", "mlb"],
  volleyball: ["volleyball"],
  motorsport: ["motor", "formula", "f1", "motogp", "racing", "nascar", "grand prix"],
};
// ─────────────────────────────────────────────────────────────────────────────

const StreamDialog = lazy(() =>
  import("./StreamDialog").then((m) => ({ default: m.StreamDialog })),
);
import type { StreamSource } from "./StreamDialog";

export type SportsPageProps = {
  category: string;
  title: string;
  subtitle: string;
  titleIcon?: React.ReactNode;
  defaultLeague: string;
  staticMatches: Match[];
  isChannelCard: (m: Match) => boolean;
  staticStreamResolver?: (m: Match) => string | null;
  staticStreamSources?: (m: Match) => StreamSource[] | null;
  detailFallbackUrl?: string;
  upcomingLabel?: string;
  upcomingSub?: string;
  groupByLeague?: boolean;
};

function getLeagueName(m: Match, defaultLeague: string): string {
  const league: any = m.league;
  const name =
    typeof league === "object" && league !== null
      ? league.name || defaultLeague
      : typeof league === "string"
      ? league
      : defaultLeague;
  return name.trim() || defaultLeague;
}

export function getLeagueRank(leagueName: string): number {
  const lower = leagueName.trim().toLowerCase();
  if (lower === "live channel") return 0;
  if (lower.includes("world championship") || lower.includes("world cup") || lower.includes("worldcup")) return 1;
  if (lower === "premier league" || lower === "english premier league" || lower === "england - premier league" || lower === "epl") return 2;
  if (lower === "la liga" || lower === "laliga" || lower === "spain - la liga" || lower === "spanish la liga") return 3;
  if (lower.includes("bundesliga") && !lower.includes("austria") && !lower.includes("women")) return 4;
  if (lower === "serie a" || lower === "italy - serie a" || lower === "italy serie a") return 5;
  if (lower === "ligue 1" || lower === "france - ligue 1" || lower === "france ligue 1") return 6;
  if (lower.includes("saudi pro league") || lower === "saudi arabia - pro league" || lower === "saudi arabian pro league" || lower === "saudi league") return 7;
  if (lower.includes("brasileirão") || lower.includes("brasileirao") || lower === "serie a (brazil)" || lower === "brazil - serie a") return 8;
  if (lower === "mls" || lower === "major league soccer" || lower === "usa - mls") return 9;
  if (lower === "primeira liga" || lower === "portugal - primeira liga") return 10;
  if (lower === "eredivisie" || lower === "netherlands - eredivisie") return 11;
  return 999;
}

export function SportsPage(props: SportsPageProps) {
  const {
    category,
    title,
    subtitle,
    titleIcon,
    defaultLeague,
    staticMatches,
    isChannelCard,
    staticStreamResolver,
    staticStreamSources,
    detailFallbackUrl,
    upcomingLabel,
    upcomingSub,
    groupByLeague,
  } = props;

  const qc = useQueryClient();
  const options = matchesQueryOptions(category);
  const { data, isFetching, refetch } = useSuspenseQuery(options);
  const fetchDetail = useServerFn(getMatchDetail);

  const matches = useMemo<Match[]>(
    () => [...staticMatches, ...normalizeMatches(data)],
    [data, staticMatches],
  );

  const groupedMatches = useMemo(() => {
    if (!groupByLeague) return null;
    
    // Initialize with the user's explicit list to guarantee they ALWAYS appear
    const groups: Record<string, Match[]> = {
      "LIVE CHANNEL": [],
      "World Championship": [],
      "English Premier League": [],
      "La Liga": [],
      "Bundesliga": [],
      "Serie A": [],
      "Ligue 1": [],
      "Saudi Pro League": [],
      "Brasileirão": [],
      "MLS": [],
      "Primeira Liga": [],
      "Eredivisie": []
    };

    matches.forEach((m) => {
      let lg = getLeagueName(m, defaultLeague);
      
      // Normalize API names to match our guaranteed UI keys
      const lower = lg.trim().toLowerCase();
      if (lower === "live channel") lg = "LIVE CHANNEL";
      else if (lower.includes("world championship") || lower.includes("world cup") || lower.includes("worldcup")) lg = "World Championship";
      else if (lower === "premier league" || lower === "english premier league" || lower === "england - premier league" || lower === "epl") lg = "English Premier League";
      else if (lower === "la liga" || lower === "laliga" || lower === "spain - la liga" || lower === "spanish la liga") lg = "La Liga";
      else if (lower.includes("bundesliga") && !lower.includes("austria") && !lower.includes("women")) lg = "Bundesliga";
      else if (lower === "serie a" || lower === "italy - serie a" || lower === "italy serie a") lg = "Serie A";
      else if (lower === "ligue 1" || lower === "france - ligue 1" || lower === "france ligue 1") lg = "Ligue 1";
      else if (lower.includes("saudi pro league") || lower === "saudi arabia - pro league" || lower === "saudi arabian pro league" || lower === "saudi league") lg = "Saudi Pro League";
      else if (lower.includes("brasileirão") || lower.includes("brasileirao") || lower === "serie a (brazil)" || lower === "brazil - serie a") lg = "Brasileirão";
      else if (lower === "mls" || lower === "major league soccer" || lower === "usa - mls") lg = "MLS";
      else if (lower === "primeira liga" || lower === "portugal - primeira liga") lg = "Primeira Liga";
      else if (lower === "eredivisie" || lower === "netherlands - eredivisie") lg = "Eredivisie";

      if (!groups[lg]) groups[lg] = [];
      groups[lg].push(m);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const rankA = getLeagueRank(a);
      const rankB = getLeagueRank(b);
      
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return a.localeCompare(b);
    });

    return sortedKeys.map((key) => ({ league: key, matches: groups[key] }));
  }, [matches, groupByLeague, defaultLeague]);

  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState<string>("All Matches");

  const leagues = useMemo(() => {
    if (!groupedMatches) return [];
    return ["All Matches", ...groupedMatches.map((g) => g.league)];
  }, [groupedMatches]);

  const isPinned = useCallback((leagueName: string) => {
    const rank = getLeagueRank(leagueName);
    return rank > 0 && rank <= 11;
  }, []);

  const [selected, setSelected] = useState<Match | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [streamSources, setStreamSources] = useState<StreamSource[] | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);

  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
  }, []);

  const handleWatch = useCallback(
    async (m: Match) => {
      setSelected(m);
      setStreamUrl(null);
      setStreamSources(null);
      
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);

      if (m.status === "upcoming") {
        setStreamLoading(false);
        return;
      }
      
      setStreamLoading(true);

      // Force cancel the loading spinner after 10 seconds 
      loadingTimeoutRef.current = setTimeout(() => {
        setStreamLoading(false);
      }, 10000);

      // Check for multi-source override first
      const sources = staticStreamSources?.(m);
      if (sources && sources.length > 0) {
        setStreamSources(sources);
        setStreamUrl(sources[0].url);
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
        setStreamLoading(false);
        return;
      }

      const staticUrl = staticStreamResolver?.(m) ?? m.daddyStreamUrl ?? null;
      if (staticUrl) {
        setStreamUrl(staticUrl);
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
        setStreamLoading(false);
        return;
      }
      
      const hNorm = normalizeName(m.home?.name || "");
      const aNorm = normalizeName(m.away?.name || "");
      const catKeys = CATEGORY_KEYWORDS[category] ?? [];

      // Run DaddyLive + SportSRC in parallel — neither blocks the other
      const [daddyResult, sportSrcResult] = await Promise.allSettled([
        // 1. DaddyLive — cached browser fetch + robust multi-sport matching
        (async () => {
          const daddyEvents = await fetchDaddyEvents();
          for (const day of daddyEvents) {
            if (!day.categories) continue;
            for (const cat of Object.values(day.categories)) {
              if (!Array.isArray(cat as any)) continue;
              for (const ev of (cat as any[])) {
                if (!ev.event || !ev.channels?.length) continue;
                const evLower = ev.event.toLowerCase();
                // Pre-filter by sport category to avoid cross-sport false matches
                if (catKeys.length > 0 && !catKeys.some(k => evLower.includes(k))) continue;
                const evNorm = normalizeName(ev.event);
                // Strategy 1: full normalised name match
                const fullMatch =
                  hNorm && aNorm && evNorm.includes(hNorm) && evNorm.includes(aNorm);
                // Strategy 2: every significant word of each name appears
                const hWords = hNorm.split(" ").filter(w => w.length > 2);
                const aWords = aNorm.split(" ").filter(w => w.length > 2);
                const wordMatch =
                  hWords.length > 0 && aWords.length > 0 &&
                  hWords.every(w => evNorm.includes(w)) &&
                  aWords.every(w => evNorm.includes(w));
                if (fullMatch || wordMatch) {
                  return (ev.channels as any[]).map((ch: any, i: number) => ({
                    label: `Link ${i + 1}`,
                    url: ch.url as string,
                  }));
                }
              }
            }
          }
          return null;
        })(),
        // 2. SportSRC — get match detail for backup stream
        (async () => {
          const detail = await qc.fetchQuery(matchDetailQueryOptions(String(m.id), category));
          return extractStreamUrl(detail);
        })(),
      ]);

      const daddyLinks: { label: string; url: string }[] | null =
        daddyResult.status === "fulfilled" ? (daddyResult.value as any) : null;
      const sportSrcUrl = sportSrcResult.status === "fulfilled" ? sportSrcResult.value : null;

      if (sportSrcUrl || (daddyLinks && daddyLinks.length > 0)) {
        const sources: { label: string; url: string }[] = [];
        
        if (sportSrcUrl) {
          sources.push({ label: "Server 1", url: sportSrcUrl });
        }
        
        if (daddyLinks) {
          daddyLinks.forEach((link) => {
            sources.push({ label: `Server ${sources.length + 1} (DaddyLive)`, url: link.url });
          });
        }
        
        setStreamSources(sources);
        setStreamUrl(sources[0].url);
      } else if (detailFallbackUrl) {
        setStreamUrl(detailFallbackUrl);
      } else {
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
        setStreamLoading(false);
      }
    },
    [qc, category, staticStreamResolver, staticStreamSources, detailFallbackUrl, fetchDetail],
  );

  const handleClose = useCallback(() => setSelected(null), []);
  const handleIframeLoad = useCallback(() => {
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    setStreamLoading(false);
  }, []);

  return (
    <main className={`mx-auto max-w-7xl w-full ${title ? "px-4 py-8 sm:px-6 lg:px-8" : "pt-4"}`}>
      {title && (
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl flex items-center gap-2">
              {titleIcon}
              {title}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      )}

      {groupedMatches ? (
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          <aside className="w-full md:w-56 lg:w-64 flex-shrink-0">
            {/* Mobile horizontal tabs */}
            <div className="md:hidden flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 gap-2 scrollbar-hide">
              {leagues.map((lg) => (
                <button
                  key={lg}
                  onClick={() => setSelectedLeagueFilter(lg)}
                  className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedLeagueFilter === lg
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isPinned(lg) && <Pin className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />}
                  {lg}
                </button>
              ))}
            </div>
            
            {/* Desktop sidebar */}
            <div className="hidden md:flex flex-col gap-1 sticky top-24">
              <h3 className="font-semibold text-lg mb-3 px-3">Leagues</h3>
              {leagues.map((lg) => (
                <button
                  key={lg}
                  onClick={() => setSelectedLeagueFilter(lg)}
                  className={`flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedLeagueFilter === lg
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isPinned(lg) && <Pin className="w-3.5 h-3.5 text-blue-500 fill-blue-500 flex-shrink-0" />}
                  {lg}
                </button>
              ))}
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex flex-col gap-8">
              {groupedMatches
                .filter((g) => selectedLeagueFilter === "All Matches" || g.league === selectedLeagueFilter)
                .map(({ league, matches: leagueMatches }) => (
                  <div key={league} className="flex flex-col gap-4">
                    {selectedLeagueFilter === "All Matches" && (
                      <h3 className="text-xl font-bold tracking-tight border-b border-border pb-2">
                        {league}
                      </h3>
                    )}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                      {leagueMatches.length > 0 ? (
                        leagueMatches.map((m) =>
                          isChannelCard(m) ? (
                            <ChannelCard key={String(m.id)} match={m} onWatch={handleWatch} />
                          ) : (
                            <MatchCard
                              key={String(m.id)}
                              match={m}
                              defaultLeague={defaultLeague}
                              onWatch={handleWatch}
                              isPortrait={category === "mma"}
                            />
                          ),
                        )
                      ) : (
                        <div className="col-span-full py-10 px-4 text-center text-sm font-medium text-muted-foreground bg-muted/10 border border-border/50 border-dashed rounded-xl">
                          No matches scheduled today.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {matches.map((m) =>
            isChannelCard(m) ? (
              <ChannelCard key={String(m.id)} match={m} onWatch={handleWatch} />
            ) : (
              <MatchCard key={String(m.id)} match={m} defaultLeague={defaultLeague} onWatch={handleWatch} isPortrait={category === "mma"} />
            ),
          )}
        </div>
      )}

      {selected && (
        <Suspense fallback={null}>
          <StreamDialog
            selected={selected}
            streamUrl={streamUrl}
            streamSources={streamSources ?? undefined}
            streamLoading={streamLoading}
            upcomingLabel={upcomingLabel}
            upcomingSub={upcomingSub}
            onClose={handleClose}
            onIframeLoad={handleIframeLoad}
          />
        </Suspense>
      )}
    </main>
  );
}

export function SportsPageSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 h-10" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    </main>
  );
}
