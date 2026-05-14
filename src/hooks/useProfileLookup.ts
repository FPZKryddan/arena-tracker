import { useCallback, useEffect, useState } from "react";
import type { ProfileLookupDto, Regions } from "../types";
import { getApiBase, getStoredRegion } from "./useApiBase";

type CacheEntry = ProfileLookupDto | null;

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<CacheEntry>>();

const profileByNameCacheKey = (
  region: Exclude<Regions, null>,
  name: string,
  tag: string
): string => `name|${region}|${name.toLowerCase()}|${tag.toLowerCase()}`;

const profileByPuuidCacheKey = (
  region: Exclude<Regions, null>,
  puuid: string
): string => `puuid|${region}|${puuid}`;

const seedProfileCache = (
  profile: ProfileLookupDto,
  region: Exclude<Regions, null>
) => {
  const regions = new Set<Exclude<Regions, null>>([region, profile.region]);

  regions.forEach((cacheRegion) => {
    cache.set(
      profileByNameCacheKey(cacheRegion, profile.gameName, profile.tagLine),
      profile
    );
    cache.set(profileByPuuidCacheKey(cacheRegion, profile.puuid), profile);
  });
};

export const fetchProfile = async (
  gameName: string,
  tagLine: string,
  region: Exclude<Regions, null> = getStoredRegion(),
  options?: { force?: boolean }
): Promise<CacheEntry> => {
  if (!gameName || !tagLine) return null;
  const key = profileByNameCacheKey(region, gameName, tagLine);
  if (!options?.force) {
    if (cache.has(key)) return cache.get(key) ?? null;
    const existing = inFlight.get(key);
    if (existing) return existing;
  } else {
    cache.delete(key);
  }

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
      seedProfileCache(data, region);
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

export const fetchProfileByPuuid = async (
  puuid: string,
  region: Exclude<Regions, null> = getStoredRegion()
): Promise<CacheEntry> => {
  if (!puuid) return null;
  const key = profileByPuuidCacheKey(region, puuid);
  if (cache.has(key)) return cache.get(key) ?? null;
  const existing = inFlight.get(key);
  if (existing) return existing;

  const apiBase = getApiBase();
  const promise = fetch(
    `${apiBase}/profiles/${region}/by-puuid/${encodeURIComponent(puuid)}`
  )
    .then(async (res) => {
      if (!res.ok) {
        cache.set(key, null);
        return null;
      }
      const data = (await res.json()) as ProfileLookupDto;
      seedProfileCache(data, region);
      return data;
    })
    .catch((err) => {
      console.error("profile lookup by puuid failed:", err);
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
    gameName && tagLine
      ? profileByNameCacheKey(effectiveRegion, gameName, tagLine)
      : null;
  const [profile, setProfile] = useState<ProfileLookupDto | null>(
    key ? cache.get(key) ?? null : null
  );
  const [loading, setLoading] = useState<boolean>(
    !!key && !cache.has(key)
  );

  useEffect(() => {
    if (!gameName || !tagLine) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const k = profileByNameCacheKey(effectiveRegion, gameName, tagLine);
    if (cache.has(k)) {
      setProfile(cache.get(k) ?? null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setProfile(null);
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

  const refetch = useCallback(async () => {
    if (!gameName || !tagLine) return null;
    setLoading(true);
    const p = await fetchProfile(gameName, tagLine, effectiveRegion, {
      force: true,
    });
    setProfile(p);
    setLoading(false);
    return p;
  }, [gameName, tagLine, effectiveRegion]);

  return { profile, loading, refetch };
}

export function useProfileLookupByPuuid(
  puuid: string | undefined,
  region?: Exclude<Regions, null>
) {
  const effectiveRegion = region ?? getStoredRegion();
  const key = puuid ? profileByPuuidCacheKey(effectiveRegion, puuid) : null;
  const [profile, setProfile] = useState<ProfileLookupDto | null>(
    key ? cache.get(key) ?? null : null
  );
  const [loading, setLoading] = useState<boolean>(!!key && !cache.has(key));

  useEffect(() => {
    if (!puuid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const k = profileByPuuidCacheKey(effectiveRegion, puuid);
    if (cache.has(k)) {
      setProfile(cache.get(k) ?? null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setProfile(null);
    setLoading(true);
    fetchProfileByPuuid(puuid, effectiveRegion).then((p) => {
      if (cancelled) return;
      setProfile(p);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [puuid, effectiveRegion]);

  return { profile, loading };
}

export default useProfileLookup;
