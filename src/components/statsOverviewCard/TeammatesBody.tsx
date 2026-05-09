import { useMemo, useState } from "react";
import type { teammateStatDto, teammateStatsDto } from "../../types";
import BottomSheet from "../common/BottomSheet";
import TeammateDetailCard from "./TeammateDetailCard";
import useProfileLookup from "../../hooks/useProfileLookup";
import useDdragonVersion from "../../hooks/useDdragonVersion";

interface TeammatesBodyProps {
  teammateStats: teammateStatsDto;
}

const FREQUENT_TEAMMATES_LIMIT = 6;

const getAvgColor = (avg: number): string => {
  if (avg >= 8) return "text-fg";
  if (avg >= 5) return "text-danger";
  if (avg >= 3) return "text-info";
  return "text-warning";
};

const TeammatesBody = ({ teammateStats }: TeammatesBodyProps) => {
  const [selected, setSelected] = useState<teammateStatDto>();
  const [bottomSheetIsOpen, setBottomSheetIsOpen] = useState<boolean>(false);

  const teammates = useMemo<teammateStatDto[]>(() => {
    return Object.values(teammateStats)
      .filter((t) => t.gamesPlayed >= 3)
      .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
      .slice(0, FREQUENT_TEAMMATES_LIMIT);
  }, [teammateStats]);

  if (teammates.length === 0) return null;

  return (
    <div className="flex flex-col gap-[8px]">
      <p className="text-[14px] font-bold">Frequent Teammates</p>
      <ul className="flex flex-col gap-[4px]">
        {teammates.map((teammate) => (
          <TeammateRow
            key={`${teammate.gameName}#${teammate.tagLine}`}
            teammate={teammate}
            onSelect={() => {
              setSelected(teammate);
              setBottomSheetIsOpen(true);
            }}
          />
        ))}
      </ul>
      <BottomSheet
        isOpen={bottomSheetIsOpen}
        closeCallback={() => setBottomSheetIsOpen(false)}
      >
        {selected ? <TeammateDetailCard teammate={selected} /> : <></>}
      </BottomSheet>
    </div>
  );
};

interface TeammateRowProps {
  teammate: teammateStatDto;
  onSelect: () => void;
}

const TeammateRow = ({ teammate, onSelect }: TeammateRowProps) => {
  const { profile } = useProfileLookup(teammate.gameName, teammate.tagLine);
  const version = useDdragonVersion();
  const initial = teammate.gameName.trim().charAt(0).toUpperCase() || "?";

  return (
    <li
      className="flex flex-row items-center gap-[8px] p-[6px] rounded-md hover:cursor-pointer hover:bg-surface-hover"
      onClick={onSelect}
    >
      <div className="h-[36px] w-[36px] aspect-square rounded-full overflow-hidden bg-surface-elevated text-fg flex items-center justify-center text-[14px] font-bold shrink-0">
        {profile ? (
          <img
            src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${profile.profileIconId}.png`}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          initial
        )}
      </div>
      <div className="flex flex-col grow min-w-0">
        <p className="text-[12px] font-medium truncate">
          {teammate.gameName}
          <span className="opacity-60">#{teammate.tagLine}</span>
        </p>
        <p className="text-[10px] opacity-70">
          {profile ? `Lv. ${profile.summonerLevel} \u2022 ` : ""}
          {teammate.gamesPlayed} games
        </p>
      </div>
      <p
        className={`text-[14px] font-bold tabular-nums ${getAvgColor(
          teammate.placementAvg
        )}`}
      >
        {(Math.ceil(teammate.placementAvg * 100) / 100).toFixed(2)}
      </p>
    </li>
  );
};

export default TeammatesBody;
