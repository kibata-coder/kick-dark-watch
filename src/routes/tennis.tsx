import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SportsPage, SportsPageSkeleton } from "@/components/sports/SportsPage";
import { matchesQueryOptions } from "@/lib/sports/query";
import type { Match } from "@/lib/sports/types";

const staticMatches: Match[] = [
  {
    id: "channel-btsport",
    title: "BT Sport 2",
    home: { name: "BT Sport 2", logo: "https://upload.wikimedia.org/wikipedia/en/f/fc/BT_Sport_2_logo.png" },
    away: { name: "BT Sport 2", logo: "" },
    league: { name: "LIVE CHANNEL" },
    status: "inprogress",
    daddyStreamUrl: "https://daddylive.li/embed/embed.php?id=143&player=1&source=tv.json",
  },
];

export const Route = createFileRoute("/tennis")({
  head: () => ({
    meta: [
      { title: "Live Tennis Streams — SOUDsports" },
      { name: "description", content: "Watch live tennis including Wimbledon, ATP, WTA on SOUDsports." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(matchesQueryOptions("tennis"));
  },
  component: TennisPage,
});

function TennisPage() {
  return (
    <Suspense fallback={<SportsPageSkeleton />}>
      <SportsPage
        category="tennis"
        title="Live Tennis"
        subtitle="Wimbledon, ATP, WTA & Grand Slams"
        defaultLeague="Tennis"
        staticMatches={staticMatches}
        isChannelCard={(m) => String(m.id).startsWith("channel-")}
        upcomingSub="Please check back closer to match time."
      />
    </Suspense>
  );
}
