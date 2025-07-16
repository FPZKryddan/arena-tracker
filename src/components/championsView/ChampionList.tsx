import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
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
import { HiMiniXMark } from "react-icons/hi2";
import { AnimatePresence, easeOut, motion } from "framer-motion";
import StatsSkeleton from "../statsOverviewCard/StatsSkeleton";
import ChampionStageProgress from "./ChampionStageProgress";
import useStatsAggregator from "../../hooks/useStatsAggregator";
import { HiMiniChevronDown, HiMiniChevronUpDown } from "react-icons/hi2";
import useChampionSorter from "../../hooks/useChampionSorter";
import useFuzzy from "../../hooks/useFuzzy";
import ChampionFiltering from "./ChampionFiltering";

const ChampionList = () => {
  const { playerStats } = useContextIfDefined(PlayerStatsContext);
  const { champions } = useContextIfDefined(ChampionsContext);
  const fuzzySearch = useFuzzy();

  const [championNameFilter, setChampionNameFilter] = useState<string>("");
  const [selectedChampion, setSelectedChampion] = useState<championStatsDto>();
  const [bottomSheetIsOpen, setBottomSheetIsOpen] = useState<boolean>(false);
  const [filteredChampions, setFilteredChampions] = useState<
    championStatsDto[]
  >([]);
  const [sortedChampions, setSortedChampions] = useState<championStatsDto[]>(
    []
  );

  const getChampionStatsList = useMemo((): championStatsDto[] => {
    if (!playerStats) return [];
    const unFilteredChampions = champions
      .map((champion: championData) => {
        if (champion.id in playerStats.championStats) {
          return playerStats.championStats[champion.id];
        }
        return undefined;
      })
      .filter((champion) => champion !== undefined);
    return fuzzySearch(unFilteredChampions, championNameFilter);
  }, [championNameFilter, champions, fuzzySearch, playerStats]);

  const onClickChampion = (champion: championStatsDto): void => {
    setSelectedChampion(champion);
    setBottomSheetIsOpen(true);
  };

  useEffect(() => {
    console.log(sortedChampions);
  }, [sortedChampions]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-row-reverse justify-end gap-[8px]">
        <ChampionFiltering
          championList={getChampionStatsList}
          filteredChampionsCallback={setFilteredChampions}
        />
        <input
          type="text"
          value={championNameFilter}
          placeholder="Search"
          className="bg-white rounded-full w-1/2 px-4 py-1 text-black text-[12px] font-normal"
          onChange={(e) => setChampionNameFilter(e.target.value)}
        />
      </div>
      <table className="w-full max-w-full table-auto border-separate border-spacing-y-[8px]">
        <thead>
          <ChampionListHeaderRow
            championList={filteredChampions}
            setSortedChampionListCallback={setSortedChampions}
          />
        </thead>
        <tbody>
          {sortedChampions.map((champion, index) => (
            <ChampionListBodyRow
              key={index}
              index={index + 1}
              champion={champion}
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
            <StatsOverviewCard
              stats={selectedChampion}
              darkText
            ></StatsOverviewCard>
          ) : (
            <></>
          )}
        </Suspense>
      </BottomSheet>
    </div>
  );
};

type BottomSheetProps = {
  isOpen: boolean;
  closeCallback: () => void;
  children: ReactNode;
};

const BottomSheet = ({ isOpen, children, closeCallback }: BottomSheetProps) => {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: easeOut }}
              className="absolute z-50 top-0 left-0 w-full h-full backdrop-blur-lg bg-black/50"
              onClick={closeCallback}
            ></motion.div>
            <motion.div
              initial={{ y: 1000, scaleX: 0.9 }}
              animate={{ y: 0, scaleX: 1 }}
              exit={{ y: 1000 }}
              transition={{ duration: 0.15, ease: easeOut }}
              className="fixed bottom-0 left-0 bg-white rounded-t-2xl w-full z-100 p-[8px] flex flex-col max-h-5/6 min-h-1/6 overflow-y-auto"
            >
              <button
                className="absolute top-[12px] right-[12px] text-black"
                onClick={closeCallback}
              >
                <HiMiniXMark className="text-2xl" />
              </button>
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

