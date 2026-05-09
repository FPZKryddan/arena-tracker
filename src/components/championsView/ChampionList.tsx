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
    return champions
      .map((champion: championData) =>
        champion.id in playerStats.championStats
          ? playerStats.championStats[champion.id]
          : undefined
      )
      .filter((c): c is championStatsDto => c !== undefined);
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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row-reverse justify-end gap-[8px]">
        <ChampionFiltering filters={filters} onFiltersChange={setFilters} />
        <input
          type="text"
          value={championNameFilter}
          placeholder="Search"
          className="bg-surface-elevated rounded-full w-1/2 px-4 py-1 text-fg text-[12px] font-normal"
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
      {displayedChampions.length === 0 ? (
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
      className={`flex flex-row items-center gap-0.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
        active
          ? "bg-accent text-accent-fg"
          : "bg-surface-elevated text-fg-muted hover:text-fg"
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
