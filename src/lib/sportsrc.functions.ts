import { createServerFn } from "@tanstack/react-start";
import { callSportsrc } from "./sportsrc.server";

export const getMatches = createServerFn({ method: "GET" })
  .inputValidator((data: { category?: string }) => data ?? {})
  .handler(async ({ data }) => {
    const category = data?.category || "football";
    return callSportsrc(`data=matches&category=${encodeURIComponent(category)}`);
  });

export const getMatchDetail = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string; category?: string }) => data)
  .handler(async ({ data }) => {
    const category = data.category || "football";
    return callSportsrc(
      `data=detail&category=${encodeURIComponent(category)}&id=${encodeURIComponent(data.id)}`,
    );
  });
