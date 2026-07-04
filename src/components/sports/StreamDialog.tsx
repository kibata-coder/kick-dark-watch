import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, RefreshCw, Tv } from "lucide-react";
import { useState, useEffect } from "react";
import type { Match } from "@/lib/sports/types";

export type StreamSource = {
  label: string;
  url: string;
};

export function StreamDialog({
  selected,
  streamUrl,
  streamSources,
  streamLoading,
  upcomingLabel = "Match not yet started",
  upcomingSub = "Please check back closer to kick-off.",
  onClose,
  onIframeLoad,
}: {
  selected: Match | null;
  streamUrl: string | null;
  streamSources?: StreamSource[];
  streamLoading: boolean;
  upcomingLabel?: string;
  upcomingSub?: string;
  onClose: () => void;
  onIframeLoad: () => void;
}) {
  const isUpcoming = selected?.status === "upcoming";

  // When multiple sources are provided, track which one is active
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset active index whenever a new match is opened
  useEffect(() => {
    setActiveIndex(0);
  }, [selected?.id]);

  const sources: StreamSource[] = streamSources && streamSources.length > 0
    ? streamSources
    : streamUrl
      ? [{ label: "Stream 1", url: streamUrl }]
      : [];

  const activeUrl = sources[activeIndex]?.url ?? null;
  const hasMultipleSources = sources.length > 1;

  return (
    <Dialog open={!!selected} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl border-border bg-card p-0 overflow-hidden sm:rounded-2xl">
        <DialogHeader className="border-b border-border/60 px-5 py-4">
          <DialogTitle>
            {selected?.title || `${selected?.home?.name ?? ""}${selected?.away?.name ? ` vs ${selected.away.name}` : ""}`}
          </DialogTitle>

          {/* Server switcher buttons */}
          {hasMultipleSources && !isUpcoming && (
            <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden w-full">
              {sources.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors shrink-0 ${
                    i === activeIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Tv className="h-3 w-3" />
                  {src.label}
                </button>
              ))}
            </div>
          )}
        </DialogHeader>
        
        <div className="relative aspect-video w-full bg-black">
          {/* Upcoming State */}
          {isUpcoming && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 px-4 text-center">
              <AlertCircle className="mb-3 h-8 w-8 text-muted-foreground" />
              <span className="text-lg font-medium text-foreground">{upcomingLabel}</span>
              <span className="mt-1 text-sm text-muted-foreground">{upcomingSub}</span>
            </div>
          )}

          {/* Missing Stream State */}
          {!isUpcoming && !streamLoading && sources.length === 0 && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 px-4 text-center">
              <AlertCircle className="mb-3 h-8 w-8 text-destructive" />
              <span className="text-lg font-medium text-foreground">Stream unavailable</span>
              <span className="mt-1 text-sm text-muted-foreground">The feed for this event could not be located.</span>
            </div>
          )}

          {/* Loading State */}
          {!isUpcoming && streamLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20"></div>
                <div className="absolute inset-2 animate-pulse rounded-full bg-primary/30"></div>
                <Tv className="relative h-8 w-8 text-primary animate-pulse" />
              </div>
              <span className="mt-6 text-sm font-semibold tracking-widest text-primary uppercase animate-pulse">Establishing Secure Link</span>
              <span className="mt-2 text-xs text-muted-foreground/60">Tuning into broadcast...</span>
            </div>
          )}

          {/* Iframe player */}
          {!isUpcoming && activeUrl && (
            <iframe
              key={activeUrl}
              src={activeUrl}
              onLoad={onIframeLoad}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              referrerPolicy="no-referrer"
              frameBorder="0"
              className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-700 ${streamLoading ? "opacity-0" : "opacity-100"}`}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
