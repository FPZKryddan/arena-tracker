type StatsSkeletonProps = {
  standalone?: boolean;
  showTeammates?: boolean;
};

const BAR_HEIGHTS = [72, 104, 132, 92, 116, 150, 126, 176];

const StatsSkeleton = ({
  standalone,
  showTeammates = true,
}: StatsSkeletonProps) => {
  return (
    <div
      className={`${
        standalone
          ? "border border-border bg-surface p-[8px] md:p-[24px]"
          : "bg-transparent"
      } flex h-fit w-full grow-0 animate-pulse flex-col gap-[24px] rounded-lg`}
      aria-label="Loading stats overview"
    >
      <StatsHeaderSkeleton />

      <DamageStatsSkeleton />

      <div className="border-t border-border/70 pt-[16px]">
        <FavoriteAugmentsSkeleton />
      </div>

      <div className="border-t border-border/70 pt-[16px]">
        <PlacementsSkeleton />
      </div>

      {showTeammates && (
        <div className="border-t border-border/70 pt-[16px]">
          <TeammatesSkeleton />
        </div>
      )}
    </div>
  );
};

const StatsHeaderSkeleton = () => (
  <div className="flex flex-row flex-wrap items-center justify-between gap-3">
    <div className="flex min-w-0 flex-row items-center gap-[8px]">
      <div className="h-[55px] w-[55px] shrink-0 rounded-md bg-border" />
      <div className="flex min-w-0 flex-col gap-[7px]">
        <div className="flex flex-row items-center gap-2">
          <div className="h-[18px] w-[152px] max-w-[52vw] rounded bg-border" />
          <div className="h-[22px] w-[22px] rounded-md bg-border/75" />
        </div>
        <div className="flex flex-row flex-wrap gap-x-[16px] gap-y-[5px]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`kda-stat-skeleton-${i}`}
              className="flex flex-row items-center gap-[4px]"
            >
              {i < 3 && <div className="h-[12px] w-[12px] rounded bg-border/80" />}
              <div
                className={`h-[12px] rounded bg-border/75 ${
                  i === 3 ? "w-[58px]" : "w-[34px]"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="hidden h-[34px] w-[126px] shrink-0 rounded-md border border-border bg-surface-elevated/55 px-2 py-1 sm:block">
      <div className="mb-[6px] h-[10px] w-[74px] rounded bg-border/80" />
      <div className="h-[6px] w-full rounded bg-border/70" />
    </div>
  </div>
);

const DamageStatsSkeleton = () => (
  <div className="flex w-full flex-col gap-[8px]">
    {["dealt", "taken"].map((type) => (
      <div key={`damage-${type}-skeleton`} className="flex flex-col">
        <div className="flex flex-row flex-wrap items-center justify-between gap-x-[8px] gap-y-[2px]">
          <div className="flex flex-row items-center gap-[4px]">
            <div className="h-[12px] w-[12px] rounded bg-border" />
            <div className="h-[12px] w-[96px] rounded bg-border" />
            <div className="h-[14px] w-[14px] rounded bg-border/70" />
          </div>
          <div className="h-[12px] w-[58px] rounded bg-border" />
        </div>
        <div className="mt-[3px] flex h-[10px] w-full flex-row overflow-hidden rounded bg-border/60">
          <div className="h-full w-[54%] bg-border" />
          <div className="h-full w-[31%] bg-border/75" />
          <div className="h-full flex-1 bg-border/50" />
        </div>
      </div>
    ))}
    <div className="flex flex-row flex-wrap gap-x-[10px] gap-y-[4px]">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={`damage-legend-skeleton-${i}`}
          className="flex flex-row items-center gap-[4px]"
        >
          <div className="h-[7px] w-[7px] rounded-full bg-border" />
          <div className="h-[10px] w-[44px] rounded bg-border/70" />
        </div>
      ))}
    </div>
    <div className="flex flex-row flex-wrap gap-x-[16px] gap-y-[4px]">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={`simple-stat-skeleton-${i}`}
          className="flex flex-row items-center gap-[4px]"
        >
          <div className="h-[12px] w-[42px] rounded bg-border" />
          <div className="h-[12px] w-[12px] rounded bg-border/80" />
          <div className="h-[14px] w-[14px] rounded bg-border/70" />
        </div>
      ))}
    </div>
  </div>
);

const FavoriteAugmentsSkeleton = () => (
  <div className="flex w-full flex-col gap-[10px]">
    <div className="flex flex-row items-center justify-between gap-[8px]">
      <div className="h-[14px] w-[118px] rounded bg-border" />
      <div className="h-[12px] w-[48px] rounded bg-border/70" />
    </div>
    <div className="grid grid-cols-[repeat(auto-fit,minmax(132px,1fr))] gap-[8px]">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`favorite-augment-skeleton-${i}`}
          className="rounded-md border border-border bg-surface/70 p-[8px]"
        >
          <div className="flex min-w-0 flex-row items-center gap-[8px]">
            <div className="h-[12px] w-[22px] shrink-0 rounded bg-border/70" />
            <div className="h-[32px] w-[32px] shrink-0 rounded-md border border-border bg-border" />
            <div className="min-w-0 flex-1">
              <div className="h-[12px] w-full rounded bg-border" />
              <div className="mt-[6px] h-[11px] w-[54px] rounded bg-border/70" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PlacementsSkeleton = () => (
  <div className="flex flex-col gap-[8px]">
    <div className="flex flex-row flex-wrap items-center justify-between gap-[8px]">
      <div className="flex min-w-[112px] flex-col rounded-md bg-border/45 px-[10px] py-[8px]">
        <div className="h-[10px] w-[58px] rounded bg-border" />
        <div className="mt-[8px] h-[28px] w-[72px] rounded bg-border" />
      </div>
      <div className="flex flex-1 flex-row flex-wrap justify-start gap-x-[10px] gap-y-[4px] sm:justify-end">
        <div className="h-[12px] w-[78px] rounded bg-border/75" />
        <div className="h-[12px] w-[96px] rounded bg-border/75" />
      </div>
    </div>
    <div className="relative h-[200px] w-full overflow-hidden">
      {[0, 1, 2, 3].map((line) => (
        <div
          key={`placement-grid-skeleton-${line}`}
          className="absolute left-0 right-0 h-px bg-border/40"
          style={{ top: `${20 + line * 20}%` }}
        />
      ))}
      <div className="absolute inset-x-0 bottom-[24px] flex h-[160px] items-end justify-around gap-[6px] px-[6px]">
        {BAR_HEIGHTS.map((height, i) => (
          <div
            key={`placement-bar-skeleton-${i}`}
            className="w-[10%] max-w-[32px] rounded-t bg-border"
            style={{ height }}
          />
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 flex justify-around gap-[6px] px-[6px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`placement-label-skeleton-${i}`}
            className="h-[10px] w-[22px] rounded bg-border/65"
          />
        ))}
      </div>
    </div>
  </div>
);

const TeammatesSkeleton = () => (
  <div className="flex flex-col gap-[8px]">
    <div className="h-[17px] w-[136px] rounded bg-border" />
    <ul className="flex flex-col gap-[4px]">
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={`teammate-skeleton-${i}`}
          className="flex flex-row items-center gap-[8px] rounded-md p-[6px]"
        >
          <div className="h-[36px] w-[36px] shrink-0 rounded-full bg-border" />
          <div className="flex min-w-0 grow flex-col gap-[5px]">
            <div className="h-[12px] w-[132px] max-w-full rounded bg-border" />
            <div className="h-[10px] w-[72px] rounded bg-border/70" />
          </div>
          <div className="h-[16px] w-[38px] shrink-0 rounded bg-border" />
        </li>
      ))}
    </ul>
  </div>
);

export default StatsSkeleton;
