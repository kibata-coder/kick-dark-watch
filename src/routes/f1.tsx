import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Radio } from "lucide-react";
import { SportsPage, SportsPageSkeleton } from "@/components/sports/SportsPage";
import { matchesQueryOptions } from "@/lib/sports/query";
import type { Match } from "@/lib/sports/types";
const F1_SOURCES = [
  { label: "Server 1", url: "https://dlhd.pk/stream/stream-60.php" },
  { label: "Server 2", url: "https://f1live.dpdns.org/embed?channelId=23" },
  { label: "Server 3", url: "https://buffstreams.plus/title-game/formula-1/formula-1-2026-austria-gp-live-streams-links" },
];

const staticMatches: Match[] = [
  {
    id: "f1-static",
    title: "Formula 1 2026 - Austria GP",
    status: "inprogress",
    home: { name: "F1 Live Stream", logo: "https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg" },
    away: { name: "Sky Sports F1",  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Sky_Sports_F1_-_Logo_2025.svg/1280px-Sky_Sports_F1_-_Logo_2025.svg.png?_=20260323223722" },
    league: { name: "Motorsport" },
  },
];

function resolveF1Sources(m: Match) {
  if (m.id === "f1-static") return F1_SOURCES;
  return null;
}

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
      { rel: "preconnect", href: "https://buffstreams.plus" },
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
        staticMatches={staticMatches}
        isChannelCard={() => false}
        staticStreamSources={resolveF1Sources}
        upcomingLabel="Race not yet started"
        upcomingSub="Please check back closer to lights out."
      />
    </Suspense>
  );
}
