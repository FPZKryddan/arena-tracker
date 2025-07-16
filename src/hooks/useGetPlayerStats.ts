import { useState } from "react";
import {
  type GetPUUIDDto,
  type MatchDto,
  type Regions,
  type summonerData,
} from "../types";
import useToast from "./useToast";
import useFetchData from "./useFetchData";
import useFetchStatusTracker from "./useFethingStatusTracker";
import useMatchParser from "./useMatchParser";
import useContextIfDefined from "./useContextIfDefined";
import { PlayerStatsContext } from "../contexts/PlayerStatsContext";
import { ChampionsContext } from "../contexts/ChampionsContext";

function useGetPlayerStats(region: Regions = 'EUW') {
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const { champions } = useContextIfDefined(ChampionsContext);
  const { playerStats, setPlayerStats } =
    useContextIfDefined(PlayerStatsContext);
  const {
    FetchMatchData,
    FetchPlayerMatchList,
    FetchUserPuuid,
    FetchSummonerData,
  } = useFetchData();
  const { createToast } = useToast();
  const {
    addStatusMessage,
    updateStatusMessage,
    completeStatusMessage,
    resetStatusMessages,
    failStatusMessage,
  } = useFetchStatusTracker();
  const {
    GetParticipantIdByPuuid,
    PopulatePlayerStatsFromMatch,
    createEmptyPlayerStats,
  } = useMatchParser();

  const mapToPlatformRoutingValues = (selectedRegion: Regions): string => {
    switch (selectedRegion) {
      case "EUNE":
        return "eun1";
      case "NA":
        return "na1";
      case "EUW":
      default:
        return "euw1";
    }
  };

  const mapToRegionalRoutingValues = (selectedRegion: Regions): string => {
    switch (selectedRegion) {
      case "NA":
        return "AMERICAS";
      case "EUNE":
      case "EUW":
      default:
        return "EUROPE";
    }
  };

  const retrievePlayerData = (name: string) => {
    if (!playerStats
      || playerStats.gameName + '#' + playerStats.tagLine !== name
    ) return GetFullPlayerData(name);
    return GetRecentStats(name);
  }

  const GetRecentStats = async (name: string) => {
    if (!playerStats) return;
    const splitName = name.split("#");
    const gameName = splitName[0];
    const tagline = splitName[1];

    if (!tagline) {
      return;
    }

    setIsFetching(true);

    const puuidData: GetPUUIDDto = await FetchUserPuuid(
      gameName,
      tagline,
      mapToRegionalRoutingValues(region)
    );
    const playerUuid = puuidData.puuid;

    let backtracking = true;
    let idx = 0;
    const matchDatas: MatchDto[] = [];

    while (backtracking) {
      const matchListSegment: string[] = await FetchPlayerMatchList(
        playerUuid,
        idx * 100,
        100,
        1741088416,
        mapToRegionalRoutingValues(region)
      );
      for (const match of matchListSegment) {
        const matchData: MatchDto = await FetchMatchData(
          match,
          mapToRegionalRoutingValues(region)
        );
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

    let tempPlayerStats = { ...playerStats };
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

    createToast(
      String(matchDatas.length) + " Updates were retrieved!",
      "SUCCESS"
    );
    setIsFetching(false);
    setPlayerStats(tempPlayerStats);
  };

  const GetFullPlayerData = async (name: string) => {
    const splitName = name.split("#");
    const gameName = splitName[0];
    const tagline = splitName[1];

    if (!tagline) {
      return;
    }

    let tempPlayerStats = createEmptyPlayerStats(champions);
    tempPlayerStats.gameName = gameName;
    tempPlayerStats.tagLine = tagline;

    setIsFetching(true);
    // setIsPlayerStatsModalOpen(true);
    resetStatusMessages();

    // Get Players UUID
    const smIdPuuid = addStatusMessage("Getting Player UUID...", 1);
    let puuidData: GetPUUIDDto;
    try {
      puuidData = await FetchUserPuuid(
        gameName,
        tagline,
        mapToRegionalRoutingValues(region)
      );
    } catch (error) {
      createToast("Could not find player!", 'ERROR');
      failStatusMessage(smIdPuuid);
      setIsFetching(false);
      console.error("Failed to fetch Player UUID:", error);
      return;
    }
    const playerUuid = puuidData.puuid;
    tempPlayerStats.puuid = playerUuid;
    updateStatusMessage(smIdPuuid);

    // Retrieve Match History
    let matchList: string[] = [];
    let findingMatches = true;
    let idx = 0;

    const smIdMatchHistory = addStatusMessage("Fetching match history...", -1);
    while (findingMatches) {
      let matchListSegment: string[];
      try {
        matchListSegment = await FetchPlayerMatchList(
          playerUuid,
          idx * 100,
          100,
          1741088416,
          mapToRegionalRoutingValues(region)
        );
      } catch (error) {
        createToast("Failed to fetch Player's match history", 'ERROR');
        failStatusMessage(smIdMatchHistory);
        setIsFetching(false);
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
    const smIdMatchData = addStatusMessage(
      "Fetching match data...",
      matchList.length
    );
    const matchDatas: MatchDto[] = [];
    for (const match of matchList) {
      let data: MatchDto;
      try {
        data = await FetchMatchData(match, mapToRegionalRoutingValues(region));
      } catch (error) {
        createToast("Failed to fetch match data!", 'ERROR');
        failStatusMessage(smIdMatchData);
        setIsFetching(false);
        console.error("Failed to fetch match data:", error);
        return;
      }
      matchDatas.push(data);
      updateStatusMessage(smIdMatchData);
    }

    // Map player to every match
    const smIdPlayerInMatches = addStatusMessage(
      "Finding player in matches...",
      matchList.length
    );
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
    const smIdPlayerStats = addStatusMessage(
      "Populating player stats",
      matchList.length
    );
    for (const matchMapping of playerParticipantIdToMatch) {
      try {
        tempPlayerStats = PopulatePlayerStatsFromMatch(
          tempPlayerStats,
          matchMapping.match,
          matchMapping.playerId
        );
        updateStatusMessage(smIdPlayerStats);
      } catch (error) {
        createToast("Failed to aggregate stats from match!", 'ERROR');
        failStatusMessage(smIdPlayerStats);
        setIsFetching(false);
        console.error(
          "Failed to fetch populate player stats from match:",
          error
        );
        return;
      }
    }

    const smIdSummonerData = addStatusMessage("Getting summoner data", 1);
    try {
      const summonerData: summonerData = await FetchSummonerData(
        playerUuid,
        mapToPlatformRoutingValues(region)
      );
      updateStatusMessage(smIdSummonerData);
      tempPlayerStats.profileIconId = summonerData.profileIconId;
      tempPlayerStats.summonerLevel = summonerData.summonerLevel;
    } catch (error) {
      createToast("Failed to get additional player info!", 'ERROR');
      failStatusMessage(smIdSummonerData);
      setIsFetching(false);
      console.error("Failed to fetch summoner data for player:", error);
      return;
    }

    console.log(tempPlayerStats);

    console.log(matchDatas);

    setPlayerStats(tempPlayerStats);
    setIsFetching(false);
  };

  return {
    isFetching,
    GetRecentStats,
    GetFullPlayerData,
    retrievePlayerData
  };
}

export default useGetPlayerStats;
