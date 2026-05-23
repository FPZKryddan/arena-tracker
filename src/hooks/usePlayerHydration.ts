import { useCallback, useEffect, useRef } from "react";
import {
  PlayerStatsContext,
  type LoadedProfile,
} from "../contexts/PlayerStatsContext";
import useContextIfDefined from "./useContextIfDefined";
import useGetPlayerStats from "./useGetPlayerStats";
import type {
  ArenaModeSelection,
  JobState,
  PlayerStats,
  Regions,
} from "../types";
import { getRetryAfterSeconds, parseApiError } from "../utils/apiError";
import {
  createArenaModesSearch,
  DEFAULT_ARENA_MODE,
} from "../utils/arenaModes";

interface HydrationParams {
  region: Exclude<Regions, null> | null;
  gameName: string | null;
  tagLine: string | null;
  arenaMode?: ArenaModeSelection;
}

interface HydrationState {
  isFetching: boolean;
  jobState: JobState | null;
  refreshProfile: () => Promise<void>;
}

const sameProfile = (
  a: LoadedProfile,
  b: LoadedProfile
): boolean =>
  a.region === b.region &&
  a.gameName.toLowerCase() === b.gameName.toLowerCase() &&
  a.tagLine.toLowerCase() === b.tagLine.toLowerCase() &&
  a.arenaMode === b.arenaMode;

function usePlayerHydration({
  region,
  gameName,
  tagLine,
  arenaMode = DEFAULT_ARENA_MODE,
}: HydrationParams): HydrationState {
  const { playerStats, setPlayerStats, loadedProfile, setLoadedProfile } =
    useContextIfDefined(PlayerStatsContext);
  const { isFetching, jobState, retrievePlayerData, cancelPlayerDataFetch } =
    useGetPlayerStats(region ?? "EUW", arenaMode);
  const playerStatsRef = useRef(playerStats);
  const loadedProfileRef = useRef(loadedProfile);
  const routeSearchStartedRef = useRef<string | null>(null);

  useEffect(() => {
    playerStatsRef.current = playerStats;
  }, [playerStats]);

  useEffect(() => {
    loadedProfileRef.current = loadedProfile;
  }, [loadedProfile]);

  useEffect(() => {
    if (!region || !gameName || !tagLine) {
      cancelPlayerDataFetch();
      routeSearchStartedRef.current = null;
      return;
    }

    const requestedProfile: LoadedProfile = {
      region,
      gameName,
      tagLine,
      arenaMode,
    };
    const requestedKey = [
      region,
      gameName.toLowerCase(),
      tagLine.toLowerCase(),
      arenaMode,
    ].join("|");
    const alreadyLoaded =
      !!playerStatsRef.current &&
      !!loadedProfileRef.current &&
      sameProfile(loadedProfileRef.current, requestedProfile);
    if (alreadyLoaded) return;

    if (playerStatsRef.current) {
      setPlayerStats(null);
      setLoadedProfile(null);
    }

    let cancelled = false;
    const apiBase = import.meta.env.VITE_API_BASE;
    const arenaModesSearch = createArenaModesSearch(arenaMode);
    fetch(
      `${apiBase}/players/${region}/${encodeURIComponent(
        gameName
      )}/${encodeURIComponent(tagLine)}?${arenaModesSearch}`
    )
      .then(async (res) => {
        if (res.ok) return (await res.json()) as PlayerStats;
        const err = await parseApiError(res);
        if (err.code === "UPSTREAM_RATE_LIMITED") {
          console.warn(
            `[hydrate] rate limited, retry-after ${getRetryAfterSeconds(err)}s`
          );
        } else if (err.code !== "PLAYER_NOT_TRACKED") {
          console.warn("[hydrate]", err.code, err.message);
        }
        return err.code;
      })
      .then((result) => {
        if (cancelled) return;
        if (!result) return;

        if (typeof result === "string") {
          if (
            result === "PLAYER_NOT_TRACKED" &&
            routeSearchStartedRef.current !== requestedKey
          ) {
            routeSearchStartedRef.current = requestedKey;
            void retrievePlayerData(`${gameName}#${tagLine}`);
          }
          return;
        }

        routeSearchStartedRef.current = null;
        playerStatsRef.current = result;
        loadedProfileRef.current = requestedProfile;
        setPlayerStats(result);
        setLoadedProfile(requestedProfile);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("hydrate from server failed:", err);
      });
    return () => {
      cancelled = true;
      cancelPlayerDataFetch();
    };
  }, [
    arenaMode,
    cancelPlayerDataFetch,
    region,
    gameName,
    retrievePlayerData,
    setLoadedProfile,
    setPlayerStats,
    tagLine,
  ]);

  const refreshProfile = useCallback(async () => {
    if (!region || !gameName || !tagLine || isFetching) return;
    await retrievePlayerData(`${gameName}#${tagLine}`);
  }, [gameName, isFetching, region, retrievePlayerData, tagLine]);

  return { isFetching, jobState, refreshProfile };
}

export default usePlayerHydration;
