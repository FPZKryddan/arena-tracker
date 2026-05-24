import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ApiErrorPayload,
  ArenaModeSelection,
  JobState,
  PlayerStats,
  Regions,
} from "../types";
import useToast from "./useToast";
import useContextIfDefined from "./useContextIfDefined";
import {
  PlayerStatsContext,
  type LoadedProfile,
} from "../contexts/PlayerStatsContext";
import {
  coerceApiErrorPayload,
  formatApiError,
  getRetryAfterSeconds,
  parseApiError,
} from "../utils/apiError";
import {
  createArenaModesSearch,
  DEFAULT_ARENA_MODE,
} from "../utils/arenaModes";

const POLL_INTERVAL_MS = 1500;
const RATE_LIMIT_TOAST_ID = "rate-limit";

const sameProfile = (a: LoadedProfile, b: LoadedProfile): boolean =>
  a.region === b.region &&
  a.gameName.toLowerCase() === b.gameName.toLowerCase() &&
  a.tagLine.toLowerCase() === b.tagLine.toLowerCase() &&
  a.arenaMode === b.arenaMode;

function useGetPlayerStats(
  region: Regions = "EUW",
  arenaMode: ArenaModeSelection = DEFAULT_ARENA_MODE,
) {
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [jobState, setJobState] = useState<JobState | null>(null);
  const { playerStats, setPlayerStats, loadedProfile, setLoadedProfile } =
    useContextIfDefined(PlayerStatsContext);
  const { upsertToast, dismissToast } = useToast();
  const apiBase = import.meta.env.VITE_API_BASE;
  const effectiveRegion: Exclude<Regions, null> = region ?? "EUW";
  const playerStatsRef = useRef(playerStats);
  const loadedProfileRef = useRef(loadedProfile);
  const pollTimerRef = useRef<number | null>(null);
  const rateLimitTimerRef = useRef<number | null>(null);
  const activeRequestRef = useRef<number | null>(null);
  const nextRequestIdRef = useRef(0);

  useEffect(() => {
    playerStatsRef.current = playerStats;
  }, [playerStats]);

  useEffect(() => {
    loadedProfileRef.current = loadedProfile;
  }, [loadedProfile]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current !== null) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const stopRateLimitCountdown = useCallback(() => {
    if (rateLimitTimerRef.current !== null) {
      clearInterval(rateLimitTimerRef.current);
      rateLimitTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopPolling();
      stopRateLimitCountdown();
    };
  }, [stopPolling, stopRateLimitCountdown]);

  const showRateLimitCountdown = useCallback(
    (seconds: number) => {
      stopRateLimitCountdown();
      let remaining = Math.max(1, Math.round(seconds));
      const render = () =>
        upsertToast({
          id: RATE_LIMIT_TOAST_ID,
          type: "WARNING",
          message: `Riot API rate limited. Try again in ${remaining}s.`,
          durationMs: Number.POSITIVE_INFINITY,
        });
      render();
      rateLimitTimerRef.current = window.setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          stopRateLimitCountdown();
          dismissToast(RATE_LIMIT_TOAST_ID);
          return;
        }
        render();
      }, 1000);
    },
    [dismissToast, stopRateLimitCountdown, upsertToast],
  );

  const handleSearchError = useCallback(
    (err: ApiErrorPayload, ctx: { gameName: string; tagLine: string }) => {
      const formatted = formatApiError(err, {
        gameName: ctx.gameName,
        tagLine: ctx.tagLine,
        region: effectiveRegion,
      });

      if (err.code === "UPSTREAM_RATE_LIMITED") {
        showRateLimitCountdown(getRetryAfterSeconds(err));
      } else if (err.code === "PLAYER_NOT_TRACKED") {
        upsertToast({ message: formatted, type: "WARNING" });
      } else {
        upsertToast({ message: formatted, type: "ERROR" });
      }

      console.error("[useGetPlayerStats]", err.code, err.message, err.details);
    },
    [effectiveRegion, showRateLimitCountdown, upsertToast],
  );

  const cancelPlayerDataFetch = useCallback(() => {
    activeRequestRef.current = null;
    stopPolling();
    setJobState(null);
    setIsFetching(false);
  }, [stopPolling]);

  const retrievePlayerData = useCallback(
    async (name: string) => {
      const [rawGameName, rawTagLine] = name.split("#");
      const gameName = rawGameName?.trim();
      const tagLine = rawTagLine?.trim();
      if (!gameName || !tagLine) return;
      const requestedProfile: LoadedProfile = {
        region: effectiveRegion,
        gameName,
        tagLine,
        arenaMode,
      };
      const playerPath = `${apiBase}/players/${effectiveRegion}/${encodeURIComponent(
        gameName,
      )}/${encodeURIComponent(tagLine)}`;
      const arenaModesSearch = createArenaModesSearch(arenaMode);
      nextRequestIdRef.current += 1;
      const requestId = nextRequestIdRef.current;
      activeRequestRef.current = requestId;
      const isActiveRequest = () => activeRequestRef.current === requestId;
      const requestedProfileIsLoaded =
        !!playerStatsRef.current &&
        !!loadedProfileRef.current &&
        sameProfile(loadedProfileRef.current, requestedProfile);

      stopPolling();
      setJobState(null);
      if (playerStatsRef.current && !requestedProfileIsLoaded) {
        playerStatsRef.current = null;
        loadedProfileRef.current = null;
        setPlayerStats(null);
        setLoadedProfile(null);
      }
      setIsFetching(true);

      try {
        const startRes = await fetch(
          `${playerPath}/refresh?${arenaModesSearch}`,
          { method: "POST" },
        );
        if (!isActiveRequest()) return;
        if (!startRes.ok) {
          const err = await parseApiError(startRes);
          if (!isActiveRequest()) return;
          handleSearchError(err, { gameName, tagLine });
          setIsFetching(false);
          activeRequestRef.current = null;
          return;
        }
        const { jobId } = (await startRes.json()) as { jobId: string };
        if (!isActiveRequest()) return;

        await new Promise<void>((resolve) => {
          const finish = () => {
            if (!isActiveRequest()) {
              resolve();
              return;
            }
            stopPolling();
            setIsFetching(false);
            activeRequestRef.current = null;
            resolve();
          };

          const poll = async () => {
            try {
              const res = await fetch(`${apiBase}/jobs/${jobId}`);
              if (!isActiveRequest()) {
                resolve();
                return;
              }
              if (!res.ok) {
                const err = await parseApiError(res);
                if (!isActiveRequest()) {
                  resolve();
                  return;
                }
                handleSearchError(err, { gameName, tagLine });
                finish();
                return;
              }
              const state = (await res.json()) as JobState;
              if (!isActiveRequest()) {
                resolve();
                return;
              }
              setJobState(state);

              if (state.status === "done") {
                const statsRes = await fetch(
                  `${playerPath}?${arenaModesSearch}`,
                );
                if (!isActiveRequest()) {
                  resolve();
                  return;
                }
                if (statsRes.ok) {
                  const stats = (await statsRes.json()) as PlayerStats;
                  if (!isActiveRequest()) {
                    resolve();
                    return;
                  }
                  playerStatsRef.current = stats;
                  loadedProfileRef.current = requestedProfile;
                  setPlayerStats(stats);
                  setLoadedProfile(requestedProfile);
                  upsertToast({ message: "Stats updated!", type: "SUCCESS" });
                } else {
                  const err = await parseApiError(statsRes);
                  if (!isActiveRequest()) {
                    resolve();
                    return;
                  }
                  handleSearchError(err, { gameName, tagLine });
                }
                finish();
              } else if (state.status === "error") {
                const err = coerceApiErrorPayload(state.error, 500);
                handleSearchError(err, { gameName, tagLine });
                setJobState(null);
                finish();
              }
            } catch (err) {
              console.error("poll failed:", err);
            }
          };

          poll();
          pollTimerRef.current = window.setInterval(poll, POLL_INTERVAL_MS);
        });
      } catch (err) {
        if (!isActiveRequest()) return;
        upsertToast({
          message: "Failed to load player stats.",
          type: "ERROR",
        });
        console.error(err);
        stopPolling();
        setIsFetching(false);
        activeRequestRef.current = null;
      }
    },
    [
      apiBase,
      arenaMode,
      effectiveRegion,
      handleSearchError,
      setLoadedProfile,
      setPlayerStats,
      stopPolling,
      upsertToast,
    ],
  );

  return {
    isFetching,
    jobState,
    cancelPlayerDataFetch,
    retrievePlayerData,
  };
}

export default useGetPlayerStats;
