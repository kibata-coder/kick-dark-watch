import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SportsPage, SportsPageSkeleton } from "@/components/sports/SportsPage";
import { matchesQueryOptions } from "@/lib/sports/query";
import type { Match } from "@/lib/sports/types";

const staticMatches: Match[] = [
  {
    id: "channel-nhln",
    title: "NHL Network",
    home: { name: "NHL Network", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/NHL_Network_logo.svg/250px-NHL_Network_logo.svg.png" },
    away: { name: "NHL Network", logo: "" },
    league: { name: "LIVE CHANNEL" },
    status: "inprogress",
    daddyStreamUrl: "https://dlhd.pk/stream/stream-251.php",
  },
];

export const Route = createFileRoute("/icehockey")({
  head: () => ({
    meta: [
      { title: "Live Ice Hockey Streams — SOUDsports" },
      { name: "description", content: "Watch live NHL, KHL & international hockey on SOUDsports." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(matchesQueryOptions("icehockey"));
  },
  component: IceHockeyPage,
});

function IceHockeyPage() {
  return (
    <Suspense fallback={<SportsPageSkeleton />}>
      <SportsPage
        category="icehockey"
        title="Live Ice Hockey"
        subtitle="NHL, KHL & International Hockey"
        defaultLeague="Ice Hockey"
        staticMatches={staticMatches}
        isChannelCard={(m) => String(m.id).startsWith("channel-")}
        upcomingSub="Please check back closer to puck drop."
      />
    </Suspense>
  );
}
