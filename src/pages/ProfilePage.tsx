import { useParams } from "react-router-dom";
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

  return (
    <div
      className="box-border flex h-dvh w-full flex-col gap-[20px] overflow-auto bg-bg p-[12px] text-fg md:gap-[28px] md:p-[24px]"
    >
      <AppHeader comparePath={comparePath} />

      <div className="flex w-full flex-row items-start gap-3 self-center md:w-[400px] lg:w-[600px]">
        <div className="flex-1 min-w-0">
          <SummonerInput routeProgress={routeProgress} />
        </div>
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
