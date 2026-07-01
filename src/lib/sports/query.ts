import { queryOptions } from "@tanstack/react-query";
import { getMatches, getMatchDetail, getStandings } from "@/lib/sportsrc.functions";
import { getWorldCupStandings } from "@/lib/worldcup.functions";
import { getEspnStandings, getEspnNews } from "@/lib/espn.functions";

const FIVE_MIN = 5 * 60 * 1000;

export const matchesQueryOptions = (category: string) =>
  queryOptions({
    queryKey: ["sports", "matches", category],
    queryFn: () => getMatches({ data: { category } }),
    staleTime: FIVE_MIN,
    gcTime: 30 * 60 * 1000,
    refetchInterval: FIVE_MIN,
    refetchOnWindowFocus: false,
  });

export const matchDetailQueryOptions = (id: string, category: string) =>
  queryOptions({
    queryKey: ["sports", "detail", category, id],
    queryFn: () => getMatchDetail({ data: { id, category } }),
    staleTime: FIVE_MIN,
  });

export const standingsQueryOptions = (league: string) =>
  queryOptions({
    queryKey: ["sports", "standings", league],
    queryFn: () => getStandings({ data: { league } }),
    staleTime: FIVE_MIN,
  });

export const worldCupStandingsQueryOptions = () =>
  queryOptions({
    queryKey: ["worldcup", "standings"],
    queryFn: () => getWorldCupStandings(),
    staleTime: FIVE_MIN,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const espnStandingsQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["espn", "standings", slug],
    queryFn: () => getEspnStandings({ data: { slug } }),
    staleTime: FIVE_MIN,
  });

export const espnNewsQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["espn", "news", slug],
    queryFn: () => getEspnNews({ data: { slug } }),
    staleTime: FIVE_MIN,
  });
