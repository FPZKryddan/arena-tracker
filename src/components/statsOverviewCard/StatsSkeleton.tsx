type StatsSkeletonProps = {
  standalone?: boolean;
  showTeammates?: boolean;
  showHeader?: boolean;
};

const BAR_HEIGHTS = [72, 104, 132, 92, 116, 150, 126, 176];

const StatsSkeleton = ({
  standalone,
  showTeammates = true,
  showHeader = true,
}: StatsSkeletonProps) => {
  return (
    <div
      className={`${
        standalone
          ? "border border-border bg-surface p-2 md:p-6"
          : "bg-transparent"
      } flex h-fit w-full grow-0 animate-pulse flex-col gap-6 rounded-lg`}
      aria-label="Loading stats overview"
    >
      {showHeader && <StatsHeaderSkeleton />}

      <div className="order-2 md:order-none">
        <DamageStatsSkeleton />
      </div>

      <div className="order-3 border-t border-border/70 pt-4 md:order-none">
        <FavoriteAugmentsSkeleton />
      </div>

      <div className="order-4 border-t border-border/70 pt-4 md:order-none">
        <PlacementsSkeleton />
      </div>

      {showTeammates && (
        <div className="order-last border-t border-border/70 pt-4 md:order-none">
          <TeammatesSkeleton />
        </div>
      )}
    </div>
  );
};

const StatsHeaderSkeleton = () => (
  <div className="flex flex-row flex-wrap items-center justify-between gap-3">
    <div className="flex min-w-0 flex-row items-center gap-2">
      <div className="h-14 w-14 shrink-0 rounded-md bg-border" />
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-row items-center gap-2">
          <div className="h-4 w-36 max-w-[52vw] rounded-sm bg-border" />
          <div className="h-5 w-5 rounded-md bg-border/75" />
        </div>
        <div className="flex flex-row flex-wrap gap-x-4 gap-y-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`kda-stat-skeleton-${i}`}
              className="flex flex-row items-center gap-1"
            >
              {i < 3 && <div className="h-3 w-3 rounded-sm bg-border/80" />}
              <div
                className={`h-3 rounded-sm bg-border/75 ${
                  i === 3 ? "w-14" : "w-8"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="hidden h-8 w-32 shrink-0 rounded-md border border-border bg-surface-elevated/55 px-2 py-1 sm:block">
      <div className="mb-1.5 h-2.5 w-20 rounded-sm bg-border/80" />
      <div className="h-1.5 w-full rounded-sm bg-border/70" />
    </div>
  </div>
);

const DamageStatsSkeleton = () => (
  <div className="flex w-full flex-col gap-2">
    {["dealt", "taken"].map((type) => (
      <div key={`damage-${type}-skeleton`} className="flex flex-col">
        <div className="flex flex-row flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
          <div className="flex flex-row items-center gap-1">
            <div className="h-3 w-3 rounded-sm bg-border" />
            <div className="h-3 w-24 rounded-sm bg-border" />
            <div className="h-3.5 w-3.5 rounded-sm bg-border/70" />
          </div>
          <div className="h-3 w-14 rounded-sm bg-border" />
        </div>
        <div className="mt-0.5 flex h-2.5 w-full flex-row overflow-hidden rounded-sm bg-border/60">
          <div className="h-full w-[54%] bg-border" />
          <div className="h-full w-[31%] bg-border/75" />
          <div className="h-full flex-1 bg-border/50" />
        </div>
      </div>
    ))}
    <div className="flex flex-row flex-wrap gap-x-2.5 gap-y-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={`damage-legend-skeleton-${i}`}
          className="flex flex-row items-center gap-1"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-border" />
          <div className="h-2.5 w-11 rounded-sm bg-border/70" />
        </div>
      ))}
    </div>
    <div className="flex flex-row flex-wrap gap-x-4 gap-y-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={`simple-stat-skeleton-${i}`}
          className="flex flex-row items-center gap-1"
        >
          <div className="h-3 w-10 rounded-sm bg-border" />
          <div className="h-3 w-3 rounded-sm bg-border/80" />
          <div className="h-3.5 w-3.5 rounded-sm bg-border/70" />
        </div>
      ))}
    </div>
  </div>
);

const FavoriteAugmentsSkeleton = () => (
  <div className="flex w-full flex-col gap-2.5">
    <div className="flex flex-row items-center justify-between gap-2">
      <div className="h-3.5 w-28 rounded-sm bg-border" />
      <div className="h-3 w-12 rounded-sm bg-border/70" />
    </div>
    <div className="grid grid-cols-[repeat(auto-fit,minmax(8.25rem,1fr))] gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`favorite-augment-skeleton-${i}`}
          className="rounded-md border border-border bg-surface/70 p-2"
        >
          <div className="flex min-w-0 flex-row items-center gap-2">
            <div className="h-3 w-5 shrink-0 rounded-sm bg-border/70" />
            <div className="h-8 w-8 shrink-0 rounded-md border border-border bg-border" />
            <div className="min-w-0 flex-1">
              <div className="h-3 w-full rounded-sm bg-border" />
              <div className="mt-1.5 h-2.5 w-14 rounded-sm bg-border/70" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PlacementsSkeleton = () => (
  <div className="flex flex-col gap-2">
    <div className="flex flex-row flex-wrap items-center justify-between gap-2">
      <div className="flex min-w-28 flex-col rounded-md bg-border/45 px-2.5 py-2">
        <div className="h-2.5 w-14 rounded-sm bg-border" />
        <div className="mt-2 h-7 w-16 rounded-sm bg-border" />
      </div>
      <div className="flex flex-1 flex-row flex-wrap justify-start gap-x-2.5 gap-y-1 sm:justify-end">
        <div className="h-3 w-20 rounded-sm bg-border/75" />
        <div className="h-3 w-24 rounded-sm bg-border/75" />
      </div>
    </div>
    <div className="relative h-48 w-full overflow-hidden">
      {[0, 1, 2, 3].map((line) => (
        <div
          key={`placement-grid-skeleton-${line}`}
          className="absolute left-0 right-0 h-px bg-border/40"
          style={{ top: `${20 + line * 20}%` }}
        />
      ))}
      <div className="absolute inset-x-0 bottom-6 flex h-40 items-end justify-around gap-1.5 px-1.5">
        {BAR_HEIGHTS.map((height, i) => (
          <div
            key={`placement-bar-skeleton-${i}`}
            className="w-[10%] max-w-8 rounded-lg bg-border"
            style={{ height }}
          />
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 flex justify-around gap-1.5 px-1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`placement-label-skeleton-${i}`}
            className="h-2.5 w-5 rounded-sm bg-border/65"
          />
        ))}
      </div>
    </div>
  </div>
);

const TeammatesSkeleton = () => (
  <div className="flex flex-col gap-2">
    <div className="h-4 w-32 rounded-sm bg-border" />
    <ul className="flex flex-col gap-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={`teammate-skeleton-${i}`}
          className="flex flex-row items-center gap-2 rounded-md p-1.5"
        >
          <div className="h-9 w-9 shrink-0 rounded-full bg-border" />
          <div className="flex min-w-0 grow flex-col gap-1">
            <div className="h-3 w-32 max-w-full rounded-sm bg-border" />
            <div className="h-2.5 w-16 rounded-sm bg-border/70" />
          </div>
          <div className="h-4 w-9 shrink-0 rounded-sm bg-border" />
        </li>
      ))}
    </ul>
  </div>
);

export default StatsSkeleton;
