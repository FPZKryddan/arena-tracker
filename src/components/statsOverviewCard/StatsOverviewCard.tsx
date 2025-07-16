import type { championStatsDto, PlayerStats } from "../../types";
import DamageStatsBody from "./DamageStatsBody";
import FavoriteAugmentsBody from "./FavoriteAugmentsBody";
import PlacementsBody from "./PlacementsBody";
import StatsOverviewHeader from "./StatsOverviewHeader";

interface StatsOverviewCardProps {
  stats: PlayerStats | championStatsDto;
  standalone?: boolean;
  darkText?: boolean
}

const StatsOverviewCard = ({ stats, standalone, darkText = false }: StatsOverviewCardProps) => {

  const firstLetterBig = (name: string): string => {
    return name[0].toUpperCase() + name.slice(1);
  };

  const getImgUrl = (): string => {
    if ('profileIconId' in stats) {
      return `https://ddragon.leagueoflegends.com/cdn/15.13.1/img/profileicon/${stats['profileIconId']}.png`;
    }
    return `https://ddragon.leagueoflegends.com/cdn/15.13.1/img/champion/${firstLetterBig(stats.id)}.png`;
  }

  return (
    <div className={`${standalone ? 'bg-stone-200 shadow-2xl p-[8px] md:p-[32px]' : 'bg-transparent shadow-none'}
     ${darkText ? 'text-black' : 'text-white'}
     flex flex-col grow-0 w-full h-fit rounded-xl gap-[24px]`}>
      {stats && stats.placementAvg != 0 ? (
        <>
          <StatsOverviewHeader
            kills={stats.infographics.killsDeathsAssists.kills}
            deaths={stats.infographics.killsDeathsAssists.deaths}
            assists={stats.infographics.killsDeathsAssists.assists}
            name={"gameName" in stats ? stats.gameName + '#' + stats.tagLine : stats.name}
            imgUrl={getImgUrl()}
          />
          <div className="flex flex-col w-full gap-[24px]">
            <DamageStatsBody
              dealtStats={stats.infographics.damageStats}
              takenStats={stats.infographics.damageTakenStats}
            />
            <FavoriteAugmentsBody augments={stats.augmentStats} />
            <PlacementsBody
              placements={stats.placements}
              placementAvg={stats.placementAvg}
              darkGraph={darkText}
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
