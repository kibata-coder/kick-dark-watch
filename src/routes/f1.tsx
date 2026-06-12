import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMatches, getMatchDetail } from "@/lib/sportsrc.functions";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, RefreshCw, Trophy, Radio } from "lucide-react";
import { countryFlagUrl } from "@/lib/country-flags";

export const Route = createFileRoute("/f1")({
  component: RacingPage,
});

type Match = { id: string | number; title?: string; home?: any; away?: any; league?: any; status?: string; time?: string; date?: number | string; [k: string]: unknown; };

// The specific streamfree links we discussed
const F1_STREAM_URL = "https://streamfree.app/embed/racing/skyf1?server=origin&quality=1080p&category=racing";
const LEMANS_STREAM_URL = "https://streamfree.app/embed/racing/lemans?server=origin&quality=1080p&category=racing";

const staticMatches: Match[] = [
  { id: "f1-static", title: "Formula 1 Racing", home: { name: "Formula 1 Live", logo: "https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg" }, away: { name: "Sky Sports F1 HD", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Sky_Sports_F1_logo.svg/512px-Sky_Sports_F1_logo.svg.png" }, league: { name: "Formula 1 (24/7 Feed)" }, status: "inprogress" },
  { id: "lemans-static", title: "24 Hours of Le Mans", home: { name: "WEC Endurance", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/WEC_logo.svg/512px-WEC_logo.svg.png" }, away: { name: "Le Mans Feed", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/37/24_Hours_of_Le_Mans_logo.svg/512px-24_Hours_of_Le_Mans_logo.svg.png" }, league: { name: "Endurance Racing" }, status: "inprogress" }
];

function deriveStatus(dateMs?: number): string {
  if (!dateMs) return "upcoming";
  const diff = Date.now() - dateMs;
  if (diff >= 0 && diff < 2.5 * 60 * 60 * 1000) return "inprogress";
  if (diff >= 2.5 * 60 * 60 * 1000) return "finished";
  return "upcoming";
}

function extractStreamUrl(raw: any): string | null {
  if (!raw) return null;
  const c = [ raw?.data?.sources?.[0]?.embedUrl, raw?.sources?.[0]?.embedUrl, raw.stream_url, raw.url, raw.embed, raw.data?.stream_url ];
  return c.find(url => typeof url === "string" && url.trim()) || null;
}

function StatusBadge({ status }: { status?: string }) {
  if (status === "inprogress") return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset bg-primary/15 text-primary shadow-[inset_0_0_0_1px_rgba(255,0,0,0.4)]"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary" /></span>LIVE</span>;
  if (status === "finished") return <Badge variant="secondary" className="rounded-full">Finished</Badge>;
  return <Badge variant="outline" className="rounded-full">Upcoming</Badge>;
}

function TeamRow({ name, logo }: { name?: string; logo?: string }) {
  const [imgError, setImgError] = useState(false);
  const showImg = logo && logo.trim() && !imgError;
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border p-1">
        {showImg ? (
          <img src={logo} alt="" onError={() => setImgError(true)} className="h-full w-full object-contain bg-white/10 rounded-full" />
        ) : (
          <Trophy className="h-4 w-4 text-muted-foreground/60" />
        )}
      </div>
      <span className="truncate text-sm font-medium text-foreground">{name}</span>
    </div>
  );
}

function RacingPage() {
  const [matches, setMatches] = useState<Match[]>(staticMatches);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Match | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);

  const fetchMatches = useServerFn(getMatches);
  const fetchDetail = useServerFn(getMatchDetail);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchMatches({ data: { category: "motorsport" } });
      const apiMatches = (Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []).map((m: any) => ({
        id: m.id, title: m.title, status: deriveStatus(m.date),
        home: { name: m.teams?.home?.name || m.title, logo: m.teams?.home?.badge },
        away: { name: m.teams?.away?.name || "Race", logo: m.teams?.away?.badge },
        league: m.category ? { name: String(m.category) } : undefined,
      }));
      setMatches([...staticMatches, ...apiMatches]);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleWatch = async (m: Match) => {
    setSelected(m); setStreamUrl(null); setStreamLoading(true);
    
    if (m.id === "f1-static") { setStreamUrl(F1_STREAM_URL); setStreamLoading(false); return; }
    if (m.id === "lemans-static") { setStreamUrl(LEMANS_STREAM_URL); setStreamLoading(false); return; }

    try {
      const data = await fetchDetail({ data: { id: String(m.id), category: "motorsport" } });
      setStreamUrl(extractStreamUrl(data));
    } catch (e) { console.error(e); } finally { setStreamLoading(false); }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl flex items-center gap-2"><Radio className="h-6 w-6 text-primary" /> Motorsport & Racing</h2>
          <p className="mt-1 text-sm text-muted-foreground">F1, Le Mans Endurance, MotoGP, and more</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading && matches.length === 2 ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />) : matches.map((m) => (
          <Card key={String(m.id)} className="bg-card/80 backdrop-blur hover:border-primary/40 transition-all flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-3"><span className="text-xs text-muted-foreground truncate">{m.league?.name || "Motorsport"}</span><StatusBadge status={m.status} /></CardHeader>
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
          <DialogHeader className="border-b border-border/60 px-5 py-4"><DialogTitle>{selected?.title || selected?.home?.name}</DialogTitle></DialogHeader>
          <div className="relative aspect-video w-full bg-black">
            {streamLoading && <div className="absolute inset-0 flex items-center justify-center"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>}
            {streamUrl && !streamLoading && <iframe src={streamUrl} allowFullScreen className="absolute inset-0 h-full w-full border-0" />}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
