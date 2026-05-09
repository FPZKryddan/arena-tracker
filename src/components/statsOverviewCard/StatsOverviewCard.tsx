import { useParams } from "react-router-dom";
import { IoStatsChart } from "react-icons/io5";
import { ChampionsContext } from "../../contexts/ChampionsContext";
import type { championStatsDto, PlayerStats, Regions } from "../../types";
import useContextIfDefined from "../../hooks/useContextIfDefined";
import useDdragonVersion from "../../hooks/useDdragonVersion";
import { getChampionSplashArtUrl } from "../../championIcon";
import ArenaGodProgressTracker from "./ArenaGodProgressTracker";
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
  const { champions } = useContextIfDefined(ChampionsContext);
  const isPlayerStats = "championStats" in stats;
  const hasStats = stats.placementAvg != 0;
  const displayName =
    "gameName" in stats ? stats.gameName + "#" + stats.tagLine : stats.name;
  const bannerImgUrl =
    "profileIconId" in stats ? undefined : getChampionSplashArtUrl(stats.id);
  const arenaGodCompletedChampions = isPlayerStats
    ? Object.values(stats.championStats).filter((champion) => champion.stage >= 3)
        .length
    : 0;

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
     text-fg relative flex flex-col grow-0 w-full h-fit rounded-xl gap-[24px]`}>
      {stats && hasStats ? (
        <div className="relative flex flex-col gap-[24px]">
          {bannerImgUrl && (
            <div
              className={`pointer-events-none absolute h-[340px] overflow-hidden ${
                standalone
                  ? "-left-2 -right-2 -top-2 md:-left-8 md:-right-8 md:-top-8 md:rounded-t-xl"
                  : "-left-2 -right-2 -top-2 rounded-t-2xl"
              }`}
              style={{
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 0%, black 46%, transparent 100%)",
                maskImage:
                  "linear-gradient(to bottom, black 0%, black 46%, transparent 100%)",
              }}
              aria-hidden
            >
              <img
                src={bannerImgUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-transparent" />
            </div>
          )}
          <div className={bannerImgUrl ? "relative pt-[150px]" : "relative"}>
            <StatsOverviewHeader
              kills={stats.infographics.killsDeathsAssists.kills}
              deaths={stats.infographics.killsDeathsAssists.deaths}
              assists={stats.infographics.killsDeathsAssists.assists}
              name={displayName}
              imgUrl={getImgUrl()}
              favoriteTarget={
                "gameName" in stats && routeRegion
                  ? {
                      gameName: stats.gameName,
                      tagLine: stats.tagLine,
                      region: routeRegion as Exclude<Regions, null>,
                    }
                  : undefined
              }
              trailing={
                isPlayerStats ? (
                  <ArenaGodProgressTracker
                    completedChampions={arenaGodCompletedChampions}
                    totalChampions={champions.length}
                  />
                ) : undefined
              }
            />
          </div>
          <div className="relative flex flex-col w-full gap-[24px]">
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
        </div>
      ) : (
        <NoStatsState
          name={displayName}
          imageUrl={bannerImgUrl ?? getImgUrl()}
        />
      )}
    </div>
  );
};

const NoStatsState = ({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl: string;
}) => (
  <div className="relative min-h-[220px] w-full overflow-hidden rounded-xl bg-surface-elevated">
    <img
      src={imageUrl}
      alt={name}
      className="absolute inset-0 h-full w-full object-cover object-[center_25%]"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4 text-white">
      <div className="flex items-center gap-2">
        <IoStatsChart className="h-5 w-5 text-success" />
        <p className="text-sm font-semibold">No recorded stats</p>
      </div>
      <h2 className="text-2xl font-extrabold leading-tight">{name}</h2>
    </div>
  </div>
);

export default StatsOverviewCard;
