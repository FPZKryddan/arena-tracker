import type { championStatsDto, PlayerStats } from "../../types";
import DamageStatsBody from "./DamageStatsBody";
import FavoriteAugmentsBody from "./FavoriteAugmentsBody";
import PlacementsBody from "./PlacementsBody";
import StatsOverviewHeader from "./StatsOverviewHeader";

interface StatsOverviewCardProps {
  stats: PlayerStats | championStatsDto;
  name: string;
}

const StatsOverviewCard = ({ stats, name }: StatsOverviewCardProps) => {

  const getImgUrl = (): string => {
    if ('profileIconId' in stats) {
      return `https://ddragon.leagueoflegends.com/cdn/15.13.1/img/profileicon/${stats['profileIconId']}.png`;
    }
    return `https://ddragon.leagueoflegends.com/cdn/15.13.1/img/champion/${name}.png`;
  }

  return (
    <div className="bg-stone-200 flex flex-col grow-0 w-fit h-fit rounded-xl p-[32px] gap-[32px] shadow-2xl">
      {stats && stats.placementAvg != 0 ? (
        <>
          <StatsOverviewHeader
            kills={stats.infographics.killsDeathsAssists.kills}
            deaths={stats.infographics.killsDeathsAssists.deaths}
            assists={stats.infographics.killsDeathsAssists.assists}
            name={name}
            imgUrl={getImgUrl()}
          />
          <div className="flex flex-col w-full gap-[16px]">
            <DamageStatsBody
              dealtStats={stats.infographics.damageStats}
              takenStats={stats.infographics.damageTakenStats}
            />
            <FavoriteAugmentsBody augments={stats.augmentStats} />
            <PlacementsBody
              placements={stats.placements}
              placementAvg={stats.placementAvg}
            />
          </div>
        </>
      ) : (
        <p>No Stats To Show!</p>
      )}
    </div>
  );
};

export default StatsOverviewCard;
