import {
  getGameStatIconUrl,
  type GameStatIconKey,
} from "../../utils/gameStatIcons";

interface GameStatIconProps {
  stat: GameStatIconKey;
  className?: string;
}

const GameStatIcon = ({
  stat,
  className = "h-4 w-4 shrink-0 object-contain",
}: GameStatIconProps) => (
  <img
    src={getGameStatIconUrl(stat)}
    alt=""
    loading="lazy"
    decoding="async"
    className={className}
  />
);

export default GameStatIcon;
