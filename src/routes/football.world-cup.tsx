import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, RefreshCw, GitMerge } from "lucide-react";
import { worldCupStandingsQueryOptions } from "@/lib/sports/query";
import type { WorldCupStandingRow } from "@/lib/sports/types";
import { WorldCupBracket } from "@/components/sports/WorldCupBracket";

export const Route = createFileRoute("/football/world-cup")({
  head: () => ({
    meta: [
      { title: "FIFA World Cup 2026 — Group Standings | SOUDsports" },
      {
        name: "description",
        content:
          "Live FIFA World Cup 2026 group stage standings: points, goal difference, wins, draws, and losses for all 48 teams across groups A–L.",
      },
      { property: "og:title", content: "FIFA World Cup 2026 Group Standings" },
      {
        property: "og:description",
        content: "Track every group of the 2026 FIFA World Cup with live points and goal differences.",
      },
    ],
    links: [{ rel: "preconnect", href: "https://worldcup26.ir" }],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(worldCupStandingsQueryOptions()),
  component: WorldCupPage,
  pendingComponent: WorldCupSkeleton,
  errorComponent: WorldCupError,
  notFoundComponent: () => (
    <p className="py-8 text-sm text-muted-foreground">No World Cup standings available.</p>
  ),
});

function WorldCupPage() {
  const { data: groups } = useSuspenseQuery(worldCupStandingsQueryOptions());
  const [activeTab, setActiveTab] = useState<"groups" | "knockout">("groups");

  return (
    <section className="py-6 flex flex-col gap-6">
      
      {/* Local Tabs for World Cup Page */}
      <div className="flex bg-muted/50 p-1 rounded-lg w-fit border border-border">
        <button
          onClick={() => setActiveTab("groups")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "groups" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Trophy className="w-4 h-4" /> Group Stage
        </button>
        <button
          onClick={() => setActiveTab("knockout")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "knockout" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <GitMerge className="w-4 h-4" /> Knockout Stage
        </button>
      </div>

      {activeTab === "groups" && (
        <div className="flex flex-col gap-4">
          <div className="mb-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Group Stage Standings
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Live points table for all 12 groups (A–L). Top 2 advance automatically; 3rd-placed teams compete for the Round of 32.
            </p>
          </div>

          {!groups || groups.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground bg-muted/20 rounded-xl border border-border/50 border-dashed">
              Standings will appear once the tournament data is published.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {groups.map((group) => (
                <GroupCard key={group.name} name={group.name} rows={group.rows} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "knockout" && (
        <div className="flex flex-col gap-4">
          <div className="mb-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Knockout Stage Bracket
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Interactive 32-team tournament bracket. Pan and zoom to explore the path to the final.
            </p>
          </div>
          <WorldCupBracket />
        </div>
      )}

    </section>
  );
}

function GroupCard({ name, rows }: { name: string; rows: WorldCupStandingRow[] }) {
  return (
    <Card className="bg-card/80 backdrop-blur overflow-hidden">
      <CardHeader className="p-3 border-b bg-muted/30">
        <CardTitle className="text-sm font-bold">Group {name}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-8 px-2 text-center text-[11px]">#</TableHead>
              <TableHead className="px-2 text-[11px]">Team</TableHead>
              <TableHead className="px-1.5 text-center text-[11px]">P</TableHead>
              <TableHead className="px-1.5 text-center text-[11px]">W</TableHead>
              <TableHead className="px-1.5 text-center text-[11px]">D</TableHead>
              <TableHead className="px-1.5 text-center text-[11px]">L</TableHead>
              <TableHead className="px-1.5 text-center text-[11px]">GD</TableHead>
              <TableHead className="px-2 text-center text-[11px] font-bold">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const qualify = row.rank <= 2;
              const playoff = row.rank === 3;
              const rowClass = qualify
                ? "bg-primary/5 hover:bg-primary/10"
                : playoff
                ? "hover:bg-muted/40"
                : "text-muted-foreground hover:bg-muted/30";
              return (
                <TableRow key={row.team.id} className={rowClass}>
                  <TableCell className="px-2 text-center text-xs">
                    <span
                      className={
                        qualify
                          ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold"
                          : "text-muted-foreground"
                      }
                    >
                      {row.rank}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {row.team.flag ? (
                        <img
                          src={row.team.flag}
                          alt=""
                          loading="lazy"
                          className="h-4 w-6 object-cover rounded-sm shrink-0"
                        />
                      ) : (
                        <div className="h-4 w-6 rounded-sm bg-muted shrink-0" />
                      )}
                      <span className="truncate text-xs font-medium">{row.team.name}</span>
                      {row.team.code && (
                        <span className="text-[10px] text-muted-foreground/70 hidden sm:inline">
                          {row.team.code}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-1.5 text-center text-xs">{row.mp}</TableCell>
                  <TableCell className="px-1.5 text-center text-xs">{row.w}</TableCell>
                  <TableCell className="px-1.5 text-center text-xs">{row.d}</TableCell>
                  <TableCell className="px-1.5 text-center text-xs">{row.l}</TableCell>
                  <TableCell className="px-1.5 text-center text-xs">
                    {row.gd > 0 ? `+${row.gd}` : row.gd}
                  </TableCell>
                  <TableCell className="px-2 text-center text-xs font-bold">{row.pts}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function WorldCupSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 py-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-56 w-full rounded-xl" />
      ))}
    </div>
  );
}

function WorldCupError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="py-12 text-center">
      <p className="text-sm text-destructive mb-3">
        Couldn't load World Cup standings: {error.message}
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          reset();
          router.invalidate();
        }}
      >
        <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retry
      </Button>
    </div>
  );
}