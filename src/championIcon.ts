const RIOT_TO_DDRAGON_NAME: Record<string, string> = {
  FiddleSticks: "Fiddlesticks",
};

const toDdragonId = (championName: string): string =>
  RIOT_TO_DDRAGON_NAME[championName] ?? championName;

export const getChampionIconUrl = (
  version: string,
  championName: string
): string =>
  `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${toDdragonId(championName)}.png`;

export const getChampionLoadingArtUrl = (championName: string): string =>
  `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${toDdragonId(championName)}_0.jpg`;

export const getChampionSplashArtUrl = (championName: string): string =>
  `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${toDdragonId(championName)}_0.jpg`;
