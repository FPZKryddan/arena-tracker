import { useEffect } from "react";
import { PlayerStatsContext } from "../contexts/PlayerStatsContext";
import useContextIfDefined from "./useContextIfDefined";
import type { PlayerStats, Regions } from "../types";
import { getRetryAfterSeconds, parseApiError } from "../utils/apiError";

interface HydrationParams {
  region: Exclude<Regions, null> | null;
  gameName: string | null;
  tagLine: string | null;
}

function usePlayerHydration({ region, gameName, tagLine }: HydrationParams) {
  const { playerStats, setPlayerStats } = useContextIfDefined(PlayerStatsContext);

  useEffect(() => {
    if (!region || !gameName || !tagLine) return;

    const alreadyLoaded =
      playerStats &&
      playerStats.gameName.toLowerCase() === gameName.toLowerCase() &&
      playerStats.tagLine.toLowerCase() === tagLine.toLowerCase();
    if (alreadyLoaded) return;

    let cancelled = false;
    const apiBase = import.meta.env.VITE_API_BASE;
    fetch(
      `${apiBase}/players/${region}/${encodeURIComponent(
        gameName
      )}/${encodeURIComponent(tagLine)}`
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
        return null;
      })
      .then((stats) => {
        if (cancelled) return;
        if (stats) setPlayerStats(stats);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("hydrate from server failed:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [region, gameName, tagLine, playerStats, setPlayerStats]);
}

export default usePlayerHydration;
