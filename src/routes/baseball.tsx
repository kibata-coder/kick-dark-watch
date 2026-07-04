import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SportsPage, SportsPageSkeleton } from "@/components/sports/SportsPage";
import { matchesQueryOptions } from "@/lib/sports/query";
import type { Match } from "@/lib/sports/types";

const staticMatches: Match[] = [
  {
    id: "channel-mlbtv",
    title: "MLB Network",
    home: { name: "MLB Network", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/MLB_Network_Logo.svg/1280px-MLB_Network_Logo.svg.png" },
    away: { name: "MLB Network", logo: "" },
    league: { name: "LIVE CHANNEL" },
    status: "inprogress",
    daddyStreamUrl: "https://daddylive.li/embed/embed.php?id=252&player=1&source=tv.json",
  },
];

export const Route = createFileRoute("/baseball")({
  head: () => ({
    meta: [
      { title: "Live Baseball Streams — SOUDsports" },
      { name: "description", content: "Watch live MLB & international baseball on SOUDsports." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(matchesQueryOptions("baseball"));
  },
  component: BaseballPage,
});

function BaseballPage() {
  return (
    <Suspense fallback={<SportsPageSkeleton />}>
      <SportsPage
        category="baseball"
        title="Live Baseball"
        subtitle="MLB & International Baseball"
        defaultLeague="Baseball"
        staticMatches={staticMatches}
        isChannelCard={(m) => String(m.id).startsWith("channel-")}
        upcomingSub="Please check back closer to first pitch."
      />
    </Suspense>
  );
}
