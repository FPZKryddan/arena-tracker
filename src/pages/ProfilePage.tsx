import { useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { IoRefresh } from "react-icons/io5";
import ChampionList from "../components/championsView/ChampionList";
import MatchHistoryList from "../components/matchHistory";
import ChampionMatchTabs from "./ChampionMatchTabs";
import ArenaModeSelector from "../components/arenaModeSelector";
import ProfileHeader from "../components/profileHeader";
import StatsOverviewCard from "../components/statsOverviewCard";
import StatsSkeleton from "../components/statsOverviewCard/StatsSkeleton";
import SummonerInput from "../components/summonerInput";
import { PlayerStatsContext } from "../contexts/PlayerStatsContext";
import useContextIfDefined from "../hooks/useContextIfDefined";
import usePlayerHydration from "../hooks/usePlayerHydration";
import useProfileLookup from "../hooks/useProfileLookup";
import type { ArenaModeSelection, PlayerStats, Regions } from "../types";
import { DEFAULT_ARENA_MODE, parseArenaMode } from "../utils/arenaModes";

type RouteProgress = ReturnType<typeof usePlayerHydration>;

const ProfilePage = () => {
  const { playerStats } = useContextIfDefined(PlayerStatsContext);
  const params = useParams<{
    region: string;
    gameName: string;
    tagLine: string;
  }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const region = (params.region ?? null) as Exclude<Regions, null> | null;
  const gameName = params.gameName ?? null;
  const tagLine = params.tagLine ?? null;
  const arenaMode = parseArenaMode(searchParams.get("mode"));

  const routeProgress = usePlayerHydration({
    region,
    gameName,
    tagLine,
    arenaMode,
  });
  const { profile, refetch: refetchProfileLookup } = useProfileLookup(
    gameName ?? undefined,
    tagLine ?? undefined,
    region ?? undefined,
  );
  const canUpdateProfile =
    !!region && !!gameName && !!tagLine && !routeProgress.isFetching;
  const pendingMatchesCount = profile?.tracked
    ? (profile.nonProcessedMatchesCount ?? 0)
    : 0;
  const pendingMatchesLabel =
    pendingMatchesCount === 1
      ? "1 game waiting"
      : `${pendingMatchesCount} games waiting`;
  const handleUpdateProfile = useCallback(async () => {
    await routeProgress.refreshProfile();
    void refetchProfileLookup();
  }, [refetchProfileLookup, routeProgress]);
  const handleArenaModeChange = useCallback(
    (nextMode: ArenaModeSelection) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        if (nextMode === DEFAULT_ARENA_MODE) {
          next.delete("mode");
        } else {
          next.set("mode", nextMode);
        }
        return next;
      });
    },
    [setSearchParams],
  );

  return (
    <main className="box-border flex min-h-dvh w-full flex-col gap-5 bg-bg p-3 text-fg md:gap-7 md:p-6">
      <ProfileHeader
        stats={playerStats}
        profile={profile}
        gameName={gameName}
        tagLine={tagLine}
        region={region}
        actions={
          <ProfileHeaderActions
            routeProgress={routeProgress}
            arenaMode={arenaMode}
            pendingMatchesCount={pendingMatchesCount}
            pendingMatchesLabel={pendingMatchesLabel}
            canUpdateProfile={canUpdateProfile}
            onUpdateProfile={handleUpdateProfile}
            onArenaModeChange={handleArenaModeChange}
          />
        }
      />

      <section
        aria-label="Profile dashboard"
        className="flex flex-col gap-4 md:flex-row"
      >
        <aside
          aria-label="Match history"
          className="order-1 hidden h-full xl:flex xl:w-1/4"
        >
          <ProfileMatchHistory arenaMode={arenaMode} />
        </aside>
        <section
          aria-label="Champions and matches"
          className="order-2 h-full w-full md:order-1 md:w-1/2 xl:order-2 xl:w-2/4"
        >
          <ProfileChampionMatches arenaMode={arenaMode} />
        </section>
        <section
          aria-label="Stats overview"
          className="order-1 h-full w-full md:hidden"
        >
          <ProfileStatsOverview
            playerStats={playerStats}
            arenaMode={arenaMode}
          />
        </section>
        <aside
          aria-label="Stats overview"
          className="hidden h-full md:order-2 md:flex md:w-1/2 xl:order-3 xl:w-1/4"
        >
          <ProfileStatsOverview
            playerStats={playerStats}
            standalone
            arenaMode={arenaMode}
          />
        </aside>
      </section>
    </main>
  );
};

