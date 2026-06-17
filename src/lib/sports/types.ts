export type Match = {
  id: string | number;
  title?: string;
  home?: { name?: string; logo?: string };
  away?: { name?: string; logo?: string };
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
