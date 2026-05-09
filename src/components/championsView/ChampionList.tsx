import {
  lazy,
  Suspense,
  useCallback,
  useMemo,
  useState,
} from "react";
import { ChampionsContext } from "../../contexts/ChampionsContext";
import { PlayerStatsContext } from "../../contexts/PlayerStatsContext";
import useContextIfDefined from "../../hooks/useContextIfDefined";
import type {
  championData,
  championStatsDto,
  Orders,
  Sort,
  SortedState,
} from "../../types";
const StatsOverviewCard = lazy(
  () => import("../../components/statsOverviewCard")
);
import BottomSheet from "../common/BottomSheet";
import StatsSkeleton from "../statsOverviewCard/StatsSkeleton";
import ChampionPodium from "./ChampionPodium";
import ChampionCardGrid from "./ChampionCardGrid";
import { HiMiniChevronDown, HiMiniChevronUpDown } from "react-icons/hi2";
import useChampionSorter from "../../hooks/useChampionSorter";
import useFuzzy from "../../hooks/useFuzzy";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import ChampionFiltering from "./ChampionFiltering";
import {
  applyChampionFilters,
  DEFAULT_CHAMPION_FILTERS,
  type ChampionFilters,
} from "./championFilters";

const SORT_OPTIONS: { label: string; value: Sort }[] = [
  { label: "Name", value: "NAME" },
  { label: "Played", value: "PLAYED" },
  { label: "Avg", value: "AVG" },
  { label: "WR%", value: "WR" },
];

const emptyStat = () => ({ value: 0, records: [] });

const createEmptyChampionStats = (
  champion: championData
): championStatsDto => ({
  timesPlayed: 0,
  placements: {},
  placementAvg: 0,
  augmentStats: {},
  name: champion.displayName,
  id: champion.id,
  stage: 0,
  roles: champion.roles,
  infographics: {
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
  },
});

const ChampionList = () => {
  const { playerStats } = useContextIfDefined(PlayerStatsContext);
  const { champions } = useContextIfDefined(ChampionsContext);
  const fuzzySearch = useFuzzy();
  const { SortByName, SortByAvgPlacement, SortByTimesPlayed, SortByWinrate } =
    useChampionSorter();

  const [championNameFilter, setChampionNameFilter] = useState<string>("");
  const debouncedNameFilter = useDebouncedValue(championNameFilter, 100);
  const [filters, setFilters] = useState<ChampionFilters>(
    DEFAULT_CHAMPION_FILTERS
  );
  const [sortBy, setSortBy] = useState<Sort>("PLAYED");
  const [order, setOrder] = useState<Orders>("DESC");
  const [selectedChampion, setSelectedChampion] = useState<championStatsDto>();
  const [bottomSheetIsOpen, setBottomSheetIsOpen] = useState<boolean>(false);

  const playerChampionStats = useMemo((): championStatsDto[] => {
    if (!playerStats) return [];
    return champions.map((champion: championData) => ({
      ...(playerStats.championStats[champion.id] ??
        createEmptyChampionStats(champion)),
      roles: champion.roles,
    }));
  }, [champions, playerStats]);

  const displayedChampions = useMemo((): championStatsDto[] => {
    const searched = debouncedNameFilter
      ? fuzzySearch(playerChampionStats, debouncedNameFilter, (c) => c.name)
      : playerChampionStats;
    const filtered = applyChampionFilters(searched, filters);
    switch (sortBy) {
      case "PLAYED":
        return SortByTimesPlayed(filtered, order);
      case "AVG":
        return SortByAvgPlacement(filtered, order);
      case "WR":
        return SortByWinrate(filtered, order);
      case "NAME":
      default:
        return SortByName(filtered, order);
    }
  }, [
    playerChampionStats,
    debouncedNameFilter,
    fuzzySearch,
    filters,
    sortBy,
    order,
    SortByName,
    SortByAvgPlacement,
    SortByTimesPlayed,
    SortByWinrate,
  ]);

  const onClickChampion = useCallback((champion: championStatsDto) => {
    setSelectedChampion(champion);
    setBottomSheetIsOpen(true);
  }, []);

  const handleSortClicked = useCallback(
    (item: Sort) => {
      if (sortBy === item) {
        setOrder((o) => (o === "ASC" ? "DESC" : "ASC"));
        return;
      }
      setOrder("DESC");
      setSortBy(item);
    },
    [sortBy]
  );

  const podiumChampions = displayedChampions.slice(0, 3);
  const gridChampions = displayedChampions.slice(3);
  const loading = !playerStats || champions.length === 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row-reverse justify-end gap-[8px]">
        <ChampionFiltering filters={filters} onFiltersChange={setFilters} />
        <input
          type="text"
          value={championNameFilter}
          placeholder="Search"
          className="bg-surface rounded-full w-1/2 border border-border-strong px-4 py-1 text-fg text-[12px] font-normal placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-accent"
          onChange={(e) => setChampionNameFilter(e.target.value)}
        />
      </div>
      <div className="flex flex-row flex-wrap gap-1.5">
        {SORT_OPTIONS.map((opt) => (
          <SortPill
            key={opt.value}
            label={opt.label}
            sorted={
              sortBy === opt.value ? order : ("OTHER_HEADER_SORTED" as const)
            }
            onClick={() => handleSortClicked(opt.value)}
          />
        ))}
      </div>
      {loading ? (
        <ChampionListSkeleton />
      ) : displayedChampions.length === 0 ? (
        <p className="text-fg-muted text-[12px] text-center py-8">
          No champions match your filters.
        </p>
      ) : (
        <>
          <ChampionPodium
            champions={podiumChampions}
            clickCallback={onClickChampion}
          />
          {gridChampions.length > 0 && (
            <ChampionCardGrid
              champions={gridChampions}
              startRank={4}
              clickCallback={onClickChampion}
            />
          )}
        </>
      )}
      <BottomSheet
        isOpen={bottomSheetIsOpen}
        closeCallback={() => setBottomSheetIsOpen(false)}
      >
        <Suspense fallback={<StatsSkeleton />}>
          {selectedChampion ? (
            <StatsOverviewCard stats={selectedChampion}></StatsOverviewCard>
          ) : (
            <></>
          )}
        </Suspense>
      </BottomSheet>
    </div>
  );
};

