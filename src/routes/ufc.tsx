import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { SportsPage, SportsPageSkeleton } from "@/components/sports/SportsPage";
import { matchesQueryOptions } from "@/lib/sports/query";
import type { Match } from "@/lib/sports/types";

const UFC_SOURCES = [
  { label: "Server 1", url: "https://streams.center/embed/ch48.php" },
];

const staticMatches: Match[] = [
  {
    id: "ufc-static",
    title: "UFC Fight Night: Fiziev vs Torres",
    status: "inprogress",
    date: new Date("2026-06-27T14:00:00Z").getTime(),
    time: "17:00 EAT",
    home: {
      name: "Rafael Fiziev",
      logo: "https://dmxg5wxfqgde4.cloudfront.net/styles/athlete_bio_full_body/s3/2024-06/FIZIEV_RAFAEL_L_BELT.png?itok=dGqLGLmL",
    },
    away: {
      name: "Manuel Torres",
      logo: "https://dmxg5wxfqgde4.cloudfront.net/styles/athlete_bio_full_body/s3/2025-04/TORRES_MANUEL_L.png?itok=Lp3GFk7A",
    },
    league: { name: "UFC Fight Night" },
  },
];

function resolveUFCSources(m: Match) {
  if (m.id === "ufc-static") return UFC_SOURCES;
  return null;
}

export const Route = createFileRoute("/ufc")({
  head: () => ({
    meta: [
      { title: "UFC & MMA Live Streams — SOUDsports" },
      { name: "description", content: "Watch UFC Fight Night, MMA bouts, and combat sports live on SOUDsports." },
      { property: "og:title", content: "UFC & MMA Live Streams — SOUDsports" },
      { property: "og:description", content: "Watch UFC Fight Night and MMA events live." },
    ],
    links: [
      { rel: "preconnect", href: "https://streams.center" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(matchesQueryOptions("mma"));
  },
  component: UFCPage,
});

function UFCPage() {
  return (
    <Suspense fallback={<SportsPageSkeleton />}>
      <SportsPage
        category="mma"
        title="UFC & MMA"
        subtitle="UFC Fight Night, Bellator, ONE Championship, and more"
        titleIcon={<Flame className="h-6 w-6 text-primary" />}
        defaultLeague="UFC"
        staticMatches={staticMatches}
        isChannelCard={() => false}
        staticStreamSources={resolveUFCSources}
        upcomingLabel="Fight not yet started"
        upcomingSub="Please check back closer to fight time."
      />
    </Suspense>
  );
}
