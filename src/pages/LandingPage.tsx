import { useMemo, type ReactNode } from "react";

import ArenaGodProgressTracker from "../components/statsOverviewCard/ArenaGodProgressTracker";
import ChampionCardGrid from "../components/championsView/ChampionCardGrid";
import ChampionPodium from "../components/championsView/ChampionPodium";
import DamageStatsBody from "../components/statsOverviewCard/DamageStatsBody";
import FavoriteAugmentsBody from "../components/statsOverviewCard/FavoriteAugmentsBody";
import PlacementsBody from "../components/statsOverviewCard/PlacementsBody";
import StatsOverviewHeader from "../components/statsOverviewCard/StatsOverviewHeader";
import TeammatesBody from "../components/statsOverviewCard/TeammatesBody";
import SummonerInput from "../components/summonerInput";
import FavoritesList from "../components/favoritesList/FavoritesList";
import { isDisplayAugment } from "../components/arenaReference/augmentRules";
import { isPurchasableArenaItem } from "../components/arenaReference/itemShopRules";
import { getProfileIconUrl } from "../championIcon";
import useDdragonVersion from "../hooks/useDdragonVersion";
import useFormatter from "../hooks/useFormatter";
import {
  useAugmentsQuery,
  useChampionListQuery,
  useItemDataQuery,
  useTrackedMatchesStatsQuery,
  useTrackedPlayersStatsQuery,
} from "../hooks/queries";
import {
  createLandingAugmentStats,
  LANDING_ARENA_GOD_COMPLETED,
  LANDING_ARENA_GOD_TOTAL_CHAMPIONS,
  LANDING_GRID_CHAMPIONS,
  LANDING_PODIUM_CHAMPIONS,
  LANDING_PROFILE_STATS,
  LANDING_TEAMMATE_PROFILE_OVERRIDES,
  LANDING_TEAMMATE_REGION,
  LANDING_TEAMMATE_STATS,
} from "../mock/landingMockData";

const ARENA_HERO_IMAGE = "/arena-promo.jpg";

const LandingPage = () => {
  return (
    <div className="min-h-dvh w-full bg-bg text-fg">
      <main>
        <Hero />
        <StatsRow />
        <UseCases />
      </main>
      <Footer />
    </div>
  );
};

const Hero = () => (
  <section className="relative isolate overflow-hidden border-b border-border bg-black">
    <div className="absolute inset-y-0 left-1/2 h-full w-full max-w-screen-2xl -translate-x-1/2 overflow-hidden">
      <img
        src={ARENA_HERO_IMAGE}
        alt=""
        className="h-full w-full object-cover object-center"
        decoding="async"
        fetchPriority="high"
      />
      <div className="absolute inset-y-0 left-0 w-[18vw] min-w-28 max-w-xs bg-gradient-to-r from-black to-transparent" />
      <div className="absolute inset-y-0 right-0 w-[18vw] min-w-28 max-w-xs bg-gradient-to-l from-black to-transparent" />
    </div>
    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/25 to-black/10" />
    <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-black/35" />

    <div className="relative mx-auto grid min-h-[28rem] max-w-6xl grid-cols-1 items-center gap-8 px-4 py-10 md:min-h-[30rem] md:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] md:py-12">
      <div className="flex max-w-2xl flex-col gap-5 text-on-media">
        <div className="flex flex-col gap-3">
          <span className="t-eyebrow text-white/70">
            League Arena stats
          </span>
          <h1 className="t-h1 md:t-display">
            Track Your Arena Stats.
          </h1>
          <p className="t-body max-w-xl text-white/80">
            Search a Riot ID for progress, picks, and duo history.
          </p>
        </div>

        <div className="flex max-w-xl flex-col gap-3 rounded-lg border border-white/15 bg-black/50 p-3 shadow-raised backdrop-blur md:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="t-label text-white">
              Search Riot ID
            </span>
            <span className="t-meta text-white/60">Name#TAG</span>
          </div>
          <SummonerInput variant="hero" submitLabel="Search Riot ID" />
          <FavoritesList />
        </div>
      </div>
    </div>
  </section>
);

