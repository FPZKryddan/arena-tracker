import { HiMiniCheckCircle } from "react-icons/hi2";

type ChampionStageProgressProps = {
  stage: number;
  completedThreshold?: number;
};

const ChampionStageProgress = ({
  stage,
  completedThreshold = 3,
}: ChampionStageProgressProps) => {
  if (stage >= completedThreshold) {
    return (
      <div className="flex items-center h-full">
        <HiMiniCheckCircle className="h-full w-auto aspect-square text-green-500 drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-row h-full gap-0.5 -skew-x-16">
      <div
        className={`rounded-l-2xl h-full w-auto aspect-square ${
          stage > 0 ? "bg-accent" : "bg-border"
        }`}
      ></div>
      <div
        className={`h-full w-auto aspect-square ${
          stage > 1 ? "bg-accent" : "bg-border"
        }`}
      ></div>
      <div
        className={`rounded-r-2xl h-full w-auto aspect-square ${
          stage > 2 ? "bg-accent" : "bg-border"
        }`}
      ></div>
    </div>
  );
};

export default ChampionStageProgress;
