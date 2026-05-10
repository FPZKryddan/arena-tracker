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
      className="h-full w-full text-success"
    />
  );
};

export default ChampionStageProgress;
