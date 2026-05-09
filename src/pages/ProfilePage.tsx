import { Link, useParams } from "react-router-dom";
import { IoFlash } from "react-icons/io5";
import ChampionList from "../components/championsView/ChampionList";
import MatchHistoryList from "../components/matchHistory";
import ChampionMatchTabs from "./ChampionMatchTabs";
import StatsOverviewCard from "../components/statsOverviewCard";
import StatsSkeleton from "../components/statsOverviewCard/StatsSkeleton";
import SummonerInput from "../components/summonerInput";
import ThemeToggle from "../components/themeToggle";
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

  usePlayerHydration({ region, gameName, tagLine });

  return (
    <div
      className="flex w-full h-dvh box-border bg-bg overflow-auto gap-[24px] md:gap-[48px]
    flex-col p-[12px]
    md:p-[32px]
    "
    >
      <header className="flex items-center justify-between w-full">
        <Link
          to="/"
          className="flex items-center gap-2 text-fg hover:text-accent transition-colors group"
          aria-label="Back to home"
        >
          <IoFlash className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
          <span className="font-extrabold text-base md:text-lg tracking-tight">
            Arena Tracker
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <div className="flex flex-row items-start gap-3 w-full md:w-[400px] lg:w-[600px] self-center">
        <div className="flex-1 min-w-0">
          <SummonerInput />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-[16px]">
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
