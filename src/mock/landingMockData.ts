import type {
  augmentsData,
  augmentsStatsDto,
  championStatsDto,
  infographicsDto,
  numericalStatsDto,
  PlayerStats,
  ProfileLookupDto,
  teammateStatsDto,
} from "../types";

export const LANDING_ARENA_GOD_COMPLETED = 37;
export const LANDING_ARENA_GOD_TOTAL_CHAMPIONS = 168;

const emptyStat = (value = 0): numericalStatsDto => ({
  value,
  records: [],
});

const createInfographics = (): infographicsDto => ({
  damageStats: {
    total: {
      total: emptyStat(),
      champions: emptyStat(),
    },
    true: {
      total: emptyStat(),
      champions: emptyStat(),
    },
    magic: {
      total: emptyStat(),
      champions: emptyStat(),
    },
    physical: {
      total: emptyStat(),
      champions: emptyStat(),
    },
    perMinute: emptyStat(),
  },
  damageTakenStats: {
    total: emptyStat(),
    true: emptyStat(),
    magic: emptyStat(),
    physical: emptyStat(),
    mitigated: emptyStat(),
  },
  goldStats: {
    earned: emptyStat(),
    spent: emptyStat(),
    perMinute: emptyStat(),
  },
  skillShotsStats: {
    dodged: emptyStat(),
    hit: emptyStat(),
  },
  killsDeathsAssists: {
    kda: emptyStat(),
    kills: emptyStat(),
    deaths: emptyStat(),
    assists: emptyStat(),
  },
});

// Keep tooltip maxima in the preview without offering links to mock matches.
const previewStat = (
  value: number,
  recordValue: number,
): numericalStatsDto => ({
  value,
  records: [{ value: recordValue, matchId: "" }],
});

export const LANDING_PROFILE_STATS: PlayerStats = {
  puuid: "landing-profile-arena-main",
  gameName: "ArenaMain",
  tagLine: "EUW",
  profileIconId: 25,
  summonerLevel: 248,
  matchesPlayed: 36,
  latestGamePlayed: 1715126400000,
  placements: { 1: 8, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1 },
  placementAvg: 3.33,
  infographics: {
    damageStats: {
      total: {
        total: previewStat(1_248_930, 75_210),
        champions: previewStat(1_248_930, 75_210),
      },
      physical: {
        total: previewStat(493_100, 31_420),
        champions: previewStat(493_100, 31_420),
      },
      magic: {
        total: previewStat(611_880, 40_560),
        champions: previewStat(611_880, 40_560),
      },
      true: {
        total: previewStat(143_950, 9_870),
        champions: previewStat(143_950, 9_870),
      },
      perMinute: previewStat(34_693, 2_089),
    },
    damageTakenStats: {
      total: previewStat(912_420, 56_870),
      physical: previewStat(401_700, 26_120),
      magic: previewStat(390_320, 24_980),
      true: previewStat(120_400, 7_940),
      mitigated: previewStat(674_260, 39_760),
    },
    goldStats: {
      earned: previewStat(512_480, 28_940),
      spent: previewStat(498_770, 27_610),
      perMinute: previewStat(14_236, 804),
    },
    skillShotsStats: {
      hit: previewStat(1_842, 92),
      dodged: previewStat(968, 48),
    },
    killsDeathsAssists: {
      kda: previewStat(6.34, 18.5),
      kills: previewStat(244, 18),
      deaths: previewStat(101, 7),
      assists: previewStat(396, 27),
    },
    healingStats: {
      total: previewStat(244_190, 17_860),
      onTeammates: previewStat(61_230, 5_180),
    },
    shieldingStats: {
      onTeammates: previewStat(109_420, 9_530),
    },
  },
  augmentStats: {},
  championStats: {},
  teammateStats: {},
};

const champion = (
  id: string,
  name: string,
  timesPlayed: number,
  placementAvg: number,
  placements: championStatsDto["placements"],
  stage: number,
): championStatsDto => ({
  id,
  name,
  timesPlayed,
  placementAvg,
  placements,
  stage,
  augmentStats: {},
  infographics: createInfographics(),
});

export const LANDING_PODIUM_CHAMPIONS: championStatsDto[] = [
  champion(
    "Yasuo",
    "Yasuo",
    42,
    2.4,
    {
      1: 12,
      2: 9,
      3: 8,
      4: 6,
      5: 3,
      6: 2,
      7: 1,
      8: 1,
    },
    3,
  ),
  champion(
    "Ahri",
    "Ahri",
    31,
    3.1,
    {
      1: 4,
      2: 8,
      3: 6,
      4: 5,
      5: 3,
      6: 2,
      7: 2,
      8: 1,
    },
    2,
  ),
  champion(
    "Jinx",
    "Jinx",
    28,
    3.6,
    {
      1: 2,
      2: 5,
      3: 7,
      4: 4,
      5: 3,
      6: 3,
      7: 2,
      8: 2,
    },
    1,
  ),
];

