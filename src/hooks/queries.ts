import { useQuery, useQueries } from "@tanstack/react-query";
import type {
  ChampionRole,
  augmentsData,
  championData,
  MatchDto,
  Regions,
} from "../types";
import { getApiBase, getStoredRegion } from "./useApiBase";
import useDdragonVersion from "./useDdragonVersion";
import { ApiError, parseApiError } from "../utils/apiError";

const CHAMPION_ROLES: ChampionRole[] = [
  "Assassin",
  "Fighter",
  "Mage",
  "Marksman",
  "Support",
  "Tank",
];

const isChampionRole = (role: string): role is ChampionRole =>
  (CHAMPION_ROLES as string[]).includes(role);

const isChampionRecord = (
  v: unknown
): v is { name: string; id: string; tags: string[] } =>
  typeof v === "object" &&
  v !== null &&
  typeof (v as { name?: unknown }).name === "string" &&
  typeof (v as { id?: unknown }).id === "string" &&
  Array.isArray((v as { tags?: unknown }).tags) &&
  (v as { tags: unknown[] }).tags.every((tag) => typeof tag === "string");

const isAugmentRecord = (v: unknown): v is augmentsData =>
  typeof v === "object" &&
  v !== null &&
  typeof (v as { id?: unknown }).id === "number";

export const queryKeys = {
  augments: ["augments"] as const,
  champions: (version: string) => ["champions", version] as const,
  match: (region: string, matchId: string) =>
    ["match", region, matchId] as const,
  recentMatchIds: (
    region: string,
    gameName: string,
    tagLine: string,
    limit: number
  ) => ["recentMatchIds", region, gameName, tagLine, limit] as const,
};

const fetchAugments = async (): Promise<augmentsData[]> => {
  const res = await fetch(
    "https://raw.communitydragon.org/latest/cdragon/arena/en_us.json"
  );
  if (!res.ok) throw new Error(`CDragon augment fetch failed: ${res.status}`);
  const data = await res.json();
  return Object.values(data.augments).filter(isAugmentRecord);
};

const fetchChampions = async (version: string): Promise<championData[]> => {
  const res = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
  );
  if (!res.ok) throw new Error(`DDragon champion fetch failed: ${res.status}`);
  const data = await res.json();
  return Object.values(data.data)
    .filter(isChampionRecord)
    .map((c) => ({
      displayName: c.name,
      id: c.id,
      roles: c.tags.filter(isChampionRole),
    }));
};

const fetchMatch = async (
  region: Exclude<Regions, null>,
  matchId: string
): Promise<MatchDto> => {
  const apiBase = getApiBase();
  const res = await fetch(`${apiBase}/matches/${region}/${matchId}`);
  if (!res.ok) throw new ApiError(await parseApiError(res));
  return (await res.json()) as MatchDto;
};

const fetchRecentMatchIds = async (
  region: Exclude<Regions, null>,
  gameName: string,
  tagLine: string,
  limit: number
): Promise<string[]> => {
  const apiBase = getApiBase();
  const res = await fetch(
    `${apiBase}/players/${region}/${encodeURIComponent(
      gameName
    )}/${encodeURIComponent(tagLine)}/matches?limit=${limit}`
  );
  if (!res.ok) throw new ApiError(await parseApiError(res));
  const data = (await res.json()) as { matchIds?: string[] } | string[];
  return Array.isArray(data) ? data : data.matchIds ?? [];
};

export const useAugmentsQuery = () =>
  useQuery({
    queryKey: queryKeys.augments,
    queryFn: fetchAugments,
    staleTime: 24 * 60 * 60_000,
  });

export const useChampionListQuery = () => {
  const version = useDdragonVersion();
  return useQuery({
    queryKey: queryKeys.champions(version),
    queryFn: () => fetchChampions(version),
    staleTime: 24 * 60 * 60_000,
    enabled: !!version,
  });
};

export const useMatchQuery = (
  matchId: string | undefined | null,
  region: Exclude<Regions, null> = getStoredRegion()
) =>
  useQuery({
    queryKey: matchId ? queryKeys.match(region, matchId) : ["match", "none"],
    queryFn: () => fetchMatch(region, matchId as string),
    enabled: !!matchId,
    staleTime: 60 * 60_000,
  });

export const useMatchesQuery = (
  matchIds: string[],
  region: Exclude<Regions, null> = getStoredRegion()
) =>
  useQueries({
    queries: matchIds.map((id) => ({
      queryKey: queryKeys.match(region, id),
      queryFn: () => fetchMatch(region, id),
      staleTime: 60 * 60_000,
    })),
  });

export const useRecentMatchIdsQuery = (
  gameName: string | undefined,
  tagLine: string | undefined,
  limit: number,
  region: Exclude<Regions, null> = getStoredRegion()
) =>
  useQuery({
    queryKey: queryKeys.recentMatchIds(
      region,
      gameName ?? "",
      tagLine ?? "",
      limit
    ),
    queryFn: () => fetchRecentMatchIds(region, gameName!, tagLine!, limit),
    enabled: !!gameName && !!tagLine,
    staleTime: 30_000,
  });
