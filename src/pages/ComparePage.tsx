import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  IoAdd,
  IoClose,
  IoSearch,
  IoStar,
  IoSwapHorizontal,
} from "react-icons/io5";
import { ClipLoader } from "react-spinners";
import AppHeader from "../components/appHeader";
import StatsOverviewCard from "../components/statsOverviewCard";
import StatsSkeleton from "../components/statsOverviewCard/StatsSkeleton";
import RegionSelector from "../components/summonerInput/RegionSelector";
import { usePlayerStatsQuery } from "../hooks/queries";
import { getStoredRegion, normalizeRegion } from "../hooks/useApiBase";
import { getWinrate } from "../hooks/useStatsAggregator";
import useFavorites, { type Favorite } from "../hooks/useFavorites";
import { ApiError, formatApiError } from "../utils/apiError";
import type { numericalStatsDto, PlayerStats, Regions } from "../types";

type Region = Exclude<Regions, null>;

type CompareDraft = {
  handle: string;
  region: Region;
};

type CompareTarget = {
  gameName: string;
  tagLine: string;
  region: Region;
};

type LoadedComparison = {
  target: CompareTarget;
  stats: PlayerStats;
};

type CompareMetricPart = {
  key: string;
  label: string;
  format: (value: number) => string;
  higherIsBetter: boolean;
};

type CompareMetric = {
  label: string;
  parts: CompareMetricPart[];
  values: Array<{
    target: CompareTarget;
    parts: Array<{
      key: string;
      value: number;
    }>;
  }>;
};

const MAX_COMPARE_PLAYERS = 4;
const INITIAL_COMPARE_PLAYERS = 2;
const PLAYER_PARAM = "p";
const REGIONS: Region[] = ["EUW", "EUNE", "NA"];

const isRegion = (value: string | undefined): value is Region =>
  typeof value === "string" &&
  REGIONS.includes(value.toUpperCase() as Region);

const parseRiotId = (
  value: string
): Pick<CompareTarget, "gameName" | "tagLine"> | null => {
  const trimmed = value.trim();
  const hashIndex = trimmed.lastIndexOf("#");
  if (hashIndex <= 0 || hashIndex === trimmed.length - 1) return null;

  const gameName = trimmed.slice(0, hashIndex).trim();
  const tagLine = trimmed.slice(hashIndex + 1).trim();
  if (!gameName || !tagLine) return null;
  return { gameName, tagLine };
};

const handleFor = (target: Pick<CompareTarget, "gameName" | "tagLine">) =>
  `${target.gameName}#${target.tagLine}`;

const favoriteToTarget = (favorite: Favorite): CompareTarget => ({
  gameName: favorite.gameName,
  tagLine: favorite.tagLine,
  region: favorite.region,
});

const targetKey = (target: CompareTarget): string =>
  `${target.region}:${target.gameName.toLowerCase()}#${target.tagLine.toLowerCase()}`;

const encodeCompareTarget = (target: CompareTarget): string =>
  [
    target.region,
    encodeURIComponent(target.gameName),
    encodeURIComponent(target.tagLine),
  ].join("|");

const safeDecode = (value: string): string | null => {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
};

const decodeCompareTarget = (value: string): CompareTarget | null => {
  const [region, encodedGameName, encodedTagLine, ...extra] = value.split("|");
  if (extra.length > 0 || !isRegion(region) || !encodedGameName || !encodedTagLine) {
    return null;
  }

  const gameName = safeDecode(encodedGameName);
  const tagLine = safeDecode(encodedTagLine);
  if (!gameName || !tagLine) return null;
  return { region: normalizeRegion(region), gameName, tagLine };
};

const uniqueTargets = (targets: CompareTarget[]): CompareTarget[] => {
  const seen = new Set<string>();
  const unique: CompareTarget[] = [];

  for (const target of targets) {
    const key = targetKey(target);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(target);
  }

  return unique.slice(0, MAX_COMPARE_PLAYERS);
};

