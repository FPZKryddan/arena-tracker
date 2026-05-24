export type championData = {
  displayName: string,
  id: string,
  roles: ChampionRole[],
};

export type ChampionRole =
  | "Assassin"
  | "Fighter"
  | "Mage"
  | "Marksman"
  | "Support"
  | "Tank";

export interface ChampionSpellIconDto {
  id: string;
  name: string;
  icon: string;
};

export interface augmentsData {
  apiName: string;
  name: string;
  desc: string;
  id: number;
  iconLarge: string;
  iconSmall: string;
  rarity: number;
};

export interface ItemDataDto {
  name: string;
  description: string;
  tags?: string[];
  plaintext?: string;
  stats?: Record<string, number>;
  maps?: Record<string, boolean>;
  hideFromAll?: boolean;
  gold?: {
    purchasable: boolean;
    total: number;
  };
};

export type Regions = 'EUW' | 'EUNE' | 'NA' | null;

export type ArenaModeSelection = 'all' | 'normal' | '3x6';

export type LeaderboardSort =
  | 'gamesPlayed'
  | 'firstPlaces'
  | 'top4'
  | 'placementAvg'
  | 'damageDealt'
  | 'damageTanked'
  | 'healing'
  | 'shielding'
  | 'skillshotsHit'
  | 'skillshotsDodged';

export type LeaderboardOrder = 'asc' | 'desc';

export interface LeaderboardChampion {
  id: string;
  name: string;
  gamesPlayed: number;
  placementAvg: number;
}

export interface LeaderboardAugment {
  id: number;
  picked: number;
}

export interface LeaderboardPlayer {
  name: string;
  tag: string;
  region: string;
  level: number;
  profileIconId: number;
  gamesPlayed: number;
  firstPlaces: number;
  top4: number;
  placementAvg: number;
  topChampions: LeaderboardChampion[];
  topAugments: LeaderboardAugment[];
  totalDamageDealt: number;
  totalDamageTanked: number;
  healing: number;
  shielding: number;
  skillshotsHit: number;
  skillshotsDodged: number;
}

export interface LeaderboardPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface LeaderboardResponse {
  players: LeaderboardPlayer[];
  pagination: LeaderboardPagination;
  sort: {
    sortBy: LeaderboardSort;
    order: LeaderboardOrder;
  };
  filters: {
    region: Exclude<Regions, null>;
    minGames?: number;
  };
}

