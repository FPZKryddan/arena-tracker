import { useCallback, useState } from "react";
import type { augmentsData, championData, GetPUUIDDto, MatchDto, summonerData } from "../types";

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
					displayName: typedChampion.name,
					id: typedChampion.id,
				};
			}
		);

		return fetchedData;
	}, []);

	const FetchAugmentsData = useCallback(async () => {
		const data = await fetch(
			"https://raw.communitydragon.org/15.13/cdragon/arena/en_us.json"
		).then((res) => res.json());

		const augmentData: augmentsData[] = Object.values(data.augments).map(
			(augment: unknown) => {
				const typedAugment = augment as augmentsData;
				return typedAugment;
			}
		);

		console.log(augmentData);
		return augmentData
	}, []);

  const FetchUserPuuid = async (
    gameName: string,
    tagLine: string,
    regionUrl: string
  ): Promise<GetPUUIDDto> => {
    const data = (await FetchWithRetry(
      `https://${regionUrl}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      {
        method: "GET",
        headers: RIOT_HEADERS,
      }
    )) as GetPUUIDDto;

    return data;
  };

	const FetchSummonerData = async (
		puuid: string,
    platformUrl: string,
	): Promise<summonerData> => {
		const data = (await FetchWithRetry(
			`https://${platformUrl}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
			{
        method: "GET",
        headers: RIOT_HEADERS,
      }
		)) as summonerData;

		return data;
	}

  const FetchPlayerMatchList = async (
    puuid: string,
    start: number = 0,
    count: number = 18,
    startTime: number = Date.now(),
    regionUrl: string
  ): Promise<string[]> => {
    const data = (await FetchWithRetry(
      `https://${regionUrl}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=1700&start=${start}&count=${count}&startTime=${startTime}`,
      {
        method: "GET",
        headers: RIOT_HEADERS,
      }
    )) as string[];

    return data;
  };

  const FetchMatchData = async (matchId: string, regionUrl: string): Promise<MatchDto> => {
    const data = (await FetchWithRetry(
      `https://${regionUrl}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
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
		FetchAugmentsData,
		FetchSummonerData,
    FetchMatchData,
    FetchPlayerMatchList,
    FetchUserPuuid,
  };
}

export default useFetchData;