const getTargetsFromSearchParams = (
  searchParams: URLSearchParams
): CompareTarget[] =>
  uniqueTargets(
    searchParams
      .getAll(PLAYER_PARAM)
      .map(decodeCompareTarget)
      .filter((target): target is CompareTarget => target !== null)
  );

const createCompareSearchParams = (
  targets: Array<CompareTarget | null>
): URLSearchParams => {
  const params = new URLSearchParams();
  uniqueTargets(
    targets.filter((target): target is CompareTarget => target !== null)
  ).forEach((target) => {
    params.append(PLAYER_PARAM, encodeCompareTarget(target));
  });
  return params;
};

const createDrafts = (
  targets: CompareTarget[],
  fallbackRegion: Region
): CompareDraft[] =>
  Array.from({ length: MAX_COMPARE_PLAYERS }, (_, index) => {
    const target = targets[index];
    return target
      ? { handle: handleFor(target), region: target.region }
      : { handle: "", region: fallbackRegion };
  });

const numberFormatter = new Intl.NumberFormat("en-US");
const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const formatInteger = (value: number) => numberFormatter.format(value);
const formatCompact = (value: number) => compactFormatter.format(value);
const formatPercent = (value: number) => `${Math.round(value)}%`;
const formatAverage = (value: number) => value.toFixed(2);
const formatKda = (value: number) =>
  Number.isFinite(value) ? value.toFixed(1) : "Perfect";

const getKda = (stats: PlayerStats): number => {
  const { kills, deaths, assists } = stats.infographics.killsDeathsAssists;
  if (deaths.value === 0) return Number.POSITIVE_INFINITY;
  return (kills.value + assists.value) / deaths.value;
};

const getArenaGodCount = (stats: PlayerStats): number =>
  Object.values(stats.championStats).filter((champion) => champion.stage >= 3)
    .length;

const getStatValue = (stat: numericalStatsDto | undefined): number =>
  stat?.value ?? 0;

const getRecordValue = (stat: numericalStatsDto | undefined): number =>
  stat?.records[0]?.value ?? 0;

const getAveragePerMatch = (
  stats: PlayerStats,
  stat: numericalStatsDto | undefined
): number => {
  if (stats.matchesPlayed <= 0) return 0;
  return getStatValue(stat) / stats.matchesPlayed;
};

const createMetrics = (comparisons: LoadedComparison[]): CompareMetric[] => {
  const metric = (
    label: string,
    getValue: (stats: PlayerStats) => number,
    format: (value: number) => string,
    higherIsBetter = true
  ): CompareMetric => ({
    label,
    parts: [
      {
        key: "value",
        label: "Value",
        format,
        higherIsBetter,
      },
    ],
    values: comparisons.map(({ target, stats }) => ({
      target,
      parts: [{ key: "value", value: getValue(stats) }],
    })),
  });

  const statMetric = (
    label: string,
    getStat: (stats: PlayerStats) => numericalStatsDto | undefined,
    format: (value: number) => string = formatCompact,
    averageFormat: (value: number) => string = formatCompact,
    higherIsBetter = true
  ): CompareMetric => ({
    label,
    parts: [
      { key: "total", label: "Total", format, higherIsBetter },
      { key: "avg", label: "Avg", format: averageFormat, higherIsBetter },
      { key: "highest", label: "Highest", format, higherIsBetter },
    ],
    values: comparisons.map(({ target, stats }) => {
      const stat = getStat(stats);
      return {
        target,
        parts: [
          { key: "total", value: getStatValue(stat) },
          { key: "avg", value: getAveragePerMatch(stats, stat) },
          { key: "highest", value: getRecordValue(stat) },
        ],
      };
    }),
  });

  return [
    metric("Played", (stats) => stats.matchesPlayed, formatInteger),
    metric("Avg Place", (stats) => stats.placementAvg, formatAverage, false),
    metric("Top 4 Rate", (stats) => getWinrate(stats.placements), formatPercent),
    metric("1st Places", (stats) => stats.placements[1] ?? 0, formatInteger),
    metric("KDA", getKda, formatKda),
    statMetric(
      "Kills",
      (stats) => stats.infographics.killsDeathsAssists.kills,
      formatInteger,
      formatAverage
    ),
    statMetric(
      "Deaths",
      (stats) => stats.infographics.killsDeathsAssists.deaths,
      formatInteger,
      formatAverage,
      false
    ),
    statMetric(
      "Assists",
      (stats) => stats.infographics.killsDeathsAssists.assists,
      formatInteger,
      formatAverage
    ),
    statMetric(
      "Champion Dmg",
      (stats) => stats.infographics.damageStats.total.champions
    ),
    statMetric(
      "Damage Taken",
      (stats) => stats.infographics.damageTakenStats.total
    ),
    statMetric(
      "Healing",
      (stats) => stats.infographics.healingStats?.total
    ),
    statMetric(
      "Shielding",
      (stats) => stats.infographics.shieldingStats?.onTeammates
    ),
    statMetric(
      "Skillshots Hit",
      (stats) => stats.infographics.skillShotsStats.hit,
      formatInteger,
      formatAverage
    ),
    statMetric(
      "Skillshots Dodged",
      (stats) => stats.infographics.skillShotsStats.dodged,
      formatInteger,
      formatAverage
    ),
    metric("Arena God", getArenaGodCount, formatInteger),
  ];
};

