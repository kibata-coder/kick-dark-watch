import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Radio } from "lucide-react";
import { SportsPage, SportsPageSkeleton } from "@/components/sports/SportsPage";
import { matchesQueryOptions } from "@/lib/sports/query";
import type { Match } from "@/lib/sports/types";
import lemansAsset from "@/assets/lemans.jpg.asset.json";
import skyF1Asset from "@/assets/sky-sports-f1.png.asset.json";
import wecAsset from "@/assets/wec.png.asset.json";

const F1_STREAM_URL = "https://streamfree.app/embed/racing/skyf1?server=origin&quality=1080p&category=racing";
const LEMANS_STREAM_URL = "https://streamfree.app/embed/racing/lemans?server=origin&quality=1080p&category=racing";

const staticMatches: Match[] = [
  { id: "f1-static", title: "Formula 1 Racing", home: { name: "Formula 1 Live", logo: "https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg" }, away: { name: "Sky Sports F1 HD", logo: skyF1Asset.url }, league: { name: "Formula 1 (24/7 Feed)" }, status: "inprogress" },
  { id: "lemans-static", title: "24 Hours of Le Mans", home: { name: "WEC Endurance", logo: wecAsset.url }, away: { name: "Le Mans Feed", logo: lemansAsset.url }, league: { name: "Endurance Racing" }, status: "inprogress" },
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
