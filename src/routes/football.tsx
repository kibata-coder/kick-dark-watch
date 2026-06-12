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

export const Route = createFileRoute("/football")({
  component: FootballPage,
});

type Match = { id: string | number; title?: string; home?: any; away?: any; league?: any; status?: string; time?: string; date?: number | string; poster?: string; [k: string]: unknown; };

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
      id: m.id, title: m.title, status: deriveStatus(dateMs), date: dateMs,
      home: { name: m.teams?.home?.name || "Home", logo: m.teams?.home?.badge },
      away: { name: m.teams?.away?.name || "Away", logo: m.teams?.away?.badge },
      league: m.category ? { name: String(m.category) } : undefined,
    };
  });
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
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border p-1">
        {logo ? <img src={logo} alt="" className="h-full w-full object-contain" /> : <Trophy className="h-4 w-4 text-muted-foreground" />}
      </div>
      <span className="truncate text-sm font-medium text-foreground">{name}</span>
    </div>
  );
}

function FootballPage() {
  const [matches, setMatches] = useState<Match[]>([]);
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
      setMatches(normalizeMatches(data));
    } catch (e: any) { setError(e?.message); } finally { setLoading(false); }
  };

  useEffect(() => { load(); const id = setInterval(load, 60000); return () => clearInterval(id); }, []);

  const handleWatch = async (m: Match) => {
    setSelected(m); setStreamUrl(null); setStreamLoading(true);
    try {
      const data = await fetchDetail({ data: { id: String(m.id) } });
      setStreamUrl(extractStreamUrl(data));
    } catch (e) { console.error(e); } finally { setStreamLoading(false); }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-2xl font-bold sm:text-3xl">Live Football</h2>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
      </div>

      {error && <div className="mb-6 p-4 text-sm text-destructive bg-destructive/10 border border-destructive/40 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />) : matches.map((m) => (
          <Card key={String(m.id)} className="bg-card/80 backdrop-blur hover:border-primary/40 transition-all flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-3"><span className="text-xs text-muted-foreground truncate">{m.league?.name || "Football"}</span><StatusBadge status={m.status} /></CardHeader>
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
            {streamLoading && <div className="absolute inset-0 flex items-center justify-center"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>}
            {streamUrl && !streamLoading && <iframe src={streamUrl} allowFullScreen className="absolute inset-0 h-full w-full border-0" />}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
