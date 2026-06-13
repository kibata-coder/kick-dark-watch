import { memo, useCallback } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Tv } from "lucide-react";
import type { Match } from "@/lib/sports/types";

function ChannelCardImpl({ match, onWatch }: { match: Match; onWatch: (m: Match) => void }) {
  const handleClick = useCallback(() => onWatch(match), [match, onWatch]);
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-primary/30 shadow-xl hover:shadow-primary/5 hover:border-primary transition-all duration-300 flex flex-col group min-h-[200px]">
      <div className="absolute right-[-20px] bottom-[-20px] text-muted/5 group-hover:text-primary/5 transition-colors pointer-events-none">
        <Tv className="w-40 h-40" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between pb-2 z-10">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary/80 bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
          {match.league?.name || "24/7 Broadcast"}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-900/30">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ONLINE
        </span>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center flex-grow text-center p-4 z-10">
        <div className="h-14 w-full flex items-center justify-center p-1 bg-black/20 rounded-lg border border-slate-900 shadow-inner mb-2 transition-transform group-hover:scale-105 duration-300">
          {match.home?.logo ? (
            <img src={match.home.logo} alt={match.home.name} loading="lazy" decoding="async" className="h-full object-contain max-w-[85%]" />
          ) : (
            <Tv className="h-6 w-6 text-primary" />
          )}
        </div>
        <h4 className="text-base font-bold text-white group-hover:text-primary transition-colors duration-300">
          {match.home?.name}
        </h4>
      </CardContent>
      <CardFooter className="pt-2 pb-4 px-4 z-10 mt-auto">
        <Button
          onClick={handleClick}
          className="w-full bg-slate-900 border border-slate-800 hover:bg-primary hover:text-primary-foreground text-slate-200 font-semibold transition-all duration-300 shadow-md"
          size="sm"
        >
          <Play className="mr-1.5 h-3.5 w-3.5 fill-current" /> Tune In
        </Button>
      </CardFooter>
    </Card>
  );
}

export const ChannelCard = memo(ChannelCardImpl);