const StatsRow = () => {
  const version = useDdragonVersion();
  const { formatNumber } = useFormatter();
  const { data: augments } = useAugmentsQuery();
  const { data: items } = useItemDataQuery();
  const { data: champions } = useChampionListQuery();
  const { data: trackedPlayers } = useTrackedPlayersStatsQuery();
  const { data: trackedMatches } = useTrackedMatchesStatsQuery();

  const augmentCount = augments?.filter(isDisplayAugment).length;
  const itemCount = items
    ? Object.values(items).filter(isPurchasableArenaItem).length
    : undefined;
  const activeRegions = trackedPlayers
    ? Object.values(trackedPlayers.perRegion).filter((count) => count > 0)
        .length
    : undefined;
  const displayNumber = (value: number | undefined): string =>
    value === undefined ? "--" : formatNumber(value);

  return (
    <section
      aria-label="Arena Tracker statistics"
      className="border-y border-border bg-surface/35"
    >
      <div
        aria-live="polite"
        className="mx-auto grid max-w-6xl grid-cols-1 px-4 lg:grid-cols-6"
      >
        <StatTile label="Patch" value={version} description="Current" />
        <StatTile
          label="Augments"
          value={displayNumber(augmentCount)}
          description="Prismatics / Golds / Silvers"
        />
        <StatTile
          label="Items"
          value={displayNumber(itemCount)}
          description="In shop"
        />
        <StatTile
          label="Champions"
          value={displayNumber(champions?.length)}
          description="To master"
        />
        <StatTile
          label="Players tracked"
          value={displayNumber(trackedPlayers?.tracked)}
          description={
            activeRegions === undefined
              ? "across -- regions"
              : `across ${activeRegions} ${activeRegions === 1 ? "region" : "regions"}`
          }
        />
        <StatTile
          label="Matches tracked"
          value={displayNumber(trackedMatches?.total)}
          description={formatLatestMatchLabel(trackedMatches?.latestMatchAt)}
        />
      </div>
    </section>
  );
};

interface StatTileProps {
  label: string;
  value: string;
  description: string;
}

const StatTile = ({ label, value, description }: StatTileProps) => (
  <div className="flex min-h-28 flex-col justify-center border-b border-border px-5 py-5 last:border-b-0 lg:border-r lg:border-b-0 lg:last:border-r-0">
    <div className="t-eyebrow text-fg-subtle">
      {label}
    </div>
    <div className="t-stat-display mt-1 text-fg">
      {value}
    </div>
    <div className="t-body-sm mt-1 text-fg-muted">{description}</div>
  </div>
);

