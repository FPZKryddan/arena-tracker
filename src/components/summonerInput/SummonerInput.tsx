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
    await retrievePlayerData(playerInputName);
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
      className="relative w-full items-center rounded-sm"
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
    >
      <div className="flex flex-row w-full px-4 box-border h-[44px] bg-surface-elevated text-fg rounded-[25px] border border-border">
        <input
          type="text"
          name="playerInput"
          className="text-left text-fg font-normal h-full w-full focus:outline-0 autofill:shadow-none placeholder:text-fg-muted"
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
            className="hover:cursor-pointer"
            disabled={isFetching}
          >
            <IoSearch className="h-full w-auto aspect-square p-2 text-fg" />
          </button>
        </div>
      </div>
      <FetchingProgress isFetching={isFetching} jobState={jobState} />

      {showDropdown && (
        <ul className="absolute left-0 right-0 top-[48px] z-20 bg-surface-elevated border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[280px] overflow-y-auto">
          <li className="flex items-center gap-2 px-4 py-2 text-xs text-fg-muted border-b border-border">
            <IoStar className="w-3.5 h-3.5 text-yellow-400" />
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
                <span className="text-[10px] uppercase bg-surface px-1.5 py-0.5 rounded text-fg-muted">
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
                className="hover:cursor-pointer ml-2 p-1 rounded-full hover:bg-surface text-fg-muted"
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
