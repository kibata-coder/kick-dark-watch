// src/components/sports/SportsPage.tsx
import { Suspense, lazy, useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { MatchCard } from "./MatchCard";
import { ChannelCard } from "./ChannelCard";
import { matchesQueryOptions, matchDetailQueryOptions } from "@/lib/sports/query";
import { normalizeMatches, extractStreamUrl } from "@/lib/sports/utils";
import { getMatchDetail } from "@/lib/sportsrc.functions";
import type { Match } from "@/lib/sports/types";

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
    const groups: Record<string, Match[]> = {};
    matches.forEach((m) => {
      const lg = getLeagueName(m, defaultLeague);
      if (!groups[lg]) groups[lg] = [];
      groups[lg].push(m);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === "LIVE CHANNEL") return -1;
      if (b === "LIVE CHANNEL") return 1;
      return a.localeCompare(b);
    });

    return sortedKeys.map((key) => ({ league: key, matches: groups[key] }));
  }, [matches, groupByLeague, defaultLeague]);

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
        return;
      }

      const staticUrl = staticStreamResolver?.(m) ?? m.daddyStreamUrl ?? null;
      if (staticUrl) {
        setStreamUrl(staticUrl);
        return; 
      }
      
      try {
        const detail = await qc.fetchQuery(matchDetailQueryOptions(String(m.id), category));
        const url = extractStreamUrl(detail);
        if (url) {
          setStreamUrl(url);
        } else if (detailFallbackUrl) {
          setStreamUrl(detailFallbackUrl);
        } else {
          if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
          setStreamLoading(false);
        }
      } catch (e) {
        console.error(e);
        if (detailFallbackUrl) {
          setStreamUrl(detailFallbackUrl);
        } else {
          if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
          setStreamLoading(false);
        }
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
        <div className="flex flex-col gap-8">
          {groupedMatches.map(({ league, matches: leagueMatches }) => (
            <div key={league} className="flex flex-col gap-4">
              <h3 className="text-xl font-bold tracking-tight border-b border-border pb-2">
                {league}
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {leagueMatches.map((m) =>
                  isChannelCard(m) ? (
                    <ChannelCard key={String(m.id)} match={m} onWatch={handleWatch} />
                  ) : (
                    <MatchCard key={String(m.id)} match={m} defaultLeague={defaultLeague} onWatch={handleWatch} isPortrait={category === "mma"} />
                  ),
                )}
              </div>
            </div>
          ))}
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
