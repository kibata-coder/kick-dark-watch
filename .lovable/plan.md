## Goal

The three sport routes (`football.tsx`, `basketball.tsx`, `f1.tsx`) duplicate ~300 lines of nearly identical code: types, status derivation, normalization, stream extraction, `StatusBadge`, `TeamRow`, channel-card layout, dialog player, polling loop. This bloats each route chunk, re-renders unnecessarily, and re-runs the same fetch on every navigation. Refactor for less code, smaller bundles, and faster loads.

## Changes

### 1. Extract shared sports module (`src/lib/sports/`)
- `types.ts` — `Match`, status union.
- `utils.ts` — `deriveStatus`, `normalizeMatches`, `extractStreamUrl`.
- `query.ts` — `matchesQueryOptions(category)` and `matchDetailQueryOptions(id, category)` using TanStack Query with `staleTime: 5min` so navigating between pages reuses cache instead of re-polling.

### 2. Extract shared components (`src/components/sports/`)
- `StatusBadge.tsx`
- `TeamRow.tsx` — wrap in `React.memo` so unrelated state updates don't re-render every row.
- `MatchCard.tsx` — standard layout.
- `ChannelCard.tsx` — premium 24/7 layout.
- `StreamDialog.tsx` — modal player with iframe/loading/error states.
- `SportsPage.tsx` — generic page component that takes `{ category, title, subtitle, staticMatches, channelDetector, fallbackStreamUrl? }` and renders header/grid/dialog. Each route file becomes ~15 lines of config.

### 3. Per-route data + metadata
- Each route adds `head()` with unique `title` and `description` (currently only root sets metadata).
- Use loader + `ensureQueryData` so SSR primes cache and first paint shows data instead of skeletons.
- Static channel lists stay in each route file as config passed into `SportsPage`.

### 4. Bundle/runtime optimizations
- Replace `setInterval` polling with TanStack Query's `refetchInterval: 5 * 60_000` + `refetchOnWindowFocus`.
- Remove duplicate logo `useState` re-renders: compute initial src once, only swap on error.
- Iframe gets `loading="lazy"` and only mounts when dialog opens (already the case via conditional render, but verify).
- Add `head().links` preconnect to `api.sportsrc.org` and `dlhd.pk` on the sport routes that use them so the first request is faster.
- The router config already has `defaultPreloadStaleTime: 0`; keep it (Query owns freshness).

### 5. Lazy-split heavier UI
- The `Dialog` + iframe player is only needed on click. Lazy-load `StreamDialog` with `React.lazy` so the initial grid paint doesn't ship dialog/radix-dialog code.

## Files

Add:
- `src/lib/sports/types.ts`
- `src/lib/sports/utils.ts`
- `src/lib/sports/query.ts`
- `src/components/sports/StatusBadge.tsx`
- `src/components/sports/TeamRow.tsx`
- `src/components/sports/MatchCard.tsx`
- `src/components/sports/ChannelCard.tsx`
- `src/components/sports/StreamDialog.tsx`
- `src/components/sports/SportsPage.tsx`

Rewrite (small config files):
- `src/routes/football.tsx`
- `src/routes/basketball.tsx`
- `src/routes/f1.tsx`

Unchanged: `__root.tsx`, `index.tsx`, server functions, country-flags lib.

## Expected impact

- ~900 lines → ~150 lines across the three route files.
- Each sport route's JS chunk drops significantly (shared deps hoisted into one shared chunk that's cached across navigations).
- No double-fetching when switching tabs within the cache window.
- Initial paint shows data (loader-primed) instead of skeletons on direct page loads.
- Better SEO via per-route titles/descriptions.

## Out of scope

- Visual/design changes — the rendered UI stays identical.
- Backend / server function changes.
- Auth, payments, schemas.
