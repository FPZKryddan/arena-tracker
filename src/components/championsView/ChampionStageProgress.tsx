import { HiMiniCheckCircle } from "react-icons/hi2";

type ChampionStageProgressProps = {
  stage: number;
  completedThreshold?: number;
};

const ChampionStageProgress = ({
  stage,
  completedThreshold = 3,
}: ChampionStageProgressProps) => {
  if (stage < completedThreshold) return null;

  return (
    <HiMiniCheckCircle
      aria-label="Stage 3 complete"
      className="h-full w-full text-success drop-shadow-[0_0_4px_rgba(74,222,128,0.55)]"
    />
  );
};

export default ChampionStageProgress;
