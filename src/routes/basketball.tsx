import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SportsPage, SportsPageSkeleton } from "@/components/sports/SportsPage";
import { matchesQueryOptions } from "@/lib/sports/query";
import type { Match } from "@/lib/sports/types";

const staticMatches: Match[] = [
  {
    id: "server-1-espn",
    title: "ESPN",
    home: { name: "ESPN LIVE", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg" },
    away: { name: "ESPN LIVE", logo: "" },
    league: { name: "LIVE CHANNEL" },
    status: "inprogress",
    daddyStreamUrl: "https://daddylive.li/embed/embed.php?id=302&player=1&source=tv.json",
  },
  {
    id: "server-2-nba",
    title: "NBA TV",
    home: { name: "NBA TV", logo: "https://upload.wikimedia.org/wikipedia/fr/9/98/Logo_NBA_TV.svg" },
    away: { name: "NBA TV", logo: "" },
    league: { name: "LIVE CHANNEL" },
    status: "inprogress",
    daddyStreamUrl: "https://daddylive.li/embed/embed.php?id=404&player=1&source=tv.json",
  },
];

export const Route = createFileRoute("/basketball")({
  head: () => ({
    meta: [
      { title: "Live Basketball Streams — SOUDsports" },
      { name: "description", content: "Stream live NBA, EuroLeague, and global basketball matchups on SOUDsports." },
      { property: "og:title", content: "Live Basketball Streams — SOUDsports" },
      { property: "og:description", content: "Stream live NBA and global basketball matchups." },
    ],
    links: [
      { rel: "preconnect", href: "https://www.thesportsdb.com" },
      { rel: "preconnect", href: "https://daddylive.li" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(matchesQueryOptions("basketball"));
  },
  component: BasketballPage,
});

function BasketballPage() {
  return (
    <Suspense fallback={<SportsPageSkeleton />}>
      <SportsPage
        category="basketball"
        title="Live Basketball"
        subtitle="Browse live broadcast matches or jump straight into continuous television streams."
        defaultLeague="Basketball"
        staticMatches={staticMatches}
        isChannelCard={(m) => String(m.id).startsWith("server-")}
        detailFallbackUrl="https://daddylive.li/embed/embed.php?id=302&player=1&source=tv.json"
        upcomingSub="Please check back closer to tip-off."
      />
    </Suspense>
  );
}
