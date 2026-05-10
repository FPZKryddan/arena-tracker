import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoSearch, IoStar, IoClose } from "react-icons/io5";
import RegionSelector from "./RegionSelector";
import useGetPlayerStats from "../../hooks/useGetPlayerStats";
import useFavorites, { type Favorite } from "../../hooks/useFavorites";
import { type Regions } from "../../types";
import FetchingProgress from "../fetchingProgress";

const profilePath = (f: Favorite): string =>
  `/profile/${f.region}/${encodeURIComponent(f.gameName)}/${encodeURIComponent(f.tagLine)}`;

const SummonerInput = () => {
  const params = useParams<{ region?: string; gameName?: string; tagLine?: string }>();
  const initialName =
    params.gameName && params.tagLine ? `${params.gameName}#${params.tagLine}` : "";
  const initialRegion = (params.region ?? null) as Regions;

  const [playerInputName, setPlayerInputName] = useState<string>(initialName);
  const [region, setRegion] = useState<Regions>(initialRegion);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const { retrievePlayerData, isFetching, jobState } = useGetPlayerStats(region);
  const { favorites, remove } = useFavorites();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

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
      `/profile/${effectiveRegion}/${encodeURIComponent(
        gameName
      )}/${encodeURIComponent(tagLine)}`
    );
  };

  const handleSelectFavorite = (f: Favorite) => {
    setPlayerInputName(`${f.gameName}#${f.tagLine}`);
    setIsFocused(false);
    navigate(profilePath(f));
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget)) {
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
      <div className="box-border flex h-[44px] w-full flex-row rounded-lg border border-border bg-surface text-fg transition-colors focus-within:border-accent">
        <input
          type="text"
          name="playerInput"
          className="h-full w-full rounded-l-lg bg-transparent px-4 text-left font-normal text-fg placeholder:text-fg-muted focus:outline-0 autofill:shadow-none"
          placeholder="RiotName#TAG"
          value={playerInputName}
          onChange={(e) => setPlayerInputName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          disabled={isFetching}
        ></input>

        <div className="flex flex-row h-full ml-auto has-disabled:opacity-50">
          <RegionSelector
            updateRegionCallback={setRegion}
            initialRegion={initialRegion}
          />
          <button
            onClick={handleSubmit}
            className="rounded-r-lg px-2 text-fg-muted transition-colors hover:cursor-pointer hover:bg-surface-hover hover:text-fg"
            disabled={isFetching}
            aria-label="Search player"
          >
            <IoSearch className="h-full w-auto aspect-square p-2" />
          </button>
        </div>
      </div>
      <FetchingProgress isFetching={isFetching} jobState={jobState} />

      {showDropdown && (
        <ul className="absolute left-0 right-0 top-[48px] z-20 max-h-[280px] overflow-y-auto rounded-lg border border-border bg-surface">
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
                <span className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase text-fg-muted">
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
