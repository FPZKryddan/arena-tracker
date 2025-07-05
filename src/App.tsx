import "./App.css";
import { useEffect, useMemo, useState } from "react";
import ChampionCard from "./components/championCard";
import {
  type championData,
  type championStatsDto,
  type GetPUUIDDto,
  type MatchDto,
  type PlayerStats,
} from "./types";
import useFuzzy from "./hooks/useFuzzy";
import { Selector } from "./components/selector";
import Progress from "./components/progressTracker/Progress";
import useFetchData from "./hooks/useFetchData";
import useMatchParser from "./hooks/useMatchParser";
import SummonerInput from "./components/summonerInput";
import Modal from "./components/modal";
import useToast from "./hooks/useToast";
import ToastContainer from "./components/toastContainer";
import useSorter from "./hooks/useSorter";
import FetchingUpdates from "./components/fetchingUpdates";
import useFetchStatusTracker from "./hooks/useFethingStatusTracker";

function App() {
  const [championData, setChampionData] = useState<championData[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"Name" | "Progress">("Name");
  const [orderBy, setOrderBy] = useState<"asc" | "desc">("asc");

  const [isSortSelectorOpen, setIsSortSelectorOpen] = useState<boolean>(false);
  const [isOrderSelectorOpen, setIsOrderSelectorOpen] =
    useState<boolean>(false);

  const [isLoadingChampions, setIsLoadingChampions] = useState<boolean>(false);
  const [isLoadingRecentStats, setIsLoadingRecentStats] =
    useState<boolean>(false);
  const [isLoadingPlayerStats, setIsLoadingPlayerStats] = useState<boolean>(false);
  const [isPlayerStatsModalOpen, setIsPlayerStatsModalOpen] = useState<boolean>(false);

  const [total, setTotal] = useState<number>(championData.length);
  const [played, setPlayed] = useState<number>(0);
  const [top4, setTop4] = useState<number>(0);
  const [won, setWon] = useState<number>(0);

  const fuzzySearch = useFuzzy();
  const {
    isRateLimited,
    FetchChampionData,
    FetchMatchData,
    FetchPlayerMatchList,
    FetchUserPuuid,
  } = useFetchData();
  const {
    GetParticipantIdByPuuid,
    PopulatePlayerStatsFromMatch,
    PopulatePlacements,
  } = useMatchParser();
  const { CreateToast, toasts } = useToast();
  const { SortByName, SortByProgress } = useSorter();
  const { 
    statusMessages,
    addStatusMessage,
    updateStatusMessage,
    completeStatusMessage,
    resetStatusMessages,
    failStatusMessage
  } = useFetchStatusTracker();

  const GetRecentStats = async (name: string) => {
    if (!playerStats) return; // add error message
    const splitName = name.split("#");
    const gameName = splitName[0];
    const tagline = splitName[1];

    if (!tagline) {
      return;
    }

    setIsLoadingRecentStats(true);

    const puuidData: GetPUUIDDto = await FetchUserPuuid(gameName, tagline);
    const playerUuid = puuidData.puuid;

    let backtracking = true;
    let idx = 0;
    const matchDatas: MatchDto[] = [];

    while (backtracking) {
      const matchListSegment: string[] = await FetchPlayerMatchList(playerUuid, idx * 100, 100, 1741088416);
      for (const match of matchListSegment) {
        const matchData: MatchDto = await FetchMatchData(match);
        if (matchData.info.gameEndTimestamp <= playerStats.latestGamePlayed) {
          backtracking = false;
          break;
        }
        matchDatas.push(matchData);
      }
      idx++;
    }

    const playerParticipantIdToMatch: { playerId: number; match: MatchDto }[] = 
      matchDatas
        .map((match) => {
          const id = GetParticipantIdByPuuid(match, playerUuid);
          return id !== null ? { playerId: id, match } : null;
        })
        .filter(
          (item): item is { playerId: number; match: MatchDto } => item !== null
        );

    let tempPlayerStats = {...playerStats};
    for (const matchMapping of playerParticipantIdToMatch) {
      try {
        tempPlayerStats = PopulatePlayerStatsFromMatch(
          tempPlayerStats,
          matchMapping.match,
          matchMapping.playerId
        );
      } catch (err) {
        console.error(err);
      }
    }

    CreateToast(String(matchDatas.length) + " Updates were retrieved!", "SUCCESS");
    setIsLoadingRecentStats(false);
    populateChampionDataFromPlayerStats(tempPlayerStats);
    setPlayerStats(tempPlayerStats);
  };

  const createEmptyPlayerStats = (
    gameName: string,
    tagLine: string,
    puuid: string
  ): PlayerStats => {
    return {
      gameName,
      tagLine,
      puuid,
      matchesPlayed: 0,
      latestGamePlayed: 0,
      placements: PopulatePlacements(0),
      placementAvg: 0,
      championStats: createEmptyChampionStats(),
    };
  };

  const createEmptyChampionStats = (): {
    [championName: string]: championStatsDto;
  } => {
    const emptyChampionStats: { [championName: string]: championStatsDto } = {};
    championData.forEach((champion) => {
      emptyChampionStats[champion.id.toLocaleLowerCase()] = {
        timesPlayed: 0,
        placements: PopulatePlacements(0),
        placementAvg: 0,
        name: champion.name.toLocaleLowerCase(),
        stage: 0,
      };
    });
    return emptyChampionStats;
  };

  const populateChampionDataFromPlayerStats = (playerStats: PlayerStats) => {
    const updatedChampionData = championData.map((champion) => {
      champion.stage = playerStats.championStats[champion.id.toLocaleLowerCase()].stage;
      return champion;
    });
    setChampionData(updatedChampionData);
    localStorage.setItem("userData", JSON.stringify(updatedChampionData));
  };

  const GetFullPlayerData = async (name: string) => {
    const splitName = name.split("#");
    const gameName = splitName[0];
    const tagline = splitName[1];

    if (!tagline) {
      return;
    }
  
    setIsLoadingPlayerStats(true);
    setIsPlayerStatsModalOpen(true);
    resetStatusMessages();

    // Get Players UUID
    const smIdPuuid = addStatusMessage('Getting Player UUID...', 1);
    let puuidData: GetPUUIDDto;
    try {
      puuidData = await FetchUserPuuid(gameName, tagline);
    } catch(error) {
      failStatusMessage(smIdPuuid);
      setIsLoadingPlayerStats(false);
      console.error("Failed to fetch Player UUID:", error);
      return;
    }
    const playerUuid = puuidData.puuid;
    updateStatusMessage(smIdPuuid);

    // Retrieve Match History
    let matchList: string[] = [];
    let findingMatches = true;
    let idx = 0;

    const smIdMatchHistory = addStatusMessage('Fetching match history...', -1);
    while (findingMatches) {
      let matchListSegment: string[];
      try {
        matchListSegment = await FetchPlayerMatchList(
          playerUuid,
          idx * 100,
          100,
          1741088416
        );
      } catch(error) {
        failStatusMessage(smIdMatchHistory);
        setIsLoadingPlayerStats(false);
        console.error("Failed to fetch Player's match history:", error);
        return;
      }
      if (matchListSegment.length === 0) {
        findingMatches = false;
      } else {
        matchList = matchList.concat(matchListSegment);
        updateStatusMessage(smIdMatchHistory, matchListSegment.length);
        idx++;
      }
    }
    completeStatusMessage(smIdMatchHistory);

    // Get match data from match history
    const smIdMatchData = addStatusMessage('Fetching match data...', matchList.length);
    const matchDatas: MatchDto[] = [];
    for (const match of matchList) {
      let data: MatchDto;
      try {
        data = await FetchMatchData(match);
      } catch(error) {
        failStatusMessage(smIdMatchData);
        setIsLoadingPlayerStats(false);
        console.error("Failed to fetch match data:", error);
        return;
      }
      matchDatas.push(data);
      updateStatusMessage(smIdMatchData);
    }

    // Map player to every match
    const smIdPlayerInMatches = addStatusMessage('Finding player in matches...', matchList.length);
    const playerParticipantIdToMatch: { playerId: number; match: MatchDto }[] =
      matchDatas
        .map((match) => {
          const id = GetParticipantIdByPuuid(match, playerUuid);
          updateStatusMessage(smIdPlayerInMatches);
          return id !== null ? { playerId: id, match } : null;
        })
        .filter(
          (item): item is { playerId: number; match: MatchDto } => item !== null
        );

    // Populate player stats from all retrieved matches
    const smIdPlayerStats = addStatusMessage('Populating player stats', matchList.length);
    let tempPlayerStats = createEmptyPlayerStats(gameName, tagline, playerUuid);
    for (const matchMapping of playerParticipantIdToMatch) {
      try {
        tempPlayerStats = PopulatePlayerStatsFromMatch(
          tempPlayerStats,
          matchMapping.match,
          matchMapping.playerId
        );
        updateStatusMessage(smIdPlayerStats);
      } catch (error) {
        failStatusMessage(smIdPlayerStats);
        setIsLoadingPlayerStats(false);
        console.error("Failed to fetch populate player stats from match:", error);
        return
      }
    }

    console.log(tempPlayerStats);

    console.log(matchDatas);

    populateChampionDataFromPlayerStats(tempPlayerStats);
    setPlayerStats(tempPlayerStats);
    setIsLoadingPlayerStats(false);
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

    const storedPlayerStats = localStorage.getItem("playerStats");
    if (storedPlayerStats) {
      try {
        const parsedStats: PlayerStats = JSON.parse(storedPlayerStats);
        setPlayerStats(parsedStats);
      } catch (error) {
        console.error("Failed to parse stored data:", error);
      }
    }
  }, [FetchChampionData]);

  useEffect(() => {
    if (playerStats) {
      console.log(playerStats);
      localStorage.setItem("playerStats", JSON.stringify(playerStats));
    }
  }, [playerStats]);

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
  }, [
    championData,
    searchFilter,
    sortBy,
    orderBy,
    fuzzySearch,
    SortByName,
    SortByProgress,
  ]);

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

  const closePlayerStatsModal = (): void => {
    setIsPlayerStatsModalOpen(false);
  }

  return (
    <>
      <Modal isOpen={isPlayerStatsModalOpen} canClose={!isLoadingPlayerStats} closeCallback={closePlayerStatsModal}>
        <FetchingUpdates statusMessages={statusMessages} rateLimited={isRateLimited} isFetching={isLoadingPlayerStats}></FetchingUpdates>
      </Modal>
      <ToastContainer toasts={toasts}></ToastContainer>
      <div
        className="flex flex-col w-full h-dvh items-center p-x-16 gap-2 bg-linear-to-b to-stone-900 from-gray-900 overflow-y-auto"
        id="scrollContainer"
      >
        <div className="mt-16 grid grid-cols-2 lg:flex-row w-full xl:w-1/2 px-16 gap-8">
          <SummonerInput
            isLoading={isLoadingRecentStats}
            onLatestClickCallback={GetRecentStats}
            onAllClickCallback={GetFullPlayerData}
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
