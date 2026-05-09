import { useCallback, useEffect, useState } from "react";
import type { Regions } from "../types";

export type Favorite = {
  gameName: string;
  tagLine: string;
  region: Exclude<Regions, null>;
};

const STORAGE_KEY = "arena-tracker:favorites";

const sameProfile = (a: Favorite, b: Favorite): boolean =>
  a.region === b.region &&
  a.gameName.toLowerCase() === b.gameName.toLowerCase() &&
  a.tagLine.toLowerCase() === b.tagLine.toLowerCase();

const readFromStorage = (): Favorite[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (f): f is Favorite =>
        f &&
        typeof f.gameName === "string" &&
        typeof f.tagLine === "string" &&
        typeof f.region === "string"
    );
  } catch {
    return [];
  }
};

const writeToStorage = (favorites: Favorite[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (err) {
    console.error("[useFavorites] failed to persist:", err);
  }
};

function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>(readFromStorage);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setFavorites(readFromStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isFavorite = useCallback(
    (f: Favorite) => favorites.some((existing) => sameProfile(existing, f)),
    [favorites]
  );

  const add = useCallback((f: Favorite) => {
    setFavorites((prev) => {
      if (prev.some((existing) => sameProfile(existing, f))) return prev;
      const next = [...prev, f];
      writeToStorage(next);
      return next;
    });
  }, []);

  const remove = useCallback((f: Favorite) => {
    setFavorites((prev) => {
      const next = prev.filter((existing) => !sameProfile(existing, f));
      writeToStorage(next);
      return next;
    });
  }, []);

  const toggle = useCallback((f: Favorite) => {
    setFavorites((prev) => {
      const exists = prev.some((existing) => sameProfile(existing, f));
      const next = exists
        ? prev.filter((existing) => !sameProfile(existing, f))
        : [...prev, f];
      writeToStorage(next);
      return next;
    });
  }, []);

  return { favorites, isFavorite, add, remove, toggle };
}

export default useFavorites;
