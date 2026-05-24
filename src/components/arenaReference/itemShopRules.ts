import type { ItemDataDto } from "../../types";

// Riot map IDs (DDragon `maps` field): 30 = Arena.
export const ARENA_MAP_ID = "30";

export const ITEM_TIERS = [
  { cost: 6000, label: "Quest items" },
  { cost: 2750, label: "Prismatics" },
  { cost: 2500, label: "Legendaries" },
  { cost: 500, label: "Boots & Pots" },
] as const;

export type ArenaItemTier = (typeof ITEM_TIERS)[number];

export const isPurchasableArenaItem = (item: ItemDataDto): boolean =>
  !!item.maps?.[ARENA_MAP_ID] &&
  !!item.gold?.purchasable &&
  !item.hideFromAll &&
  ITEM_TIERS.some((tier) => tier.cost === item.gold?.total);
