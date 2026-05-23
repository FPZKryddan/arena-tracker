import { Link } from "react-router-dom";
import type { ArenaModeSelection, Regions, teammateStatDto } from "../../types";
import { useProfileLookupByPuuid } from "../../hooks/useProfileLookup";
import PlacementsBody from "./PlacementsBody";
import { getArenaPlacementCount } from "../../utils/arenaModes";

interface TeammateDetailCardProps {
  teammate: teammateStatDto;
  puuid: string;
  region: Exclude<Regions, null>;
  arenaMode?: ArenaModeSelection;
  onProfileClick?: () => void;
}

const getProfilePath = (
  region: Exclude<Regions, null>,
  gameName: string,
  tagLine: string
): string =>
  `/profile/${region}/${encodeURIComponent(gameName)}/${encodeURIComponent(
    tagLine
  )}`;

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

const TeammateDetailCard = ({
  teammate,
  puuid,
  region,
  arenaMode,
  onProfileClick,
}: TeammateDetailCardProps) => {
  const { profile } = useProfileLookupByPuuid(puuid, region);
  const displayGameName = profile?.gameName ?? teammate.gameName;
  const displayTagLine = profile?.tagLine ?? teammate.tagLine;
  const profilePath = getProfilePath(
    profile?.region ?? region,
    displayGameName,
    displayTagLine
  );

  return (
    <div className="flex flex-col gap-4 text-fg p-2">
      <div className="flex flex-col gap-1 pr-10">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="min-w-0 text-lg font-semibold">
            <span className="text-fg-muted text-sm">Stats with </span>
            {displayGameName}
            <span className="text-fg-muted">#{displayTagLine}</span>
          </p>
          <Link
            to={profilePath}
            onClick={onProfileClick}
            className="text-xs font-semibold text-accent transition-colors hover:text-fg"
          >
            View profile
          </Link>
        </div>
        <p className="text-xs text-fg-muted">
          Last played: {formatLastPlayed(teammate.lastPlayedAt)}
        </p>
      </div>
      <PlacementsBody
        placements={teammate.placements}
        placementAvg={teammate.placementAvg}
        placementCount={getArenaPlacementCount(arenaMode)}
      />
    </div>
  );
};

export default TeammateDetailCard;
