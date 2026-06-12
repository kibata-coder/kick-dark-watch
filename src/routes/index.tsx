import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Radio, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4">
          Welcome to <span className="text-primary">SOUDsports</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your premium hub for live sports. Choose a category below to start watching real-time streams and live scores.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Link to="/football" className="block outline-none">
          <Card className="group relative overflow-hidden border-border/60 bg-card/80 backdrop-blur transition-all hover:border-primary/50 hover:shadow-[0_0_40px_-10px_oklch(var(--primary)/0.4)]">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="mb-6 rounded-full bg-primary/10 p-4 text-primary group-hover:scale-110 transition-transform">
                <Trophy className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Live Football</h2>
              <p className="text-muted-foreground mb-6">Watch global football matches, live scores, and real-time updates.</p>
              <div className="flex items-center text-primary font-semibold">
                Enter Dashboard <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/f1" className="block outline-none">
          <Card className="group relative overflow-hidden border-border/60 bg-card/80 backdrop-blur transition-all hover:border-primary/50 hover:shadow-[0_0_40px_-10px_oklch(var(--primary)/0.4)]">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="mb-6 rounded-full bg-primary/10 p-4 text-primary group-hover:scale-110 transition-transform">
                <Radio className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Motorsport & F1</h2>
              <p className="text-muted-foreground mb-6">Catch Formula 1, Le Mans Endurance, MotoGP, and more.</p>
              <div className="flex items-center text-primary font-semibold">
                Enter Dashboard <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  );
}
