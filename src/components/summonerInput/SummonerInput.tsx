import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoSearch, IoStar, IoClose } from "react-icons/io5";
import RegionSelector from "./RegionSelector";
import useGetPlayerStats from "../../hooks/useGetPlayerStats";
import useFavorites, { type Favorite } from "../../hooks/useFavorites";
import {
  type ArenaModeSelection,
  type JobState,
  type Regions,
} from "../../types";
import FetchingProgress from "../fetchingProgress";
import { DEFAULT_ARENA_MODE } from "../../utils/arenaModes";

const profilePath = (
  f: Favorite,
  arenaMode: ArenaModeSelection = DEFAULT_ARENA_MODE,
): string => {
  const path = `/profile/${f.region}/${encodeURIComponent(
    f.gameName,
  )}/${encodeURIComponent(f.tagLine)}`;
  if (arenaMode === DEFAULT_ARENA_MODE) return path;
  return `${path}?${new URLSearchParams({ mode: arenaMode }).toString()}`;
};

interface SummonerInputProps {
  routeProgress?: {
    isFetching: boolean;
    jobState: JobState | null;
  };
  arenaMode?: ArenaModeSelection;
  submitLabel?: string;
  variant?: "default" | "hero";
}

const SummonerInput = ({
  routeProgress,
  arenaMode = DEFAULT_ARENA_MODE,
  submitLabel,
  variant = "default",
}: SummonerInputProps) => {
  const params = useParams<{
    region?: string;
    gameName?: string;
    tagLine?: string;
  }>();
  const initialName =
    params.gameName && params.tagLine
      ? `${params.gameName}#${params.tagLine}`
      : "";
  const initialRegion = (params.region ?? null) as Regions;

  const [playerInputName, setPlayerInputName] = useState<string>(initialName);
  const [region, setRegion] = useState<Regions>(initialRegion);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const { retrievePlayerData, isFetching, jobState } = useGetPlayerStats(
    region,
    arenaMode,
  );
  const { favorites, remove } = useFavorites();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIsFetching = isFetching || routeProgress?.isFetching === true;
  const progressJobState = isFetching
    ? jobState
    : (routeProgress?.jobState ?? jobState);
  const isHero = variant === "hero";

  useEffect(() => {
    if (params.gameName && params.tagLine) {
      setPlayerInputName(`${params.gameName}#${params.tagLine}`);
    }
  }, [params.gameName, params.tagLine]);

  const filteredFavorites = useMemo(() => {
    const query = playerInputName.trim().toLowerCase();
    if (!query) return favorites;
    return favorites.filter((f) => {
      const handle = `${f.gameName}#${f.tagLine}`.toLowerCase();
      return (
        handle.includes(query) || f.gameName.toLowerCase().startsWith(query)
      );
    });
  }, [favorites, playerInputName]);

  const showDropdown = isFocused && filteredFavorites.length > 0;

  const handleSubmit = async () => {
    const [gameName, tagLine] = playerInputName.split("#");
    if (!gameName || !tagLine) return;
    const effectiveRegion = (region ?? "EUW") as Exclude<Regions, null>;
    try {
      await retrievePlayerData(playerInputName);
    } finally {
      setIsFocused(false);
    }
    navigate(
      profilePath({ region: effectiveRegion, gameName, tagLine }, arenaMode),
    );
  };

  const handleSelectFavorite = (f: Favorite) => {
    setPlayerInputName(`${f.gameName}#${f.tagLine}`);
    setIsFocused(false);
    navigate(profilePath(f, arenaMode));
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.relatedTarget)
    ) {
      setIsFocused(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full items-center"
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
    >
      <div
        className={`box-border flex w-full flex-row rounded-lg border text-fg transition-colors focus-within:border-accent ${
          isHero
            ? "h-14 border-border-strong bg-surface/90 shadow-raised backdrop-blur"
            : "h-11 border-border bg-surface"
        }`}
      >
        <input
          type="text"
          name="playerInput"
          className={`h-full min-w-0 w-full rounded-lg bg-transparent px-4 text-left font-normal text-fg placeholder:text-fg-muted focus:outline-0 ${
            isHero ? "text-base" : ""
          }`}
          placeholder="RiotName#TAG"
          value={playerInputName}
          onChange={(e) => setPlayerInputName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          disabled={progressIsFetching}
        ></input>

        <div
          className={`flex h-full flex-row has-disabled:opacity-50 ${
            isHero ? "gap-2 p-1" : "ml-auto"
          }`}
        >
          <RegionSelector
            updateRegionCallback={setRegion}
            initialRegion={initialRegion}
          />
          <button
            type="button"
            onClick={handleSubmit}
            className={
              submitLabel
                ? "flex items-center gap-2 rounded-lg bg-accent px-3 text-sm font-semibold text-accent-fg transition-colors hover:cursor-pointer hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
                : "rounded-lg px-2 text-fg-muted transition-colors hover:cursor-pointer hover:bg-surface-hover hover:text-fg"
            }
            disabled={progressIsFetching}
            aria-label={submitLabel ?? "Search player"}
          >
            <IoSearch
              className={
                submitLabel
                  ? "h-4 w-4 shrink-0"
                  : "h-full w-auto aspect-square p-2"
              }
            />
            {submitLabel && (
              <span className="whitespace-nowrap">{submitLabel}</span>
            )}
          </button>
        </div>
      </div>
      <FetchingProgress
        isFetching={progressIsFetching}
        jobState={progressJobState}
      />

      {showDropdown && (
        <ul className="absolute left-0 right-0 top-12 z-20 max-h-72 overflow-y-auto rounded-lg border border-border bg-surface">
          <li className="flex items-center gap-2 px-4 py-2 text-xs text-fg-muted border-b border-border">
            <IoStar className="w-3.5 h-3.5 text-favorite" />
            <span>Favorites</span>
          </li>
          {filteredFavorites.map((f) => (
            <li
              key={`${f.region}:${f.gameName}#${f.tagLine}`}
              className="flex items-center justify-between px-4 py-2 hover:bg-surface-hover hover:cursor-pointer"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectFavorite(f);
              }}
            >
              <div className="flex items-center gap-2 text-fg text-sm min-w-0">
                <span className="truncate font-medium">
                  {f.gameName}
                  <span className="text-fg-muted">#{f.tagLine}</span>
                </span>
                <span className="rounded-sm border border-border px-1.5 py-0.5 text-xs uppercase text-fg-muted">
                  {f.region}
                </span>
              </div>
              <button
                type="button"
                aria-label={`Remove ${f.gameName}#${f.tagLine}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(f);
                }}
                className="ml-2 rounded-md p-1 text-fg-muted hover:cursor-pointer hover:bg-surface-hover hover:text-fg"
              >
                <IoClose className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SummonerInput;
