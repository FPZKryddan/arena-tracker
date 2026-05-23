import { useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { IoRefresh } from "react-icons/io5";
import ChampionList from "../components/championsView/ChampionList";
import MatchHistoryList from "../components/matchHistory";
import ChampionMatchTabs from "./ChampionMatchTabs";
import ArenaModeSelector from "../components/arenaModeSelector";
import StatsOverviewCard from "../components/statsOverviewCard";
import StatsSkeleton from "../components/statsOverviewCard/StatsSkeleton";
import SummonerInput from "../components/summonerInput";
import { PlayerStatsContext } from "../contexts/PlayerStatsContext";
import useContextIfDefined from "../hooks/useContextIfDefined";
import usePlayerHydration from "../hooks/usePlayerHydration";
import useProfileLookup from "../hooks/useProfileLookup";
import type { ArenaModeSelection, Regions } from "../types";
import {
  DEFAULT_ARENA_MODE,
  parseArenaMode,
} from "../utils/arenaModes";

const ProfilePage = () => {
  const { playerStats } = useContextIfDefined(PlayerStatsContext);
  const params = useParams<{ region: string; gameName: string; tagLine: string }>();
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
    region ?? undefined
  );
  const canUpdateProfile =
    !!region && !!gameName && !!tagLine && !routeProgress.isFetching;
  const pendingMatchesCount = profile?.tracked
    ? profile.nonProcessedMatchesCount ?? 0
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
    [setSearchParams]
  );

  return (
    <div
      className="box-border flex min-h-dvh w-full flex-col gap-5 bg-bg p-3 text-fg md:gap-7 md:p-6"
    >
      <div className="flex w-full flex-col gap-2 self-center md:max-w-sm lg:max-w-2xl">
        <div className="flex w-full flex-row items-start gap-3">
          <div className="flex-1 min-w-0">
            <SummonerInput
              routeProgress={routeProgress}
              arenaMode={arenaMode}
            />
          </div>
          <button
            type="button"
            onClick={handleUpdateProfile}
            disabled={!canUpdateProfile}
            aria-label={
              pendingMatchesCount > 0
                ? `Update profile, ${pendingMatchesLabel}`
                : "Fetch new games played"
            }
            title={
              pendingMatchesCount > 0
                ? `Update profile, ${pendingMatchesLabel}`
                : "Fetch new games played"
            }
            className="relative flex h-11 shrink-0 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-fg transition-colors hover:cursor-pointer hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IoRefresh
              className={`h-4 w-4 ${routeProgress.isFetching ? "animate-spin" : ""}`}
              aria-hidden
            />
            <span>Update</span>
            {pendingMatchesCount > 0 && (
              <span className="min-w-5 rounded-full bg-accent px-1.5 py-0.5 text-center text-xs font-semibold leading-none text-bg tabular-nums">
                {pendingMatchesCount}
              </span>
            )}
          </button>
        </div>
        <ArenaModeSelector
          value={arenaMode}
          onChange={handleArenaModeChange}
        />
        {pendingMatchesCount > 0 && !routeProgress.isFetching && (
          <p className="self-end pr-1 text-xs font-medium text-fg-muted">
            <span className="text-accent tabular-nums">
              {pendingMatchesCount}
            </span>{" "}
            {pendingMatchesCount === 1 ? "game" : "games"} waiting to process
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="hidden xl:flex xl:w-1/4 h-full order-1">
          <MatchHistoryList arenaMode={arenaMode} />
        </div>
        <div className="w-full md:w-1/2 xl:w-2/4 h-full order-2 md:order-1 xl:order-2">
          <div className="hidden xl:block">
            <ChampionList />
          </div>
          <div className="block xl:hidden">
            <ChampionMatchTabs arenaMode={arenaMode} />
          </div>
        </div>
        <div className="w-full md:hidden h-full order-1">
          {playerStats !== null ? (
            <StatsOverviewCard stats={playerStats} arenaMode={arenaMode} />
          ) : (
            <StatsSkeleton />
          )}
        </div>
        <div className="hidden md:flex md:w-1/2 xl:w-1/4 h-full md:order-2 xl:order-3">
          {playerStats !== null ? (
            <StatsOverviewCard
              stats={playerStats}
              standalone
              arenaMode={arenaMode}
            />
          ) : (
            <StatsSkeleton standalone />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
