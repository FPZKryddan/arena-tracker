import { useQuery, useQueries } from "@tanstack/react-query";
import type {
  ArenaModeSelection,
  ChampionRole,
  ChampionSpellIconDto,
  augmentsData,
  championData,
  ItemDataDto,
  LeaderboardOrder,
  LeaderboardResponse,
  LeaderboardSort,
  MatchDto,
  MatchTimelineDto,
  PlayerStats,
  Regions,
} from "../types";
import { getChampionDataUrl, getSpellIconUrl } from "../championIcon";
import { getApiBase, getStoredRegion } from "./useApiBase";
import useDdragonVersion from "./useDdragonVersion";
import {
  ApiError,
  coerceApiErrorPayload,
  parseApiError,
} from "../utils/apiError";
import {
  createArenaMatchesSearch,
  createArenaModesSearch,
  DEFAULT_ARENA_MODE,
} from "../utils/arenaModes";

const CHAMPION_ROLES: ChampionRole[] = [
  "Assassin",
  "Fighter",
  "Mage",
  "Marksman",
  "Support",
  "Tank",
];

const POLL_INTERVAL_MS = 1500;

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
  championSpellIcons: (version: string, championNames: string[]) =>
    ["championSpellIcons", version, championNames] as const,
  items: (version: string) => ["items", version] as const,
  match: (region: string, matchId: string) =>
    ["match", region, matchId] as const,
  matchTimeline: (region: string, matchId: string) =>
    ["matchTimeline", region, matchId] as const,
  playerStats: (
    region: string,
    gameName: string,
    tagLine: string,
    arenaMode: ArenaModeSelection
  ) => ["playerStats", region, gameName, tagLine, arenaMode] as const,
  recentMatchIds: (
    region: string,
    gameName: string,
    tagLine: string,
    limit: number,
    arenaMode: ArenaModeSelection
  ) =>
    ["recentMatchIds", region, gameName, tagLine, limit, arenaMode] as const,
  leaderboard: (
    page: number,
    limit: number,
    region: string,
    sortBy: LeaderboardSort,
    order: LeaderboardOrder,
    arenaMode: ArenaModeSelection
  ) => ["leaderboard", page, limit, region, sortBy, order, arenaMode] as const,
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

type DdragonChampionSpell = {
  id?: string;
  name?: string;
  image?: {
    full?: string;
  };
};

type DdragonChampionDetail = {
  spells?: DdragonChampionSpell[];
};

type DdragonChampionDetailResponse = {
  data?: Record<string, DdragonChampionDetail>;
};

const fetchChampionSpellIcons = async (
  version: string,
  championNames: string[]
): Promise<Record<string, ChampionSpellIconDto[]>> => {
  const entries = await Promise.all(
    championNames.map(async (championName) => {
      const res = await fetch(getChampionDataUrl(version, championName));
      if (!res.ok) return [championName, []] as const;

      const data = (await res.json()) as DdragonChampionDetailResponse;
      const champion = Object.values(data.data ?? {})[0];
      const spells = (champion?.spells ?? []).map((spell) => ({
        id: spell.id ?? "",
        name: spell.name ?? "Spell",
        icon: spell.image?.full ? getSpellIconUrl(version, spell.image.full) : "",
      }));

      return [championName, spells] as const;
    })
  );

  return Object.fromEntries(entries);
};

