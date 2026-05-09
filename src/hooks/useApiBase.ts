import type { Regions } from "../types";

export const getApiBase = (): string => import.meta.env.VITE_API_BASE;

export const getStoredRegion = (): Exclude<Regions, null> => {
  const stored = localStorage.getItem("region") as Regions | null;
  return stored ?? "EUW";
};
