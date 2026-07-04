import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SportsPage, SportsPageSkeleton } from "@/components/sports/SportsPage";
import { matchesQueryOptions } from "@/lib/sports/query";
import type { Match } from "@/lib/sports/types";

const staticMatches: Match[] = [];

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
        isChannelCard={() => false}
        upcomingSub="Please check back closer to match time."
      />
    </Suspense>
  );
}
