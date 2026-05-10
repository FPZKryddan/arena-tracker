import type { Regions } from "../types";

type Region = Exclude<Regions, null>;

export const MATCH_QUERY_PARAM = "match";

export const buildMatchSharePath = (region: Region, matchId: string): string =>
  `/match/${encodeURIComponent(region)}/${encodeURIComponent(matchId)}`;

export const buildMatchShareUrl = (region: Region, matchId: string): string => {
  const path = buildMatchSharePath(region, matchId);
  return typeof window === "undefined" ? path : `${window.location.origin}${path}`;
};
