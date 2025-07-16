import type {
  championData,
  ParticipantDto,
  MatchDto,
  PlayerStats,
  placementDto,
  infographicsDto,
  numericalStatsDto,
  damageTakenStatsDto,
  goldStatsDto,
  damageStatsDto,
  championStatsDto,
  skillShotsDto,
  recordsDto,
  killDeathAssistsDto,
  augmentsStatsDto,
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

    let champion = player.championName;
    if (champion === 'FiddleSticks') champion = 'Fiddlesticks';
    if (!(champion in playerStats.championStats)) {
      playerStats.championStats[champion] = {
        timesPlayed: 0,
        placements: PopulatePlacements(0),
        placementAvg: 0,
        infographics: createEmptyInfographics(),
        augmentStats: {},
        name: champion,
        id: champion,
        stage: 0,
      };
    }

    playerStats.latestGamePlayed = Math.max(
      playerStats.latestGamePlayed,
      match.info.gameEndTimestamp
    );
    playerStats.matchesPlayed += 1;
    playerStats.placements[player.placement] += 1;
    playerStats.placementAvg = CalculatePlacementAvg(
      playerStats.placements,
      playerStats.matchesPlayed
    );
    playerStats.infographics = populateInfographicsStats(
      player,
      playerStats.infographics,
      match.metadata.matchId
    );
    playerStats.augmentStats = populateAugmentStats(
      player,
      playerStats.augmentStats
    );

    const championStats = playerStats.championStats[champion];
    championStats.timesPlayed += 1;
    championStats.placements[player.placement] += 1;
    championStats.placementAvg = CalculatePlacementAvg(
      championStats.placements,
      championStats.timesPlayed
    );
    championStats.infographics = populateInfographicsStats(
      player,
      championStats.infographics,
      match.metadata.matchId
    );
    championStats.augmentStats = populateAugmentStats(
      player,
      championStats.augmentStats
    );
    const championStageInMatch = PlacementToStage(player.placement);
    championStats.stage = Math.max(championStats.stage, championStageInMatch);

    return playerStats;
  };

  const populateAugmentStats = (
    playerMatchStats: ParticipantDto,
    augmentStats: augmentsStatsDto,
  ): augmentsStatsDto => {
    const updatedStats = { ...augmentStats };

    const augmentKeys = [
      playerMatchStats.playerAugment1,
      playerMatchStats.playerAugment2,
      playerMatchStats.playerAugment3,
      playerMatchStats.playerAugment4,
    ];

    augmentKeys.forEach((augment) => {
      if (!updatedStats[augment]) {
        updatedStats[augment] = { picked: 1 };
      } else {
        updatedStats[augment].picked += 1;
      }
    });

    return updatedStats;
  };

  const populateInfographicsStats = (
    playerMatchStats: ParticipantDto,
    infographics: infographicsDto,
    matchId: string
  ): infographicsDto => {
    return {
      ...infographics,
      skillShotsStats: {
        hit: updateNumericalStat(
          infographics.skillShotsStats.hit,
          playerMatchStats.challenges.skillshotsHit,
          matchId
        ),
        dodged: updateNumericalStat(
          infographics.skillShotsStats.dodged,
          playerMatchStats.challenges.skillshotsDodged,
          matchId
        ),
      },

      goldStats: {
        earned: updateNumericalStat(
          infographics.goldStats.earned,
          playerMatchStats.goldEarned,
          matchId
        ),
        spent: updateNumericalStat(
          infographics.goldStats.spent,
          playerMatchStats.goldSpent,
          matchId
        ),
        perMinute: updateNumericalStat(
          infographics.goldStats.perMinute,
          playerMatchStats.challenges.goldPerMinute,
          matchId
        )
      },

      damageStats: {
        total: {
          total: updateNumericalStat(
            infographics.damageStats.total.total,
            playerMatchStats.totalDamageDealt,
            matchId
          ),
          champions: updateNumericalStat(
            infographics.damageStats.total.champions,
            playerMatchStats.totalDamageDealtToChampions,
            matchId
          ),
        },
        true: {
          total: updateNumericalStat(
            infographics.damageStats.true.total,
            playerMatchStats.trueDamageDealt,
            matchId
          ),
          champions: updateNumericalStat(
            infographics.damageStats.true.champions,
            playerMatchStats.trueDamageDealtToChampions,
            matchId
          )
        },
        magic: {
          total: updateNumericalStat(
            infographics.damageStats.magic.total,
            playerMatchStats.magicDamageDealt,
            matchId
          ),
          champions: updateNumericalStat(
            infographics.damageStats.magic.champions,
            playerMatchStats.magicDamageDealtToChampions,
            matchId
          )
        },
        physical: {
          total: updateNumericalStat(
            infographics.damageStats.physical.total,
            playerMatchStats.physicalDamageDealt,
            matchId
          ),
          champions: updateNumericalStat(
            infographics.damageStats.physical.champions,
            playerMatchStats.physicalDamageDealtToChampions,
            matchId
          )
        },
        perMinute: updateNumericalStat(
          infographics.damageStats.perMinute,
          playerMatchStats.challenges.damagePerMinute,
          matchId
        ),
      },

      damageTakenStats: {
        total: updateNumericalStat(
          infographics.damageTakenStats.total,
          playerMatchStats.totalDamageTaken,
          matchId
        ),
        true: updateNumericalStat(
          infographics.damageTakenStats.true,
          playerMatchStats.trueDamageTaken,
          matchId
        ),
        magic: updateNumericalStat(
          infographics.damageTakenStats.magic,
          playerMatchStats.magicDamageTaken,
          matchId
        ),
        physical: updateNumericalStat(
          infographics.damageTakenStats.physical,
          playerMatchStats.physicalDamageTaken,
          matchId
        ),
        mitigated: updateNumericalStat(
          infographics.damageTakenStats.mitigated,
          playerMatchStats.damageSelfMitigated,
          matchId
        )
      },

      killsDeathsAssists: {
        kda: updateNumericalStat(
          infographics.killsDeathsAssists.kda,
          playerMatchStats.challenges.kda,
          matchId
        ),
        kills: updateNumericalStat(
          infographics.killsDeathsAssists.kills,
          playerMatchStats.kills,
          matchId,
        ),
        deaths: updateNumericalStat(
          infographics.killsDeathsAssists.deaths,
          playerMatchStats.deaths,
          matchId
        ),
        assists: updateNumericalStat(
          infographics.killsDeathsAssists.assists,
          playerMatchStats.assists,
          matchId
        )
      }
    };
  };

  const updateRecords = (
    records: recordsDto,
    value: number,
    matchId: string
  ): recordsDto => {
    const newRecords = [...records, { value, matchId }];
    newRecords.sort((a, b) => b.value - a.value);
    return newRecords.splice(0, 5);
  };

  const updateNumericalStat = (
    stat: numericalStatsDto,
    value: number,
    matchId: string
  ): numericalStatsDto => ({
    value: (stat.value += value),
    records: updateRecords(stat.records, value, matchId),
  });

  const createEmptyInfographics = (): infographicsDto => {
    const createEmptyNumericalStats = (): numericalStatsDto => ({
      value: 0,
      records: [],
    });

    const createEmptyDamageStats = (): damageStatsDto => ({
      total: {
        total: createEmptyNumericalStats(),
        champions: createEmptyNumericalStats(),
      },
      true: {
        total: createEmptyNumericalStats(),
        champions: createEmptyNumericalStats(),
      },
      magic: {
        total: createEmptyNumericalStats(),
        champions: createEmptyNumericalStats(),
      },
      physical: {
        total: createEmptyNumericalStats(),
        champions: createEmptyNumericalStats(),
      },
      perMinute: createEmptyNumericalStats(),
    });

    const createEmptyDamageTakenStats = (): damageTakenStatsDto => ({
      total: createEmptyNumericalStats(),
      true: createEmptyNumericalStats(),
      magic: createEmptyNumericalStats(),
      physical: createEmptyNumericalStats(),
      mitigated: createEmptyNumericalStats()
    });

    const createEmptyGoldStats = (): goldStatsDto => ({
      earned: createEmptyNumericalStats(),
      spent: createEmptyNumericalStats(),
      perMinute: createEmptyNumericalStats(),
    });

    const createEmptySkillShotStats = (): skillShotsDto => ({
      dodged: createEmptyNumericalStats(),
      hit: createEmptyNumericalStats(),
    });

    const createEmptyKillsDeathsAssists = (): killDeathAssistsDto => ({
      kda: createEmptyNumericalStats(),
      kills: createEmptyNumericalStats(),
      deaths: createEmptyNumericalStats(),
      assists: createEmptyNumericalStats(),
    })

    return {
      damageStats: createEmptyDamageStats(),
      damageTakenStats: createEmptyDamageTakenStats(),
      goldStats: createEmptyGoldStats(),
      skillShotsStats: createEmptySkillShotStats(),
      killsDeathsAssists: createEmptyKillsDeathsAssists(),
    };
  };

  const createEmptyPlayerStats = (
    championData: championData[]
  ): PlayerStats => {
    return {
      gameName: "",
      tagLine: "",
      puuid: "",
      profileIconId: 0,
      summonerLevel: 0,
      matchesPlayed: 0,
      latestGamePlayed: 0,
      placements: PopulatePlacements(0),
      placementAvg: 0,
      infographics: createEmptyInfographics(),
      augmentStats: {},
      championStats: createEmptyChampionStats(championData),
    };
  };

  const createEmptyChampionStats = (
    championData: championData[]
  ): {
    [championName: string]: championStatsDto;
  } => {
    const emptyChampionStats: { [championName: string]: championStatsDto } = {};
    championData.forEach((champion) => {
      emptyChampionStats[champion.id] = {
        timesPlayed: 0,
        placements: PopulatePlacements(0),
        placementAvg: 0,
        infographics: createEmptyInfographics(),
        augmentStats: {},
        name: champion.displayName,
        id: champion.id,
        stage: 0,
      };
    });
    return emptyChampionStats;
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
    PopulatePlayerStatsFromMatch,
    PopulatePlacements,
    createEmptyPlayerStats,
  };
}

export default useMatchParser;
