import { useEffect, useRef, useState } from "react";
import type {
  ApiErrorPayload,
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

const POLL_INTERVAL_MS = 1500;
const RATE_LIMIT_TOAST_ID = "rate-limit";

const sameProfile = (
  a: LoadedProfile,
  b: LoadedProfile
): boolean =>
  a.region === b.region &&
  a.gameName.toLowerCase() === b.gameName.toLowerCase() &&
  a.tagLine.toLowerCase() === b.tagLine.toLowerCase();

function useGetPlayerStats(region: Regions = "EUW") {
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [jobState, setJobState] = useState<JobState | null>(null);
  const { playerStats, setPlayerStats, loadedProfile, setLoadedProfile } =
    useContextIfDefined(PlayerStatsContext);
  const { upsertToast, dismissToast } = useToast();
  const apiBase = import.meta.env.VITE_API_BASE;
  const effectiveRegion: Exclude<Regions, null> = region ?? "EUW";
  const pollTimerRef = useRef<number | null>(null);
  const rateLimitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current !== null) clearInterval(pollTimerRef.current);
      if (rateLimitTimerRef.current !== null)
        clearInterval(rateLimitTimerRef.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollTimerRef.current !== null) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const stopRateLimitCountdown = () => {
    if (rateLimitTimerRef.current !== null) {
      clearInterval(rateLimitTimerRef.current);
      rateLimitTimerRef.current = null;
    }
  };

  const showRateLimitCountdown = (seconds: number) => {
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
  };

  const handleSearchError = (
    err: ApiErrorPayload,
    ctx: { gameName: string; tagLine: string }
  ) => {
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
  };

  const retrievePlayerData = async (name: string) => {
    const [gameName, tagLine] = name.split("#");
    if (!tagLine) return;
    const requestedProfile: LoadedProfile = {
      region: effectiveRegion,
      gameName,
      tagLine,
    };
    const requestedProfileIsLoaded =
      !!playerStats &&
      !!loadedProfile &&
      sameProfile(loadedProfile, requestedProfile);

    stopPolling();
    setJobState(null);
    if (playerStats && !requestedProfileIsLoaded) {
      setPlayerStats(null);
      setLoadedProfile(null);
    }
    setIsFetching(true);

    try {
      const startRes = await fetch(
        `${apiBase}/players/${effectiveRegion}/${encodeURIComponent(
          gameName
        )}/${encodeURIComponent(tagLine)}/refresh`,
        { method: "POST" }
      );
      if (!startRes.ok) {
        const err = await parseApiError(startRes);
        handleSearchError(err, { gameName, tagLine });
        setIsFetching(false);
        return;
      }
      const { jobId } = (await startRes.json()) as { jobId: string };

      await new Promise<void>((resolve) => {
        const finish = () => {
          stopPolling();
          setIsFetching(false);
          resolve();
        };

        const poll = async () => {
          try {
            const res = await fetch(`${apiBase}/jobs/${jobId}`);
            if (!res.ok) {
              const err = await parseApiError(res);
              handleSearchError(err, { gameName, tagLine });
              finish();
              return;
            }
            const state = (await res.json()) as JobState;
            setJobState(state);

            if (state.status === "done") {
              const statsRes = await fetch(
                `${apiBase}/players/${effectiveRegion}/${encodeURIComponent(
                  gameName
                )}/${encodeURIComponent(tagLine)}`
              );
              if (statsRes.ok) {
                const stats = (await statsRes.json()) as PlayerStats;
                setPlayerStats(stats);
                setLoadedProfile(requestedProfile);
                upsertToast({ message: "Stats updated!", type: "SUCCESS" });
              } else {
                const err = await parseApiError(statsRes);
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
      upsertToast({
        message: "Failed to load player stats.",
        type: "ERROR",
      });
      console.error(err);
      stopPolling();
      setIsFetching(false);
    }
  };

  return {
    isFetching,
    jobState,
    retrievePlayerData,
  };
}

export default useGetPlayerStats;