const fetchItems = async (
  version: string
): Promise<Record<number, ItemDataDto>> => {
  const res = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`
  );
  if (!res.ok) throw new Error(`DDragon item fetch failed: ${res.status}`);
  const data = (await res.json()) as { data?: Record<string, ItemDataDto> };
  const items: Record<number, ItemDataDto> = {};

  Object.entries(data.data ?? {}).forEach(([id, item]) => {
    const numericId = Number(id);
    if (Number.isFinite(numericId)) items[numericId] = item;
  });

  return items;
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

const fetchMatchTimeline = async (
  region: Exclude<Regions, null>,
  matchId: string
): Promise<MatchTimelineDto> => {
  const apiBase = getApiBase();
  const res = await fetch(`${apiBase}/matches/${region}/${matchId}/timeline`);
  if (!res.ok) throw new ApiError(await parseApiError(res));
  return (await res.json()) as MatchTimelineDto;
};

const fetchPlayerStats = async (
  region: Exclude<Regions, null>,
  gameName: string,
  tagLine: string,
  arenaMode: ArenaModeSelection = DEFAULT_ARENA_MODE
): Promise<PlayerStats> => {
  const apiBase = getApiBase();
  const arenaModesSearch = createArenaModesSearch(arenaMode);
  const res = await fetch(
    `${apiBase}/players/${region}/${encodeURIComponent(
      gameName
    )}/${encodeURIComponent(tagLine)}?${arenaModesSearch}`
  );
  if (!res.ok) throw new ApiError(await parseApiError(res));
  return (await res.json()) as PlayerStats;
};

const fetchLeaderboard = async (
  page: number,
  limit: number,
  region: Exclude<Regions, null>,
  sortBy: LeaderboardSort,
  order: LeaderboardOrder,
  arenaMode: ArenaModeSelection = DEFAULT_ARENA_MODE
): Promise<LeaderboardResponse> => {
  const apiBase = getApiBase();
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    region,
    sortBy,
    order,
  });
  const arenaModesSearch = new URLSearchParams(createArenaModesSearch(arenaMode));
  arenaModesSearch.forEach((value, key) => params.set(key, value));
  const res = await fetch(`${apiBase}/players/leaderboard?${params}`);
  if (!res.ok) throw new ApiError(await parseApiError(res));
  return (await res.json()) as LeaderboardResponse;
};

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const pollRefreshJob = async (jobId: string): Promise<void> => {
  const apiBase = getApiBase();

  while (true) {
    const res = await fetch(`${apiBase}/jobs/${jobId}`);
    if (!res.ok) throw new ApiError(await parseApiError(res));

    const state = (await res.json()) as {
      status: "queued" | "running" | "done" | "error";
      error?: unknown;
    };

    if (state.status === "done") return;
    if (state.status === "error") {
      throw new ApiError(coerceApiErrorPayload(state.error, 500));
    }

    await wait(POLL_INTERVAL_MS);
  }
};

const refreshPlayerStats = async (
  region: Exclude<Regions, null>,
  gameName: string,
  tagLine: string,
  arenaMode: ArenaModeSelection = DEFAULT_ARENA_MODE
): Promise<PlayerStats> => {
  const apiBase = getApiBase();
  const arenaModesSearch = createArenaModesSearch(arenaMode);
  const startRes = await fetch(
    `${apiBase}/players/${region}/${encodeURIComponent(
      gameName
    )}/${encodeURIComponent(tagLine)}/refresh?${arenaModesSearch}`,
    { method: "POST" }
  );
  if (!startRes.ok) throw new ApiError(await parseApiError(startRes));

  const { jobId } = (await startRes.json()) as { jobId: string };
  await pollRefreshJob(jobId);
  return fetchPlayerStats(region, gameName, tagLine, arenaMode);
};

const fetchPlayerStatsWithRefresh = async (
  region: Exclude<Regions, null>,
  gameName: string,
  tagLine: string,
  arenaMode: ArenaModeSelection = DEFAULT_ARENA_MODE
): Promise<PlayerStats> => {
  try {
    return await fetchPlayerStats(region, gameName, tagLine, arenaMode);
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.payload.code === "PLAYER_NOT_TRACKED"
    ) {
      return refreshPlayerStats(region, gameName, tagLine, arenaMode);
    }
    throw error;
  }
};

const fetchRecentMatchIds = async (
  region: Exclude<Regions, null>,
  gameName: string,
  tagLine: string,
  limit: number,
  arenaMode: ArenaModeSelection
): Promise<string[]> => {
  const apiBase = getApiBase();
  const params = createArenaMatchesSearch(limit, arenaMode);
  const res = await fetch(
    `${apiBase}/players/${region}/${encodeURIComponent(
      gameName
    )}/${encodeURIComponent(tagLine)}/matches?${params}`
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

export const useChampionSpellIconsQuery = (championNames: string[]) => {
  const version = useDdragonVersion();
  const uniqueChampionNames = Array.from(new Set(championNames)).sort();

  return useQuery({
    queryKey: queryKeys.championSpellIcons(version, uniqueChampionNames),
    queryFn: () => fetchChampionSpellIcons(version, uniqueChampionNames),
    staleTime: 24 * 60 * 60_000,
    enabled: !!version && uniqueChampionNames.length > 0,
  });
};

export const useItemDataQuery = () => {
  const version = useDdragonVersion();
  return useQuery({
    queryKey: queryKeys.items(version),
    queryFn: () => fetchItems(version),
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

export const useMatchTimelineQuery = (
  matchId: string | undefined | null,
  region: Exclude<Regions, null> = getStoredRegion()
) =>
  useQuery({
    queryKey: matchId
      ? queryKeys.matchTimeline(region, matchId)
      : ["matchTimeline", "none"],
    queryFn: () => fetchMatchTimeline(region, matchId as string),
    enabled: !!matchId,
    staleTime: 60 * 60_000,
  });

export const usePlayerStatsQuery = (
  region: Exclude<Regions, null> | undefined,
  gameName: string | undefined,
  tagLine: string | undefined,
  arenaMode: ArenaModeSelection = DEFAULT_ARENA_MODE
) =>
  useQuery({
    queryKey:
      region && gameName && tagLine
        ? queryKeys.playerStats(region, gameName, tagLine, arenaMode)
        : ["playerStats", "none"],
    queryFn: () =>
      fetchPlayerStatsWithRefresh(region!, gameName!, tagLine!, arenaMode),
    enabled: !!region && !!gameName && !!tagLine,
    retry: false,
    staleTime: 30_000,
  });

export const useLeaderboardQuery = (
  page: number,
  limit: number,
  region: Exclude<Regions, null>,
  sortBy: LeaderboardSort,
  order: LeaderboardOrder,
  arenaMode: ArenaModeSelection = DEFAULT_ARENA_MODE
) =>
  useQuery({
    queryKey: queryKeys.leaderboard(
      page,
      limit,
      region,
      sortBy,
      order,
      arenaMode
    ),
    queryFn: () => fetchLeaderboard(page, limit, region, sortBy, order, arenaMode),
    staleTime: 30_000,
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
  region: Exclude<Regions, null> = getStoredRegion(),
  arenaMode: ArenaModeSelection = DEFAULT_ARENA_MODE
) =>
  useQuery({
    queryKey: queryKeys.recentMatchIds(
      region,
      gameName ?? "",
      tagLine ?? "",
      limit,
      arenaMode
    ),
    queryFn: () =>
      fetchRecentMatchIds(region, gameName!, tagLine!, limit, arenaMode),
    enabled: !!gameName && !!tagLine,
    staleTime: 30_000,
  });
