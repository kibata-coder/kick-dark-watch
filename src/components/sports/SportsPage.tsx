import { Suspense, lazy, useCallback, useMemo, useState } from "react";
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

export type SportsPageProps = {
  category: string;
  title: string;
  subtitle: string;
  titleIcon?: React.ReactNode;
  defaultLeague: string;
  staticMatches: Match[];
  isChannelCard: (m: Match) => boolean;
  staticStreamResolver?: (m: Match) => string | null;
  detailFallbackUrl?: string;
  upcomingLabel?: string;
  upcomingSub?: string;
};

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
    detailFallbackUrl,
    upcomingLabel,
    upcomingSub,
  } = props;

  const qc = useQueryClient();
  const options = matchesQueryOptions(category);
  const { data, isFetching, refetch } = useSuspenseQuery(options);
  const fetchDetail = useServerFn(getMatchDetail);

  const matches = useMemo<Match[]>(
    () => [...staticMatches, ...normalizeMatches(data)],
    [data, staticMatches],
  );

  const [selected, setSelected] = useState<Match | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);

  const handleWatch = useCallback(
    async (m: Match) => {
      setSelected(m);
      setStreamUrl(null);
      if (m.status === "upcoming") {
        setStreamLoading(false);
        return;
      }
      setStreamLoading(true);
      const staticUrl = staticStreamResolver?.(m) ?? m.daddyStreamUrl ?? null;
      if (staticUrl) {
        setStreamUrl(staticUrl);
        return;
      }
      try {
        const detail = await qc.fetchQuery(matchDetailQueryOptions(String(m.id), category));
        const url = extractStreamUrl(detail);
        if (url) setStreamUrl(url);
        else if (detailFallbackUrl) setStreamUrl(detailFallbackUrl);
        else setStreamLoading(false);
      } catch (e) {
        console.error(e);
        if (detailFallbackUrl) setStreamUrl(detailFallbackUrl);
        else setStreamLoading(false);
      }
    },
    [qc, category, staticStreamResolver, detailFallbackUrl, fetchDetail],
  );

  const handleClose = useCallback(() => setSelected(null), []);
  const handleIframeLoad = useCallback(() => setStreamLoading(false), []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {matches.map((m) =>
          isChannelCard(m) ? (
            <ChannelCard key={String(m.id)} match={m} onWatch={handleWatch} />
          ) : (
            <MatchCard key={String(m.id)} match={m} defaultLeague={defaultLeague} onWatch={handleWatch} />
          ),
        )}
      </div>

      {selected && (
        <Suspense fallback={null}>
          <StreamDialog
            selected={selected}
            streamUrl={streamUrl}
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