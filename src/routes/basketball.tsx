import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMatches, getMatchDetail } from "@/lib/sportsrc.functions";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, RefreshCw, Trophy, AlertCircle } from "lucide-react";
import { countryFlagUrl } from "@/lib/country-flags";

export const Route = createFileRoute("/basketball")({
  component: BasketballPage,
});

// Added daddyStreamUrl to your type definition
type Match = { id: string | number; title?: string; home?: any; away?: any; league?: any; status?: string; time?: string; date?: number | string; poster?: string; daddyStreamUrl?: string; [k: string]: unknown; };

// --- THE PERMANENT IFRAME EMBED URLS ---
const STREAMFREE_NBA_URL = "https://streamfree.app/embed/basketball/nbatv?server=origin&quality=1080p&category=basketball";
const BUFFSTREAMS_URL = "https://buffstreams.plus/index18";

const staticMatches: Match[] = [
  { id: "nba-static", title: "Server 1", home: { name: "NBA Live", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/03/National_Basketball_Association_logo.svg/315px-National_Basketball_Association_logo.svg.png" }, away: { name: "HD Feed", logo: "" }, league: { name: "Basketball (24/7)" }, status: "inprogress" },
  { id: "buff-static", title: "Server 2", home: { name: "Global Hoops", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Basketball.png/512px-Basketball.png" }, away: { name: "HD Feed", logo: "" }, league: { name: "Live Events" }, status: "inprogress" }
];

function deriveStatus(dateMs?: number): string {
  if (!dateMs) return "upcoming";
  const diff = Date.now() - dateMs;
  if (diff >= 0 && diff < 2.5 * 60 * 60 * 1000) return "inprogress";
  if (diff >= 2.5 * 60 * 60 * 1000) return "finished";
  return "upcoming";
}

function normalizeMatches(raw: any): Match[] {
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
      daddyStreamUrl: m.daddyStreamUrl // Safely inherit the automated URL assigned by the server
    };
  });
}

function extractStreamUrl(raw: any): string | null {
  if (!raw) return null;
  const c = [ raw?.data?.sources?.[0]?.embedUrl, raw?.sources?.[0]?.embedUrl, raw.stream_url, raw.url, raw.embed, raw.data?.stream_url ];
  return c.find(url => typeof url === "string" && url.trim()) || null;
}

function StatusBadge({ status }: { status?: string }) {
  if (status === "inprogress" || status === "live") return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset bg-primary/15 text-primary shadow-[inset_0_0_0_1px_rgba(255,0,0,0.4)]"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary" /></span>LIVE</span>;
  if (status === "finished") return <Badge variant="secondary" className="rounded-full">Finished</Badge>;
  return <Badge variant="outline" className="rounded-full">Upcoming</Badge>;
}

function TeamRow({ name, logo }: { name?: string; logo?: string }) {
  const flag = countryFlagUrl(name) ?? null;
  const initial: string | null = logo && logo.trim() ? logo : flag;
  const [src, setSrc] = useState<string | null>(initial);
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border p-1">
        {src ? (
          <img src={src} alt="" onError={() => setSrc((cur) => (cur !== flag && flag ? flag : null))} className="h-full w-full object-contain" />
        ) : (
          <Trophy className="h-4 w-4 text-muted-foreground/60" />
        )}
      </div>
      <span className="truncate text-sm font-medium text-foreground">{name}</span>
    </div>
  );
}

