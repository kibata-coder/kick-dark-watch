import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SportsPage, SportsPageSkeleton } from "@/components/sports/SportsPage";
import { matchesQueryOptions } from "@/lib/sports/query";
import type { Match } from "@/lib/sports/types";

const staticMatches: Match[] = [
  {
    id: "channel-golfchannel",
    title: "Golf Channel",
    home: { name: "Golf Channel", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Golf_Channel_logo.svg/1280px-Golf_Channel_logo.svg.png" },
    away: { name: "Golf Channel", logo: "" },
    league: { name: "LIVE CHANNEL" },
    status: "inprogress",
    daddyStreamUrl: "https://dlhd.pk/stream/stream-236.php",
  },
];

export const Route = createFileRoute("/golf")({
  head: () => ({
    meta: [
      { title: "Live Golf Streams — SOUDsports" },
      { name: "description", content: "Watch live golf including PGA Tour, Masters & The Open on SOUDsports." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(matchesQueryOptions("golf"));
  },
  component: GolfPage,
});

function GolfPage() {
  return (
    <Suspense fallback={<SportsPageSkeleton />}>
      <SportsPage
        category="golf"
        title="Live Golf"
        subtitle="PGA Tour, Masters, The Open & more"
        defaultLeague="Golf"
        staticMatches={staticMatches}
        isChannelCard={(m) => String(m.id).startsWith("channel-")}
        upcomingSub="Please check back closer to tee time."
      />
    </Suspense>
  );
}
