import { useParams } from "react-router-dom";
import type { championStatsDto, PlayerStats, Regions } from "../../types";
import useDdragonVersion from "../../hooks/useDdragonVersion";
import { getChampionSplashArtUrl } from "../../championIcon";
import DamageStatsBody from "./DamageStatsBody";
import FavoriteAugmentsBody from "./FavoriteAugmentsBody";
import PlacementsBody from "./PlacementsBody";
import StatsOverviewHeader from "./StatsOverviewHeader";
import TeammatesBody from "./TeammatesBody";

interface StatsOverviewCardProps {
  stats: PlayerStats | championStatsDto;
  standalone?: boolean;
}

const StatsOverviewCard = ({ stats, standalone }: StatsOverviewCardProps) => {
  const version = useDdragonVersion();
  const { region: routeRegion } = useParams<{ region?: string }>();

  const firstLetterBig = (name: string): string => {
    return name[0].toUpperCase() + name.slice(1);
  };

  const getImgUrl = (): string => {
    if ('profileIconId' in stats) {
      return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${stats['profileIconId']}.png`;
    }
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${firstLetterBig(stats.id)}.png`;
  }

  return (
    <div className={`${standalone ? 'bg-surface shadow-2xl p-[8px] md:p-[32px]' : 'bg-transparent shadow-none'}
     text-fg flex flex-col grow-0 w-full h-fit rounded-xl gap-[24px]`}>
      {stats && stats.placementAvg != 0 ? (
        <>
          <StatsOverviewHeader
            kills={stats.infographics.killsDeathsAssists.kills}
            deaths={stats.infographics.killsDeathsAssists.deaths}
            assists={stats.infographics.killsDeathsAssists.assists}
            name={"gameName" in stats ? stats.gameName + '#' + stats.tagLine : stats.name}
            imgUrl={getImgUrl()}
            bannerImgUrl={
              "profileIconId" in stats
                ? undefined
                : getChampionSplashArtUrl(stats.id)
            }
            favoriteTarget={
              "gameName" in stats && routeRegion
                ? {
                    gameName: stats.gameName,
                    tagLine: stats.tagLine,
                    region: routeRegion as Exclude<Regions, null>,
                  }
                : undefined
            }
          />
          <div className="flex flex-col w-full gap-[24px]">
            <DamageStatsBody
              dealtStats={stats.infographics.damageStats}
              takenStats={stats.infographics.damageTakenStats}
              healingStats={stats.infographics.healingStats}
              shieldingStats={stats.infographics.shieldingStats}
              skillShotsStats={stats.infographics.skillShotsStats}
            />
            <FavoriteAugmentsBody augments={stats.augmentStats} />
            <PlacementsBody
              placements={stats.placements}
              placementAvg={stats.placementAvg}
            />
            {"teammateStats" in stats && stats.teammateStats && (
              <TeammatesBody teammateStats={stats.teammateStats} />
            )}
          </div>
        </>
      ) : (
        <p>No Stats To Show!</p>
      )}
    </div>
  );
};

export default StatsOverviewCard;
