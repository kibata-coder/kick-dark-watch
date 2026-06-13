import { memo, useCallback } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { TeamRow } from "./TeamRow";
import type { Match } from "@/lib/sports/types";

function MatchCardImpl({
  match,
  defaultLeague,
  onWatch,
}: {
  match: Match;
  defaultLeague: string;
  onWatch: (m: Match) => void;
}) {
  const handleClick = useCallback(() => onWatch(match), [match, onWatch]);
  return (
    <Card className="bg-card/80 backdrop-blur hover:border-primary/40 transition-all flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <span className="text-xs text-muted-foreground truncate">{match.league?.name || defaultLeague}</span>
        <StatusBadge status={match.status} />
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        <TeamRow name={match.home?.name} logo={match.home?.logo} />
        <TeamRow name={match.away?.name} logo={match.away?.logo} />
      </CardContent>
      <CardFooter className="pt-3 mt-auto">
        <Button onClick={handleClick} className="w-full" size="sm">
          <Play className="mr-1.5 h-4 w-4" /> Watch
        </Button>
      </CardFooter>
    </Card>
  );
}

export const MatchCard = memo(MatchCardImpl);