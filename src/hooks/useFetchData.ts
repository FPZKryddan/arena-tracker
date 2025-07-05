import { useCallback, useState } from "react";
import type { championData, GetPUUIDDto, MatchDto } from "../types";

function useFetchData() {
  const API_KEY = import.meta.env.VITE_RIOT_API_KEY;
  const RIOT_HEADERS = {
    "Content-Type": "application/json",
    Origin: "https://developer.riotgames.com",
    "X-Riot-Token": API_KEY,
  };

	const [isRateLimited, setIsRateLimited] = useState<boolean>(false);

  const FetchWithRetry = async (
    url: string,
    options: RequestInit = {},
    maxRetries: number = 10
  ): Promise<unknown> => {
    let retries = 0;

    while (retries <= maxRetries) {
      const response = await fetch(url, options);

      if (response.ok) {
				setIsRateLimited(false);
        return response.json();
      }

      if (response.status === 429) {
				setIsRateLimited(true);

        retries++;
        const waitTime =  30 * 1000;
        console.warn(
          `Rate limited. Retrying in ${
            waitTime / 1000
          }s ... (attempt ${retries})`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } else {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          `ERROR upon fetch ${response.status}: ${JSON.stringify(error)}`
        );
      }
    }

    throw new Error("Max Retries exceeded due to rate limiting!");
  };

	const FetchChampionData = useCallback(async () => {
		const data = await fetch(
			"https://ddragon.leagueoflegends.com/cdn/15.13.1/data/en_US/champion.json"
		).then((res) => res.json());

		const fetchedData: championData[] = Object.values(data.data).map(
			(champion: unknown) => {
				const typedChampion = champion as { name: string; id: string };
				return {
					name: typedChampion.name.toLocaleLowerCase(),
					id: typedChampion.id.toLocaleLowerCase(),
					stage: 0,
				};
			}
		);

		return fetchedData;
	}, []);

  const FetchUserPuuid = async (
    gameName: string,
    tagLine: string
  ): Promise<GetPUUIDDto> => {
    const data = (await FetchWithRetry(
      `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      {
        method: "GET",
        headers: RIOT_HEADERS,
      }
    )) as GetPUUIDDto;

    return data;
  };

  const FetchPlayerMatchList = async (
    puuid: string,
    start: number = 0,
    count: number = 18,
    startTime: number = Date.now()
  ): Promise<string[]> => {
    const data = (await FetchWithRetry(
      `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=1700&start=${start}&count=${count}&startTime=${startTime}`,
      {
        method: "GET",
        headers: RIOT_HEADERS,
      }
    )) as string[];

    return data;
  };

  const FetchMatchData = async (matchId: string): Promise<MatchDto> => {
    const data = (await FetchWithRetry(
      `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      {
        method: "GET",
        headers: RIOT_HEADERS,
      }
    )) as MatchDto;

    return data;
  };

  return {
		isRateLimited,
    FetchChampionData,
    FetchMatchData,
    FetchPlayerMatchList,
    FetchUserPuuid,
  };
}

export default useFetchData;
