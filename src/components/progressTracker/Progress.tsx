import ProgressTracker from "./ProgressTracker";

interface ProgressProps {
  total: number;
  played: number;
  top4: number;
  won: number;
}

const Progress = ({ total, played, top4, won }: ProgressProps) => {
  return (
    <div className="flex flex-col w-full lg:w-1/2 items-center gap-2">
      <h1 className="text-white text-xl font-bold">Progress</h1>
      <div className="w-full h-[25px] bg-amber-50 flex flex-row shrink-0 overflow-visible">
        <ProgressTracker
          current={played}
          total={total}
          tracking={"played"}
        ></ProgressTracker>
        <ProgressTracker
          current={top4}
          total={total}
          tracking={"top-4"}
        ></ProgressTracker>
        <ProgressTracker
          current={won}
          total={total}
          tracking={"victory"}
        ></ProgressTracker>
      </div>
    </div>
  );
};

export default Progress;
