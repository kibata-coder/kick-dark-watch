import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/ufc")({
  component: UFCLayout,
});

function UFCLayout() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold sm:text-3xl flex items-center gap-2">
          UFC & MMA
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          UFC Fight Night, Bellator, ONE Championship, and more.
        </p>
      </div>

      <nav className="flex gap-2 border-b mb-2 -mx-1">
        <UFCTab to="/ufc">Live Matches</UFCTab>
        <UFCTab to="/ufc/fighters">Fighters Information</UFCTab>
      </nav>

      <Outlet />
    </div>
  );
}

function UFCTab({ to, children }: { to: string; children: React.ReactNode }) {
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
