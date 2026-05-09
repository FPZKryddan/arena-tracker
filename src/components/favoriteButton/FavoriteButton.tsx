import { IoStar, IoStarOutline } from "react-icons/io5";
import useFavorites, { type Favorite } from "../../hooks/useFavorites";

interface FavoriteButtonProps {
  favorite: Favorite;
}

const FavoriteButton = ({ favorite }: FavoriteButtonProps) => {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(favorite);

  return (
    <button
      type="button"
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={active}
      title={active ? "Remove from favorites" : "Add to favorites"}
      onClick={() => toggle(favorite)}
      className="hover:cursor-pointer p-1 rounded-md transition-colors hover:bg-surface-hover"
    >
      {active ? (
        <IoStar className="w-5 h-5 text-yellow-400" />
      ) : (
        <IoStarOutline className="w-5 h-5 text-fg-muted" />
      )}
    </button>
  );
};

export default FavoriteButton;