type ChampionListHeaderRowProps = {
  championList: championStatsDto[];
  setSortedChampionListCallback: (sortedList: championStatsDto[]) => void;
};

const ChampionListHeaderRow = ({
  championList,
  setSortedChampionListCallback,
}: ChampionListHeaderRowProps) => {
  const { SortByName, SortByAvgPlacement, SortByTimesPlayed, SortByWinrate } =
    useChampionSorter();
  const [order, setOrder] = useState<Orders>("ASC");
  const [sortBy, setSortBy] = useState<Sort>("NAME");

  const toggleOrder = (): Orders => {
    return order === "ASC" ? "DESC" : "ASC";
  };

  const handleHeaderClicked = (item: Sort): void => {
    if (sortBy === item) {
      setOrder(toggleOrder());
      return;
    }

    setOrder("ASC");
    setSortBy(item);
  };

  const getItemSortedState = (item: Sort): SortedState => {
    if (sortBy === item) return order;
    return "OTHER_HEADER_SORTED";
  };

  const sortChampions = useCallback((): championStatsDto[] => {
    switch (sortBy) {
      case "PLAYED":
        return SortByTimesPlayed(championList, order);
      case "AVG":
        return SortByAvgPlacement(championList, order);
      case "WR":
        return SortByWinrate(championList, order);
      case "NAME":
      default:
        return SortByName(championList, order);
    }
  }, [
    SortByAvgPlacement,
    SortByName,
    SortByTimesPlayed,
    SortByWinrate,
    championList,
    order,
    sortBy,
  ]);

  useEffect(() => {
    const sorted = sortChampions();
    console.log(sorted);
    setSortedChampionListCallback(sorted);
  }, [
    order,
    sortBy,
    championList,
    setSortedChampionListCallback,
    sortChampions,
  ]);

  return (
    <tr className="text-[10px] font-bold text-left text-white">
      <ChampionListHeaderRowItem label={"#"} leftEdge setWidth={25} />
      <ChampionListHeaderRowItem
        label={"CHAMPION"}
        setWidth={150}
        sorted={getItemSortedState("NAME")}
        clickCallback={() => handleHeaderClicked("NAME")}
      />
      <ChampionListHeaderRowItem
        label={"PLAYED"}
        setWidth={70}
        sorted={getItemSortedState("PLAYED")}
        clickCallback={() => handleHeaderClicked("PLAYED")}
      />
      <ChampionListHeaderRowItem
        label={"AVG"}
        setWidth={45}
        sorted={getItemSortedState("AVG")}
        clickCallback={() => handleHeaderClicked("AVG")}
      />
      <ChampionListHeaderRowItem
        label={"WR%"}
        setWidth={45}
        rightEdge
        sorted={getItemSortedState("WR")}
        clickCallback={() => handleHeaderClicked("WR")}
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
      className={`px-1 py-2 box-border bg-slate-500 text-wrap text-ellipsis hover:cursor-pointer
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
  clickCallback: (champion: championStatsDto) => void;
};

const ChampionListBodyRow = ({
  index,
  champion,
  clickCallback,
}: ChampionListBodyRowProps) => {
  const { getWinrate } = useStatsAggregator();
  return (
    <tr
      className="text-[10px] font-normal text-left text-white"
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
              src={`https://ddragon.leagueoflegends.com/cdn/15.13.1/img/champion/${champion.id}.png`}
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
};

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
      className={`px-1 box-border h-[64px] bg-slate-700 ${
        edge === "LEFT" ? "rounded-l-md w-[20px]" : "rounded-l-none"
      } ${edge === "RIGHT" ? "rounded-r-md" : "rounded-r-none"}`}
    >
      <div className="flex flex-row gap-[8px] items-center">{children}</div>
    </td>
  );
};

export default ChampionList;
