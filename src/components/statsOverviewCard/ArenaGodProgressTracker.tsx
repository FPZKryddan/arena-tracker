const ARENA_GOD_REQUIRED_STAGE_THREE_CHAMPIONS = 60;

type ArenaGodProgressTrackerProps = {
  completedChampions: number;
  totalChampions: number;
};

const ArenaGodProgressTracker = ({
  completedChampions,
  totalChampions,
}: ArenaGodProgressTrackerProps) => {
  const hasArenaGod =
    completedChampions >= ARENA_GOD_REQUIRED_STAGE_THREE_CHAMPIONS;
  const target = hasArenaGod
    ? Math.max(totalChampions, completedChampions)
    : ARENA_GOD_REQUIRED_STAGE_THREE_CHAMPIONS;
  const cappedCompleted = Math.min(completedChampions, target);
  const progressPercent = target > 0 ? (cappedCompleted / target) * 100 : 0;
  const title = hasArenaGod ? "Arena Master" : "Arena God";

  return (
    <div className="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-surface-elevated/55 px-2 py-1 text-fg">
      <div
        className="grid h-6 w-6 shrink-0 place-items-center rounded"
        style={{
          background: `conic-gradient(var(--color-success) 0 ${progressPercent}%, var(--color-border) ${progressPercent}% 100%)`,
        }}
        aria-label={`${Math.round(progressPercent)}% complete`}
      >
        <div className="h-4 w-4 rounded-sm bg-surface" />
      </div>
      <div className="flex min-w-0 items-baseline gap-1.5">
        <span className="truncate text-[11px] font-semibold text-fg-muted">
          {title}
        </span>
        <span className="shrink-0 text-[11px] font-bold text-success">
          {cappedCompleted}/{target}
        </span>
      </div>
    </div>
  );
};

export default ArenaGodProgressTracker;
