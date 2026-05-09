import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
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
import ChampionStageProgress from "./ChampionStageProgress";
import { getWinrate } from "../../hooks/useStatsAggregator";
import { HiMiniChevronDown, HiMiniChevronUpDown } from "react-icons/hi2";
import useChampionSorter from "../../hooks/useChampionSorter";
import useDdragonVersion from "../../hooks/useDdragonVersion";
import useFuzzy from "../../hooks/useFuzzy";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import ChampionFiltering from "./ChampionFiltering";
import {
  applyChampionFilters,
  DEFAULT_CHAMPION_FILTERS,
  type ChampionFilters,
} from "./championFilters";

const ChampionList = () => {
  const { playerStats } = useContextIfDefined(PlayerStatsContext);
  const { champions } = useContextIfDefined(ChampionsContext);
  const fuzzySearch = useFuzzy();
  const version = useDdragonVersion();
  const { SortByName, SortByAvgPlacement, SortByTimesPlayed, SortByWinrate } =
    useChampionSorter();

  const [championNameFilter, setChampionNameFilter] = useState<string>("");
  const debouncedNameFilter = useDebouncedValue(championNameFilter, 100);
  const [filters, setFilters] = useState<ChampionFilters>(
    DEFAULT_CHAMPION_FILTERS
  );
  const [sortBy, setSortBy] = useState<Sort>("NAME");
  const [order, setOrder] = useState<Orders>("ASC");
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

  const handleHeaderClicked = useCallback(
    (item: Sort) => {
      if (sortBy === item) {
        setOrder((o) => (o === "ASC" ? "DESC" : "ASC"));
        return;
      }
      setOrder("ASC");
      setSortBy(item);
    },
    [sortBy]
  );

  return (
    <div className="flex flex-col">
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
      <table className="w-full max-w-full table-auto border-separate border-spacing-y-[8px]">
        <thead>
          <ChampionListHeaderRow
            sortBy={sortBy}
            order={order}
            onHeaderClick={handleHeaderClicked}
          />
        </thead>
        <tbody>
          {displayedChampions.map((champion, index) => (
            <ChampionListBodyRow
              key={champion.id}
              index={index + 1}
              champion={champion}
              version={version}
              clickCallback={onClickChampion}
            />
          ))}
        </tbody>
      </table>
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

type ChampionListHeaderRowProps = {
  sortBy: Sort;
  order: Orders;
  onHeaderClick: (item: Sort) => void;
};

const ChampionListHeaderRow = ({
  sortBy,
  order,
  onHeaderClick,
}: ChampionListHeaderRowProps) => {
  const getItemSortedState = (item: Sort): SortedState =>
    sortBy === item ? order : "OTHER_HEADER_SORTED";

  return (
    <tr className="text-[10px] font-bold text-left text-fg">
      <ChampionListHeaderRowItem label={"#"} leftEdge setWidth={25} />
      <ChampionListHeaderRowItem
        label={"CHAMPION"}
        setWidth={150}
        sorted={getItemSortedState("NAME")}
        clickCallback={() => onHeaderClick("NAME")}
      />
      <ChampionListHeaderRowItem
        label={"PLAYED"}
        setWidth={70}
        sorted={getItemSortedState("PLAYED")}
        clickCallback={() => onHeaderClick("PLAYED")}
      />
      <ChampionListHeaderRowItem
        label={"AVG"}
        setWidth={45}
        sorted={getItemSortedState("AVG")}
        clickCallback={() => onHeaderClick("AVG")}
      />
      <ChampionListHeaderRowItem
        label={"WR%"}
        setWidth={45}
        rightEdge
        sorted={getItemSortedState("WR")}
        clickCallback={() => onHeaderClick("WR")}
      />
    </tr>
  );
};

type ChampionListHeaderRowItemProps = {
  label: string;
  setWidth?: number;
  leftEdge?: boolean;
  rightEdge?: boolean;
  sorted?: SortedState;
  clickCallback?: () => void;
};

const ChampionListHeaderRowItem = ({
  label,
  setWidth,
  leftEdge = false,
  rightEdge = false,
  sorted = "OTHER_HEADER_SORTED",
  clickCallback,
}: ChampionListHeaderRowItemProps) => {
  return (
    <th
      className={`px-1 py-2 box-border bg-surface-elevated text-fg text-wrap text-ellipsis hover:cursor-pointer
         ${leftEdge ? "rounded-l-md" : "rounded-l-none"}
         ${rightEdge ? "rounded-r-md" : "rounded-r-none"}`}
      style={{ width: setWidth ? setWidth + "px" : "auto" }}
      onClick={clickCallback}
    >
      <p className="flex flex-row items-center gap-0">
        {label}
        {sorted === "OTHER_HEADER_SORTED" ? (
          <HiMiniChevronUpDown
            className={`text-xl opacity-30 ${leftEdge ? "hidden" : ""}`}
          />
        ) : (
          <HiMiniChevronDown
            className={`text-xl transition-all duration-75 ease-out ${
              sorted === "ASC" ? "" : "-rotate-180"
            }`}
          />
        )}
      </p>
    </th>
  );
};

type ChampionListBodyRowProps = {
  index: number;
  champion: championStatsDto;
  version: string;
  clickCallback: (champion: championStatsDto) => void;
};

const ChampionListBodyRow = memo(
  ({ index, champion, version, clickCallback }: ChampionListBodyRowProps) => {
    return (
      <tr
        className="text-[10px] font-normal text-left text-fg"
        onClick={() => clickCallback(champion)}
      >
        <ChampionListBodyRowItem edge={"LEFT"}>
          <p>{String(index)}</p>
        </ChampionListBodyRowItem>
        <ChampionListBodyRowItem edge={"NONE"}>
          <div className="relative">
            <div className="h-[45px] aspect-square rounded-full overflow-hidden">
              <img
                className="h-full w-auto aspect-square rounded-full scale-110"
                src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.id}.png`}
                alt={champion.name}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-2">
              <ChampionStageProgress stage={champion.stage} />
            </div>
          </div>
          <p className="text-wrap">{champion.name}</p>
        </ChampionListBodyRowItem>
        <ChampionListBodyRowItem edge={"NONE"}>
          <p>{champion.timesPlayed}</p>
        </ChampionListBodyRowItem>
        <ChampionListBodyRowItem edge={"NONE"}>
          <p>
            {champion.timesPlayed > 0
              ? Math.ceil(champion.placementAvg * 100) / 100
              : "-"}
          </p>
        </ChampionListBodyRowItem>
        <ChampionListBodyRowItem edge={"RIGHT"}>
          <p>
            {champion.timesPlayed > 0
              ? getWinrate(champion.placements) + "%"
              : "-"}
          </p>
        </ChampionListBodyRowItem>
      </tr>
    );
  }
);

type ChampionListBodyRowItemProps = {
  children: ReactNode;
  edge: "LEFT" | "NONE" | "RIGHT";
};

const ChampionListBodyRowItem = ({
  edge,
  children,
}: ChampionListBodyRowItemProps) => {
  return (
    <td
      className={`px-1 box-border h-[64px] bg-surface ${
        edge === "LEFT" ? "rounded-l-md w-[20px]" : "rounded-l-none"
      } ${edge === "RIGHT" ? "rounded-r-md" : "rounded-r-none"}`}
    >
      <div className="flex flex-row gap-[8px] items-center">{children}</div>
    </td>
  );
};

export default ChampionList;
