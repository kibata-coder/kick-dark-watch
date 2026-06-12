import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Trophy } from "lucide-react";

export const Route = createFileRoute("/f1")({
  component: F1Page,
});

function StatusBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset" style={{ backgroundColor: "oklch(0.7 0.22 25 / 0.15)", color: "oklch(0.78 0.22 25)", boxShadow: "inset 0 0 0 1px oklch(0.7 0.22 25 / 0.4)" }}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: "oklch(0.7 0.22 25)" }} />
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: "oklch(0.7 0.22 25)" }} />
      </span>
      LIVE
    </span>
  );
}

function F1Page() {
  const [isWatching, setIsWatching] = useState(false);
  const streamUrl = "https://streamfree.app/embed/racing/skyf1?server=origin&quality=1080p&category=racing";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Formula 1</h2>
          <p className="mt-1 text-sm text-muted-foreground">Dedicated 24/7 Live Feed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card className="group flex flex-col overflow-hidden border-border/60 bg-card/80 backdrop-blur transition-all hover:border-primary/40 hover:shadow-[0_0_0_1px_oklch(var(--primary)/0.3),0_20px_40px_-20px_oklch(var(--primary)/0.4)]">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
            <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
              <Trophy className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Motorsport</span>
            </div>
            <StatusBadge />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center p-4 bg-black/50 rounded-lg">
                {/* Official F1 Logo rendered natively via SVG for sharp quality */}
                <svg viewBox="0 0 100 25" className="h-8 w-auto fill-white">
                    <path d="M21.2 24.3H0L9.9 0h21.2L21.2 24.3z"/>
                    <path d="M49 0h21.1v6.8H54.4l-2.6 6.5h15.6v6.8H49L49 0z"/>
                    <path fill="#e10600" d="M37.9 24.3l9.9-24.3H69L59.1 24.3H37.9z"/>
                </svg>
            </div>
            <div className="flex items-center justify-between gap-3">
                <span className="text-lg font-bold text-foreground">Sky Sports F1 HD</span>
            </div>
          </CardContent>
          <CardFooter className="mt-auto pt-3">
            <Button onClick={() => setIsWatching(true)} className="w-full font-semibold" size="sm">
              <Play className="mr-1.5 h-4 w-4 fill-current" />
              Launch Stream
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={isWatching} onOpenChange={setIsWatching}>
        <DialogContent className="max-w-5xl border-border bg-card p-0 sm:rounded-2xl overflow-hidden">
          <DialogHeader className="border-b border-border/60 px-5 py-4">
            <DialogTitle className="flex items-center gap-3 text-base">
              <span className="truncate">Live: Formula 1 Broadcast</span>
              <StatusBadge />
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full bg-black aspect-video">
             {isWatching && (
                <iframe
                  src={streamUrl}
                  width="100%"
                  height="100%"
                  frameBorder={0}
                  scrolling="no"
                  allow="autoplay; fullscreen; encrypted-media"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
             )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
