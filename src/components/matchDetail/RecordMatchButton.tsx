import { useState } from "react";
import { HiMiniArrowTopRightOnSquare } from "react-icons/hi2";
import { PlayerStatsContext } from "../../contexts/PlayerStatsContext";
import useContextIfDefined from "../../hooks/useContextIfDefined";
import MatchDetailModal from "./MatchDetailModal";

interface RecordMatchButtonProps {
  matchId?: string;
  label?: string;
}

const RecordMatchButton = ({ matchId, label }: RecordMatchButtonProps) => {
  const [open, setOpen] = useState(false);
  const { playerStats, loadedProfile } = useContextIfDefined(PlayerStatsContext);

  if (!matchId) return null;

  return (
    <>
      <button
        type="button"
        title={label ?? "Open match"}
        className="opacity-50 hover:opacity-100 hover:cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <HiMiniArrowTopRightOnSquare className="text-xs" />
      </button>
      <MatchDetailModal
        matchId={matchId}
        isOpen={open}
        onClose={() => setOpen(false)}
        highlightPuuid={playerStats?.puuid}
        region={loadedProfile?.region}
      />
    </>
  );
};

export default RecordMatchButton;