export const LANDING_GRID_CHAMPIONS: championStatsDto[] = [
  champion(
    "Lux",
    "Lux",
    19,
    2.9,
    {
      1: 5,
      2: 3,
      3: 4,
      4: 3,
      5: 2,
      6: 1,
      8: 1,
    },
    3,
  ),
  champion(
    "Sett",
    "Sett",
    16,
    3.4,
    {
      1: 1,
      2: 4,
      3: 3,
      4: 3,
      5: 2,
      6: 2,
      7: 1,
    },
    2,
  ),
  champion(
    "Riven",
    "Riven",
    9,
    4.7,
    {
      2: 1,
      3: 1,
      4: 2,
      5: 2,
      6: 1,
      7: 1,
      8: 1,
    },
    1,
  ),
  champion("Karthus", "Karthus", 0, 0, {}, 0),
];

const LANDING_AUGMENT_PICK_COUNTS = [31, 24, 18, 13, 11, 9, 7, 5];
const LANDING_AUGMENT_NAMES = [
  "Chain Lightning",
  "Vanish",
  "Undying Guard",
  "Warmup Routine",
  "Goliath",
  "Tap Dancer",
  "Bread And Butter",
  "Bread and Jam",
];

const normalizeAugmentName = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

export const createLandingAugmentStats = (
  augments: augmentsData[],
): augmentsStatsDto => {
  const available = augments.filter((augment) => !!augment.iconLarge);
  const selected: augmentsData[] = [];
  const selectedIds = new Set<number>();

  for (const name of LANDING_AUGMENT_NAMES) {
    const normalizedName = normalizeAugmentName(name);
    const match = available.find(
      (augment) =>
        !selectedIds.has(augment.id) &&
        (normalizeAugmentName(augment.name) === normalizedName ||
          normalizeAugmentName(augment.apiName) === normalizedName),
    );
    if (!match) continue;
    selected.push(match);
    selectedIds.add(match.id);
  }

  const fallbackAugments = available
    .filter((augment) => !selectedIds.has(augment.id))
    .sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name));

  return [...selected, ...fallbackAugments]
    .slice(0, LANDING_AUGMENT_PICK_COUNTS.length)
    .reduce<augmentsStatsDto>((stats, augment, index) => {
      stats[augment.id] = {
        picked: LANDING_AUGMENT_PICK_COUNTS[index],
      };
      return stats;
    }, {});
};

const TEAMMATE_REGION = "EUW" as const;

export const LANDING_TEAMMATE_STATS: teammateStatsDto = {
  "landing-teammate-bjergsen": {
    gameName: "Bjergsen",
    tagLine: "EUW",
    gamesPlayed: 38,
    placements: { 1: 8, 2: 10, 3: 8, 4: 6, 5: 3, 6: 2, 7: 1 },
    placementAvg: 2.8,
    lastPlayedAt: 1715126400000,
  },
  "landing-teammate-caps": {
    gameName: "Caps",
    tagLine: "EUW",
    gamesPlayed: 24,
    placements: { 1: 3, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 8: 1 },
    placementAvg: 3.4,
    lastPlayedAt: 1715040000000,
  },
  "landing-teammate-faker": {
    gameName: "Faker",
    tagLine: "KR",
    gamesPlayed: 12,
    placements: { 1: 5, 2: 3, 3: 2, 4: 1, 6: 1 },
    placementAvg: 2.1,
    lastPlayedAt: 1714953600000,
  },
};

export const LANDING_TEAMMATE_PROFILE_OVERRIDES: Record<
  string,
  ProfileLookupDto
> = {
  "landing-teammate-bjergsen": {
    puuid: "landing-teammate-bjergsen",
    gameName: "Bjergsen",
    tagLine: "EUW",
    region: TEAMMATE_REGION,
    profileIconId: 4923,
    summonerLevel: 438,
    tracked: true,
  },
  "landing-teammate-caps": {
    puuid: "landing-teammate-caps",
    gameName: "Caps",
    tagLine: "EUW",
    region: TEAMMATE_REGION,
    profileIconId: 4895,
    summonerLevel: 512,
    tracked: true,
  },
  "landing-teammate-faker": {
    puuid: "landing-teammate-faker",
    gameName: "Faker",
    tagLine: "KR",
    region: TEAMMATE_REGION,
    profileIconId: 6,
    summonerLevel: 777,
    tracked: true,
  },
};

export { TEAMMATE_REGION as LANDING_TEAMMATE_REGION };
