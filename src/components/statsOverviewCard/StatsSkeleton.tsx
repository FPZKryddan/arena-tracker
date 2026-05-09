type StatsSkeletonProps = {
  standalone?: boolean;
};

const StatsSkeleton = ({ standalone }: StatsSkeletonProps) => {
  return (
    <div
      className={`${
        standalone
          ? "bg-surface shadow-2xl p-[8px] md:p-[32px]"
          : "bg-transparent shadow-none"
      } flex flex-col grow-0 w-full h-fit rounded-xl gap-[24px] animate-pulse`}
    >
      <div className="flex flex-row items-center gap-4">
        <div className="w-12 h-12 bg-border rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="w-40 max-w-full h-4 bg-border rounded" />
          <div className="flex flex-wrap gap-2">
            <div className="w-10 h-3 bg-border rounded" />
            <div className="w-10 h-3 bg-border rounded" />
            <div className="w-10 h-3 bg-border rounded" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="w-32 h-4 bg-border rounded" />
        <div className="w-full h-3 bg-border rounded" />
        <div className="w-32 h-4 bg-border rounded" />
        <div className="w-full h-3 bg-border rounded" />
      </div>

      <div className="flex flex-col gap-2">
        <div className="w-32 h-4 bg-border rounded" />
        <div className="flex flex-row gap-4 mt-2 justify-between overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={`augment-stat-skeleton-${i}`}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-10 h-10 bg-border rounded-full" />
              <div className="w-4 h-3 bg-border rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-4 text-sm">
          <div className="w-20 h-3 bg-border rounded" />
          <div className="w-24 h-3 bg-border rounded" />
          <div className="w-24 h-3 bg-border rounded" />
        </div>

        <div className="h-[150px] w-full flex items-end gap-1 justify-around">
          {[...Array(8)].map((_, i) => (
            <div
              key={`bar-skeleton-${i}`}
              className="w-6 bg-border rounded"
              style={{ height: `${75 + (i % 2) * 50}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsSkeleton;
