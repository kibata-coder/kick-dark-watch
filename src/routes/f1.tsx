import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Radio } from "lucide-react";
import { SportsPage, SportsPageSkeleton } from "@/components/sports/SportsPage";
import { matchesQueryOptions } from "@/lib/sports/query";
import type { Match } from "@/lib/sports/types";



export const Route = createFileRoute("/f1")({
  head: () => ({
    meta: [
      { title: "F1 & Motorsport Live Streams — SOUDsports" },
      { name: "description", content: "Watch Formula 1, Le Mans Endurance, MotoGP, and motorsport streams live on SOUDsports." },
      { property: "og:title", content: "F1 & Motorsport Live Streams — SOUDsports" },
      { property: "og:description", content: "Watch Formula 1, Le Mans, MotoGP and more, live." },
    ],
    links: [
      { rel: "preconnect", href: "https://api.sportsrc.org" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(matchesQueryOptions("motorsport"));
  },
  component: RacingPage,
});

function RacingPage() {
  return (
    <Suspense fallback={<SportsPageSkeleton />}>
      <SportsPage
        category="motorsport"
        title="Motorsport & Racing"
        subtitle="F1, Le Mans Endurance, MotoGP, and more"
        titleIcon={<Radio className="h-6 w-6 text-primary" />}
        defaultLeague="Motorsport"
        isChannelCard={() => false}
        upcomingLabel="Race not yet started"
        upcomingSub="Please check back closer to lights out."
      />
    </Suspense>
  );
}
