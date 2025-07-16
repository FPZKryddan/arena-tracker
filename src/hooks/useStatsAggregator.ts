import { ChampionsContext } from "../contexts/ChampionsContext";
import type { championData, placementDto, PlayerStats } from "../types";
import useContextIfDefined from "./useContextIfDefined";

function useStatsAggregator() {
  const { champions } = useContextIfDefined(ChampionsContext);

  /**
   * Gets the number of champions in each stage of progression for a player
   * @param stats The player stats object of the player
   * @returns The number of champions found in each stage of progression for the player and the total amount of champions
   */
  const getProgressStatusOfChampions = (
    stats: PlayerStats
  ): {
    total: number;
    played: number;
    top4: number;
    won: number;
  } => {
    console.log("DKSAK", stats);
    let played = 0;
    let top4 = 0;
    let won = 0;
    console.log("CHAMPIONS", champions);
    champions.map((champion: championData) => {
      if (!(champion.id in stats.championStats)) return;
      switch (stats.championStats[champion.id].stage) {
        case 1:
          played++;
          break;
        case 2:
          top4++;
          break;
        case 3:
          won++;
          break;
      }
    });
    console.log("WON", won);
    return {
      total: champions.length,
      played,
      top4,
      won,
    };
  };

  const getTotalMatches = (placements: placementDto): number => {
    let total = 0;
    for (let i = 1; i <= 8; i++) {
      const v = i in placements ? placements[i] : 0;
      total += v;
    }
    return total;
  };

  const getWins = (placements: placementDto): number => {
    let total = 0;
    for (let i = 1; i <= 4; i++) {
      const v = i in placements ? placements[i] : 0;
      total += v;
    }
    return total;
  };

  const getLosses = (placements: placementDto): number => {
    let total = 0;
    for (let i = 5; i <= 8; i++) {
      const v = i in placements ? placements[i] : 0;
      total += v;
    }
    return total;
  };

  const getWinrate = (placements: placementDto): number => {
    const wins = getWins(placements);
    const total = getTotalMatches(placements)
    if (total == 0) return 0;
    return Math.ceil(wins / total  * 100);
  }

  return {
    getProgressStatusOfChampions,
    getTotalMatches,
    getWins,
    getLosses,
    getWinrate,
  };
}

export default useStatsAggregator;