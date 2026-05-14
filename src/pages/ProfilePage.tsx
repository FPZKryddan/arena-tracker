import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { IoAlertCircle, IoRefresh } from "react-icons/io5";
import AppHeader from "../components/appHeader";
import ChampionList from "../components/championsView/ChampionList";
import MatchHistoryList from "../components/matchHistory";
import ChampionMatchTabs from "./ChampionMatchTabs";
import StatsOverviewCard from "../components/statsOverviewCard";
import StatsSkeleton from "../components/statsOverviewCard/StatsSkeleton";
import SummonerInput from "../components/summonerInput";
import { PlayerStatsContext } from "../contexts/PlayerStatsContext";
import useContextIfDefined from "../hooks/useContextIfDefined";
import usePlayerHydration from "../hooks/usePlayerHydration";
import useProfileLookup from "../hooks/useProfileLookup";
import type { Regions } from "../types";

const ProfilePage = () => {
  const { playerStats } = useContextIfDefined(PlayerStatsContext);
  const params = useParams<{ region: string; gameName: string; tagLine: string }>();
  const region = (params.region ?? null) as Exclude<Regions, null> | null;
  const gameName = params.gameName ?? null;
  const tagLine = params.tagLine ?? null;
  const comparePath =
    region && gameName && tagLine
      ? `/compare?${new URLSearchParams({
          p: [
            region,
            encodeURIComponent(gameName),
            encodeURIComponent(tagLine),
          ].join("|"),
        }).toString()}`
      : "/compare";

  const routeProgress = usePlayerHydration({ region, gameName, tagLine });
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
      ? "1 unprocessed game"
      : `${pendingMatchesCount} unprocessed games`;
  const showPendingMatchesPrompt =
    pendingMatchesCount > 0 && !routeProgress.isFetching;
  const handleUpdateProfile = useCallback(async () => {
    await routeProgress.refreshProfile();
    void refetchProfileLookup();
  }, [refetchProfileLookup, routeProgress]);

  return (
    <div
      className="box-border flex h-dvh w-full flex-col gap-[20px] overflow-auto bg-bg p-[12px] text-fg md:gap-[28px] md:p-[24px]"
    >
      <AppHeader comparePath={comparePath} />

      <div className="flex w-full flex-col gap-2 self-center md:w-[400px] lg:w-[600px]">
        <div className="flex w-full flex-row items-start gap-3">
          <div className="flex-1 min-w-0">
            <SummonerInput routeProgress={routeProgress} />
          </div>
          <button
            type="button"
            onClick={handleUpdateProfile}
            disabled={!canUpdateProfile}
            aria-label={
              pendingMatchesCount > 0
                ? `Process ${pendingMatchesLabel}`
                : "Fetch new games played"
            }
            title={
              pendingMatchesCount > 0
                ? `Process ${pendingMatchesLabel}`
                : "Fetch new games played"
            }
            className={`relative flex h-[44px] shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
              pendingMatchesCount > 0
                ? "border-warning/60 bg-warning/10 text-warning hover:bg-warning/15"
                : "border-border bg-surface text-fg hover:bg-surface-hover"
            }`}
          >
            <IoRefresh
              className={`h-4 w-4 ${routeProgress.isFetching ? "animate-spin" : ""}`}
              aria-hidden
            />
            <span>Update</span>
            {pendingMatchesCount > 0 && (
              <span className="rounded-full bg-warning px-1.5 py-0.5 text-[10px] font-bold leading-none text-warning-fg tabular-nums">
                {pendingMatchesCount}
              </span>
            )}
          </button>
        </div>
        {showPendingMatchesPrompt && (
          <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-fg">
            <IoAlertCircle className="h-4 w-4 shrink-0 text-warning" aria-hidden />
            <p className="min-w-0">
              <span className="font-semibold text-warning">
                {pendingMatchesLabel}
              </span>{" "}
              ready to add to this profile.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-[16px] md:flex-row">
        <div className="hidden xl:flex xl:w-1/4 h-full order-1">
          <MatchHistoryList />
        </div>
        <div className="w-full md:w-1/2 xl:w-2/4 h-full order-2 md:order-1 xl:order-2">
          <div className="hidden xl:block">
            <ChampionList />
          </div>
          <div className="block xl:hidden">
            <ChampionMatchTabs />
          </div>
        </div>
        <div className="w-full md:hidden h-full order-1">
          {playerStats !== null ? (
            <StatsOverviewCard stats={playerStats} />
          ) : (
            <StatsSkeleton />
          )}
        </div>
        <div className="hidden md:flex md:w-1/2 xl:w-1/4 h-full md:order-2 xl:order-3">
          {playerStats !== null ? (
            <StatsOverviewCard stats={playerStats} standalone />
          ) : (
            <StatsSkeleton standalone />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
