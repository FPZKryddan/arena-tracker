import { useEffect, useState } from "react";
import type { ProfileLookupDto, Regions } from "../types";
import { getApiBase, getStoredRegion } from "./useApiBase";

type CacheEntry = ProfileLookupDto | null;

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<CacheEntry>>();

const cacheKey = (
  region: Exclude<Regions, null>,
  name: string,
  tag: string
): string => `${region}|${name.toLowerCase()}|${tag.toLowerCase()}`;

export const fetchProfile = async (
  gameName: string,
  tagLine: string,
  region: Exclude<Regions, null> = getStoredRegion()
): Promise<CacheEntry> => {
  if (!gameName || !tagLine) return null;
  const key = cacheKey(region, gameName, tagLine);
  if (cache.has(key)) return cache.get(key) ?? null;
  const existing = inFlight.get(key);
  if (existing) return existing;

  const apiBase = getApiBase();
  const promise = fetch(
    `${apiBase}/profiles/${region}/${encodeURIComponent(
      gameName
    )}/${encodeURIComponent(tagLine)}`
  )
    .then(async (res) => {
      if (!res.ok) {
        cache.set(key, null);
        return null;
      }
      const data = (await res.json()) as ProfileLookupDto;
      cache.set(key, data);
      return data;
    })
    .catch((err) => {
      console.error("profile lookup failed:", err);
      cache.set(key, null);
      return null;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, promise);
  return promise;
};

function useProfileLookup(
  gameName: string | undefined,
  tagLine: string | undefined,
  region?: Exclude<Regions, null>
) {
  const effectiveRegion = region ?? getStoredRegion();
  const key =
    gameName && tagLine ? cacheKey(effectiveRegion, gameName, tagLine) : null;
  const [profile, setProfile] = useState<ProfileLookupDto | null>(
    key ? cache.get(key) ?? null : null
  );
  const [loading, setLoading] = useState<boolean>(
    !!key && !cache.has(key)
  );

  useEffect(() => {
    if (!gameName || !tagLine) return;
    const k = cacheKey(effectiveRegion, gameName, tagLine);
    if (cache.has(k)) {
      setProfile(cache.get(k) ?? null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchProfile(gameName, tagLine, effectiveRegion).then((p) => {
      if (cancelled) return;
      setProfile(p);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [gameName, tagLine, effectiveRegion]);

  return { profile, loading };
}

export default useProfileLookup;
