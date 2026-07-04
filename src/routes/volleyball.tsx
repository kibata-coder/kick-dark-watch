import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SportsPage, SportsPageSkeleton } from "@/components/sports/SportsPage";
import { matchesQueryOptions } from "@/lib/sports/query";
import type { Match } from "@/lib/sports/types";

const staticMatches: Match[] = [
  {
    id: "channel-bein-volleyball",
    title: "BeIN Sports",
    home: { name: "BeIN Sports", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/BeIN_Sports_logo.svg/1280px-BeIN_Sports_logo.svg.png" },
    away: { name: "BeIN Sports", logo: "" },
    league: { name: "LIVE CHANNEL" },
    status: "inprogress",
    daddyStreamUrl: "https://dlhd.pk/stream/stream-87.php",
  },
];

export const Route = createFileRoute("/volleyball")({
  head: () => ({
    meta: [
      { title: "Live Volleyball Streams — SOUDsports" },
      { name: "description", content: "Watch live FIVB, beach volleyball & international volleyball on SOUDsports." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(matchesQueryOptions("volleyball"));
  },
  component: VolleyballPage,
});

function VolleyballPage() {
  return (
    <Suspense fallback={<SportsPageSkeleton />}>
      <SportsPage
        category="volleyball"
        title="Live Volleyball"
        subtitle="FIVB, Beach Volleyball & International"
        defaultLeague="Volleyball"
        staticMatches={staticMatches}
        isChannelCard={(m) => String(m.id).startsWith("channel-")}
        upcomingSub="Please check back closer to match time."
      />
    </Suspense>
  );
}