const formatLatestMatchLabel = (timestamp: number | undefined): string => {
  if (timestamp === undefined) return "latest match --";
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "no matches yet";

  const minutes = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / (60 * 1000)),
  );
  if (minutes < 1) return "latest match just now";
  if (minutes < 60) return `latest match ${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `latest match ${hours}h ago`;

  return `latest match ${Math.floor(hours / 24)}d ago`;
};

const UseCases = () => (
  <section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 md:gap-12 md:py-12">
    <UseCaseRow
      eyebrow="Profile stats"
      title="See your Arena performance at a glance."
      body="Review KDA, damage, skillshots, and placement trends across your Arena match history."
      preview={<ProfileStatsMock />}
    />

    <UseCaseRow
      reverse
      eyebrow="Arena God progress"
      title="Know exactly who still needs completion."
      body="Keep completed champions, unfinished picks, games played, and next targets in one roster view after every Arena session."
      preview={<ChampionsMock />}
    />

    <UseCaseRow
      eyebrow="Augment picks"
      title="Review your draft patterns."
      body="See which augments you return to most often to dominate your opponents."
      preview={<AugmentsMock />}
    />

    <UseCaseRow
      reverse
      eyebrow="Teammates"
      title="Keep the duo history visible."
      body="Check who you queue with most, how often you play together, and where the average placement lands."
      preview={<TeammatesMock />}
    />
  </section>
);

interface UseCaseRowProps {
  eyebrow: string;
  title: string;
  body: string;
  preview: ReactNode;
  reverse?: boolean;
}

const UseCaseRow = ({
  eyebrow,
  title,
  body,
  preview,
  reverse,
}: UseCaseRowProps) => (
  <div
    className={`grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-10 ${
      reverse ? "md:[&>*:first-child]:order-2" : ""
    }`}
  >
    <div className="flex flex-col gap-3">
      <span className="t-eyebrow text-fg-subtle">
        {eyebrow}
      </span>
      <h3 className="t-h1">{title}</h3>
      <p className="t-body max-w-lg text-fg-muted">{body}</p>
    </div>
    <div>{preview}</div>
  </div>
);

const ProfileStatsMock = () => {
  const version = useDdragonVersion();
  const { infographics } = LANDING_PROFILE_STATS;

  return (
    <PreviewFrame>
      <div className="flex flex-col gap-6">
        <StatsOverviewHeader
          kills={infographics.killsDeathsAssists.kills}
          deaths={infographics.killsDeathsAssists.deaths}
          assists={infographics.killsDeathsAssists.assists}
          matchCount={LANDING_PROFILE_STATS.matchesPlayed}
          name={`${LANDING_PROFILE_STATS.gameName}#${LANDING_PROFILE_STATS.tagLine}`}
          imgUrl={getProfileIconUrl(
            version,
            LANDING_PROFILE_STATS.profileIconId,
          )}
        />
        <DamageStatsBody
          dealtStats={infographics.damageStats}
          takenStats={infographics.damageTakenStats}
          healingStats={infographics.healingStats}
          shieldingStats={infographics.shieldingStats}
          skillShotsStats={infographics.skillShotsStats}
          matchCount={LANDING_PROFILE_STATS.matchesPlayed}
        />
        <div className="border-t border-border/70 pt-4">
          <PlacementsBody
            placements={LANDING_PROFILE_STATS.placements}
            placementAvg={LANDING_PROFILE_STATS.placementAvg}
          />
        </div>
      </div>
    </PreviewFrame>
  );
};

const ChampionsMock = () => {
  return (
    <PreviewFrame>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <div className="t-eyebrow text-fg-subtle">
              Arena God
            </div>
            <div className="t-h1">
              Chase challenges
            </div>
          </div>
          <ArenaGodProgressTracker
            completedChampions={LANDING_ARENA_GOD_COMPLETED}
            totalChampions={LANDING_ARENA_GOD_TOTAL_CHAMPIONS}
          />
        </div>

        <ChampionPodium
          champions={LANDING_PODIUM_CHAMPIONS}
          interactive={false}
        />
        <ChampionCardGrid
          champions={LANDING_GRID_CHAMPIONS}
          startRank={4}
          interactive={false}
        />
      </div>
    </PreviewFrame>
  );
};

const AugmentsMock = () => {
  const { data: augments = [] } = useAugmentsQuery();
  const augmentStats = useMemo(
    () => createLandingAugmentStats(augments),
    [augments],
  );

  return (
    <PreviewFrame>
      <FavoriteAugmentsBody augments={augmentStats} />
    </PreviewFrame>
  );
};

const TeammatesMock = () => (
  <PreviewFrame>
    <TeammatesBody
      teammateStats={LANDING_TEAMMATE_STATS}
      region={LANDING_TEAMMATE_REGION}
      profileOverrides={LANDING_TEAMMATE_PROFILE_OVERRIDES}
      resolveProfiles={false}
      interactive={false}
    />
  </PreviewFrame>
);

const PreviewFrame = ({ children }: { children: ReactNode }) => (
  <div className="overflow-hidden rounded-lg border border-border-strong bg-surface p-4 shadow-resting">
    {children}
  </div>
);

const Footer = () => (
  <footer className="t-meta border-t border-border px-4 py-8 text-center text-fg-muted">
    Arena Tracker is not endorsed by Riot Games. League of Legends and Riot
    Games are trademarks of Riot Games, Inc.
  </footer>
);

export default LandingPage;