interface ProfileHeaderActionsProps {
  routeProgress: RouteProgress;
  arenaMode: ArenaModeSelection;
  pendingMatchesCount: number;
  pendingMatchesLabel: string;
  canUpdateProfile: boolean;
  onUpdateProfile: () => void | Promise<void>;
  onArenaModeChange: (nextMode: ArenaModeSelection) => void;
}

const ProfileHeaderActions = ({
  routeProgress,
  arenaMode,
  pendingMatchesCount,
  pendingMatchesLabel,
  canUpdateProfile,
  onUpdateProfile,
  onArenaModeChange,
}: ProfileHeaderActionsProps) => (
  <div className="flex w-full flex-col gap-2 sm:w-fit sm:items-end">
    <ArenaModeSelector
      value={arenaMode}
      onChange={onArenaModeChange}
      variant="segmented"
    />
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-start">
      <div className="min-w-0 flex-1 sm:w-64">
        <SummonerInput routeProgress={routeProgress} arenaMode={arenaMode} />
      </div>
      <ProfileUpdateButton
        isFetching={routeProgress.isFetching}
        canUpdateProfile={canUpdateProfile}
        pendingMatchesCount={pendingMatchesCount}
        pendingMatchesLabel={pendingMatchesLabel}
        onUpdateProfile={onUpdateProfile}
      />
    </div>
  </div>
);

interface ProfileUpdateButtonProps {
  isFetching: boolean;
  canUpdateProfile: boolean;
  pendingMatchesCount: number;
  pendingMatchesLabel: string;
  onUpdateProfile: () => void | Promise<void>;
}

const ProfileUpdateButton = ({
  isFetching,
  canUpdateProfile,
  pendingMatchesCount,
  pendingMatchesLabel,
  onUpdateProfile,
}: ProfileUpdateButtonProps) => {
  const updateLabel =
    pendingMatchesCount > 0
      ? `Update profile, ${pendingMatchesLabel}`
      : "Fetch new games played";

  return (
    <button
      type="button"
      onClick={onUpdateProfile}
      disabled={!canUpdateProfile}
      aria-label={updateLabel}
      title={updateLabel}
      className="t-label relative flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-center text-fg transition-colors hover:cursor-pointer hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit"
    >
      Update profile
      <IoRefresh
        className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
        aria-hidden
      />
      {pendingMatchesCount > 0 && (
        <span className="t-stat min-w-5 rounded-full bg-accent px-1.5 py-0.5 text-center text-bg">
          {pendingMatchesCount}
        </span>
      )}
    </button>
  );
};

const ProfileMatchHistory = ({
  arenaMode,
}: {
  arenaMode: ArenaModeSelection;
}) => <MatchHistoryList arenaMode={arenaMode} />;

const ProfileChampionMatches = ({
  arenaMode,
}: {
  arenaMode: ArenaModeSelection;
}) => (
  <div className="mt-3">
    <div className="hidden xl:block">
      <ChampionList />
    </div>
    <div className="block xl:hidden">
      <ChampionMatchTabs arenaMode={arenaMode} />
    </div>
  </div>
);

interface ProfileStatsOverviewProps {
  playerStats: PlayerStats | null;
  arenaMode: ArenaModeSelection;
  standalone?: boolean;
}

const ProfileStatsOverview = ({
  playerStats,
  arenaMode,
  standalone = false,
}: ProfileStatsOverviewProps) => {
  if (playerStats === null) {
    return <StatsSkeleton standalone={standalone} showHeader={false} />;
  }

  return (
    <StatsOverviewCard
      stats={playerStats}
      standalone={standalone}
      showHeader={false}
      arenaMode={arenaMode}
    />
  );
};

export default ProfilePage;
