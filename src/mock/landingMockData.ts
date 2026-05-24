import type {
  augmentsData,
  augmentsStatsDto,
  championStatsDto,
  infographicsDto,
  numericalStatsDto,
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
