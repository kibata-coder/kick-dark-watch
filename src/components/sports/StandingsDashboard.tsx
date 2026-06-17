import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { standingsQueryOptions } from "@/lib/sports/query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { TeamStanding } from "@/lib/sports/types";

// Common league IDs - adjust these based on SportSRC exact IDs if needed
const LEAGUES = [
  { id: "PL", name: "Premier League" },
  { id: "CL", name: "Champions League" },
  { id: "LL", name: "La Liga" },
  { id: "SA", name: "Serie A" },
];

export function StandingsDashboard() {
  const [selectedLeague, setSelectedLeague] = useState<string>("PL");

  const { data, isLoading, isError } = useQuery(standingsQueryOptions(selectedLeague));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-xl font-semibold">League Standings</h3>
        <Select value={selectedLeague} onValueChange={setSelectedLeague}>
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Select League" />
          </SelectTrigger>
          <SelectContent>
            {LEAGUES.map((league) => (
              <SelectItem key={league.id} value={league.id}>
                {league.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      )}

      {isError && (
        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
          Failed to load standings for this league. Please try again later.
        </div>
      )}

      {!isLoading && !isError && data && (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-center">MP</TableHead>
                <TableHead className="text-center">W</TableHead>
                <TableHead className="text-center">D</TableHead>
                <TableHead className="text-center">L</TableHead>
                <TableHead className="text-center hidden sm:table-cell">GF</TableHead>
                <TableHead className="text-center hidden sm:table-cell">GA</TableHead>
                <TableHead className="text-center">GD</TableHead>
                <TableHead className="text-center font-bold">Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(data) && data.length > 0 ? data.map((team: TeamStanding, index: number) => (
                <TableRow key={team.id || index}>
                  <TableCell className="text-center font-medium">{team.rank || index + 1}</TableCell>
                  <TableCell className="font-medium flex items-center gap-2">
                    {team.logo ? (
                      <img src={team.logo} alt={team.name || team.teamName} className="w-6 h-6 object-contain" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted" />
                    )}
                    <span className="truncate max-w-[120px] sm:max-w-none">{team.name || team.teamName || 'Unknown Team'}</span>
                  </TableCell>
                  <TableCell className="text-center">{team.matchesPlayed ?? team.played ?? 0}</TableCell>
                  <TableCell className="text-center">{team.wins ?? team.won ?? 0}</TableCell>
                  <TableCell className="text-center">{team.draws ?? team.drawn ?? 0}</TableCell>
                  <TableCell className="text-center">{team.losses ?? team.lost ?? 0}</TableCell>
                  <TableCell className="text-center text-muted-foreground hidden sm:table-cell">{team.goalsFor ?? team.gf ?? 0}</TableCell>
                  <TableCell className="text-center text-muted-foreground hidden sm:table-cell">{team.goalsAgainst ?? team.ga ?? 0}</TableCell>
                  <TableCell className="text-center">{team.goalDifference ?? team.gd ?? 0}</TableCell>
                  <TableCell className="text-center font-bold">{team.points ?? team.pts ?? 0}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No standings data available for this league currently.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
