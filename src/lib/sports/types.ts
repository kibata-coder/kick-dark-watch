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