const ChampionListSkeleton = () => (
  <div className="flex flex-col gap-3 animate-pulse" aria-label="Loading champions">
    <div className="flex flex-row items-end justify-center gap-2 sm:gap-3 w-full">
      <ChampionPodiumSkeleton height="h-[220px] sm:h-[250px]" />
      <ChampionPodiumSkeleton height="h-[260px] sm:h-[300px]" />
      <ChampionPodiumSkeleton height="h-[200px] sm:h-[225px]" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 2xl:grid-cols-4 gap-2">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div
          key={`champion-card-skeleton-${idx}`}
          className="aspect-[3/4] rounded-md bg-surface-elevated"
        >
          <div className="h-full w-full rounded-md bg-gradient-to-t from-border/80 via-border/35 to-surface-elevated" />
        </div>
      ))}
    </div>
  </div>
);

const ChampionPodiumSkeleton = ({ height }: { height: string }) => (
  <div
    className={`relative flex-1 min-w-0 ${height} rounded-lg overflow-hidden bg-surface-elevated`}
  >
    <div className="absolute inset-0 bg-gradient-to-t from-border/80 via-border/35 to-surface-elevated" />
    <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-2">
      <div className="h-4 w-2/3 rounded bg-border" />
      <div className="grid grid-cols-3 gap-1">
        <div className="h-6 rounded bg-border" />
        <div className="h-6 rounded bg-border" />
        <div className="h-6 rounded bg-border" />
      </div>
    </div>
  </div>
);

type SortPillProps = {
  label: string;
  sorted: SortedState;
  onClick: () => void;
};

const SortPill = ({ label, sorted, onClick }: SortPillProps) => {
  const active = sorted !== "OTHER_HEADER_SORTED";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-row items-center gap-0.5 px-2.5 py-1 rounded-full border text-[10px] font-bold transition-colors cursor-pointer ${
        active
          ? "border-accent bg-accent text-accent-fg"
          : "border-border-strong bg-surface text-fg-muted hover:border-fg hover:text-fg"
      }`}
    >
      {label}
      {active ? (
        <HiMiniChevronDown
          className={`text-base transition-transform duration-75 ease-out ${
            sorted === "ASC" ? "-rotate-180" : ""
          }`}
        />
      ) : (
        <HiMiniChevronUpDown className="text-base opacity-40" />
      )}
    </button>
  );
};

export default ChampionList;
