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
      <div className="flex items-center gap-2 mb-3 text-fg-muted text-sm">
        <IoStar className="w-4 h-4 text-favorite" />
        <span>Favorites</span>
      </div>
      <ul className="flex flex-wrap gap-2">
        {favorites.map((f) => (
          <li key={`${f.region}:${f.gameName}#${f.tagLine}`}>
            <div className="flex items-center bg-surface-elevated border border-border rounded-full pl-3 pr-1 py-1 text-fg hover:bg-surface-hover transition-colors">
              <button
                type="button"
                onClick={() => navigate(profilePath(f))}
                className="hover:cursor-pointer text-sm flex items-center gap-2"
              >
                <span className="font-medium">
                  {f.gameName}
                  <span className="text-fg-muted">#{f.tagLine}</span>
                </span>
                <span className="text-[10px] uppercase bg-surface px-1.5 py-0.5 rounded text-fg-muted">
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
                className="hover:cursor-pointer ml-2 p-1 rounded-full hover:bg-surface text-fg-muted"
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
