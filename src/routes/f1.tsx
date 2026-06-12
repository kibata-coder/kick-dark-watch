import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMatches, getMatchDetail } from "@/lib/sportsrc.functions";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, RefreshCw, Trophy, AlertCircle, Radio } from "lucide-react";
import { countryFlagUrl } from "@/lib/country-flags";

export const Route = createFileRoute("/f1")({
  component: RacingPage,
});

type Match = { id: string | number; title?: string; home?: any; away?: any; league?: any; status?: string; time?: string; date?: number | string; poster?: string; [k: string]: unknown; };

// --- 24/7 STATIC F1 MATCH ---
const staticF1Match: Match = {
  id: "f1-static-embed",
  title: "Formula 1 Racing",
  home: { name: "Formula 1 Live", logo: "https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg" },
  away: { name: "Sky Sports F1 HD", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Sky_Sports_F1_logo.svg/512px-Sky_Sports_F1_logo.svg.png" },
  league: { name: "Formula 1 (24/7 Feed)" },
  status: "live",
  time: "LIVE",
};
const F1_STREAM_URL = "https://streamfree.app/embed/racing/skyf1?server=origin&quality=1080p&category=racing";
// ----------------------------

// Helper Functions
function splitTitle(title?: string): { home?: string; away?: string } {
  if (!title) return {};
  const m = title.match(/^(.+?)\s+vs\.?\s+(.+)$/i);
  if (m) return { home: m[1].trim(), away: m[2].trim() };
  return { home: title };
}

function deriveStatus(dateMs?: number): string {
  if (!dateMs) return "upcoming";
  const now = Date.now();
  const diff = now - dateMs;
  if (diff >= 0 && diff < 2.5 * 60 * 60 * 1000) return "inprogress";
  if (diff >= 2.5 * 60 * 60 * 1000) return "finished";
  return "upcoming";
}

function formatTime(dateMs?: number): string | undefined {
  if (!dateMs) return undefined;
  try { return new Date(dateMs).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" }); } catch { return undefined; }
}

function normalizeMatches(raw: any): Match[] {
  const items: any[] = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
  return items.map((m) => {
    const t = splitTitle(m.title);
    const dateMs = typeof m.date === "number" ? m.date : undefined;
    return {
      id: m.id, title: m.title, status: deriveStatus(dateMs), time: formatTime(dateMs), date: dateMs,
      home: { name: m.teams?.home?.name || t.home || m.title, logo: m.teams?.home?.badge },
      away: { name: m.teams?.away?.name || t.away || "Race", logo: m.teams?.away?.badge },
      league: m.category ? { name: String(m.category) } : undefined,
    };
  });
}

function extractStreamUrl(raw: any): string | null {
  if (!raw) return null;
  const candidates = [ raw?.data?.sources?.[0]?.embedUrl, raw?.sources?.[0]?.embedUrl, raw.stream_url, raw.url, raw.embed, raw.data?.stream_url ];
  for (const c of candidates) if (typeof c === "string" && c.trim()) return c;
  return null;
}

function statusVariant(status?: string): "live" | "upcoming" | "finished" {
  const s = (status || "").toLowerCase();
  if (s.includes("progress") || s.includes("live") || s.includes("ht") || s.includes("1h")) return "live";
  if (s.includes("finish") || s.includes("ft") || s.includes("ended")) return "finished";
  return "upcoming";
}

function StatusBadge({ status }: { status?: string }) {
  const v = statusVariant(status);
  if (v === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset" style={{ backgroundColor: "oklch(0.7 0.22 25 / 0.15)", color: "oklch(0.78 0.22 25)", boxShadow: "inset 0 0 0 1px oklch(0.7 0.22 25 / 0.4)" }}>
        <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: "oklch(0.7 0.22 25)" }} /><span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: "oklch(0.7 0.22 25)" }} /></span>
        LIVE
      </span>
    );
  }
  if (v === "finished") return <Badge variant="secondary" className="rounded-full">Finished</Badge>;
  return <Badge variant="outline" className="rounded-full">Upcoming</Badge>;
}

