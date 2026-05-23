import type { ArenaModeSelection } from "../types";

export type ArenaPlacementCount = 6 | 8;
export type ArenaQueueId = 1700 | 1710 | 1750;

export const DEFAULT_ARENA_MODE: ArenaModeSelection = "all";
export const ARENA_QUEUE_IDS: readonly ArenaQueueId[] = [1700, 1710, 1750];

export const ARENA_MODE_OPTIONS: ReadonlyArray<{
  value: ArenaModeSelection;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "normal", label: "Normal" },
  { value: "3x6", label: "3x6" },
];

const ARENA_MODE_API_VALUES: Record<ArenaModeSelection, readonly string[]> = {
  all: ["normal", "3x6"],
  normal: ["normal"],
  "3x6": ["3x6"],
};

const ARENA_MODE_QUEUE_IDS: Record<ArenaModeSelection, readonly ArenaQueueId[]> = {
  all: ARENA_QUEUE_IDS,
  normal: [1700, 1710],
  "3x6": [1750],
};

export const parseArenaMode = (
  value: string | null | undefined
): ArenaModeSelection =>
  value === "normal" || value === "3x6" ? value : DEFAULT_ARENA_MODE;

export const getArenaModesParam = (
  arenaMode: ArenaModeSelection = DEFAULT_ARENA_MODE
): string => ARENA_MODE_API_VALUES[arenaMode].join(",");

export const createArenaModesSearch = (
  arenaMode: ArenaModeSelection = DEFAULT_ARENA_MODE
): string =>
  new URLSearchParams({ modes: getArenaModesParam(arenaMode) }).toString();

export const createArenaMatchesSearch = (
  limit: number,
  arenaMode: ArenaModeSelection = DEFAULT_ARENA_MODE
): string => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (arenaMode === DEFAULT_ARENA_MODE) {
    params.set("modes", getArenaModesParam(arenaMode));
  } else {
    params.set("mode", arenaMode);
  }
  return params.toString();
};

export const getArenaPlacementCount = (
  arenaMode: ArenaModeSelection | undefined
): ArenaPlacementCount => (arenaMode === "3x6" ? 6 : 8);

export const matchQueueIdBelongsToArenaMode = (
  queueId: number,
  arenaMode: ArenaModeSelection = DEFAULT_ARENA_MODE
): boolean => ARENA_MODE_QUEUE_IDS[arenaMode].includes(queueId as ArenaQueueId);
