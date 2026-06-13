import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMatches, getMatchDetail } from "@/lib/sportsrc.functions";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, RefreshCw, Trophy, AlertCircle, Tv } from "lucide-react";
import { countryFlagUrl } from "@/lib/country-flags";

export const Route = createFileRoute("/football")({
  component: FootballPage,
});

type Match = { 
  id: string | number; 
  title?: string; 
  home?: any; 
  away?: any; 
  league?: any; 
  status?: string; 
  time?: string; 
  date?: number | string; 
  poster?: string; 
  daddyStreamUrl?: string; 
  [k: string]: unknown; 
};

// --- 24/7 PERMANENT CHANNELS ---
const staticMatches: Match[] = [
  { 
    id: "channel-skynews", 
    title: "Sky Sports News", 
    home: { name: "Sky Sports News", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Sky_Sports_News_-_Logo_2025.svg/1920px-Sky_Sports_News_-_Logo_2025.svg.png?_=20260324104102" }, 
    away: { name: "Sky Sports News", logo: "" }, 
    league: { name: "Sky Sports News" }, 
    status: "inprogress",
    daddyStreamUrl: "https://dlhd.pk/stream/stream-366.php" 
  },
  { 
    id: "channel-skypl", 
    title: "Sky Sports PL", 
    home: { name: "Sky Sports PL", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Sky_Sports_Premier_League_-_Logo_2025.svg/1280px-Sky_Sports_Premier_League_-_Logo_2025.svg.png?_=20260324104241" }, 
    away: { name: "Sky Sports PL", logo: "" }, 
    league: { name: "Premier League" }, 
    status: "inprogress",
    daddyStreamUrl: "https://dlhd.pk/stream/stream-130.php" 
  }
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
      league: m.category ? { name: String(m.category) } : undefined
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

function FootballPage() {
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
      const data = await fetchMatches({ data: { category: "football" } });
      const apiMatches = normalizeMatches(data);
      // Merge permanent 24/7 channels with live API data
      setMatches([...staticMatches, ...apiMatches]);
    } catch (e: any) { 
      setError(e?.message); 
      setMatches(staticMatches); 
    } finally { 
      setLoading(false); 
    }
  };

  // Poll for new match data every 5 minutes
  useEffect(() => { load(); const id = setInterval(load, 300000); return () => clearInterval(id); }, []);

  const handleWatch = async (m: Match) => {
    setSelected(m); 
    setStreamUrl(null);
    
    if (m.status === "upcoming") {
      setStreamLoading(false);
      return;
    }

    setStreamLoading(true);
    
    // Instantly resolve streams for 24/7 configured channels
    if (m.daddyStreamUrl) {
      setStreamUrl(m.daddyStreamUrl);
      return;
    }

    // Fetch stream URLs dynamically for sportsrc API matches
    try {
      const data = await fetchDetail({ data: { id: String(m.id) } });
      const url = extractStreamUrl(data);
      if (url) {
        setStreamUrl(url);
      } else {
        setStreamLoading(false); 
      }
    } catch (e) { 
      console.error(e); 
      setStreamLoading(false); 
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">Live Football</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Browse live broadcast matches or jump straight into continuous television streams.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {error && <div className="mb-6 p-4 text-sm text-destructive bg-destructive/10 border border-destructive/40 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading && matches.length === 2 ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
        ) : (
          matches.map((m) => {
            const isChannelCard = !!m.daddyStreamUrl;

            // PREMIUM 24/7 CHANNEL LAYOUT
            if (isChannelCard) {
              return (
                <Card 
                  key={String(m.id)} 
                  className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-primary/30 shadow-xl hover:shadow-primary/5 hover:border-primary transition-all duration-300 flex flex-col group min-h-[200px]"
                >
                  <div className="absolute right-[-20px] bottom-[-20px] text-muted/5 group-hover:text-primary/5 transition-colors pointer-events-none">
                    <Tv className="w-40 h-40" />
                  </div>

                  <CardHeader className="flex flex-row items-center justify-between pb-2 z-10">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary/80 bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                      {m.league?.name || "24/7 Broadcast"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-900/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ONLINE
                    </span>
                  </CardHeader>

                  <CardContent className="flex flex-col items-center justify-center flex-grow text-center p-4 z-10">
                    <div className="h-14 w-full flex items-center justify-center p-1 bg-black/20 rounded-lg border border-slate-900 shadow-inner mb-2 transition-transform group-hover:scale-105 duration-300">
                      {m.home?.logo ? (
                        <img src={m.home.logo} alt={m.home.name} className="h-full object-contain max-w-[85%]" />
                      ) : (
                        <Tv className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <h4 className="text-base font-bold text-white group-hover:text-primary transition-colors duration-300">
                      {m.home?.name}
                    </h4>
                  </CardContent>

                  <CardFooter className="pt-2 pb-4 px-4 z-10 mt-auto">
                    <Button 
                      onClick={() => handleWatch(m)} 
                      className="w-full bg-slate-900 border border-slate-800 hover:bg-primary hover:text-primary-foreground text-slate-200 font-semibold transition-all duration-300 shadow-md" 
                      size="sm"
                    >
                      <Play className="mr-1.5 h-3.5 w-3.5 fill-current" /> Tune In
                    </Button>
                  </CardFooter>
                </Card>
              );
            }

            // STANDARD MATCH LAYOUT
            return (
              <Card key={String(m.id)} className="bg-card/80 backdrop-blur hover:border-primary/40 transition-all flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <span className="text-xs text-muted-foreground truncate">{m.league?.name || "Football"}</span>
                  <StatusBadge status={m.status} />
                </CardHeader>
                <CardContent className="space-y-3 flex-grow">
                  <TeamRow name={m.home?.name} logo={m.home?.logo} />
                  <TeamRow name={m.away?.name} logo={m.away?.logo} />
                </CardContent>
                <CardFooter className="pt-3 mt-auto">
                  <Button onClick={() => handleWatch(m)} className="w-full" size="sm">
                    <Play className="mr-1.5 h-4 w-4" /> Watch
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>

      {/* STREAMING MODAL */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-5xl border-border bg-card p-0 overflow-hidden sm:rounded-2xl">
          <DialogHeader className="border-b border-border/60 px-5 py-4">
            <DialogTitle>{selected?.title || `${selected?.home?.name} vs ${selected?.away?.name}`}</DialogTitle>
          </DialogHeader>
          
          <div className="relative aspect-video w-full bg-black">
            {selected?.status === "upcoming" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 px-4 text-center">
                <AlertCircle className="mb-3 h-8 w-8 text-muted-foreground" />
                <span className="text-lg font-medium text-foreground">Match not yet started</span>
                <span className="mt-1 text-sm text-muted-foreground">Please check back closer to kick-off.</span>
              </div>
            )}

            {!streamLoading && !streamUrl && selected?.status !== "upcoming" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 px-4 text-center">
                <AlertCircle className="mb-3 h-8 w-8 text-destructive" />
                <span className="text-lg font-medium text-foreground">Stream unavailable</span>
                <span className="mt-1 text-sm text-muted-foreground">The feed for this event could not be located.</span>
              </div>
            )}

            {streamLoading && selected?.status !== "upcoming" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90">
                <RefreshCw className="h-8 w-8 animate-spin text-primary mb-3" />
                <span className="text-sm font-medium text-muted-foreground">Connecting to stream...</span>
              </div>
            )}
            
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
