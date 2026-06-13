import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Radio } from "lucide-react";
import { SportsPage, SportsPageSkeleton } from "@/components/sports/SportsPage";
import { matchesQueryOptions } from "@/lib/sports/query";
import type { Match } from "@/lib/sports/types";

const F1_STREAM_URL = "https://streamfree.app/embed/racing/skyf1?server=origin&quality=1080p&category=racing";
const LEMANS_STREAM_URL = "https://streamfree.app/embed/racing/yie58g866enp?server=origin&quality=1080p&category=racing";

const staticMatches: Match[] = [
  { id: "f1-static", title: "Formula 1 Racing", home: { name: "Formula 1 Live", logo: "https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg" }, away: { name: "Sky Sports F1 HD", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Sky_Sports_F1_-_Logo_2025.svg/1280px-Sky_Sports_F1_-_Logo_2025.svg.png?_=20260323223722" }, league: { name: "Motorsport" } },
  { id: "lemans-static", title: "24 Hours of Le Mans", home: { name: "WEC Endurance", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/WEC_Logo.svg/500px-WEC_Logo.svg.png?_=20191117125257" }, away: { name: "Le Mans Feed", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/24_Hours_of_Le_Mans_logo_%28since_2014%29.svg/1280px-24_Hours_of_Le_Mans_logo_%28since_2014%29.svg.png?_=20240604043410" }, league: { name: "Endurance Racing" } },
];

function resolveStaticStream(m: Match): string | null {
  if (m.id === "f1-static") return F1_STREAM_URL;
  if (m.id === "lemans-static") return LEMANS_STREAM_URL;
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
      { rel: "preconnect", href: "https://streamfree.app" },
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
        staticStreamResolver={resolveStaticStream}
        upcomingLabel="Race not yet started"
        upcomingSub="Please check back closer to lights out."
      />
    </Suspense>
  );
}
