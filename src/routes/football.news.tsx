import { Suspense, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { espnNewsQueryOptions } from "@/lib/sports/query";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";

export const Route = createFileRoute("/football/news")({
  component: FootballNewsRoute,
});

const SUPPORTED_LEAGUES = [
  { name: "English Premier League", slug: "eng.1" },
  { name: "La Liga", slug: "esp.1" },
  { name: "Bundesliga", slug: "ger.1" },
  { name: "Serie A", slug: "ita.1" },
  { name: "Ligue 1", slug: "fra.1" },
  { name: "Saudi Pro League", slug: "ksa.1" }, 
  { name: "Brasileirão", slug: "bra.1" },
  { name: "MLS", slug: "usa.1" },
  { name: "Primeira Liga", slug: "por.1" },
  { name: "Eredivisie", slug: "ned.1" },
];

function FootballNewsRoute() {
  const [selectedLeague, setSelectedLeague] = useState(SUPPORTED_LEAGUES[0].slug);

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 gap-2 scrollbar-hide">
        {SUPPORTED_LEAGUES.map((lg) => (
          <button
            key={lg.slug}
            onClick={() => setSelectedLeague(lg.slug)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedLeague === lg.slug
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {lg.name}
          </button>
        ))}
      </div>

      <Suspense fallback={<NewsSkeleton />}>
        <NewsFeed slug={selectedLeague} />
      </Suspense>
    </div>
  );
}

function NewsFeed({ slug }: { slug: string }) {
  const { data } = useSuspenseQuery(espnNewsQueryOptions(slug));
  const articles = data?.articles || [];

  if (!articles.length) {
    return <div className="text-muted-foreground py-8 text-center">No news available for this league right now.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article: any) => {
        // Find a 16:9 image if available
        const image = article.images?.find((img: any) => img.url)?.url || "https://placehold.co/600x400/1a1a1a/444444?text=News";
        const date = new Date(article.published).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });

        return (
          <a 
            key={article.id} 
            href={article.links?.web?.href || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
          >
            <div className="aspect-video w-full overflow-hidden bg-muted">
              <img 
                src={image} 
                alt={article.headline} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-lg font-bold leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {article.headline}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                {article.description}
              </p>
              <div className="flex items-center text-xs text-muted-foreground font-medium gap-1.5 mt-auto">
                <Clock className="w-3.5 h-3.5" />
                {date}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}

function NewsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col rounded-xl overflow-hidden border border-border">
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
