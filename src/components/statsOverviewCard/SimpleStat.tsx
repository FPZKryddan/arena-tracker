import { type JSX } from "react";
import Tooltip from "../Tooltip/Tooltip";
import type { numericalStatsDto } from "../../types";
import useFormatter from "../../hooks/useFormatter";
import RecordMatchButton from "../matchDetail/RecordMatchButton";
import {
  formatAveragePerMatch,
  getAveragePerMatch,
  getAveragePerMatchLabel,
} from "./statAverages";

interface SimpleStatProps {
  icon: JSX.Element;
  label: string;
  recordLabel: string;
  stat: numericalStatsDto;
  matchCount: number;
}

const SimpleStat = ({
  icon,
  label,
  recordLabel,
  stat,
  matchCount,
}: SimpleStatProps) => {
  const { formatNumber } = useFormatter();
  const average = formatAveragePerMatch(
    getAveragePerMatch(stat.value, matchCount),
  );

  return (
    <div className="flex flex-row gap-1 items-center">
      <div className="flex flex-row items-baseline gap-1">
        <p className="text-xs font-normal">{formatNumber(stat.value)}</p>
        <p className="text-[0.65rem] font-medium text-fg-muted tabular-nums">
          {average}/game
        </p>
      </div>
      <Tooltip
        text={label}
        extra={`Highest ${recordLabel}: ${formatNumber(
          stat.records[0]?.value,
        )} | ${getAveragePerMatchLabel(stat.value, matchCount)}`}
      >
        {icon}
      </Tooltip>
      <RecordMatchButton
        matchId={stat.records[0]?.matchId}
        label={`View highest ${recordLabel} match`}
      />
    </div>
  );
};

export default SimpleStat;
