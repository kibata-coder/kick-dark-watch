## Goal

1. Add **match kickoff time** to every football match card.
2. Add a **sub-page** at `/football/world-cup` showing FIFA World Cup 2026 group standings (Pts, P, W, D, L, GF, GA, GD) using the free public API at `https://worldcup26.ir` (no key required) — your free SportSRC tier won't change.

## Data source

Public, no-auth endpoints from `rezarahiminia/worldcup2026`:

- `GET https://worldcup26.ir/get/groups` → array of 12 groups, each with `teams[]` containing `team_id, mp, w, l, d, pts, gf, ga, gd`.
- `GET https://worldcup26.ir/get/teams` → 48 teams with `id, name_en, flag, fifa_code, iso2, groups`.

We fetch both once and join `team_id` → team metadata in memory.

Live match times keep coming from the existing SportSRC `?type=matches&sport=football` response (each match has a `date` timestamp the normalizer already captures).

## Changes

### 1. Match kickoff time

- **`src/lib/sports/utils.ts`** — extend `normalizeMatches` to format `date` (ms) into a friendly `time` string: `Today 21:00`, `Tomorrow 18:30`, or `Sat 18 Jul 20:00` using `Intl.DateTimeFormat` (no new dep). Keep the raw ms on the object too.
- **`src/components/sports/MatchCard.tsx`** — render `match.time` under the league name with a small `Clock` icon. Hidden when missing (covers the static channel cards).

### 2. World Cup standings data layer

- **New** `src/lib/worldcup.functions.ts` with two `createServerFn` calls (server-side fetch keeps the browser CORS-free and lets us cache):
  - `getWorldCupGroups()` → `https://worldcup26.ir/get/groups`
  - `getWorldCupTeams()` → `https://worldcup26.ir/get/teams`
  - 5-min in-memory cache (same pattern as `sportsrc.functions.ts`).
- **`src/lib/sports/types.ts`** — add `WorldCupTeam`, `WorldCupGroup`, `EnrichedStanding` types.
- **`src/lib/sports/query.ts`** — add `worldCupStandingsQueryOptions()` that fetches both, joins them server-side via a single combined server fn `getWorldCupStandings()`, and returns:
  ```ts
  Array<{ name: "A".."L"; rows: Array<{ rank, team:{name,flag,code,iso2}, mp, w, d, l, gf, ga, gd, pts }> }>
  ```
  Rows sorted by `pts ↓, gd ↓, gf ↓, name asc`. 5-min `staleTime`, 30-min `gcTime`.

### 3. Routing — convert football to a layout

Current `src/routes/football.tsx` is a leaf. Restructure:

```text
src/routes/
  football.tsx              ← layout: shared header + tabs Nav + <Outlet />
  football.index.tsx        ← /football  (live matches view, current content)
  football.world-cup.tsx    ← /football/world-cup  (group standings)
```

- `football.tsx` becomes a thin layout: page header + a TanStack `<Link>`-based tab strip (`Live Matches` → `/football`, `World Cup 2026` → `/football/world-cup`) + `<Outlet />`. Active state uses `activeProps`.
- `football.index.tsx` keeps the existing live-matches `SportsPage` block and its loader prime for `matchesQueryOptions("football")`.
- `football.world-cup.tsx`:
  - `loader` primes `worldCupStandingsQueryOptions()` via `ensureQueryData`.
  - Component uses `useSuspenseQuery`, renders 12 `Card`s (one per group A–L) in a responsive grid (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3`).
  - Each card: header `Group A`; a `Table` with columns `#, Team (flag + name + 3-letter code), MP, W, D, L, GF, GA, GD, Pts (bold)`. Top 2 rows get a subtle highlight (qualify), row 3 a muted "playoff" hint, bottom row dimmed.
  - Own `head()` metadata (title `FIFA World Cup 2026 — Group Standings`, description, og:title, og:description).
  - `errorComponent` + `notFoundComponent` per TanStack rules; retry button calls `router.invalidate()`.
- Remove the standings `<Tabs>` UI inside the old `football.tsx` (replaced by route-based navigation). `StandingsDashboard.tsx` stays on disk but is no longer imported.

### 4. SEO

- `/football` keeps its existing meta (live streams).
- `/football/world-cup` gets its own meta + `link rel="preconnect" href="https://worldcup26.ir"`.

## Out of scope

- Match-by-match World Cup fixtures view (only standings).
- xG, shotmaps, odds, lineups (premium SportSRC).
- Visual redesign — reuses existing tokens and shadcn primitives.

## Risk / fallback

- If `worldcup26.ir` is down, the World Cup route shows the route `errorComponent` with a Retry button; nothing else on the site is affected.
- The free site has no SSL/uptime SLA. We keep the request server-side with a 5-min cache and an 8s timeout so the loader can't hang the page.
