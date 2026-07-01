// src/routes/football.tsx — layout for /football and /football/world-cup
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/football")({
  component: FootballLayout,
});

function FootballLayout() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold sm:text-3xl">Football</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Live broadcasts, kickoff times, and FIFA World Cup 2026 group standings.
        </p>
      </div>

      <nav className="flex gap-2 border-b mb-2 -mx-1 overflow-x-auto scrollbar-hide">
        <FootballTab to="/football">Live Matches</FootballTab>
        <FootballTab to="/football/world-cup">World Championship</FootballTab>
        <FootballTab to="/football/standings">Standings</FootballTab>
        <FootballTab to="/football/news">Latest News</FootballTab>
      </nav>

      <Outlet />
    </div>
  );
}

function FootballTab({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: true }}
      className="relative px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      activeProps={{
        className:
          "relative px-3 py-2 text-sm font-medium text-foreground after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-primary",
      }}
    >
      {children}
    </Link>
  );
}
