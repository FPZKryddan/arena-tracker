import "./App.css";
import { useEffect, useMemo, useState } from "react";
import ChampionCard from "./components/championCard";
import type { championData, GetPUUIDDto, MatchDto } from "./types";
import useFuzzy from "./hooks/useFuzzy";
import { Selector } from "./components/selector";
import Progress from "./components/progressTracker/Progress";
import useFetchData from "./hooks/useFetchData";
import useMatchParser from "./hooks/useMatchParser";
import SummonerInput from "./components/summonerInput";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Modal from "./components/modal";
import useToast from "./hooks/useToast";
import ToastContainer from "./components/toastContainer";

function App() {
  const [championData, setChampionData] = useState<championData[]>([]);
  const [isLoadingChampions, setIsLoadingChampions] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"Name" | "Progress">("Name");
  const [orderBy, setOrderBy] = useState<"asc" | "desc">("asc");

  const [isSortSelectorOpen, setIsSortSelectorOpen] = useState<boolean>(false);
  const [isOrderSelectorOpen, setIsOrderSelectorOpen] =
    useState<boolean>(false);

  const [total, setTotal] = useState<number>(championData.length);
  const [played, setPlayed] = useState<number>(0);
  const [top4, setTop4] = useState<number>(0);
  const [won, setWon] = useState<number>(0);

  const [isLoadingRecentStats, setIsLoadingRecentStats] =
    useState<boolean>(false);

  const fuzzySearch = useFuzzy();
  const {
    FetchChampionData,
    FetchMatchData,
    FetchPlayerMatchList,
    FetchUserPuuid,
  } = useFetchData();
  const {
    GetPlayersProgressOnChampionFromMatch,
    GetParticipantIdForPlayer,
    ComparePlayedGameToSavedData,
  } = useMatchParser();
  const {
    CreateToast,
    toasts
  } = useToast();

  const GetRecentStats = async (name: string) => {
    const splitName = name.split("#");
    const gameName = splitName[0];
    const tagline = splitName[1];

    if (!tagline) {
      return;
    }

    setIsLoadingRecentStats(true);
    
    const puuidData: GetPUUIDDto = await FetchUserPuuid(gameName, tagline);
    const playerUuid = puuidData.puuid;
    const matchList = await FetchPlayerMatchList(playerUuid);
    const matchDatas: MatchDto[] = await Promise.all(
      matchList.map((match) => FetchMatchData(match))
    );
    const playedChampions: (championData | null)[] = matchDatas.map((match) => {
      const playerParticipantId: number | null = GetParticipantIdForPlayer(
        match,
        playerUuid
      );
      if (!playerParticipantId) return null;
      return GetPlayersProgressOnChampionFromMatch(match, playerParticipantId);
    });
    let newData: championData[] = [...championData];
    let amountUpdated: number = 0;
    playedChampions.forEach((champion) => {
      if (champion) {
        const comparison = ComparePlayedGameToSavedData(champion, newData);
        newData = comparison.data;
        amountUpdated = comparison.didUpdate
          ? amountUpdated + 1
          : amountUpdated;
      }
    });
    CreateToast(String(amountUpdated) + ' Updates were retrieved!', 'SUCCESS');
    localStorage.setItem("userData", JSON.stringify(newData));
    setChampionData(newData);
    setIsLoadingRecentStats(false);
  };

  const SortByName = (
    data: championData[],
    order: "asc" | "desc"
  ): championData[] => {
    if (order === "asc") {
      return data.sort((a, b) =>
        a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
      );
    }

    return data.sort((a, b) =>
      b.name.toLocaleLowerCase().localeCompare(a.name.toLocaleLowerCase())
    );
  };

  const SortByProgress = (
    data: championData[],
    order: "asc" | "desc"
  ): championData[] => {
    if (order === "asc") {
      return data.sort((a, b) => b.stage - a.stage);
    }

    return data.sort((a, b) => a.stage - b.stage);
  };

  const handleUpdateSearchFilter = (filter: string): void => {
    setSearchFilter(filter);
  };

  const UpdateChampionStage = (championName: string, stage: number): void => {
    const updatedData: championData[] = championData.map((champion) => {
      if (champion.name === championName) {
        let newStage: number = stage;
        if (champion.stage === stage) newStage = 0;
        return { ...champion, stage: newStage };
      }
      return champion;
    });

    setChampionData(updatedData);
    localStorage.setItem("userData", JSON.stringify(updatedData));
  };

  const ToggleSortSelecctorState = (): void => {
    setIsSortSelectorOpen(!isSortSelectorOpen);
    setIsOrderSelectorOpen(false);
  };

  const CloseSortSelector = (): void => {
    setIsSortSelectorOpen(false);
  };

  const UpdateSortingMethod = (value: string): void => {
    if (value === "Name" || value === "Progress") {
      const sortingMethod = value as "Name" | "Progress";
      setSortBy(sortingMethod);
    } else {
      console.error("Invalid Sorting Method:", value);
    }
  };

  const ToggleOrderSelectorState = (): void => {
    setIsOrderSelectorOpen(!isOrderSelectorOpen);
    setIsSortSelectorOpen(false);
  };

  const CloseOrderSelector = (): void => {
    setIsOrderSelectorOpen(false);
  };

  const UpdateOrderMethod = (value: string): void => {
    if (value === "asc" || value === "desc") {
      const orderingMethod = value as "asc" | "desc";
      setOrderBy(orderingMethod);
    } else {
      console.error("Invalid Order Method:", value);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        try {
          const parsedData: championData[] = JSON.parse(storedData);
          setChampionData(parsedData);
        } catch (error) {
          console.error("Failed to parse stored data:", error);
        }
      } else {
        setIsLoadingChampions(true);
        const fetchedChampionData = await FetchChampionData();
        setChampionData(fetchedChampionData);
        setIsLoadingChampions(false);
      }
    };
    fetchData();
  }, []);

  // update rendered data
  const sortedFilteredData = useMemo(() => {
    let toBeRenderedData = [...championData];
    if (searchFilter) {
      toBeRenderedData = fuzzySearch(championData, searchFilter);
    }

    if (sortBy === "Name") {
      SortByName(toBeRenderedData, orderBy);
    } else if (sortBy === "Progress") {
      SortByProgress(toBeRenderedData, orderBy);
    }

    return toBeRenderedData;
  }, [championData, searchFilter, sortBy, orderBy, fuzzySearch]);

  // update tracked stats
  useEffect(() => {
    let _played = 0;
    let _top4 = 0;
    let _won = 0;
    championData.map((champion) => {
      switch (champion.stage) {
        case 1:
          _played++;
          break;
        case 2:
          _top4++;
          break;
        case 3:
          _won++;
          break;
      }
    });
    setTotal(championData.length);
    setPlayed(_played);
    setTop4(_top4);
    setWon(_won);
  }, [championData]);

  return (
    <>
      {/* <Modal isOpen={true}><p>hej</p></Modal> */}
      <ToastContainer toasts={toasts}></ToastContainer>
      <div className="flex flex-col w-full h-dvh items-center p-x-16 gap-2 bg-linear-to-b to-stone-900 from-gray-900 overflow-y-auto" id="scrollContainer">
        <div className="mt-16 grid grid-cols-2 lg:flex-row w-full xl:w-1/2 px-16 gap-8">
          <SummonerInput
            isLoading={isLoadingRecentStats}
            onClickCallback={GetRecentStats}
          ></SummonerInput>
          <div className="flex flex-col gap-2 w-full">
            <input
              type="text"
              className="text-center h-8 rounded-sm bg-stone-700 text-white font-semibold w-full"
              placeholder="SEARCH"
              value={searchFilter}
              onChange={(e) => handleUpdateSearchFilter(e.target.value)}
            />
            <div className="self-start flex flex-row gap-2 w-full">
              <Selector
                label={sortBy}
                items={["Name", "Progress"]}
                isOpen={isSortSelectorOpen}
                toggleCallBack={ToggleSortSelecctorState}
                closeCallBack={CloseSortSelector}
                selectCallBack={UpdateSortingMethod}
              ></Selector>
              <Selector
                label={orderBy}
                items={["asc", "desc"]}
                isOpen={isOrderSelectorOpen}
                toggleCallBack={ToggleOrderSelectorState}
                closeCallBack={CloseOrderSelector}
                selectCallBack={UpdateOrderMethod}
              ></Selector>
            </div>
          </div>
          <Progress
            total={total}
            played={played}
            top4={top4}
            won={won}
          ></Progress>
        </div>
        {isLoadingChampions ? (
          <p>Loading</p>
        ) : (
          <div className="grid gap-x-4 gap-y-20 grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 mt-12 mb-24 pb-24">
            {sortedFilteredData.map((champion) => (
              <ChampionCard
                key={champion.name}
                champion={champion}
                updateStageCallBack={UpdateChampionStage}
              ></ChampionCard>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default App;
