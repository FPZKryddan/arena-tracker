import { useCallback, useEffect } from "react";
import { ChampionsContext } from "../contexts/ChampionsContext";
import { PlayerStatsContext } from "../contexts/PlayerStatsContext";
import useChampionData from "./useChampionData";
import useContextIfDefined from "./useContextIfDefined";
import useMatchParser from "./useMatchParser";
import type { PlayerStats } from "../types";

function useInitializeAppState() {
  const { champions, setChampions } = useContextIfDefined(ChampionsContext);
  const { playerStats, setPlayerStats } =
    useContextIfDefined(PlayerStatsContext);
  const { createEmptyPlayerStats } = useMatchParser();
  const { getChampions } = useChampionData();

  const initChampions = useCallback(async () => {
    if (champions.length !== 0) return;
    const fetchedChampions = await getChampions();
    setChampions(fetchedChampions);
  }, [champions, setChampions, getChampions]);

  const initPlayerStats = useCallback(async () => {
    const storedPlayerStats = localStorage.getItem("playerStats");
    if (storedPlayerStats) {
      const parsedStats: PlayerStats = JSON.parse(storedPlayerStats);
      setPlayerStats(parsedStats);
    } else {
      const emptyStats = createEmptyPlayerStats(champions);
      setPlayerStats(emptyStats);
    }
  }, [champions, createEmptyPlayerStats, setPlayerStats]);

  useEffect(() => {
    if (playerStats && champions) return;

    console.log("Initial effect running");

    initChampions();
    initPlayerStats();
  }, [initChampions, initPlayerStats, playerStats, champions]);

  useEffect(() => {
    if (playerStats) {
      console.log("PlayerStats updated:", playerStats);
      localStorage.setItem("playerStats", JSON.stringify(playerStats));
    }
  }, [playerStats]);
}

export default useInitializeAppState;
