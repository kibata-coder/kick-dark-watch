// src/routes/football.tsx
import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SportsPage, SportsPageSkeleton } from "@/components/sports/SportsPage";
import { matchesQueryOptions } from "@/lib/sports/query";
import type { Match } from "@/lib/sports/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StandingsDashboard } from "@/components/sports/StandingsDashboard";

const staticMatches: Match[] = [
  {
    id: "channel-skynews",
    title: "Sky Sports News",
    home: { name: "Sky Sports News", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Sky_Sports_News_-_Logo_2025.svg/1920px-Sky_Sports_News_-_Logo_2025.svg.png" },
    away: { name: "Sky Sports News", logo: "" },
    league: { name: "LIVE CHANNEL" },
    status: "inprogress",
    daddyStreamUrl: "https://dlhd.pk/stream/stream-366.php",
  },
  {
    id: "channel-skypl",
    title: "Sky Sports PL",
    home: { name: "Sky Sports PL", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Sky_Sports_Premier_League_-_Logo_2025.svg/1280px-Sky_Sports_Premier_League_-_Logo_2025.svg.png" },
    away: { name: "Sky Sports PL", logo: "" },
    league: { name: "LIVE CHANNEL" },
    status: "inprogress",
    daddyStreamUrl: "https://dlhd.pk/stream/stream-130.php",
  },
];

export const Route = createFileRoute("/football")({
  head: () => ({
    meta: [
      { title: "Live Football Streams & Scores — SOUDsports" },
      { name: "description", content: "Watch live football matches, Premier League streams, and global scores on SOUDsports." },
      { property: "og:title", content: "Live Football Streams — SOUDsports" },
      { property: "og:description", content: "Watch live football matches and 24/7 sports channels." },
    ],
    links: [
      { rel: "preconnect", href: "https://api.sportsrc.org" },
      { rel: "preconnect", href: "https://dlhd.pk" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(matchesQueryOptions("football"));
  },
  component: FootballPage,
});

function FootballPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Tabs defaultValue="live" className="w-full">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl flex items-center gap-2">
              Live Football
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Watch matches, track live scores, and view group standings.
            </p>
          </div>
          
          <TabsList className="grid w-full grid-cols-2 sm:w-[350px]">
            <TabsTrigger value="live">Live Matches</TabsTrigger>
            <TabsTrigger value="standings">Standings & Results</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="live" className="mt-0 outline-none">
          <Suspense fallback={<SportsPageSkeleton />}>
            <SportsPage
              category="football"
              title="" 
              subtitle=""
              defaultLeague="Football"
              staticMatches={staticMatches}
              isChannelCard={(m) => {
                const leagueName = typeof m.league === "object" && m.league !== null ? (m.league.name || "") : (m.league || "");
                return leagueName === "LIVE CHANNEL";
              }}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="standings" className="mt-0 outline-none">
           <StandingsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
