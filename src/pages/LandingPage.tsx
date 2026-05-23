import { useMemo, type ReactNode } from "react";

import { IoPeople, IoStatsChart, IoTrophy } from "react-icons/io5";
import ArenaGodProgressTracker from "../components/statsOverviewCard/ArenaGodProgressTracker";
import ChampionCardGrid from "../components/championsView/ChampionCardGrid";
import ChampionPodium from "../components/championsView/ChampionPodium";
import FavoriteAugmentsBody from "../components/statsOverviewCard/FavoriteAugmentsBody";
import TeammatesBody from "../components/statsOverviewCard/TeammatesBody";
import SummonerInput from "../components/summonerInput";
import FavoritesList from "../components/favoritesList/FavoritesList";
import { useAugmentsQuery } from "../hooks/queries";
import {
  createLandingAugmentStats,
  LANDING_ARENA_GOD_COMPLETED,
  LANDING_ARENA_GOD_TOTAL_CHAMPIONS,
  LANDING_GRID_CHAMPIONS,
  LANDING_PODIUM_CHAMPIONS,
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
        <Overview />
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
          <span className="text-xs font-semibold uppercase text-white/70">
            League Arena stats
          </span>
          <h1 className="text-2xl font-semibold leading-tight md:text-display">
            Track Arena God wins.
          </h1>
          <p className="max-w-xl text-base leading-7 text-white/80 md:text-lg">
            Search a Riot ID for progress, picks, and duo history.
          </p>
        </div>

        <div className="flex max-w-xl flex-col gap-3 rounded-lg border border-white/15 bg-black/50 p-3 shadow-raised backdrop-blur md:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-white">
              Search Riot ID
            </span>
            <span className="text-xs text-white/60">Name#TAG</span>
          </div>
          <SummonerInput variant="hero" submitLabel="Search Riot ID" />
          <FavoritesList />
        </div>
      </div>

    </div>
  </section>
);



const Overview = () => (
  <section className="border-y border-border bg-surface/35">
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-8 md:grid-cols-3 md:gap-6">
      <FeatureItem
        icon={<IoStatsChart className="h-6 w-6" />}
        title="Match stats"
        body="KDA, damage, healing, shielding, and skillshots grouped by match and champion."
      />
      <FeatureItem
        icon={<IoTrophy className="h-6 w-6" />}
        title="Champion progress"
        body="Sort the roster by games played, average placement, win rate, or name."
      />
      <FeatureItem
        icon={<IoPeople className="h-6 w-6" />}
        title="Duo records"
        body="Track frequent teammates, shared games, average placement, and last played."
      />
    </div>
  </section>
);

interface FeatureItemProps {
  icon: ReactNode;
  title: string;
  body: string;
}

const FeatureItem = ({ icon, title, body }: FeatureItemProps) => (
  <div className="flex h-full gap-4 rounded-lg border border-border-strong bg-surface p-5 shadow-resting">
    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md border border-border bg-bg text-accent">
      {icon}
    </div>
    <div className="flex flex-col gap-2">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-sm leading-6 text-fg-muted">{body}</p>
    </div>
  </div>
);

const UseCases = () => (
  <section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 md:gap-12 md:py-12">
    <UseCaseRow
      eyebrow="Arena God progress"
      title="Know exactly who still needs a victory."
      body="Keep completed champions, unfinished picks, games played, and next targets in one roster view after every Arena session."
      preview={<ChampionsMock />}
    />

    <UseCaseRow
      reverse
      eyebrow="Augment picks"
      title="Review your draft patterns."
      body="See which augments you return to most often and how your favorites change across your match history."
      preview={<AugmentsMock />}
    />

    <UseCaseRow
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
      <span className="text-xs font-semibold uppercase text-fg-subtle">
        {eyebrow}
      </span>
      <h3 className="text-2xl font-semibold leading-tight">{title}</h3>
      <p className="max-w-lg leading-7 text-fg-muted">{body}</p>
    </div>
    <div>{preview}</div>
  </div>
);

const ChampionsMock = () => {
  return (
    <PreviewFrame>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-medium uppercase text-fg-subtle">
              Arena God
            </div>
            <div className="text-2xl font-semibold tabular-nums">
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
    [augments]
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
  <footer className="border-t border-border px-4 py-8 text-center text-xs text-fg-muted">
    Arena Tracker is not endorsed by Riot Games. League of Legends and Riot
    Games are trademarks of Riot Games, Inc.
  </footer>
);

export default LandingPage;
