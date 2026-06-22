export type Match = {
  id: string | number;
  title?: string;
  home?: { name?: string; logo?: string; score?: number | string };
  away?: { name?: string; logo?: string; score?: number | string };
  league?: { name?: string };
  status?: string;
  time?: string;
  date?: number | string;
  poster?: string;
  daddyStreamUrl?: string;
  [k: string]: unknown;
};

export type TeamStanding = {
  id?: string | number;
  rank?: number;
  name?: string;
  teamName?: string;
  logo?: string;
  matchesPlayed?: number;
  played?: number;
  wins?: number;
  won?: number;
  draws?: number;
  drawn?: number;
  losses?: number;
  lost?: number;
  goalsFor?: number;
  gf?: number;
  goalsAgainst?: number;
  ga?: number;
  goalDifference?: number;
  gd?: number;
  points?: number;
  pts?: number;
  [k: string]: unknown;
};

export type WorldCupTeam = {
  id: string;
  name_en: string;
  name_fa?: string;
  flag: string;
  fifa_code: string;
  iso2: string;
  groups: string;
};

export type WorldCupStandingRow = {
  rank: number;
  team: { id: string; name: string; flag: string; code: string; iso2: string };
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
};

export type WorldCupGroupStanding = {
  name: string;
  rows: WorldCupStandingRow[];
};