function TeamRow({ name, logo, label }: { name?: string; logo?: string; label?: string }) {
  const src = logo && logo.trim() ? logo : countryFlagUrl(name);
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border p-1">
          {src ? <img src={src} alt="logo" className="h-full w-full object-contain bg-white/10 rounded-full" /> : <Trophy className="h-4 w-4 text-muted-foreground" />}
        </div>
        <span className="truncate text-sm font-medium text-foreground">{name}</span>
      </div>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}

// Main Page Component
function RacingPage() {
  const [matches, setMatches] = useState<Match[]>([staticF1Match]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Match | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  const fetchMatches = useServerFn(getMatches);
  const fetchDetail = useServerFn(getMatchDetail);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      // We specifically ask the API for the "motorsport" category!
      const data = await fetchMatches({ data: { category: "motorsport" } });
      const normalized = normalizeMatches(data);
      // We merge our permanent 24/7 Sky F1 stream with whatever live races are happening
      setMatches([staticF1Match, ...normalized]);
    } catch (e: any) { 
      setError(e?.message || "Could not load dynamic races"); 
      setMatches([staticF1Match]); // Fallback to at least showing our hardcoded F1 stream
    }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); const id = setInterval(load, 60_000); return () => clearInterval(id); }, []);

  const handleWatch = async (m: Match) => {
    setSelected(m); setStreamUrl(null); setStreamError(null); setStreamLoading(true);

    // Bypass API if it's our hardcoded stream
    if (m.id === "f1-static-embed") {
      setStreamUrl(F1_STREAM_URL);
      setStreamLoading(false);
      return;
    }

    try {
      // Fetch dynamic link for API motorsport events (MotoGP, NASCAR, etc)
      const data = await fetchDetail({ data: { id: String(m.id), category: "motorsport" } });
      const url = extractStreamUrl(data);
      if (!url) throw new Error("No stream available for this event yet");
      setStreamUrl(url);
    } catch (e: any) { setStreamError(e?.message || "Stream unavailable"); }
    finally { setStreamLoading(false); }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
            <Radio className="h-6 w-6 text-primary" /> Motorsport & Racing
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">F1, MotoGP, NASCAR, and more</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" /><div><p className="font-medium">Notice</p><p className="text-muted-foreground">{error}</p></div></div>
      )}

      {loading && matches.length === 1 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
           {/* Static F1 card displays while the rest load */}
          <Skeleton className="h-48 w-full rounded-xl" />
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {matches.map((m) => (
            <Card key={String(m.id)} className="group flex flex-col overflow-hidden border-border/60 bg-card/80 backdrop-blur transition-all hover:border-primary/40">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Trophy className="h-3.5 w-3.5" /><span className="truncate">{m.league?.name || "Motorsport"}</span></div>
                <StatusBadge status={m.status} />
              </CardHeader>
              <CardContent className="space-y-3">
                <TeamRow name={m.home?.name} logo={m.home?.logo} label={m.time && typeof m.time === "string" && m.time !== "LIVE" ? "Event" : ""} />
                <TeamRow name={m.away?.name} logo={m.away?.logo} label={m.time && typeof m.time === "string" && m.time !== "LIVE" ? m.time : ""} />
              </CardContent>
              <CardFooter className="mt-auto pt-3">
                <Button onClick={() => handleWatch(m)} className="w-full font-semibold" size="sm">
                  <Play className="mr-1.5 h-4 w-4 fill-current" /> Watch Stream
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-5xl border-border bg-card p-0 sm:rounded-2xl overflow-hidden">
          <DialogHeader className="border-b border-border/60 px-5 py-4">
            <DialogTitle className="flex items-center gap-3 text-base">
              <span className="truncate">{selected?.title || selected?.home?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video w-full bg-black">
            {streamLoading && <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground"><RefreshCw className="h-6 w-6 animate-spin" /><span className="mt-2 text-sm">Loading stream…</span></div>}
            {streamError && !streamLoading && <div className="absolute inset-0 flex flex-col items-center justify-center text-center"><AlertCircle className="h-8 w-8 text-destructive mb-2" /><p className="font-medium">Stream unavailable</p><p className="text-sm text-muted-foreground">{streamError}</p></div>}
            {streamUrl && !streamLoading && !streamError && <iframe src={streamUrl} allow="autoplay; fullscreen; encrypted-media" allowFullScreen className="absolute inset-0 h-full w-full border-0" />}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
