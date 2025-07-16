import ChampionList from "../components/championsView/ChampionList";
import ProfileHeader from "../components/profileHeader";
import StatsOverviewCard from "../components/statsOverviewCard";
import StatsSkeleton from "../components/statsOverviewCard/StatsSkeleton";
import SummonerInput from "../components/summonerInput";
import { PlayerStatsContext } from "../contexts/PlayerStatsContext";
import useContextIfDefined from "../hooks/useContextIfDefined";

const HomePage = () => {
  const { playerStats } = useContextIfDefined(PlayerStatsContext);
  return (
    <div
      className="flex w-full h-dvh box-border bg-[#043040] overflow-auto gap-[32px] md:gap-[64px] 
    flex-col p-[12px] 
    md:p-[32px] 
    "
    >
      <div className="flex flex-col w-full md:w-[400px] lg:w-[600px] self-center">
        <SummonerInput />
        {/* <ProfileHeader /> */}
      </div>

      <div className="flex flex-col md:flex-row gap-[16px]">
        <div className="hidden xl:flex xl:w-1/4 h-full order-1"> MATCH HISTORY</div>
        <div className="w-full md:w-1/2 xl:w-2/4 h-full order-2 md:order-1 xl:order-2">
          {/* TODO: tab switch between match history and champion list */}
          <ChampionList />
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
            <StatsOverviewCard stats={playerStats} standalone darkText/>
          ) : (
            <StatsSkeleton />
          )}
        </div>
      </div>
      {/* {playerStats ? (
          <ProfileHeader
            name={playerStats?.gameName + "#" + playerStats?.tagLine}
            percentProgress={getPlayerProgress()}
            iconId={playerStats?.profileIconId}
          />
        ) : (
          <ProfileHeader percentProgress={getPlayerProgress()} />
        )}
        <div className="w-[350px] mt-[8px]">
          <Progress
            total={total}
            played={played}
            top4={top4}
            won={won}
          ></Progress>
        </div> */}
    </div>
  );
};

export default HomePage;
