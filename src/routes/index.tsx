import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Zap, Shield, Tv } from "lucide-react";

export const Route = createFileRoute("/")(({
  head: () => ({
    meta: [
      { title: "SOUDsports — Live Sports Streams" },
      { name: "description", content: "Stream live football, basketball, tennis, cricket, UFC, F1 and more on SOUDsports. Free HD live sports streaming." },
    ],
  }),
  component: Index,
}));

const SPORTS = [
  { emoji: "⚽", label: "Football", sub: "Premier League, World Cup, La Liga & more", to: "/football", gradient: "from-green-500/20 to-emerald-600/10", border: "hover:border-green-500/50", glow: "hover:shadow-[0_0_40px_-10px_rgba(34,197,94,0.4)]" },
  { emoji: "🏀", label: "Basketball", sub: "NBA, EuroLeague & global matchups", to: "/basketball", gradient: "from-orange-500/20 to-amber-600/10", border: "hover:border-orange-500/50", glow: "hover:shadow-[0_0_40px_-10px_rgba(249,115,22,0.4)]" },
  { emoji: "🎾", label: "Tennis", sub: "Wimbledon, ATP, WTA & Grand Slams", to: "/tennis", gradient: "from-yellow-500/20 to-lime-600/10", border: "hover:border-yellow-500/50", glow: "hover:shadow-[0_0_40px_-10px_rgba(234,179,8,0.4)]" },
  { emoji: "🏏", label: "Cricket", sub: "Test, ODI, T20 & IPL", to: "/cricket", gradient: "from-sky-500/20 to-blue-600/10", border: "hover:border-sky-500/50", glow: "hover:shadow-[0_0_40px_-10px_rgba(14,165,233,0.4)]" },
  { emoji: "🏎️", label: "Motorsport", sub: "F1, MotoGP, Le Mans & more", to: "/f1", gradient: "from-red-500/20 to-rose-600/10", border: "hover:border-red-500/50", glow: "hover:shadow-[0_0_40px_-10px_rgba(239,68,68,0.4)]" },
  { emoji: "🥊", label: "Boxing", sub: "World title fights & combat sports", to: "/boxing", gradient: "from-purple-500/20 to-violet-600/10", border: "hover:border-purple-500/50", glow: "hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)]" },
  { emoji: "🔥", label: "UFC & MMA", sub: "Fight Night, PPV & MMA events", to: "/ufc", gradient: "from-rose-500/20 to-red-600/10", border: "hover:border-rose-500/50", glow: "hover:shadow-[0_0_40px_-10px_rgba(244,63,94,0.4)]" },
  { emoji: "🏉", label: "Rugby", sub: "Rugby Union, League & Internationals", to: "/rugby", gradient: "from-teal-500/20 to-cyan-600/10", border: "hover:border-teal-500/50", glow: "hover:shadow-[0_0_40px_-10px_rgba(20,184,166,0.4)]" },
  { emoji: "⛳", label: "Golf", sub: "PGA Tour, Masters & The Open", to: "/golf", gradient: "from-lime-500/20 to-green-600/10", border: "hover:border-lime-500/50", glow: "hover:shadow-[0_0_40px_-10px_rgba(132,204,22,0.4)]" },
  { emoji: "🏒", label: "Ice Hockey", sub: "NHL, KHL & International Hockey", to: "/icehockey", gradient: "from-blue-500/20 to-indigo-600/10", border: "hover:border-blue-500/50", glow: "hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)]" },
  { emoji: "⚾", label: "Baseball", sub: "MLB & International Baseball", to: "/baseball", gradient: "from-amber-500/20 to-orange-600/10", border: "hover:border-amber-500/50", glow: "hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.4)]" },
  { emoji: "🏐", label: "Volleyball", sub: "FIVB, Beach Volleyball & more", to: "/volleyball", gradient: "from-pink-500/20 to-fuchsia-600/10", border: "hover:border-pink-500/50", glow: "hover:shadow-[0_0_40px_-10px_rgba(236,72,153,0.4)]" },
];

const FEATURES = [
  { icon: <Zap className="h-5 w-5 text-yellow-400" />, title: "Instant HD Streams", desc: "Multiple server links per match so you're never stuck buffering." },
  { icon: <Tv className="h-5 w-5 text-blue-400" />, title: "12+ Sports Covered", desc: "Football, Basketball, Tennis, Cricket, UFC, F1 and much more." },
  { icon: <Shield className="h-5 w-5 text-green-400" />, title: "Always Free", desc: "No sign-up, no subscription. Just click and watch." },
];

function Index() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

      {/* ── Hero ── */}
      <section className="py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-6 animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          LIVE NOW — Streams Available
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-5 leading-tight">
          Watch Every Sport <br />
          <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Live & Free
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          HD live streams for football, basketball, tennis, cricket, UFC, F1 and 6 more sports — all in one place, no sign-up needed.
        </p>
        <Link
          to="/football"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-primary/50 hover:shadow-xl"
        >
          Watch Football Now <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* ── Sports Grid ── */}
      <section className="pb-16">
        <h2 className="text-2xl font-bold mb-2">All Sports</h2>
        <p className="text-sm text-muted-foreground mb-8">Pick a sport — streams load automatically when a match is live.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {SPORTS.map((sport) => (
            <Link key={sport.to} to={sport.to} className="group block outline-none">
              <div
                className={`relative h-full rounded-2xl border border-border/60 bg-gradient-to-br ${sport.gradient} p-5 transition-all duration-300 ${sport.border} ${sport.glow} hover:-translate-y-1`}
              >
                <div className="text-4xl mb-3">{sport.emoji}</div>
                <h3 className="font-bold text-base mb-1">{sport.label}</h3>
                <p className="text-xs text-muted-foreground leading-snug mb-3">{sport.sub}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  Watch Live <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="pb-20 border-t border-border/40 pt-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex gap-4 items-start rounded-xl border border-border/40 bg-card/50 p-5">
              <div className="rounded-lg bg-muted p-2 flex-shrink-0">{f.icon}</div>
              <div>
                <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
