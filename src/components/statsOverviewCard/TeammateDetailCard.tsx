import type { teammateStatDto } from "../../types";
import PlacementsBody from "./PlacementsBody";

interface TeammateDetailCardProps {
  teammate: teammateStatDto;
}

const formatLastPlayed = (timestamp: number): string => {
  if (!timestamp) return "-";
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  return `${months} months ago`;
};

const TeammateDetailCard = ({ teammate }: TeammateDetailCardProps) => {
  return (
    <div className="flex flex-col gap-[16px] text-fg p-[8px]">
      <div className="flex flex-col">
        <p className="text-[18px] font-bold">
          {teammate.gameName}
          <span className="text-fg-muted">#{teammate.tagLine}</span>
        </p>
        <p className="text-[12px] text-fg-muted">
          Last played: {formatLastPlayed(teammate.lastPlayedAt)}
        </p>
      </div>
      <PlacementsBody
        placements={teammate.placements}
        placementAvg={teammate.placementAvg}
      />
    </div>
  );
};

export default TeammateDetailCard;