export interface summonerData {
  id: string;
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export type Orders = "ASC" | "DESC";
export type SortedState = "ASC" | "DESC" | "OTHER_HEADER_SORTED";
export type Sort = "NAME" | "PLAYED" | "AVG" | "WR";

export type ToastVariant = 'SUCCESS' | 'ERROR' | 'WARNING';

export interface Toast {
  id: string;
  message: string;
  type: ToastVariant;
};

export type ErrorCode =
  | 'BAD_PATH'
  | 'BAD_REGION'
  | 'BAD_HOST'
  | 'METHOD_NOT_ALLOWED'
  | 'NOT_FOUND'
  | 'PLAYER_NOT_TRACKED'
  | 'JOB_NOT_FOUND'
  | 'UPSTREAM_NOT_FOUND'
  | 'UPSTREAM_RATE_LIMITED'
  | 'UPSTREAM_ERROR'
  | 'INTERNAL_ERROR';

export interface ApiErrorPayload {
  code: ErrorCode;
  message: string;
  status: number;
  details?: Record<string, unknown>;
};

export interface ApiErrorEnvelope {
  error: ApiErrorPayload;
};

export type JobPhase = 'puuid' | 'matchlist' | 'matches' | 'summoner' | 'persisting';

export interface JobState {
  jobId: string;
  status: 'queued' | 'running' | 'done' | 'error';
  phase?: JobPhase;
  progress?: { current: number; total: number };
  error?: unknown;
  startedAt: number;
  updatedAt: number;
};

export interface PlayerStats {
  puuid: string;
  gameName: string;
  tagLine: string;
  profileIconId: number;
  summonerLevel: number; 
  matchesPlayed: number;
  latestGamePlayed: EpochTimeStamp;
  placements: PlacementDto
  placementAvg: number;
  infographics: infographicsDto;
  augmentStats: augmentsStatsDto;
  championStats: {
    [championName: string]: championStatsDto;
  };
  teammateStats: teammateStatsDto;
};

export interface PlacementDto {
  [key: number]: number;
};

export interface teammateStatDto {
  gameName: string;
  tagLine: string;
  gamesPlayed: number;
  placements: PlacementDto;
  placementAvg: number;
  lastPlayedAt: number;
};

export interface teammateStatsDto {
  [teammatePuuid: string]: teammateStatDto;
};

export interface ProfileLookupDto {
  puuid: string;
  gameName: string;
  tagLine: string;
  region: Exclude<Regions, null>;
  profileIconId: number;
  summonerLevel: number;
  tracked: boolean;
  nonProcessedMatchesCount?: number;
};

export interface championStatsDto {
  timesPlayed: number;
  placements: PlacementDto;
  placementAvg: number;
  infographics: infographicsDto;
  augmentStats: augmentsStatsDto;
  name: string;
  id: string;
  stage: number;
  roles?: ChampionRole[];
};

export interface infographicsDto {
  damageStats: damageStatsDto;
  damageTakenStats: damageTakenStatsDto;
  goldStats: goldStatsDto;
  skillShotsStats: skillShotsDto;
  killsDeathsAssists: killDeathAssistsDto;
  healingStats?: healingShieldingStatsDto;
  shieldingStats?: Omit<healingShieldingStatsDto, 'total'>;
};

export interface healingShieldingStatsDto {
  total: numericalStatsDto;
  onTeammates: numericalStatsDto;
};

export interface augmentsStatsDto {
  [id: number]: {
    picked: number;
  }
}

export interface killDeathAssistsDto {
  kda: numericalStatsDto;
  kills: numericalStatsDto;
  deaths: numericalStatsDto;
  assists: numericalStatsDto;
}

export interface damageStatsDto {
  total: {
    total: numericalStatsDto;
    champions: numericalStatsDto;
  };
  true: {
    total: numericalStatsDto;
    champions: numericalStatsDto;
  };
  magic: {
    total: numericalStatsDto;
    champions: numericalStatsDto;
  };
  physical: {
    total: numericalStatsDto;
    champions: numericalStatsDto;
  };
  perMinute: numericalStatsDto;
};

export interface damageTakenStatsDto {
  total: numericalStatsDto;
  true: numericalStatsDto;
  magic: numericalStatsDto;
  physical: numericalStatsDto;
  mitigated: numericalStatsDto;
};

export interface skillShotsDto {
  dodged: numericalStatsDto;
  hit: numericalStatsDto;
};

export interface goldStatsDto {
  earned: numericalStatsDto;
  spent: numericalStatsDto;
  perMinute: numericalStatsDto;
};

export interface numericalStatsDto {
  value: number;
  records: recordsDto;
};

export interface recordsDtoEntry {
  value: number;
  matchId: string;
}

export type recordsDto = recordsDtoEntry[];

export interface GetPUUIDDto {
  gameName: string;
  puuid: string;
  tagLine: string;
};

export interface GetPlayerMatchListDto {
  matchIds: string[]
};

export interface MatchDto {
  metadata: MetaDataDto;
  info: InfoDto;
};

export interface MatchTimelineDto {
  metadata: MatchTimelineMetaDataDto;
  info: MatchTimelineInfoDto;
};

export interface MatchTimelineMetaDataDto {
  dataVersion: string;
  matchId: string;
  participants: string[];
};

export interface MatchTimelineInfoDto {
  endOfGameResult?: string;
  frameInterval: number;
  gameId?: number;
  participants?: MatchTimelineParticipantDto[];
  frames: MatchTimelineFrameDto[];
};

export interface MatchTimelineParticipantDto {
  participantId: number;
  puuid: string;
};

export interface MatchTimelineFrameDto {
  events: unknown[];
  participantFrames?: Record<string, MatchTimelineParticipantFrameDto>;
  timestamp: number;
};

export interface MatchTimelineParticipantFrameDto {
  championStats: MatchTimelineChampionStatsDto;
  currentGold: number;
  damageStats: MatchTimelineDamageStatsDto;
  goldPerSecond: number;
  jungleMinionsKilled: number;
  level: number;
  minionsKilled: number;
  participantId: number;
  position: MatchTimelinePositionDto;
  timeEnemySpentControlled: number;
  totalGold: number;
  xp: number;
};

export interface MatchTimelineChampionStatsDto {
  abilityHaste?: number;
  abilityPower: number;
  armor: number;
  armorPen: number;
  armorPenPercent: number;
  attackDamage: number;
  attackSpeed: number;
  bonusArmorPenPercent: number;
  bonusMagicPenPercent: number;
  ccReduction: number;
  cooldownReduction: number;
  critChance?: number;
  critDamage?: number;
  health: number;
  healthMax: number;
  healthRegen: number;
  lifesteal: number;
  magicPen: number;
  magicPenPercent: number;
  magicResist: number;
  movementSpeed: number;
  omnivamp?: number;
  physicalVamp?: number;
  power: number;
  powerMax: number;
  powerRegen: number;
  resourceType?: string;
  spellVamp: number;
};

export interface MatchTimelineDamageStatsDto {
  magicDamageDone: number;
  magicDamageDoneToChampions: number;
  magicDamageTaken: number;
  physicalDamageDone: number;
  physicalDamageDoneToChampions: number;
  physicalDamageTaken: number;
  totalDamageDone: number;
  totalDamageDoneToChampions: number;
  totalDamageTaken: number;
  trueDamageDone: number;
  trueDamageDoneToChampions: number;
  trueDamageTaken: number;
};

export interface MatchTimelinePositionDto {
  x: number;
  y: number;
};

export interface MetaDataDto {
  dataVersion: string;
  matchId: string;
  participants: string[];
};

export interface InfoDto {
  endOfGameResult: string;
  gameCreation: number;
  gameDuration: number;
  gameEndTimestamp: number;
  gameId: number;
  gameMode: string;
  gameName: string;
  gameStartTimestamp: number;
  gameType: string;
  gameVersion: string;
  mapId: number;
  participants: ParticipantDto[];
  platformId: string;
  queueId: number;
  teams: TeamDto[];
  tournamentCode: string;
};

export interface ChallengesDto {
  "12AssistStreakCount": number;
  baronBuffGoldAdvantageOverThreshold: number;
  controlWardTimeCoverageInRiverOrEnemyHalf: number;
  earliestBaron: number;
  earliestDragonTakedown: number;
  earliestElderDragon: number;
  earlyLaningPhaseGoldExpAdvantage: number;
  fasterSupportQuestCompletion: number;
  fastestLegendary: number;
  hadAfkTeammate: number;
  highestChampionDamage: number;
  highestCrowdControlScore: number;
  highestWardKills: number;
  junglerKillsEarlyJungle: number;
  killsOnLanersEarlyJungleAsJungler: number;
  laningPhaseGoldExpAdvantage: number;
  legendaryCount: number;
  maxCsAdvantageOnLaneOpponent: number;
  maxLevelLeadLaneOpponent: number;
  mostWardsDestroyedOneSweeper: number;
  mythicItemUsed: number;
  playedChampSelectPosition: number;
  soloTurretsLategame: number;
  takedownsFirst25Minutes: number;
  teleportTakedowns: number;
  thirdInhibitorDestroyedTime: number;
  threeWardsOneSweeperCount: number;
  visionScoreAdvantageLaneOpponent: number;
  InfernalScalePickup: number;
  fistBumpParticipation: number;
  voidMonsterKill: number;
  abilityUses: number;
  acesBefore15Minutes: number;
  alliedJungleMonsterKills: number;
  baronTakedowns: number;
  blastConeOppositeOpponentCount: number;
  bountyGold: number;
  buffsStolen: number;
  completeSupportQuestInTime: number;
  controlWardsPlaced: number;
  damagePerMinute: number;
  damageTakenOnTeamPercentage: number;
  dancedWithRiftHerald: number;
  deathsByEnemyChamps: number;
  dodgeSkillShotsSmallWindow: number;
  doubleAces: number;
  dragonTakedowns: number;
  legendaryItemUsed: number[];
  effectiveHealAndShielding: number;
  elderDragonKillsWithOpposingSoul: number;
  elderDragonMultikills: number;
  enemyChampionImmobilizations: number;
  enemyJungleMonsterKills: number;
  epicMonsterKillsNearEnemyJungler: number;
  epicMonsterKillsWithin30SecondsOfSpawn: number;
  epicMonsterSteals: number;
  epicMonsterStolenWithoutSmite: number;
  firstTurretKilled: number;
  firstTurretKilledTime: number;
  flawlessAces: number;
  fullTeamTakedown: number;
  gameLength: number;
  getTakedownsInAllLanesEarlyJungleAsLaner: number;
  goldPerMinute: number;
  hadOpenNexus: number;
  immobilizeAndKillWithAlly: number;
  initialBuffCount: number;
  initialCrabCount: number;
  jungleCsBefore10Minutes: number;
  junglerTakedownsNearDamagedEpicMonster: number;
  kda: number;
  killAfterHiddenWithAlly: number;
  killedChampTookFullTeamDamageSurvived: number;
  killingSprees: number;
  killParticipation: number;
  killsNearEnemyTurret: number;
  killsOnOtherLanesEarlyJungleAsLaner: number;
  killsOnRecentlyHealedByAramPack: number;
  killsUnderOwnTurret: number;
  killsWithHelpFromEpicMonster: number;
  knockEnemyIntoTeamAndKill: number;
  kTurretsDestroyedBeforePlatesFall: number;
  landSkillShotsEarlyGame: number;
  laneMinionsFirst10Minutes: number;
  lostAnInhibitor: number;
  maxKillDeficit: number;
  mejaisFullStackInTime: number;
  moreEnemyJungleThanOpponent: number;
  multiKillOneSpell: number;
  multikills: number;
  multikillsAfterAggressiveFlash: number;
  multiTurretRiftHeraldCount: number;
  outerTurretExecutesBefore10Minutes: number;
  outnumberedKills: number;
  outnumberedNexusKill: number;
  perfectDragonSoulsTaken: number;
  perfectGame: number;
  pickKillWithAlly: number;
  poroExplosions: number;
  quickCleanse: number;
  quickFirstTurret: number;
  quickSoloKills: number;
  riftHeraldTakedowns: number;
  saveAllyFromDeath: number;
  scuttleCrabKills: number;
  shortestTimeToAceFromFirstTakedown: number;
  skillshotsDodged: number;
  skillshotsHit: number;
  snowballsHit: number;
  soloBaronKills: number;
  SWARM_DefeatAatrox: number;
  SWARM_DefeatBriar: number;
  SWARM_DefeatMiniBosses: number;
  SWARM_EvolveWeapon: number;
  SWARM_Have3Passives: number;
  SWARM_KillEnemy: number;
  SWARM_PickupGold: number;
  SWARM_ReachLevel50: number;
  SWARM_Survive15Min: number;
  SWARM_WinWith5EvolvedWeapons: number;
  soloKills: number;
  stealthWardsPlaced: number;
  survivedSingleDigitHpCount: number;
  survivedThreeImmobilizesInFight: number;
  takedownOnFirstTurret: number;
  takedowns: number;
  takedownsAfterGainingLevelAdvantage: number;
  takedownsBeforeJungleMinionSpawn: number;
  takedownsFirstXMinutes: number;
  takedownsInAlcove: number;
  takedownsInEnemyFountain: number;
  teamBaronKills: number;
  teamDamagePercentage: number;
  teamElderDragonKills: number;
  teamRiftHeraldKills: number;
  tookLargeDamageSurvived: number;
  turretPlatesTaken: number;
  turretsTakenWithRiftHerald: number;
  turretTakedowns: number;
  twentyMinionsIn3SecondsCount: number;
  twoWardsOneSweeperCount: number;
  unseenRecalls: number;
  visionScorePerMinute: number;
  wardsGuarded: number;
  wardTakedowns: number;
  wardTakedownsBefore20M: number;
};

export interface ParticipantDto {
  allInPings: number;
  assistMePings: number;
  assists: number;
  baronKills: number;
  bountyLevel: number;
  champExperience: number;
  champLevel: number;
  championId: number;
  championName: string;
  commandPings: number;
  championTransform: number;
  consumablesPurchased: number;
  challenges: ChallengesDto;
  damageDealtToBuildings: number;
  damageDealtToObjectives: number;
  damageDealtToTurrets: number;
  damageSelfMitigated: number;
  deaths: number;
  detectorWardsPlaced: number;
  doubleKills: number;
  dragonKills: number;
  eligibleForProgression: boolean;
  enemyMissingPings: number;
  enemyVisionPings: number;
  firstBloodAssist: boolean;
  firstBloodKill: boolean;
  firstTowerAssist: boolean;
  firstTowerKill: boolean;
  gameEndedInEarlySurrender: boolean;
  gameEndedInSurrender: boolean;
  holdPings: number;
  getBackPings: number;
  goldEarned: number;
  goldSpent: number;
  individualPosition: string;
  inhibitorKills: number;
  inhibitorTakedowns: number;
  inhibitorsLost: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  itemsPurchased: number;
  killingSprees: number;
  kills: number;
  lane: string;
  largestCriticalStrike: number;
  largestKillingSpree: number;
  largestMultiKill: number;
  longestTimeSpentLiving: number;
  magicDamageDealt: number;
  magicDamageDealtToChampions: number;
  magicDamageTaken: number;
  missions: MissionsDto;
  neutralMinionsKilled: number;
  needVisionPings: number;
  nexusKills: number;
  nexusTakedowns: number;
  nexusLost: number;
  objectivesStolen: number;
  objectivesStolenAssists: number;
  onMyWayPings: number;
  participantId: number;
  playerScore0: number;
  playerScore1: number;
  playerScore2: number;
  playerScore3: number;
  playerScore4: number;
  playerScore5: number;
  playerScore6: number;
  playerScore7: number;
  playerScore8: number;
  playerScore9: number;
  playerScore10: number;
  playerScore11: number;
  pentaKills: number;
  perks: PerksDto;
  physicalDamageDealt: number;
  physicalDamageDealtToChampions: number;
  physicalDamageTaken: number;
  placement: number;
  playerAugment1: number;
  playerAugment2: number;
  playerAugment3: number;
  playerAugment4: number;
  playerSubteamId: number;
  pushPings: number;
  profileIcon: number;
  puuid: string;
  quadraKills: number;
  riotIdGameName: string;
  riotIdTagline: string;
  role: string;
  sightWardsBoughtInGame: number;
  spell1Casts: number;
  spell2Casts: number;
  spell3Casts: number;
  spell4Casts: number;
  subteamPlacement: number;
  summoner1Casts: number;
  summoner1Id: number;
  summoner2Casts: number;
  summoner2Id: number;
  summonerId: string;
  summonerLevel: number;
  summonerName: string;
  teamEarlySurrendered: boolean;
  teamId: number;
  teamPosition: string;
  timeCCingOthers: number;
  timePlayed: number;
  totalAllyJungleMinionsKilled: number;
  totalDamageDealt: number;
  totalDamageDealtToChampions: number;
  totalDamageShieldedOnTeammates: number;
  totalDamageTaken: number;
  totalEnemyJungleMinionsKilled: number;
  totalHeal: number;
  totalHealsOnTeammates: number;
  totalMinionsKilled: number;
  totalTimeCCDealt: number;
  totalTimeSpentDead: number;
  totalUnitsHealed: number;
  tripleKills: number;
  trueDamageDealt: number;
  trueDamageDealtToChampions: number;
  trueDamageTaken: number;
  turretKills: number;
  turretTakedowns: number;
  turretsLost: number;
  unrealKills: number;
  visionScore: number;
  visionClearedPings: number;
  visionWardsBoughtInGame: number;
  wardsKilled: number;
  wardsPlaced: number;
  win: boolean;
};

export interface MissionsDto {
  playerScore0: number;
  playerScore1: number;
  playerScore2: number;
  playerScore3: number;
  playerScore4: number;
  playerScore5: number;
  playerScore6: number;
  playerScore7: number;
  playerScore8: number;
  playerScore9: number;
  playerScore10: number;
  playerScore11: number;
};

export interface PerksDto {
  statPerks: PerkStatsDto;
  styles: PerkStyleDto[];
};

export interface PerkStatsDto {
  defense: number;
  flex: number;
  offense: number;
};

export interface PerkStyleDto {
  description: string;
  selections: PerkStyleSelectionDto[];
  style: number;
};

export interface PerkStyleSelectionDto {
  perk: number;
  var1: number;
  var2: number;
  var3: number;
};

export interface TeamDto {
  bans: BanDto[];
  objectives: ObjectivesDto;
  teamId: number;
  win: boolean;
};

export interface BanDto {
  championId: number;
  pickTurn: number;
};

export interface ObjectivesDto {
  baron: ObjectiveDto;
  champion: ObjectiveDto;
  dragon: ObjectiveDto;
  horde: ObjectiveDto;
  inhibitor: ObjectiveDto;
  riftHerald: ObjectiveDto;
  tower: ObjectiveDto;
};

export interface ObjectiveDto {
  first: boolean;
  kills: number;
};
