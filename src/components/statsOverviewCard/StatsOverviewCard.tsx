import { useParams } from "react-router-dom";
import { IoStatsChart } from "react-icons/io5";
import { ChampionsContext } from "../../contexts/ChampionsContext";
import type {
  ArenaModeSelection,
  championStatsDto,
  PlayerStats,
  Regions,
} from "../../types";
import useContextIfDefined from "../../hooks/useContextIfDefined";
import useDdragonVersion from "../../hooks/useDdragonVersion";
import { getStoredRegion, normalizeRegion } from "../../hooks/useApiBase";
import { getChampionSplashArtUrl } from "../../championIcon";
import {
  DEFAULT_ARENA_MODE,
  getArenaPlacementCount,
} from "../../utils/arenaModes";
import ArenaGodProgressTracker from "./ArenaGodProgressTracker";
import DamageStatsBody from "./DamageStatsBody";
import FavoriteAugmentsBody from "./FavoriteAugmentsBody";
import PlacementsBody from "./PlacementsBody";
import StatsOverviewHeader from "./StatsOverviewHeader";
import TeammatesBody from "./TeammatesBody";

interface StatsOverviewCardProps {
  stats: PlayerStats | championStatsDto;
  standalone?: boolean;
  favoriteRegion?: Exclude<Regions, null>;
  profileRegion?: Exclude<Regions, null>;
  arenaMode?: ArenaModeSelection;
}

const StatsOverviewCard = ({
  stats,
  standalone,
  favoriteRegion,
  profileRegion,
  arenaMode,
}: StatsOverviewCardProps) => {
  const version = useDdragonVersion();
  const { region: routeRegion } = useParams<{ region?: string }>();
  const { champions } = useContextIfDefined(ChampionsContext);
  const isPlayerStats = "championStats" in stats;
  const hasStats = stats.placementAvg != 0;
  const matchCount = Math.max(
    0,
    "matchesPlayed" in stats ? stats.matchesPlayed : stats.timesPlayed
  );
  const displayName =
    "gameName" in stats ? stats.gameName + "#" + stats.tagLine : stats.name;
  const bannerImgUrl =
    "profileIconId" in stats ? undefined : getChampionSplashArtUrl(stats.id);
  const arenaGodCompletedChampions = isPlayerStats
    ? Object.values(stats.championStats).filter((champion) => champion.stage >= 3)
        .length
    : 0;
  const effectiveFavoriteRegion = favoriteRegion ?? routeRegion;
  const effectiveProfileRegion =
    profileRegion ??
    (routeRegion ? normalizeRegion(routeRegion) : getStoredRegion());
  const profilePath =
    "gameName" in stats && profileRegion
      ? (() => {
          const path = `/profile/${profileRegion}/${encodeURIComponent(
            stats.gameName
          )}/${encodeURIComponent(stats.tagLine)}`;
          if (!arenaMode || arenaMode === DEFAULT_ARENA_MODE) return path;
          return `${path}?${new URLSearchParams({ mode: arenaMode }).toString()}`;
        })()
      : undefined;
  const placementCount = getArenaPlacementCount(arenaMode);

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
    <div className={`${standalone ? 'border border-border bg-surface p-2 md:p-6' : 'bg-transparent'}
     relative flex h-fit w-full grow-0 flex-col gap-6 rounded-lg text-fg`}>
      {stats && hasStats ? (
        <div className="relative flex flex-col gap-6">
          {bannerImgUrl && (
            <div
              className={`pointer-events-none absolute h-80 overflow-hidden ${
                standalone
                  ? "-left-2 -right-2 -top-2 md:-left-6 md:-right-6 md:-top-6 md:rounded-lg"
                  : "-left-2 -right-2 -top-2 rounded-lg"
              }`}
              style={{
                WebkitMaskImage:
                  "linear-gradient(to bottom, var(--color-media-mask) 0%, var(--color-media-mask) 46%, transparent 100%)",
                maskImage:
                  "linear-gradient(to bottom, var(--color-media-mask) 0%, var(--color-media-mask) 46%, transparent 100%)",
              }}
              aria-hidden
            >
              <img
                src={bannerImgUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-media-scrim/10 via-media-scrim/30 to-transparent" />
            </div>
          )}
          <div className={bannerImgUrl ? "relative pt-24" : "relative"}>
            <StatsOverviewHeader
              kills={stats.infographics.killsDeathsAssists.kills}
              deaths={stats.infographics.killsDeathsAssists.deaths}
              assists={stats.infographics.killsDeathsAssists.assists}
              matchCount={matchCount}
              name={displayName}
              imgUrl={getImgUrl()}
              profilePath={profilePath}
              favoriteTarget={
                "gameName" in stats && effectiveFavoriteRegion
                  ? {
                      gameName: stats.gameName,
                      tagLine: stats.tagLine,
                      region: effectiveFavoriteRegion as Exclude<Regions, null>,
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
          <div className="relative flex flex-col w-full gap-6">
            <div className="order-2 md:order-none">
              <DamageStatsBody
                dealtStats={stats.infographics.damageStats}
                takenStats={stats.infographics.damageTakenStats}
                healingStats={stats.infographics.healingStats}
                shieldingStats={stats.infographics.shieldingStats}
                skillShotsStats={stats.infographics.skillShotsStats}
                matchCount={matchCount}
              />
            </div>
            <div className="order-3 border-t border-border/70 pt-4 md:order-none">
              <FavoriteAugmentsBody augments={stats.augmentStats} />
            </div>
            <div className="order-4 border-t border-border/70 pt-4 md:order-none">
              <PlacementsBody
                placements={stats.placements}
                placementAvg={stats.placementAvg}
                placementCount={placementCount}
              />
            </div>
            {"teammateStats" in stats && stats.teammateStats && (
              <div className="order-last border-t border-border/70 pt-4 md:order-none">
                <TeammatesBody
                  teammateStats={stats.teammateStats}
                  region={effectiveProfileRegion}
                  arenaMode={arenaMode}
                />
              </div>
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
  <div className="relative min-h-56 w-full overflow-hidden rounded-lg border border-border bg-surface-elevated">
    <img
      src={imageUrl}
      alt={name}
      className="absolute inset-0 h-full w-full object-cover object-[center_25%]"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-media-scrim via-media-scrim/60 to-media-scrim/10" />
    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4 text-on-media">
      <div className="flex items-center gap-2">
        <IoStatsChart className="h-5 w-5 text-success" />
        <p className="text-sm font-semibold">No recorded stats</p>
      </div>
      <h2 className="text-2xl font-semibold leading-tight">{name}</h2>
    </div>
  </div>
);

export default StatsOverviewCard;
