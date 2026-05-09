import { useEffect } from "react";
import { ChampionsContext } from "../contexts/ChampionsContext";
import { PlayerStatsContext } from "../contexts/PlayerStatsContext";
import { useChampionListQuery } from "./queries";
import useContextIfDefined from "./useContextIfDefined";
import type { PlayerStats, Regions } from "../types";
import { getRetryAfterSeconds, parseApiError } from "../utils/apiError";

function useInitializeAppState() {
  const { setChampions } = useContextIfDefined(ChampionsContext);
  const { setPlayerStats } = useContextIfDefined(PlayerStatsContext);
  const { data: championList } = useChampionListQuery();

  useEffect(() => {
    if (championList) setChampions(championList);
  }, [championList, setChampions]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPlayer = params.get("player");
    const urlRegion = params.get("region") as Regions | null;

    const name = urlPlayer
      ? urlPlayer.replace("-", "#")
      : localStorage.getItem("leagueAccountName");
    const region = urlRegion ?? (localStorage.getItem("region") as Regions | null);
    if (!name || !region) return;
    const [gameName, tagLine] = name.split("#");
    if (!tagLine) return;

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
  }, [setPlayerStats]);
}

export default useInitializeAppState;
