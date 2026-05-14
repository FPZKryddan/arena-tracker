import ProgressTracker from "./ProgressTracker";

interface ProgressProps {
  total: number;
  played: number;
  top4: number;
  won: number;
}

const Progress = ({ total, played, top4, won }: ProgressProps) => {
    // const percent: number = Math.floor((played+top4*2+won*3) / (total*3) * 100);

  return (
    <div className="flex flex-col w-full col-span-2 items-center gap-2">
      <div className="flex h-5 w-full shrink-0 flex-row overflow-hidden rounded-sm bg-border">
        <ProgressTracker
          current={played}
          total={total}
          totalWidth={350}
          tracking={"played"}
        ></ProgressTracker>
        <ProgressTracker
          current={top4}
          total={total}
          totalWidth={350}
          tracking={"top-4"}
        ></ProgressTracker>
        <ProgressTracker
          current={won}
          total={total}
          totalWidth={350}
          tracking={"victory"}
        ></ProgressTracker>
        <ProgressTracker
          current={total-(played+top4+won)}
          total={total}
          totalWidth={350}
          tracking={"none"}
        ></ProgressTracker>
      </div>
    </div>
  );
};

export default Progress;