function BasketballPage() {
  const [matches, setMatches] = useState<Match[]>(staticMatches);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Match | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);

  const fetchMatches = useServerFn(getMatches);
  const fetchDetail = useServerFn(getMatchDetail);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await fetchMatches({ data: { category: "basketball" } });
      const apiMatches = normalizeMatches(data);
      setMatches([...staticMatches, ...apiMatches]);
    } catch (e: any) { 
      setError(e?.message); 
      setMatches(staticMatches); 
    } finally { 
      setLoading(false); 
    }
  };

  // 300000ms = 5 minutes polling
  useEffect(() => { load(); const id = setInterval(load, 300000); return () => clearInterval(id); }, []);

  const handleWatch = async (m: Match) => {
    setSelected(m); 
    setStreamUrl(null);
    
    if (m.status === "upcoming") {
      setStreamLoading(false);
      return;
    }

    setStreamLoading(true);
    
    // 1. AUTOMATED FRAME INJECTION
    // If our server found a matching Daddy Live feed, bypass extra API lookups and play immediately
    if (m.daddyStreamUrl) {
      setStreamUrl(m.daddyStreamUrl);
      return;
    }

    // 2. Static Server Fallbacks
    if (m.id === "nba-static") { setStreamUrl(STREAMFREE_NBA_URL); return; }
    if (m.id === "buff-static") { setStreamUrl(BUFFSTREAMS_URL); return; }

    // 3. Native API Fetch as final backup
    try {
      const data = await fetchDetail({ data: { id: String(m.id) } });
      const url = extractStreamUrl(data);
      if (url) {
        setStreamUrl(url);
      } else {
        // Failsafe stream frame to prevent black screens
        setStreamUrl("https://dlhd.pk/stream/stream-302.php"); 
      }
    } catch (e) { 
      console.error(e); 
      setStreamLoading(false); 
      setStreamUrl("https://dlhd.pk/stream/stream-302.php"); // Failsafe
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-2xl font-bold sm:text-3xl">Live Basketball</h2>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
      </div>

      {error && <div className="mb-6 p-4 text-sm text-destructive bg-destructive/10 border border-destructive/40 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading && matches.length === 2 ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />) : matches.map((m) => (
          <Card key={String(m.id)} className="bg-card/80 backdrop-blur hover:border-primary/40 transition-all flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-3"><span className="text-xs text-muted-foreground truncate">{m.league?.name || "Basketball"}</span><StatusBadge status={m.status} /></CardHeader>
            <CardContent className="space-y-3 flex-grow">
              <TeamRow name={m.home?.name} logo={m.home?.logo} />
              <TeamRow name={m.away?.name} logo={m.away?.logo} />
            </CardContent>
            <CardFooter className="pt-3 mt-auto">
              <Button onClick={() => handleWatch(m)} className="w-full" size="sm"><Play className="mr-1.5 h-4 w-4" /> Watch</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-5xl border-border bg-card p-0 overflow-hidden sm:rounded-2xl">
          <DialogHeader className="border-b border-border/60 px-5 py-4"><DialogTitle>{selected?.title || `${selected?.home?.name} vs ${selected?.away?.name}`}</DialogTitle></DialogHeader>
          
          <div className="relative aspect-video w-full bg-black">
            {/* UPCOMING STATE */}
            {selected?.status === "upcoming" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 px-4 text-center">
                <AlertCircle className="mb-3 h-8 w-8 text-muted-foreground" />
                <span className="text-lg font-medium text-foreground">Match not yet started</span>
                <span className="mt-1 text-sm text-muted-foreground">Please check back closer to tip-off.</span>
              </div>
            )}

            {/* ERROR STATE: Stream not found / API failure */}
            {!streamLoading && !streamUrl && selected?.status !== "upcoming" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 px-4 text-center">
                <AlertCircle className="mb-3 h-8 w-8 text-destructive" />
                <span className="text-lg font-medium text-foreground">Stream unavailable</span>
                <span className="mt-1 text-sm text-muted-foreground">The feed for this event could not be located.</span>
              </div>
            )}

            {/* LOADING STATE */}
            {streamLoading && selected?.status !== "upcoming" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90">
                <RefreshCw className="h-8 w-8 animate-spin text-primary mb-3" />
                <span className="text-sm font-medium text-muted-foreground">Connecting to stream...</span>
              </div>
            )}
            
            {/* PLAYING STATE */}
            {streamUrl && selected?.status !== "upcoming" && (
              <iframe 
                src={streamUrl} 
                onLoad={() => setStreamLoading(false)}
                allow="autoplay; fullscreen; encrypted-media" 
                allowFullScreen 
                className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-700 ${streamLoading ? 'opacity-0' : 'opacity-100'}`} 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
