import type { championData, GetPUUIDDto, MatchDto } from "../types";

function useFetchData() {
  const FetchChampionData = async () => {
    const data = await fetch(
      "https://ddragon.leagueoflegends.com/cdn/15.13.1/data/en_US/champion.json"
    ).then((res) => res.json());

    const fetchedData: championData[] = Object.values(data.data).map(
      (champion: unknown) => {
        const typedChampion = champion as { name: string; id: string };
        return {
          name: typedChampion.name,
          id: typedChampion.id,
          stage: 0,
        };
      }
    );

    return fetchedData;
  };

  const FetchUserPuuid = async (gameName: string, tagLine: string): Promise<GetPUUIDDto> => {
    const data = await fetch(
      `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://developer.riotgames.com",
          "X-Riot-Token": import.meta.env.VITE_RIOT_API_KEY,
        },
      }
    ).then((res) => res.json());

    return data;
  };

  const FetchPlayerMatchList = async (
    puuid: string,
    start: number = 0,
    count: number = 18
  ): Promise<string[]> => {
    const data = await fetch(
      `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=1700&start=${start}&count=${count}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://developer.riotgames.com",
          "X-Riot-Token": import.meta.env.VITE_RIOT_API_KEY,
        },
      }
    ).then((res) => res.json());

    return data;
  };

  const FetchMatchData = async (matchId: string): Promise<MatchDto> => {
    const data = await fetch(
      `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://developer.riotgames.com",
          "X-Riot-Token": import.meta.env.VITE_RIOT_API_KEY,
        },
      }
    ).then((res) => res.json());

    return data;
  };

	return {
		FetchChampionData,
		FetchMatchData,
		FetchPlayerMatchList,
		FetchUserPuuid,
	}
}

export default useFetchData;
