import { queryOptions } from "@tanstack/react-query";
import { getMatches, getMatchDetail } from "@/lib/sportsrc.functions";

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