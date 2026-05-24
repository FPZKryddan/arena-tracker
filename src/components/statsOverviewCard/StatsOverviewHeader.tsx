import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { numericalStatsDto, Regions } from "../../types";
import FavoriteButton from "../favoriteButton/FavoriteButton";
import Tooltip from "../Tooltip/Tooltip";
import KdaStat from "./KdaStat";
import { getAveragePerMatchLabel } from "./statAverages";

interface StatsOverviewHeaderProps {
  kills: numericalStatsDto;
  deaths: numericalStatsDto;
  assists: numericalStatsDto;
  matchCount: number;
  name: string;
  imgUrl: string;
  profilePath?: string;
  favoriteTarget?: {
    gameName: string;
    tagLine: string;
    region: Exclude<Regions, null>;
  };
  trailing?: ReactNode;
}

const StatsOverviewHeader = ({
  kills,
  deaths,
  assists,
  matchCount,
  name,
  imgUrl,
  profilePath,
  favoriteTarget,
  trailing,
}: StatsOverviewHeaderProps) => {
  const hasPerfectKda = deaths.value === 0;
  const kda = hasPerfectKda
    ? "Perfect"
    : Math.ceil(((kills.value + assists.value) / deaths.value) * 10) / 10;
  const kdRatio = hasPerfectKda
    ? "Perfect"
    : Math.ceil((kills.value / deaths.value) * 10) / 10;

  const stats = (
    <div className="flex flex-row gap-4">
      <Tooltip
        text="Kills"
        extra={`Highest kills: ${
          kills.records[0]?.value
        } | ${getAveragePerMatchLabel(kills.value, matchCount)}`}
      >
        <KdaStat type={"kills"} value={kills.value} />
      </Tooltip>
      <Tooltip
        text="Deaths"
        extra={`Highest deaths: ${
          deaths.records[0]?.value
        } | ${getAveragePerMatchLabel(deaths.value, matchCount)}`}
      >
        <KdaStat type={"deaths"} value={deaths.value} />
      </Tooltip>
      <Tooltip
        text="Assists"
        extra={`Highest assists: ${
          assists.records[0]?.value
        } | ${getAveragePerMatchLabel(assists.value, matchCount)}`}
      >
        <KdaStat type={"assists"} value={assists.value} />
      </Tooltip>
      <Tooltip text="KDA Ratio" extra={"K/D: " + kdRatio}>
        <KdaStat type={"kda"} value={kda} />
      </Tooltip>
    </div>
  );

  return (
    <div className="flex flex-row flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 flex-row items-center gap-2">
        {profilePath ? (
          <Link
            to={profilePath}
            aria-label={`Open ${name} profile`}
            className="shrink-0 rounded-md transition-opacity hover:opacity-85"
          >
            <img
              className="h-14 w-14 rounded-md bg-surface-elevated"
              src={imgUrl}
              alt=""
            />
          </Link>
        ) : (
          <img
            className="h-14 w-14 shrink-0 rounded-md bg-surface-elevated"
            src={imgUrl}
            alt=""
          />
        )}
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-row items-center gap-2">
            <h1 className="t-h2 min-w-0 truncate">
              {profilePath ? (
                <Link
                  to={profilePath}
                  className="block truncate transition-colors hover:text-accent"
                >
                  {name}
                </Link>
              ) : (
                name
              )}
            </h1>
            {favoriteTarget && <FavoriteButton favorite={favoriteTarget} />}
          </div>
          {stats}
        </div>
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
};

export default StatsOverviewHeader;
