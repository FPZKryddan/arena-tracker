import type { ReactNode } from "react";
import FavoriteButton from "../favoriteButton/FavoriteButton";
import { ChampionsContext } from "../../contexts/ChampionsContext";
import useContextIfDefined from "../../hooks/useContextIfDefined";
import useDdragonVersion from "../../hooks/useDdragonVersion";
import { getWins } from "../../hooks/useStatsAggregator";
import type { PlayerStats, ProfileLookupDto, Regions } from "../../types";

interface ProfileHeaderProps {
  stats: PlayerStats | null;
  profile: ProfileLookupDto | null;
  gameName: string | null;
  tagLine: string | null;
  region: Exclude<Regions, null> | null;
  actions?: ReactNode;
}

const ProfileHeader = ({
  stats,
  profile,
  gameName,
  tagLine,
  region,
  actions,
}: ProfileHeaderProps) => {
  const version = useDdragonVersion();
  const { champions } = useContextIfDefined(ChampionsContext);
  const displayGameName =
    stats?.gameName ?? profile?.gameName ?? gameName ?? "RiotName";
  const displayTagLine = stats?.tagLine ?? profile?.tagLine ?? tagLine ?? "TAG";
  const displayRegion = profile?.region ?? region;
  const level = stats?.summonerLevel ?? profile?.summonerLevel;
  const profileIconId = stats?.profileIconId ?? profile?.profileIconId ?? 1;
  const completedChampions = stats
    ? Object.values(stats.championStats).filter(
        (champion) => champion.stage >= 3,
      ).length
    : 0;
  const progressPercent =
    champions.length > 0
      ? Math.round((completedChampions / champions.length) * 100)
      : 0;
  const topFourCount = stats ? getWins(stats.placements) : null;
  const topFourRate =
    stats && stats.matchesPlayed > 0 && topFourCount !== null
      ? Math.round((topFourCount / stats.matchesPlayed) * 100)
      : null;
  const kills = stats?.infographics.killsDeathsAssists.kills.value;
  const deaths = stats?.infographics.killsDeathsAssists.deaths.value;
  const assists = stats?.infographics.killsDeathsAssists.assists.value;
  const kda =
    kills === undefined || deaths === undefined || assists === undefined
      ? "--"
      : deaths === 0
        ? "Perfect"
        : ((kills + assists) / deaths).toFixed(1);
  const favoriteTarget =
    displayRegion && displayGameName !== "RiotName" && displayTagLine !== "TAG"
      ? {
          gameName: displayGameName,
          tagLine: displayTagLine,
          region: displayRegion,
        }
      : undefined;

  return (
    <header className="flex flex-col gap-5 border-b border-border pb-5 md:gap-6 md:pb-7">
      <div className="flex flex-col gap-6 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <img
            className="h-24 w-24 shrink-0 rounded-lg bg-surface-elevated object-cover sm:h-28 sm:w-28"
            src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${profileIconId}.png`}
            alt=""
          />

          <div className="min-w-0">
            <div className="t-eyebrow flex flex-wrap items-center gap-1 text-fg-subtle">
              {favoriteTarget && <FavoriteButton favorite={favoriteTarget} />}
              <span>Favorite</span>
              {level !== undefined && (
                <>
                  <span className="mx-1">/</span>
                  <span>Level {level}</span>
                </>
              )}
              {displayRegion && (
                <>
                  <span className="mx-1">/</span>
                  <span>{displayRegion}</span>
                </>
              )}
            </div>
            <h1 className="mt-2 truncate text-4xl font-semibold tracking-tight text-fg md:t-display">
              {displayGameName}{" "}
              <span className="text-fg-muted">#{displayTagLine}</span>
            </h1>

            <div className="mt-4 flex flex-wrap items-center divide-x divide-border">
              <ArenaProgress
                completedChampions={completedChampions}
                totalChampions={champions.length}
                percent={progressPercent}
              />
              <HeaderMetric
                label="Played"
                value={formatValue(stats?.matchesPlayed)}
              />
              <HeaderMetric
                label="Top 4"
                value={
                  topFourCount === null
                    ? "--"
                    : `${topFourCount} / ${topFourRate ?? 0}%`
                }
              />
              <HeaderMetric
                label="Avg"
                value={stats ? stats.placementAvg.toFixed(2) : "--"}
              />
              <HeaderMetric label="KDA" value={kda} />
            </div>
          </div>
        </div>

        {actions && (
          <div className="w-full shrink-0 self-start sm:w-auto sm:self-end 2xl:self-center">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};

const formatValue = (value: number | undefined): string =>
  value === undefined ? "--" : new Intl.NumberFormat().format(value);

interface ArenaProgressProps {
  completedChampions: number;
  totalChampions: number;
  percent: number;
}

const ArenaProgress = ({
  completedChampions,
  totalChampions,
  percent,
}: ArenaProgressProps) => (
  <div className="flex items-center gap-3 pr-4">
    <div
      className="grid h-12 w-12 shrink-0 place-items-center rounded-full"
      style={{
        background: `conic-gradient(var(--color-accent) 0 ${percent}%, var(--color-border) ${percent}% 100%)`,
      }}
      role="img"
      aria-label={`${percent}% Arena progress`}
    >
      <div className="t-meta grid h-9 w-9 place-items-center rounded-full bg-bg text-fg">
        {percent}%
      </div>
    </div>
    <div className="flex flex-col gap-0.5">
      <span className="t-eyebrow text-fg-subtle">Arena Progress</span>
      <span className="t-label">Arena Master</span>
      <span className="t-meta text-fg-muted">
        {totalChampions > 0 ? `${completedChampions}/${totalChampions}` : "--"}{" "}
        champions
      </span>
    </div>
  </div>
);

const HeaderMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="flex min-w-20 flex-col gap-1 px-4 last:pr-0">
    <span className="t-eyebrow text-fg-subtle">{label}</span>
    <span className="t-h1 whitespace-nowrap">{value}</span>
  </div>
);

export default ProfileHeader;
