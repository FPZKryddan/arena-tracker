import type { augmentsData } from "../../types";

export const isDisplayAugment = (augment: augmentsData): boolean =>
  augment.rarity !== 4 && augment.apiName !== "null_augment";
