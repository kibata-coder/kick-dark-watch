import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SportsPage, SportsPageSkeleton } from "@/components/sports/SportsPage";
import { matchesQueryOptions } from "@/lib/sports/query";
import type { Match } from "@/lib/sports/types";

const staticMatches: Match[] = [
  {
    id: "channel-skysportscricket",
    title: "Sky Sports Cricket",
    home: { name: "Sky Sports Cricket", logo: "https://upload.wikimedia.org/wikipedia/en/9/97/Sky_Sports_Cricket_logo.png" },
    away: { name: "Sky Sports Cricket", logo: "" },
    league: { name: "LIVE CHANNEL" },
    status: "inprogress",
    daddyStreamUrl: "https://dlhd.pk/stream/stream-136.php",
  },
];

export const Route = createFileRoute("/cricket")({
  head: () => ({
    meta: [
      { title: "Live Cricket Streams — SOUDsports" },
      { name: "description", content: "Watch live cricket including Test, ODI, T20 & IPL on SOUDsports." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(matchesQueryOptions("cricket"));
  },
  component: CricketPage,
});

function CricketPage() {
  return (
    <Suspense fallback={<SportsPageSkeleton />}>
      <SportsPage
        category="cricket"
        title="Live Cricket"
        subtitle="Test, ODI, T20 & IPL"
        defaultLeague="Cricket"
        staticMatches={staticMatches}
        isChannelCard={(m) => String(m.id).startsWith("channel-")}
        upcomingSub="Please check back closer to match time."
      />
    </Suspense>
  );
}
