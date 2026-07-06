import { queryOptions } from "@tanstack/react-query";
import { getStandings } from "@/lib/thesportsdb.functions";
import { getMatches as getSportsrcMatches, getMatchDetail as getSportsrcMatchDetail } from "@/lib/sportsrc.functions";
import { getWorldCupStandings } from "@/lib/worldcup.functions";
import { getEspnStandings, getEspnNews, getEspnScoreboard } from "@/lib/espn.functions";

const FIVE_MIN = 5 * 60 * 1000;

export const matchesQueryOptions = (category: string) =>
  queryOptions({
    queryKey: ["sports", "matches", category],
    staleTime: FIVE_MIN,
    gcTime: 30 * 60 * 1000,
    queryFn: async () => {
      // SportSRC v2 wants a date, default to today local time
      const now = new Date();
      const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      const [todayRes, yesterdayRes] = await Promise.all([
        getSportsrcMatches({ data: { date: todayDate, category } }),
        getSportsrcMatches({ data: { date: yesterdayDate, category } }),
      ]);

      if (category === "football") {
        const mergedData: any[] = [];
        
        // Add yesterday's finished matches
        if (yesterdayRes?.data && Array.isArray(yesterdayRes.data)) {
          const finishedYesterday = yesterdayRes.data.map((group: any) => ({
            ...group,
            matches: group.matches?.filter((m: any) => m.status === "finished") || []
          })).filter((group: any) => group.matches.length > 0);
          mergedData.push(...finishedYesterday);
        }
        
        // Add today's matches
        if (todayRes?.data && Array.isArray(todayRes.data)) {
          mergedData.push(...todayRes.data);
        }
        
        return { success: true, data: mergedData };
      } else {
        // Fallback for non-football (v1 format)
        let merged: any[] = [];
        if (Array.isArray(yesterdayRes)) merged = merged.concat(yesterdayRes);
        else if (yesterdayRes?.data && Array.isArray(yesterdayRes.data)) merged = merged.concat(yesterdayRes.data);
        
        if (Array.isArray(todayRes)) merged = merged.concat(todayRes);
        else if (todayRes?.data && Array.isArray(todayRes.data)) merged = merged.concat(todayRes.data);
        
        return { data: merged };
      }
    },
    refetchInterval: FIVE_MIN,
    refetchOnWindowFocus: false,
  });

export const matchDetailQueryOptions = (id: string, category: string) =>
  queryOptions({
    queryKey: ["sports", "detail", category, id],
    queryFn: () => {
      return getSportsrcMatchDetail({ data: { id, category } });
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
