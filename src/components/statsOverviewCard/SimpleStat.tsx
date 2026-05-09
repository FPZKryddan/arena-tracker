import { type JSX } from "react";
import Tooltip from "../Tooltip/Tooltip";
import type { numericalStatsDto } from "../../types";
import useFormatter from "../../hooks/useFormatter";
import RecordMatchButton from "../matchDetail/RecordMatchButton";

interface SimpleStatProps {
  icon: JSX.Element;
  label: string;
  recordLabel: string;
  stat: numericalStatsDto;
}

const SimpleStat = ({ icon, label, recordLabel, stat }: SimpleStatProps) => {
  const { formatNumber } = useFormatter();
  return (
    <div className="flex flex-row gap-[4px] items-center">
      <p className="text-[12px] font-normal">{formatNumber(stat.value)}</p>
      <Tooltip
        text={label}
        extra={`Highest ${recordLabel}: ` + formatNumber(stat.records[0]?.value)}
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
