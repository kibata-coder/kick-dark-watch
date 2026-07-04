import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SportsPage, SportsPageSkeleton } from "@/components/sports/SportsPage";
import { matchesQueryOptions } from "@/lib/sports/query";
import type { Match } from "@/lib/sports/types";

const staticMatches: Match[] = [
  {
    id: "channel-skysportsaction",
    title: "Sky Sports Action",
    home: { name: "Sky Sports Action", logo: "https://upload.wikimedia.org/wikipedia/en/4/43/Sky_Sports_Action_logo.png" },
    away: { name: "Sky Sports Action", logo: "" },
    league: { name: "LIVE CHANNEL" },
    status: "inprogress",
    daddyStreamUrl: "https://daddylive.li/embed/embed.php?id=131&player=1&source=tv.json",
  },
];

export const Route = createFileRoute("/rugby")({
  head: () => ({
    meta: [
      { title: "Live Rugby Streams — SOUDsports" },
      { name: "description", content: "Watch live rugby union, rugby league & internationals on SOUDsports." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(matchesQueryOptions("rugby"));
  },
  component: RugbyPage,
});

function RugbyPage() {
  return (
    <Suspense fallback={<SportsPageSkeleton />}>
      <SportsPage
        category="rugby"
        title="Live Rugby"
        subtitle="Rugby Union, Rugby League & Internationals"
        defaultLeague="Rugby"
        staticMatches={staticMatches}
        isChannelCard={(m) => String(m.id).startsWith("channel-")}
        upcomingSub="Please check back closer to kick-off."
      />
    </Suspense>
  );
}
