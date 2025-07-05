import type {
  championData,
  ParticipantDto,
  MatchDto,
  PlayerStats,
  placementDto,
} from "../types";

function useMatchParser() {
  const GetParticipantIdByPuuid = (
    matchData: MatchDto,
    player: string
  ): number | null => {
    const participants: ParticipantDto[] = matchData.info.participants;

    let foundId: number | null = null;
    participants.forEach((participant) => {
      if (participant.puuid === player) {
        foundId = participant.participantId - 1;
        return;
      }
    });

    return foundId;
  };

  const GetChampionProgressFromMatch = (
    matchData: MatchDto,
    participantId: number
  ): championData => {
    const player = matchData.info.participants[participantId];
    const name = player.championName.toLocaleLowerCase();
    let stage: number = 1;

    if (player.placement === 1) {
      stage = 3;
    } else if (player.placement <= 4) {
      stage = 2;
    }

    return {
      name,
      stage,
      id: "",
    };
  };

  const UpdateChampionProgressIfImproved = (
    played: championData,
    savedData: championData[]
  ): { data: championData[]; didUpdate: boolean } => {
    const newData: championData[] = [...savedData];
    let updated = false;
    newData.forEach((champion) => {
      if (
        played.name.toLocaleLowerCase() === champion.name.toLocaleLowerCase()
      ) {
        if (played.stage > champion.stage) {
          champion.stage = played.stage;
          updated = true;
          return;
        }
      }
    });
    return { data: newData, didUpdate: updated };
  };

  const PopulatePlayerStatsFromMatch = (
    playerStats: PlayerStats,
    match: MatchDto,
    playerId: number
  ): PlayerStats => {
    const player = match.info.participants[playerId];
    if (!player)
      throw new Error(
        `Player not found in match with id: ${playerId} of match: ${match.metadata.matchId}`
      );

    const champion = player.championName.toLocaleLowerCase();
    if (!(champion in playerStats.championStats)) {
      playerStats.championStats[champion] = {
        timesPlayed: 0,
        placements: PopulatePlacements(0),
        placementAvg: 0,
        name: champion,
        stage: 0,
      };
    }

    playerStats.latestGamePlayed = Math.max(playerStats.latestGamePlayed, match.info.gameEndTimestamp);
    playerStats.matchesPlayed += 1;
    playerStats.placements[player.placement] += 1;
    playerStats.placementAvg = CalculatePlacementAvg(playerStats.placements, playerStats.matchesPlayed);

    const championStats = playerStats.championStats[champion];
    championStats.timesPlayed += 1;
    championStats.placements[player.placement] += 1;
    championStats.placementAvg = CalculatePlacementAvg(
      championStats.placements,
      championStats.timesPlayed
    );
    const championStageInMatch = PlacementToStage(player.placement);
    championStats.stage = Math.max(championStats.stage, championStageInMatch);

    return playerStats;
  };

  const PlacementToStage = (placement: number): number => {
    if (placement === 1) return 3;
    else if (placement <= 4) return 2;
    return 1;
  };

  const PopulatePlacements = (placement: number): placementDto => {
    const newPlacementsDto: placementDto = {};
    for (let i = 1; i <= 8; i++) {
      newPlacementsDto[i] = i === placement ? 1 : 0;
    }
    return newPlacementsDto;
  };

  const CalculatePlacementAvg = (
    placements: placementDto,
    timesPlayed: number
  ): number => {
    let totalPlacements = 0;

    for (let i = 1; i <= 8; i++) {
      const count = placements[i as keyof placementDto] || 0;
      totalPlacements += i * count;
    }

    return totalPlacements / timesPlayed;
  };

  return {
    GetParticipantIdByPuuid,
    GetChampionProgressFromMatch,
    UpdateChampionProgressIfImproved,
    PopulatePlayerStatsFromMatch,
    PopulatePlacements,
  };
}

export default useMatchParser;
