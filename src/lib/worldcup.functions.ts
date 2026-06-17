import { createServerFn } from "@tanstack/react-start";
import type { WorldCupGroupStanding, WorldCupTeam } from "./sports/types";

const BASE = "https://worldcup26.ir";
const CACHE_TTL = 5 * 60 * 1000;

let cache: { timestamp: number; data: WorldCupGroupStanding[] } | null = null;

async function fetchJson(path: string): Promise<any> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Accept: "application/json" },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`worldcup26.ir ${path} failed (${res.status})`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

function toNum(v: unknown): number {
  const n = typeof v === "string" ? parseInt(v, 10) : (v as number);
  return Number.isFinite(n) ? n : 0;
}

export const getWorldCupStandings = createServerFn({ method: "GET" }).handler(
  async (): Promise<WorldCupGroupStanding[]> => {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return cache.data;
    }

    const [groupsRes, teamsRes] = await Promise.all([
      fetchJson("/get/groups"),
      fetchJson("/get/teams"),
    ]);

    const rawTeams: WorldCupTeam[] = Array.isArray(teamsRes?.teams) ? teamsRes.teams : [];
    const teamMap = new Map<string, WorldCupTeam>();
    for (const t of rawTeams) teamMap.set(String(t.id), t);

    const rawGroups: any[] = Array.isArray(groupsRes?.groups) ? groupsRes.groups : [];

    const standings: WorldCupGroupStanding[] = rawGroups
      .map((g) => {
        const rows = (g.teams || [])
          .map((entry: any) => {
            const meta = teamMap.get(String(entry.team_id));
            return {
              team: {
                id: String(entry.team_id),
                name: meta?.name_en || `Team ${entry.team_id}`,
                flag: meta?.flag || "",
                code: meta?.fifa_code || "",
                iso2: meta?.iso2 || "",
              },
              mp: toNum(entry.mp),
              w: toNum(entry.w),
              d: toNum(entry.d),
              l: toNum(entry.l),
              gf: toNum(entry.gf),
              ga: toNum(entry.ga),
              gd: toNum(entry.gd),
              pts: toNum(entry.pts),
            };
          })
          .sort((a: any, b: any) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            if (b.gd !== a.gd) return b.gd - a.gd;
            if (b.gf !== a.gf) return b.gf - a.gf;
            return a.team.name.localeCompare(b.team.name);
          })
          .map((r: any, i: number) => ({ ...r, rank: i + 1 }));

        return { name: String(g.name || ""), rows };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    cache = { timestamp: Date.now(), data: standings };
    return standings;
  },
);