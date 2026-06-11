import { createServerFn } from "@tanstack/react-start";
import { callSportsrc } from "./sportsrc.server";

export const getMatches = createServerFn({ method: "GET" })
  .inputValidator((data: { date: string; status?: string }) => data)
  .handler(async ({ data }) => {
    const status = data.status || "inprogress";
    return callSportsrc(
      `type=matches&sport=football&status=${encodeURIComponent(status)}&date=${encodeURIComponent(data.date)}`,
    );
  });

export const getMatchDetail = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return callSportsrc(`type=detail&id=${encodeURIComponent(data.id)}`);
  });
