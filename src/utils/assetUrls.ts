export const DDRAGON_CDN_BASE = "https://ddragon.leagueoflegends.com/cdn";

export const CDRAGON_GAME_BASE = "https://raw.communitydragon.org/latest/game/";

export const CDRAGON_STAT_ICON_BASE =
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/ux/fonts/texticons/lol/statsicon/";

export const getDdragonItemIconUrl = (
  version: string,
  itemId: number,
): string => `${DDRAGON_CDN_BASE}/${version}/img/item/${itemId}.png`;

export const getCdragonAugmentIconUrl = (iconPath: string): string =>
  `${CDRAGON_GAME_BASE}${iconPath}`;
