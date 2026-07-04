import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SportsPage, SportsPageSkeleton } from "@/components/sports/SportsPage";
import { matchesQueryOptions } from "@/lib/sports/query";
import type { Match } from "@/lib/sports/types";

const staticMatches: Match[] = [
  {
    id: "channel-espn2",
    title: "ESPN 2",
    home: { name: "ESPN 2", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/ESPN2_logo.svg/1280px-ESPN2_logo.svg.png" },
    away: { name: "ESPN 2", logo: "" },
    league: { name: "LIVE CHANNEL" },
    status: "inprogress",
    daddyStreamUrl: "https://daddylive.li/embed/embed.php?id=303&player=1&source=tv.json",
  },
];

export const Route = createFileRoute("/boxing")({
  head: () => ({
    meta: [
      { title: "Live Boxing & Combat Sports Streams — SOUDsports" },
      { name: "description", content: "Watch live boxing, kickboxing & combat sports on SOUDsports." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(matchesQueryOptions("boxing"));
  },
  component: BoxingPage,
});

function BoxingPage() {
  return (
    <Suspense fallback={<SportsPageSkeleton />}>
      <SportsPage
        category="boxing"
        title="Live Boxing & Combat"
        subtitle="Boxing, Kickboxing & Combat Sports"
        defaultLeague="Boxing"
        staticMatches={staticMatches}
        isChannelCard={(m) => String(m.id).startsWith("channel-")}
        upcomingSub="Please check back closer to fight time."
      />
    </Suspense>
  );
}
