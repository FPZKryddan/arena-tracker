const RIOT_TO_DDRAGON_NAME: Record<string, string> = {
  FiddleSticks: "Fiddlesticks",
};

export const getChampionIconUrl = (
  version: string,
  championName: string
): string => {
  const ddragonId = RIOT_TO_DDRAGON_NAME[championName] ?? championName;
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${ddragonId}.png`;
};
