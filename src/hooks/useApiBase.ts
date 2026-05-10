import type { Regions } from "../types";

type Region = Exclude<Regions, null>;

const SUPPORTED_REGIONS: Region[] = ["EUW", "EUNE", "NA"];

export const getApiBase = (): string => import.meta.env.VITE_API_BASE;

export const normalizeRegion = (region: string | null | undefined): Region => {
  const normalized = region?.toUpperCase();
  return SUPPORTED_REGIONS.includes(normalized as Region)
    ? (normalized as Region)
    : "EUW";
};

export const getStoredRegion = (): Region => {
  return normalizeRegion(localStorage.getItem("region"));
};
