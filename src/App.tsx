import "./App.css";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import ChampionCard from "./components/championCard";
import {
  type championData,
  type GetPUUIDDto,
  type MatchDto,
  type PlayerStats,
  type summonerData,
} from "./types";
import useFuzzy from "./hooks/useFuzzy";
import { Selector } from "./components/selector";
import Progress from "./components/progressTracker/Progress";
import useFetchData from "./hooks/useFetchData";
import useMatchParser from "./hooks/useMatchParser";
import SummonerInput from "./components/summonerInput";
// import Modal from "./components/modal";
import useToast from "./hooks/useToast";
import ToastContainer from "./components/toastContainer";
import useSorter from "./hooks/useChampionSorter";
import FetchingUpdates from "./components/fetchingUpdates";
import useFetchStatusTracker from "./hooks/useFethingStatusTracker";
const StatsOverviewCard = lazy(() => import("./components/statsOverviewCard"));
import Tooltip from "./components/Tooltip/Tooltip";
import StatsSkeleton from "./components/statsOverviewCard/StatsSkeleton";
import ProfileHeader from "./components/profileHeader";
import usePlayerStats from "./hooks/useGetPlayerStats";
import HomePage from "./pages/Home";
import { PlayerStatsContext } from "./contexts/PlayerStatsContext";
import useContextIfDefined from "./hooks/useContextIfDefined";
import useChampionData from "./hooks/useChampionData";
import { ChampionsContext } from "./contexts/ChampionsContext";
import useInitializeAppState from "./hooks/useInitializeAppState";
import { ToastsContext } from "./contexts/ToastsContext";

