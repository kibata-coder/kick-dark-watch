import { queryOptions } from "@tanstack/react-query";
import { getMatches as getTsdbMatches, getMatchDetail as getTsdbMatchDetail, getStandings } from "@/lib/thesportsdb.functions";
import { getMatches as getSportsrcMatches, getMatchDetail as getSportsrcMatchDetail } from "@/lib/sportsrc.functions";
import { getWorldCupStandings } from "@/lib/worldcup.functions";
import { getEspnStandings, getEspnNews, getEspnScoreboard } from "@/lib/espn.functions";

const FIVE_MIN = 5 * 60 * 1000;

export const matchesQueryOptions = (category: string) =>
  queryOptions({
    queryKey: ["sports", "matches", category],
    queryFn: () => {
      if (category === "football") {
        // SportSRC v2 wants a date, default to today
        const date = new Date().toISOString().split("T")[0];
        return getSportsrcMatches({ data: { date } });
      }
      return getTsdbMatches({ data: { category } });
    },
    staleTime: FIVE_MIN,
    gcTime: 30 * 60 * 1000,
    refetchInterval: FIVE_MIN,
    refetchOnWindowFocus: false,
  });

export const matchDetailQueryOptions = (id: string, category: string) =>
  queryOptions({
    queryKey: ["sports", "detail", category, id],
    queryFn: () => {
      if (category === "football") {
        return getSportsrcMatchDetail({ data: { id } });
      }
      return getTsdbMatchDetail({ data: { id, category } });
    },
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

export const espnScoreboardQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["espn", "scoreboard", slug],
    queryFn: () => getEspnScoreboard({ data: { slug } }),
    staleTime: FIVE_MIN,
  });