const ComparePage = () => {
  const params = useParams<{
    region?: string;
    gameName?: string;
    tagLine?: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const storedRegion = getStoredRegion();
  const { favorites } = useFavorites();

  const routeTarget = useMemo<CompareTarget | null>(() => {
    if (!isRegion(params.region) || !params.gameName || !params.tagLine) {
      return null;
    }
    return {
      region: normalizeRegion(params.region),
      gameName: params.gameName,
      tagLine: params.tagLine,
    };
  }, [params.gameName, params.region, params.tagLine]);

  const searchTargets = useMemo(
    () => getTargetsFromSearchParams(searchParams),
    [searchParams]
  );

  const targets = useMemo(
    () =>
      searchTargets.length > 0
        ? searchTargets
        : routeTarget
        ? [routeTarget]
        : [],
    [routeTarget, searchTargets]
  );
  const targetsKey = useMemo(
    () => targets.map(encodeCompareTarget).join("\n"),
    [targets]
  );
  const slotTargets = useMemo<Array<CompareTarget | null>>(
    () =>
      Array.from(
        { length: MAX_COMPARE_PLAYERS },
        (_, index) => targets[index] ?? null
      ),
    [targets]
  );

  const [drafts, setDrafts] = useState<CompareDraft[]>(() =>
    createDrafts(targets, storedRegion)
  );
  const [visibleSlotCount, setVisibleSlotCount] = useState(() =>
    Math.max(INITIAL_COMPARE_PLAYERS, targets.length)
  );
  const [formErrors, setFormErrors] = useState<Array<string | null>>(() =>
    Array.from({ length: MAX_COMPARE_PLAYERS }, () => null)
  );

  const navigateToTargets = useCallback(
    (nextTargets: Array<CompareTarget | null>, replace = false) => {
      const params = createCompareSearchParams(nextTargets);
      const search = params.toString();
      navigate(
        {
          pathname: "/compare",
          search: search ? `?${search}` : "",
        },
        { replace }
      );
    },
    [navigate]
  );

  useEffect(() => {
    setDrafts(createDrafts(targets, storedRegion));
    setVisibleSlotCount(Math.max(INITIAL_COMPARE_PLAYERS, targets.length));
    setFormErrors(Array.from({ length: MAX_COMPARE_PLAYERS }, () => null));
  }, [storedRegion, targets, targetsKey]);

  useEffect(() => {
    if (routeTarget && searchTargets.length === 0) {
      navigateToTargets([routeTarget], true);
    }
  }, [navigateToTargets, routeTarget, searchTargets.length]);

  const query0 = usePlayerStatsQuery(
    slotTargets[0]?.region,
    slotTargets[0]?.gameName,
    slotTargets[0]?.tagLine
  );
  const query1 = usePlayerStatsQuery(
    slotTargets[1]?.region,
    slotTargets[1]?.gameName,
    slotTargets[1]?.tagLine
  );
  const query2 = usePlayerStatsQuery(
    slotTargets[2]?.region,
    slotTargets[2]?.gameName,
    slotTargets[2]?.tagLine
  );
  const query3 = usePlayerStatsQuery(
    slotTargets[3]?.region,
    slotTargets[3]?.gameName,
    slotTargets[3]?.tagLine
  );
  const playerQueries = useMemo(
    () => [query0, query1, query2, query3],
    [query0, query1, query2, query3]
  );

  const visibleIndexes = useMemo(
    () => Array.from({ length: visibleSlotCount }, (_, index) => index),
    [visibleSlotCount]
  );
  const visibleTargets = useMemo(
    () => slotTargets.slice(0, visibleSlotCount),
    [slotTargets, visibleSlotCount]
  );
  const canAddPlayer = useMemo(() => {
    if (visibleSlotCount >= MAX_COMPARE_PLAYERS) return false;
    return visibleTargets.every((target, index) => {
      const query = playerQueries[index];
      return target !== null && !!query.data && !query.isFetching;
    });
  }, [playerQueries, visibleSlotCount, visibleTargets]);

  const loadedComparisons = useMemo<LoadedComparison[]>(() => {
    return visibleTargets
      .map((target, index) =>
        target && playerQueries[index].data
          ? { target, stats: playerQueries[index].data }
          : null
      )
      .filter(
        (comparison): comparison is LoadedComparison => comparison !== null
      );
  }, [playerQueries, visibleTargets]);

  const metrics = useMemo(() => {
    if (loadedComparisons.length < 2) return [];
    return createMetrics(loadedComparisons);
  }, [loadedComparisons]);

  const updateDraft = useCallback(
    (index: number, patch: Partial<CompareDraft>) => {
      setDrafts((current) =>
        current.map((draft, draftIndex) =>
          draftIndex === index ? { ...draft, ...patch } : draft
        )
      );
    },
    []
  );
  const updateDraftHandle = useCallback(
    (index: number, handle: string) => {
      updateDraft(index, { handle });
    },
    [updateDraft]
  );
  const updateDraftRegion = useCallback(
    (index: number, region: Region) => {
      updateDraft(index, { region });
    },
    [updateDraft]
  );

  const loadPlayer = useCallback(
    (index: number) => {
      const draft = drafts[index];
      const parsed = parseRiotId(draft.handle);
      if (!parsed) {
        setFormErrors((current) =>
          current.map((error, errorIndex) =>
            errorIndex === index ? "Use RiotName#TAG." : error
          )
        );
        return;
      }

      const nextTarget: CompareTarget = {
        ...parsed,
        region: draft.region,
      };
      const duplicate = slotTargets.some(
        (target, targetIndex) =>
          targetIndex !== index &&
          target !== null &&
          targetKey(target) === targetKey(nextTarget)
      );

      if (duplicate) {
        setFormErrors((current) =>
          current.map((error, errorIndex) =>
            errorIndex === index ? "Already in comparison." : error
          )
        );
        return;
      }

      setFormErrors((current) =>
        current.map((error, errorIndex) =>
          errorIndex === index ? null : error
        )
      );

      const nextTargets = [...slotTargets];
      nextTargets[index] = nextTarget;
      navigateToTargets(nextTargets);
    },
    [drafts, navigateToTargets, slotTargets]
  );

  const clearPlayer = useCallback(
    (index: number) => {
      setDrafts((current) =>
        current.map((draft, draftIndex) =>
          draftIndex === index ? { ...draft, handle: "" } : draft
        )
      );
      setFormErrors((current) =>
        current.map((error, errorIndex) =>
          errorIndex === index ? null : error
        )
      );
      if (!slotTargets[index]) {
        if (index >= INITIAL_COMPARE_PLAYERS) {
          setVisibleSlotCount(index);
        }
        return;
      }

      const nextTargets = [...slotTargets];
      nextTargets[index] = null;
      navigateToTargets(nextTargets);
    },
    [navigateToTargets, slotTargets]
  );

  const addPlayerSlot = useCallback(() => {
    setVisibleSlotCount((count) =>
      Math.min(MAX_COMPARE_PLAYERS, count + 1)
    );
  }, []);

  const addFavoritePlayer = useCallback(
    (favorite: Favorite) => {
      const nextTarget = favoriteToTarget(favorite);
      if (
        slotTargets.some(
          (target) => target !== null && targetKey(target) === targetKey(nextTarget)
        )
      ) {
        return;
      }

      const visibleEmptyIndex = slotTargets.findIndex(
        (target, index) => index < visibleSlotCount && target === null
      );
      const nextIndex =
        visibleEmptyIndex >= 0
          ? visibleEmptyIndex
          : canAddPlayer
          ? visibleSlotCount
          : -1;

      if (nextIndex < 0 || nextIndex >= MAX_COMPARE_PLAYERS) return;

      const nextTargets = [...slotTargets];
      nextTargets[nextIndex] = nextTarget;
      setVisibleSlotCount((count) => Math.max(count, nextIndex + 1));
      navigateToTargets(nextTargets);
    },
    [canAddPlayer, navigateToTargets, slotTargets, visibleSlotCount]
  );

  return (
    <div className="box-border flex min-h-dvh w-full flex-col gap-[20px] overflow-auto bg-bg p-[12px] text-fg md:gap-[28px] md:p-[24px]">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-[16px]">
        <div className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <IoSwapHorizontal className="h-5 w-5 shrink-0 text-accent" />
            <h1 className="truncate text-[22px] font-extrabold md:text-[28px]">
              Compare Players
            </h1>
          </div>
        </div>

        <section className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-4">
            {visibleIndexes.map((index) => {
              const draft = drafts[index];
              const target = slotTargets[index];
              const query = playerQueries[index];
              return (
                <ComparePlayerPicker
                  key={`compare-picker-${index}`}
                  slotIndex={index}
                  label={`Player ${index + 1}`}
                  draft={draft}
                  target={target}
                  isLoading={query.isFetching}
                  error={formErrors[index] ?? getQueryError(query.error, target)}
                  onClear={() => clearPlayer(index)}
                  onHandleChange={updateDraftHandle}
                  onRegionChange={updateDraftRegion}
                  onSubmit={() => loadPlayer(index)}
                />
              );
            })}
          </div>
          {canAddPlayer && (
            <button
              type="button"
              className="flex h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface/45 px-4 text-sm font-semibold text-fg-muted transition-colors hover:cursor-pointer hover:border-border-strong hover:bg-surface-hover hover:text-fg lg:w-fit"
              onClick={addPlayerSlot}
            >
              <IoAdd className="h-4 w-4" />
              Add player
            </button>
          )}
        </section>

        <FavoriteCompareQuickAdd
          favorites={favorites}
          slotTargets={slotTargets}
          canAddPlayer={canAddPlayer}
          visibleSlotCount={visibleSlotCount}
          onAddFavorite={addFavoritePlayer}
        />


        <section className="overflow-x-auto pb-2">
          <div className="flex w-full min-w-0 flex-row items-start gap-4">
            {visibleIndexes.map((index) => {
              const target = slotTargets[index];
              const query = playerQueries[index];
              return (
                <CompareStatsSlot
                key={`compare-stats-${index}`}
                target={target}
                stats={query.data}
                isLoading={query.isFetching && !query.data}
                region={target?.region}
                emptyLabel={`Choose Player ${index + 1}`}
                visibleSlotCount={visibleSlotCount}
                />
              );
            })}
          </div>
        </section>

        {metrics.length > 0 && (
          <CompareMetricPanel
            metrics={metrics}
            comparisons={loadedComparisons}
          />
        )}
      </main>
    </div>
  );
};

interface ComparePlayerPickerProps {
  slotIndex: number;
  label: string;
  draft: CompareDraft;
  target: CompareTarget | null;
  isLoading: boolean;
  error?: string | null;
  onClear: () => void;
  onHandleChange: (index: number, handle: string) => void;
  onRegionChange: (index: number, region: Region) => void;
  onSubmit: () => void;
}

interface FavoriteCompareQuickAddProps {
  favorites: Favorite[];
  slotTargets: Array<CompareTarget | null>;
  canAddPlayer: boolean;
  visibleSlotCount: number;
  onAddFavorite: (favorite: Favorite) => void;
}

const FavoriteCompareQuickAdd = ({
  favorites,
  slotTargets,
  canAddPlayer,
  visibleSlotCount,
  onAddFavorite,
}: FavoriteCompareQuickAddProps) => {
  const comparedKeys = useMemo(
    () =>
      new Set(
        slotTargets
          .filter((target): target is CompareTarget => target !== null)
          .map(targetKey)
      ),
    [slotTargets]
  );
  const hasVisibleEmptySlot = slotTargets.some(
    (target, index) => index < visibleSlotCount && target === null
  );
  const canUseQuickAdd = hasVisibleEmptySlot || canAddPlayer;

  if (favorites.length === 0) return null;

  return (
    <section className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-fg-muted">
        <IoStar className="h-4 w-4 text-favorite" />
        Favorites
      </div>
      <div className="flex flex-wrap gap-2">
        {favorites.map((favorite) => {
          const target = favoriteToTarget(favorite);
          const alreadyAdded = comparedKeys.has(targetKey(target));
          const disabled = alreadyAdded || !canUseQuickAdd;

          return (
            <button
              key={targetKey(target)}
              type="button"
              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                disabled
                  ? "border-border bg-bg/40 text-fg-subtle opacity-65"
                  : "border-border bg-bg/35 text-fg hover:cursor-pointer hover:border-border-strong hover:bg-surface-hover"
              }`}
              onClick={() => onAddFavorite(favorite)}
              disabled={disabled}
              aria-label={`Add ${handleFor(target)} to comparison`}
            >
              <span className="min-w-0 truncate font-medium">
                {target.gameName}
                <span className="text-fg-muted">#{target.tagLine}</span>
              </span>
              <span className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase text-fg-muted">
                {target.region}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

const ComparePlayerPicker = ({
  slotIndex,
  label,
  draft,
  target,
  isLoading,
  error,
  onClear,
  onHandleChange,
  onRegionChange,
  onSubmit,
}: ComparePlayerPickerProps) => {
  const handleRegionChange = useCallback(
    (region: Regions) => {
      if (region) onRegionChange(slotIndex, region);
    },
    [onRegionChange, slotIndex]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{label}</h2>
        <div className="flex items-center gap-2">
          {target && (
            <span className="rounded border border-border px-2 py-1 text-[11px] font-semibold uppercase text-fg-muted">
              {target.region}
            </span>
          )}
          {(target || draft.handle) && (
            <button
              type="button"
              aria-label={`Clear ${label}`}
              className="grid h-7 w-7 place-items-center rounded-md text-fg-muted transition-colors hover:cursor-pointer hover:bg-surface-hover hover:text-fg"
              onClick={onClear}
            >
              <IoClose className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="box-border flex h-[44px] w-full flex-row rounded-lg border border-border bg-bg text-fg transition-colors focus-within:border-accent">
        <input
          type="text"
          className="h-full w-full min-w-0 rounded-l-lg bg-transparent px-4 text-left text-[14px] font-normal text-fg placeholder:text-fg-muted focus:outline-0"
          placeholder="RiotName#TAG"
          value={draft.handle}
          onChange={(event) => onHandleChange(slotIndex, event.target.value)}
          disabled={isLoading}
        />
        <div className="flex h-full flex-row items-center gap-2 pr-1 has-disabled:opacity-50">
          <RegionSelector
            updateRegionCallback={handleRegionChange}
            initialRegion={draft.region}
          />
          <button
            type="submit"
            className="grid h-[36px] w-[36px] place-items-center rounded-md text-fg-muted transition-colors hover:cursor-pointer hover:bg-surface-hover hover:text-fg disabled:cursor-not-allowed"
            disabled={isLoading}
            aria-label={`Load ${label}`}
          >
            {isLoading ? (
              <ClipLoader size={15} color="var(--color-info)" />
            ) : (
              <IoSearch className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {(target || error || isLoading) && (
        <div className="min-h-[18px] text-[12px]">
          {error ? (
            <p className="text-danger">{error}</p>
          ) : isLoading ? (
            <p className="truncate text-info">Loading stats...</p>
          ) : target ? (
            <p className="truncate text-fg-muted">{handleFor(target)}</p>
          ) : null}
        </div>
      )}
    </form>
  );
};

interface CompareMetricPanelProps {
  metrics: CompareMetric[];
  comparisons: LoadedComparison[];
}

const CompareMetricPanel = ({
  metrics,
  comparisons,
}: CompareMetricPanelProps) => {
  const gridStyle = {
    gridTemplateColumns: `minmax(96px, 0.75fr) repeat(${comparisons.length}, minmax(92px, 1fr))`,
  };
  const desktopMinWidth = Math.max(640, 132 + comparisons.length * 180);

  return (
    <>
      <section className="flex flex-col gap-2 md:hidden">
        {metrics.map((metric) => (
          <MobileMetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="hidden overflow-x-auto rounded-lg border border-border bg-surface md:block">
        <div style={{ minWidth: `${desktopMinWidth}px` }}>
          <div
            className="grid gap-2 border-b border-border px-3 py-2 text-[11px] font-semibold uppercase text-fg-muted"
            style={gridStyle}
          >
            <span>Metric</span>
            {comparisons.map(({ target }) => (
              <span key={targetKey(target)} className="truncate text-right">
                {handleFor(target)}
              </span>
            ))}
          </div>
          {metrics.map((metric) => (
            <CompareMetricRow
              key={metric.label}
              metric={metric}
              gridStyle={gridStyle}
            />
          ))}
        </div>
      </section>
    </>
  );
};

const getMetricLeaders = (metric: CompareMetric) =>
  metric.parts.map((part) => {
    const values = metric.values.map((entry) =>
      getMetricPartValue(entry, part.key)
    );
    const firstValue = values[0];
    const allTie = values.every((value) => value === firstValue);
    const bestValue = part.higherIsBetter
      ? Math.max(...values)
      : Math.min(...values);
    return { key: part.key, allTie, bestValue };
  });

const MobileMetricCard = ({ metric }: { metric: CompareMetric }) => {
  const leaders = getMetricLeaders(metric);
  const rowIsTie = leaders.every((leader) => leader.allTie);

  return (
    <article className="rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="min-w-0 truncate text-[13px] font-semibold text-fg">
          {metric.label}
        </h3>
        <span className="shrink-0 rounded border border-border px-2 py-1 text-[10px] font-semibold uppercase text-fg-subtle">
          {rowIsTie ? "Tie" : "Leader"}
        </span>
      </div>

      <div className="mt-2 flex flex-col divide-y divide-border">
        {metric.values.map((entry) => (
          <div key={targetKey(entry.target)} className="grid gap-2 py-2 first:pt-0 last:pb-0">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <p className="min-w-0 truncate text-[12px] font-medium text-fg">
                {handleFor(entry.target)}
              </p>
              <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] uppercase text-fg-muted">
                {entry.target.region}
              </span>
            </div>
            <MetricValueGroup
              metric={metric}
              entry={entry}
              leaders={leaders}
              mobile
            />
          </div>
        ))}
      </div>
    </article>
  );
};

const CompareMetricRow = ({
  metric,
  gridStyle,
}: {
  metric: CompareMetric;
  gridStyle: { gridTemplateColumns: string };
}) => {
  const leaders = getMetricLeaders(metric);

  return (
    <div
      className="grid items-center gap-3 border-b border-border px-3 py-3 last:border-b-0"
      style={gridStyle}
    >
      <div className="min-w-0">
        <p className="truncate text-[12px] font-semibold text-fg">
          {metric.label}
        </p>
      </div>
      {metric.values.map((entry) => (
        <MetricValueGroup
          key={targetKey(entry.target)}
          metric={metric}
          entry={entry}
          leaders={leaders}
        />
      ))}
    </div>
  );
};

const getMetricPartValue = (
  entry: CompareMetric["values"][number],
  key: string
): number => entry.parts.find((part) => part.key === key)?.value ?? 0;

const MetricValueGroup = ({
  metric,
  entry,
  leaders,
  mobile,
}: {
  metric: CompareMetric;
  entry: CompareMetric["values"][number];
  leaders: Array<{ key: string; allTie: boolean; bestValue: number }>;
  mobile?: boolean;
}) => {
  if (metric.parts.length === 1) {
    const part = metric.parts[0];
    const value = getMetricPartValue(entry, part.key);
    const leader = leaders[0];
    const isLeading = !leader.allTie && value === leader.bestValue;

    return (
      <p
        className={`truncate ${
          mobile ? "text-left text-[20px]" : "text-right text-[18px]"
        } font-extrabold tabular-nums ${
          isLeading ? "text-success" : "text-fg-muted"
        }`}
      >
        {part.format(value)}
      </p>
    );
  }

  return (
    <div
      className={`grid gap-1 ${
        mobile ? "w-full text-left" : "min-w-[168px] text-right"
      }`}
      style={{
        gridTemplateColumns: `repeat(${metric.parts.length}, minmax(0, 1fr))`,
      }}
    >
      {metric.parts.map((part) => {
        const value = getMetricPartValue(entry, part.key);
        const leader = leaders.find((candidate) => candidate.key === part.key);
        const isLeading = !!leader && !leader.allTie && value === leader.bestValue;

        return (
          <div key={part.key} className="min-w-0">
            <p className="truncate text-[10px] font-semibold uppercase text-fg-subtle">
              {part.label}
            </p>
            <p
              className={`truncate text-[14px] font-extrabold tabular-nums ${
                isLeading ? "text-success" : "text-fg-muted"
              }`}
            >
              {part.format(value)}
            </p>
          </div>
        );
      })}
    </div>
  );
};

interface CompareStatsSlotProps {
  target: CompareTarget | null;
  stats?: PlayerStats;
  isLoading: boolean;
  region?: Region;
  emptyLabel: string;
  visibleSlotCount: number;
}

const CompareStatsSlot = ({
  target,
  stats,
  isLoading,
  region,
  emptyLabel,
  visibleSlotCount,
}: CompareStatsSlotProps) => {
  const gapPx = 16;
  const basis = `calc((100% - ${
    (visibleSlotCount - 1) * gapPx
  }px) / ${visibleSlotCount})`;

  return (
    <div
      className="shrink-0"
      style={{
        flex: `1 0 ${basis}`,
        minWidth: "min(380px, calc(100vw - 48px))",
      }}
    >
      {isLoading && target ? (
        <StatsSkeleton standalone />
      ) : stats ? (
        <StatsOverviewCard
          stats={stats}
          standalone
          favoriteRegion={region}
          profileRegion={region}
        />
      ) : (
        <EmptyCompareSlot label={emptyLabel} />
      )}
    </div>
  );
};

const EmptyCompareSlot = ({ label }: { label: string }) => (
  <div className="flex min-h-[260px] items-center justify-center rounded-lg border border-dashed border-border bg-surface/45 p-4 text-center text-sm font-semibold text-fg-muted">
    {label}
  </div>
);

const getQueryError = (
  error: unknown,
  target: CompareTarget | null
): string | null => {
  if (!error || !target) return null;
  if (error instanceof ApiError) {
    return formatApiError(error.payload, target);
  }
  return "Could not load stats.";
};

export default ComparePage;
