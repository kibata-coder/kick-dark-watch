import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button"; // Added Button import
import type { Match } from "@/lib/sports/types";

export function StreamDialog({
  selected,
  streamUrl,
  streamLoading,
  upcomingLabel = "Match not yet started",
  upcomingSub = "Please check back closer to kick-off.",
  onClose,
  onIframeLoad,
}: {
  selected: Match | null;
  streamUrl: string | null;
  streamLoading: boolean;
  upcomingLabel?: string;
  upcomingSub?: string;
  onClose: () => void;
  onIframeLoad: () => void;
}) {
  const isUpcoming = selected?.status === "upcoming";
  
  return (
    <Dialog open={!!selected} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl border-border bg-card p-0 overflow-hidden sm:rounded-2xl">
        {/* Updated DialogHeader to use a flex layout to hold both the Title and the new Button */}
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border/60 px-5 py-4 space-y-0">
          <DialogTitle>
            {selected?.title || `${selected?.home?.name ?? ""}${selected?.away?.name ? ` vs ${selected.away.name}` : ""}`}
          </DialogTitle>
          
          {/* If the match is not upcoming and we have a streamUrl, render the fallback button */}
          {!isUpcoming && streamUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={streamUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Watch in New Tab
              </a>
            </Button>
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
          {!isUpcoming && !streamLoading && !streamUrl && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 px-4 text-center">
              <AlertCircle className="mb-3 h-8 w-8 text-destructive" />
              <span className="text-lg font-medium text-foreground">Stream unavailable</span>
              <span className="mt-1 text-sm text-muted-foreground">The feed for this event could not be located.</span>
            </div>
          )}

          {/* Loading State */}
          {!isUpcoming && streamLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mb-3" />
              <span className="text-sm font-medium text-muted-foreground">Connecting to stream...</span>
            </div>
          )}

          {/* Video Iframe State */}
          {!isUpcoming && streamUrl && (
            <iframe
              src={streamUrl}
              onLoad={onIframeLoad}
              allow="autoplay; fullscreen; encrypted-media"
              allowFullScreen
              loading="lazy"
              className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-700 ${streamLoading ? "opacity-0" : "opacity-100"}`}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
