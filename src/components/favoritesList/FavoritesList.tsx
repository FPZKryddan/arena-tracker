import { useNavigate } from "react-router-dom";
import { IoClose, IoStar } from "react-icons/io5";
import useFavorites, { type Favorite } from "../../hooks/useFavorites";

const profilePath = (f: Favorite): string =>
  `/profile/${f.region}/${encodeURIComponent(f.gameName)}/${encodeURIComponent(f.tagLine)}`;

const FavoritesList = () => {
  const { favorites, remove } = useFavorites();
  const navigate = useNavigate();

  if (favorites.length === 0) return null;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center gap-2 text-sm text-fg-muted">
        <IoStar className="w-4 h-4 text-favorite" />
        <span>Favorites</span>
      </div>
      <ul className="flex flex-wrap gap-2">
        {favorites.map((f) => (
          <li key={`${f.region}:${f.gameName}#${f.tagLine}`}>
            <div className="flex items-center rounded-md border border-border bg-surface px-1 py-1 pl-3 text-fg transition-colors hover:border-border-strong hover:bg-surface-hover">
              <button
                type="button"
                onClick={() => navigate(profilePath(f))}
                className="hover:cursor-pointer text-sm flex items-center gap-2"
              >
                <span className="font-medium">
                  {f.gameName}
                  <span className="text-fg-muted">#{f.tagLine}</span>
                </span>
                <span className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase text-fg-muted">
                  {f.region}
                </span>
              </button>
              <button
                type="button"
                aria-label={`Remove ${f.gameName}#${f.tagLine}`}
                onClick={(e) => {
                  e.stopPropagation();
                  remove(f);
                }}
                className="ml-2 rounded-md p-1 text-fg-muted hover:cursor-pointer hover:bg-bg hover:text-fg"
              >
                <IoClose className="w-3.5 h-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FavoritesList;
