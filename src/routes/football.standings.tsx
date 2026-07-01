import { Suspense, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { espnStandingsQueryOptions } from "@/lib/sports/query";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/football/standings")({
  component: FootballStandingsRoute,
});

const SUPPORTED_LEAGUES = [
  { name: "English Premier League", slug: "eng.1" },
  { name: "La Liga", slug: "esp.1" },
  { name: "Bundesliga", slug: "ger.1" },
  { name: "Serie A", slug: "ita.1" },
  { name: "Ligue 1", slug: "fra.1" },
  { name: "Saudi Pro League", slug: "ksa.1" }, 
  { name: "Brasileirão", slug: "bra.1" },
  { name: "MLS", slug: "usa.1" },
  { name: "Primeira Liga", slug: "por.1" },
  { name: "Eredivisie", slug: "ned.1" },
];

function FootballStandingsRoute() {
  const [selectedLeague, setSelectedLeague] = useState(SUPPORTED_LEAGUES[0].slug);

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 gap-2 scrollbar-hide">
        {SUPPORTED_LEAGUES.map((lg) => (
          <button
            key={lg.slug}
            onClick={() => setSelectedLeague(lg.slug)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedLeague === lg.slug
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {lg.name}
          </button>
        ))}
      </div>

      <Suspense fallback={<StandingsSkeleton />}>
        <StandingsTable slug={selectedLeague} />
      </Suspense>
    </div>
  );
}

function StandingsTable({ slug }: { slug: string }) {
  const { data } = useSuspenseQuery(espnStandingsQueryOptions(slug));
  const standings = data?.children?.[0]?.standings?.entries || [];

  if (!standings.length) {
    return <div className="text-muted-foreground py-8 text-center">No standings available for this league right now.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
          <tr>
            <th className="px-4 py-3 w-12 text-center">#</th>
            <th className="px-4 py-3">Club</th>
            <th className="px-4 py-3 text-center">MP</th>
            <th className="px-4 py-3 text-center">W</th>
            <th className="px-4 py-3 text-center">D</th>
            <th className="px-4 py-3 text-center">L</th>
            <th className="px-4 py-3 text-center hidden sm:table-cell">GF</th>
            <th className="px-4 py-3 text-center hidden sm:table-cell">GA</th>
            <th className="px-4 py-3 text-center">GD</th>
            <th className="px-4 py-3 text-center font-bold">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {standings.map((entry: any, index: number) => {
            const team = entry.team;
            const stats = entry.stats || [];
            
            // Helper to find stat by abbreviation (e.g. "GP", "W", "D", "L", "GD", "P", "F", "A")
            const getStat = (abbrev: string) => stats.find((s: any) => s.abbreviation === abbrev)?.displayValue || "0";

            return (
              <tr key={team.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 text-center font-medium">{index + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={team.logos?.[0]?.href} alt={team.name} className="w-6 h-6 object-contain" />
                    <span className="font-medium whitespace-nowrap">{team.shortDisplayName || team.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">{getStat("GP")}</td>
                <td className="px-4 py-3 text-center">{getStat("W")}</td>
                <td className="px-4 py-3 text-center">{getStat("D")}</td>
                <td className="px-4 py-3 text-center">{getStat("L")}</td>
                <td className="px-4 py-3 text-center hidden sm:table-cell text-muted-foreground">{getStat("F")}</td>
                <td className="px-4 py-3 text-center hidden sm:table-cell text-muted-foreground">{getStat("A")}</td>
                <td className="px-4 py-3 text-center">{getStat("GD")}</td>
                <td className="px-4 py-3 text-center font-bold">{getStat("P")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StandingsSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-10 w-full rounded-t-xl" />
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