function App() {
  // const {playerStats, setPlayerStats} = usePlayerStats();

  // const [isLoadingChampions, setIsLoadingChampions] = useState<boolean>(false);
  // const [isLoadingRecentStats, setIsLoadingRecentStats] =
  //   useState<boolean>(false);
  // const [isLoadingPlayerStats, setIsLoadingPlayerStats] =
  //   useState<boolean>(false);
  // // const [isPlayerStatsModalOpen, setIsPlayerStatsModalOpen] =
  // //   useState<boolean>(false);

  // const [total, setTotal] = useState<number>(championData.length);
  // const [played, setPlayed] = useState<number>(0);
  // const [top4, setTop4] = useState<number>(0);
  // const [won, setWon] = useState<number>(0);

  // const fuzzySearch = useFuzzy();
  // const {
  //   isRateLimited,
  //   FetchChampionData,
  //   FetchMatchData,
  //   FetchPlayerMatchList,
  //   FetchUserPuuid,
  //   FetchSummonerData,
  // } = useFetchData();
  // const {
  //   GetParticipantIdByPuuid,
  //   PopulatePlayerStatsFromMatch,
  //   createEmptyPlayerStats,
  // } = useMatchParser();
  // const { CreateToast, toasts } = useToast();
  // const {
  //   statusMessages,
  //   addStatusMessage,
  //   updateStatusMessage,
  //   completeStatusMessage,
  //   resetStatusMessages,
  //   failStatusMessage,
  // } = useFetchStatusTracker();

  // const ToggleSortSelecctorState = (): void => {
  //   setIsSortSelectorOpen(!isSortSelectorOpen);
  //   setIsOrderSelectorOpen(false);
  // };

  // const CloseSortSelector = (): void => {
  //   setIsSortSelectorOpen(false);
  // };

  // const UpdateSortingMethod = (value: string): void => {
  //   if (value === "Name" || value === "Progress") {
  //     const sortingMethod = value as "Name" | "Progress";
  //     setSortBy(sortingMethod);
  //   } else {
  //     console.error("Invalid Sorting Method:", value);
  //   }
  // };

  // const ToggleOrderSelectorState = (): void => {
  //   setIsOrderSelectorOpen(!isOrderSelectorOpen);
  //   setIsSortSelectorOpen(false);
  // };

  // const CloseOrderSelector = (): void => {
  //   setIsOrderSelectorOpen(false);
  // };

  // const UpdateOrderMethod = (value: string): void => {
  //   if (value === "asc" || value === "desc") {
  //     const orderingMethod = value as "asc" | "desc";
  //     setOrderBy(orderingMethod);
  //   } else {
  //     console.error("Invalid Order Method:", value);
  //   }
  // };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const storedData = localStorage.getItem("userData");
  //     if (storedData) {
  //       try {
  //         const parsedData: championData[] = JSON.parse(storedData);
  //         setChampionData(parsedData);
  //       } catch (error) {
  //         console.error("Failed to parse stored data:", error);
  //       }
  //     } else {
  //       setIsLoadingChampions(true);
  //       const fetchedChampionData = await FetchChampionData();
  //       setChampionData(fetchedChampionData);
  //       setIsLoadingChampions(false);
  //     }
  //   };
  //   fetchData();

  // }, [FetchChampionData]);

  // // update tracked stats
  // useEffect(() => {
  //   let _played = 0;
  //   let _top4 = 0;
  //   let _won = 0;
  //   championData.map((champion) => {
  //     switch (champion.stage) {
  //       case 1:
  //         _played++;
  //         break;
  //       case 2:
  //         _top4++;
  //         break;
  //       case 3:
  //         _won++;
  //         break;
  //     }
  //   });
  //   setTotal(championData.length);
  //   setPlayed(_played);
  //   setTop4(_top4);
  //   setWon(_won);
  // }, [championData]);

  // // const closePlayerStatsModal = (): void => {
  // //   setIsPlayerStatsModalOpen(false);
  // // };

  // const getPlayerProgress = (): number => {
  //   return Math.floor(((played * 1 + top4 * 2 + won * 3) / (total * 3)) * 100);
  // };

  // const getPlayerStatsRedirecter = (name: string): void => {
  //   if (
  //     !playerStats ||
  //     name !== playerStats.gameName + "#" + playerStats.tagLine
  //   ) {
  //     GetFullPlayerData(name);
  //     return;
  //   }

  //   GetRecentStats(name);
  // };

  useInitializeAppState();
  const { toasts } = useContextIfDefined(ToastsContext);

  return (
    <>

      <ToastContainer toasts={toasts} />
      <HomePage />
      {/* <Modal
        isOpen={isPlayerStatsModalOpen}
        canClose={!isLoadingPlayerStats}
        closeCallback={closePlayerStatsModal}
      >
      </Modal> */}
      {/* <FetchingUpdates
        statusMessages={statusMessages}
        rateLimited={isRateLimited}
        isFetching={isLoadingPlayerStats}
      />
      <div className="flex flex-col w-full h-dvh bg-linear-to-b to-slate-900 from-black p-[32px]">
        <div className="flex flex-col p-4">
          <SummonerInput
            isLoading={isLoadingRecentStats}
            onClickCallback={getPlayerStatsRedirecter}
          ></SummonerInput>
          {playerStats ? (
            <ProfileHeader
              name={playerStats?.gameName + "#" + playerStats?.tagLine}
              percentProgress={getPlayerProgress()}
              iconId={playerStats?.profileIconId}
            />
          ) : (
            <ProfileHeader percentProgress={getPlayerProgress()} />
          )}
          <div className="w-[350px] mt-[8px]">
            <Progress
              total={total}
              played={played}
              top4={top4}
              won={won}
            ></Progress>
          </div>
        </div>

        <div className="flex flex-row h-full p-4 gap-[48px] mt-[32px] overflow-hidden">
          <div className="w-1/5 h-ful"></div>

          <div className="flex flex-col p-4 w-3/5 gap-[16px]">
            <div className="flex flex-col gap-2 w-1/3 self-center">

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

            <div
              className="w-full flex-1 min-h-0 py-[8px] grid [grid-template-columns:repeat(auto-fit,_150px)] gap-[16px] justify-center overflow-auto bg-[#171A1C] rounded-[25px]"
              id="scrollContainer"
            >
              {isLoadingChampions ? (
                <p>Loading</p>
              ) : (
                <>
                  {sortedFilteredData.map((champion) =>
                    playerStats ? (
                      <Tooltip
                        key={champion.name + "-tooltip"}
                        delay={300}
                        renderContent={() => (
                          <Suspense fallback={<StatsSkeleton />}>
                            <StatsOverviewCard
                              stats={playerStats.championStats[champion.id]}
                              name={champion.id}
                            />
                          </Suspense>
                        )}
                      >
                        <ChampionCard
                          key={champion.name}
                          champion={champion}
                          updateStageCallBack={UpdateChampionStage}
                        ></ChampionCard>
                      </Tooltip>
                    ) : (
                      <ChampionCard
                        key={champion.name}
                        champion={champion}
                        updateStageCallBack={UpdateChampionStage}
                      ></ChampionCard>
                    )
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex justify-center w-fit h-full">
            {playerStats ? (
              <Suspense fallback={<StatsSkeleton />}>
                <StatsOverviewCard
                  stats={playerStats}
                  name={playerStats.gameName + "#" + playerStats.tagLine}
                />
              </Suspense>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div> */}
      {/* <div
        className="flex flex-col w-full h-dvh items-center p-x-16 gap-2 bg-linear-to-b from-black to-slate-950 overflow-y-auto"
        id="scrollContainer"
      >
        <StatsSkeleton />
        <SummonerInput
          isLoading={isLoadingRecentStats}
          onLatestClickCallback={GetRecentStats}
          onAllClickCallback={GetFullPlayerData}
        ></SummonerInput>


      </div> */}
    </>
  );
}

export default App;
