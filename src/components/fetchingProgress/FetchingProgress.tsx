import { ClipLoader } from "react-spinners";
import type { JobPhase, JobState } from "../../types";

interface FetchingProgressProps {
  isFetching: boolean;
  jobState: JobState | null;
}

const PHASE_LABELS: Record<JobPhase, string> = {
  puuid: "Looking up player",
  matchlist: "Fetching match history",
  matches: "Loading matches",
  summoner: "Getting summoner profile",
  persisting: "Saving stats",
};

const FetchingProgress = ({ isFetching, jobState }: FetchingProgressProps) => {
  if (!isFetching) return null;

  const label = jobState?.phase
    ? PHASE_LABELS[jobState.phase]
    : jobState?.status === "queued"
    ? "Queued search"
    : "Starting search";

  const progress = jobState?.progress;
  const pct =
    progress && progress.total > 0
      ? Math.min(100, Math.round((progress.current / progress.total) * 100))
      : null;

  return (
    <div className="mt-2 flex w-full flex-col gap-1.5 rounded-lg border border-border bg-surface px-4 py-2.5">
      <div className="flex flex-row items-center gap-2">
        <ClipLoader size={14} color="var(--color-info)" />
        <p className="text-xs text-fg">
          {label}
          {progress ? ` (${progress.current}/${progress.total})` : ""}
        </p>
      </div>
      {pct !== null && (
        <div className="h-1 w-full overflow-hidden rounded-sm bg-border">
          <div
            className="h-full bg-info transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default FetchingProgress;
