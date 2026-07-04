import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SportsPage, SportsPageSkeleton } from "@/components/sports/SportsPage";
import { matchesQueryOptions } from "@/lib/sports/query";
import type { Match } from "@/lib/sports/types";

const staticMatches: Match[] = [
  {
    id: "channel-skynews",
    title: "Sky Sports News",
    home: {
      name: "Sky Sports News",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Sky_Sports_News_-_Logo_2025.svg/1920px-Sky_Sports_News_-_Logo_2025.svg.png",
    },
    away: { name: "Sky Sports News", logo: "" },
    league: { name: "LIVE CHANNEL" },
    status: "inprogress",
    daddyStreamUrl: "https://daddylive.li/embed/embed.php?id=366&player=1&source=tv.json",
  },
  {
    id: "channel-skypl",
    title: "Sky Sports PL",
    home: {
      name: "Sky Sports PL",
      logo: "/sky-sports-pl.png",
    },
    away: { name: "Sky Sports PL", logo: "" },
    league: { name: "LIVE CHANNEL" },
    status: "inprogress",
    daddyStreamUrl: "https://daddylive.li/embed/embed.php?id=130&player=1&source=tv.json",
  },
];

export const Route = createFileRoute("/football/")({
  head: () => ({
    meta: [
      { title: "Live Football Streams & Scores — SOUDsports" },
      {
        name: "description",
        content:
          "Watch live football matches with kickoff times, Premier League streams, and global scores on SOUDsports.",
      },
      { property: "og:title", content: "Live Football Streams — SOUDsports" },
      { property: "og:description", content: "Watch live football matches and 24/7 sports channels." },
    ],
    links: [
      { rel: "preconnect", href: "https://www.thesportsdb.com" },
      { rel: "preconnect", href: "https://daddylive.li" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(matchesQueryOptions("football"));
  },
  component: FootballLiveMatches,
});

function FootballLiveMatches() {
  return (
    <Suspense fallback={<SportsPageSkeleton />}>
      <SportsPage
        category="football"
        title=""
        subtitle=""
        defaultLeague="Football"
        staticMatches={staticMatches}
        isChannelCard={(m) => {
          const league: any = m.league;
          const leagueName =
            typeof league === "object" && league !== null
              ? league.name || ""
              : typeof league === "string"
              ? league
              : "";
          return leagueName === "LIVE CHANNEL";
        }}
        groupByLeague={true}
      />
    </Suspense>
  );
}