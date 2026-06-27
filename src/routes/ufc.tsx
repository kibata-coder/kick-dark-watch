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
    home: { name: "Rafael Fiziev", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/UFC_Logo.svg/320px-UFC_Logo.svg.png" },
    away: { name: "Ilia Torres", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/UFC_Logo.svg/320px-UFC_Logo.svg.png" },
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
