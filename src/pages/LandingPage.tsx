import { useMemo, type ReactNode } from "react";
import { IoPeople, IoStatsChart, IoTrophy } from "react-icons/io5";
import SummonerInput from "../components/summonerInput";
import FavoritesList from "../components/favoritesList/FavoritesList";
import useDdragonVersion from "../hooks/useDdragonVersion";
import { useAugmentsQuery, useChampionListQuery } from "../hooks/queries";
import type { augmentsData, championData } from "../types";

const CDRAGON_BASE = "https://raw.communitydragon.org/latest/game/";
const ARENA_HERO_IMAGE = "/arena-promo.jpg";
const ddragonChampionIcon = (version: string, id: string) =>
  `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${id}.png`;
const ddragonProfileIcon = (version: string, id: number) =>
  `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${id}.png`;

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
    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/62 to-black/10" />
    <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-black/35" />

    <div className="relative mx-auto flex min-h-[calc(100dvh-10rem)] max-w-6xl flex-col justify-center px-4 py-12 md:min-h-96 md:py-16 lg:min-h-96">
      <div className="flex max-w-2xl flex-col gap-6 text-on-media">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold leading-tight md:text-display">
            Arena Tracker
          </h1>
          <p className="max-w-xl text-base leading-7 text-white/80 md:text-lg">
            Look up a Riot ID, review Arena matches, and compare champion,
            augment, and teammate stats without the noise.
          </p>
        </div>

        <div className="flex max-w-xl flex-col gap-4">
          <SummonerInput />
          <FavoritesList />
        </div>
      </div>
    </div>
  </section>
);

const Overview = () => (
  <section className="border-y border-border bg-surface/35">
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-3">
      <FeatureItem
        icon={<IoStatsChart className="h-5 w-5" />}
        title="Match stats"
        body="KDA, damage, healing, shielding, and skillshots grouped by match and champion."
      />
      <FeatureItem
        icon={<IoTrophy className="h-5 w-5" />}
        title="Champion progress"
        body="Sort the roster by games played, average placement, win rate, or name."
      />
      <FeatureItem
        icon={<IoPeople className="h-5 w-5" />}
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
  <div className="flex gap-4">
    <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border bg-bg text-accent">
      {icon}
    </div>
    <div className="flex flex-col gap-1">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="text-sm leading-6 text-fg-muted">{body}</p>
    </div>
  </div>
);

const UseCases = () => (
  <section className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-16 md:py-20">
    <UseCaseRow
      eyebrow="Champion lineup"
      title="Find your most reliable picks."
      body="Compare games played, average placement, win rate, and Arena God progress across the full champion list."
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
    className={`grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12 ${
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

const FEATURED_CHAMPIONS: Array<{
  id: string;
  fallbackName: string;
  games: number;
  avg: number;
}> = [
  { id: "Yasuo", fallbackName: "Yasuo", games: 42, avg: 2.4 },
  { id: "Ahri", fallbackName: "Ahri", games: 31, avg: 3.1 },
  { id: "Jinx", fallbackName: "Jinx", games: 28, avg: 3.6 },
  { id: "Karthus", fallbackName: "Karthus", games: 22, avg: 4.2 },
];

const ChampionsMock = () => {
  const version = useDdragonVersion();
  const { data: champions = [] } = useChampionListQuery();

  const championsById = useMemo(() => {
    const map = new Map<string, championData>();
    for (const c of champions) map.set(c.id, c);
    return map;
  }, [champions]);

  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center justify-between px-1 pb-2 text-xs font-medium text-fg-muted">
        <span>Top champions</span>
        <span>Avg</span>
      </div>
      <ul className="divide-y divide-border">
        {FEATURED_CHAMPIONS.map((r) => {
          const data = championsById.get(r.id);
          const displayName = data?.displayName ?? r.fallbackName;
          return (
            <li key={r.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-2">
              {version ? (
                <img
                  src={ddragonChampionIcon(version, r.id)}
                  alt={displayName}
                  loading="lazy"
                  decoding="async"
                  className="h-9 w-9 rounded-md bg-surface-elevated object-cover"
                />
              ) : (
                <div className="h-9 w-9 rounded-md bg-surface-elevated" />
              )}
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{displayName}</div>
                <div className="text-xs text-fg-muted">{r.games} games</div>
              </div>
              <div className="text-sm font-semibold tabular-nums">{r.avg}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const FALLBACK_AUGMENT_PICKS = [22, 17, 14, 9];

const AugmentsMock = () => {
  const { data: augments = [] } = useAugmentsQuery();

  const featured = useMemo(() => {
    if (augments.length === 0) return [] as augmentsData[];
    const byRarity: Record<number, augmentsData[]> = { 0: [], 1: [], 2: [] };
    for (const a of augments) {
      if (!a.iconLarge) continue;
      if (byRarity[a.rarity]) byRarity[a.rarity].push(a);
    }
    const picks: augmentsData[] = [];
    if (byRarity[2][0]) picks.push(byRarity[2][0]);
    if (byRarity[1][0]) picks.push(byRarity[1][0]);
    if (byRarity[1][1]) picks.push(byRarity[1][1]);
    if (byRarity[0][0]) picks.push(byRarity[0][0]);
    return picks;
  }, [augments]);

  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="px-1 pb-2 text-xs font-medium text-fg-muted">
        Most picked augments
      </div>
      <ul className="grid min-h-32 grid-cols-2 gap-2">
        {featured.map((a, i) => (
          <li
            key={a.id}
            className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-bg/35 p-2"
          >
            <div className={`h-9 w-9 shrink-0 augment-${a.rarity}`}>
              <img
                src={CDRAGON_BASE + a.iconLarge}
                alt={a.name}
                loading="lazy"
                decoding="async"
                className="relative h-full w-full rounded-md bg-surface-elevated"
              />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold">{a.name}</div>
              <div className="text-xs text-fg-muted">
                {FALLBACK_AUGMENT_PICKS[i] ?? 8} picks
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const TEAMMATES = [
  { name: "Bjergsen", tag: "EUW", games: 38, avg: 2.8, profileIcon: 4923 },
  { name: "Caps", tag: "EUW", games: 24, avg: 3.4, profileIcon: 4895 },
  { name: "Faker", tag: "KR", games: 12, avg: 2.1, profileIcon: 6 },
];

const TeammatesMock = () => {
  const version = useDdragonVersion();
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center justify-between px-1 pb-2 text-xs font-medium text-fg-muted">
        <span>Top duo partners</span>
        <IoTrophy className="h-3.5 w-3.5 text-accent" />
      </div>
      <ul className="divide-y divide-border">
        {TEAMMATES.map((m) => (
          <li key={m.name} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-2">
            {version ? (
              <img
                src={ddragonProfileIcon(version, m.profileIcon)}
                alt={`${m.name} icon`}
                loading="lazy"
                decoding="async"
                className="h-9 w-9 rounded-md bg-surface-elevated object-cover"
              />
            ) : (
              <div className="h-9 w-9 rounded-md bg-surface-elevated" />
            )}
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">
                {m.name}
                <span className="text-fg-muted">#{m.tag}</span>
              </div>
              <div className="text-xs text-fg-muted">{m.games} games</div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase text-fg-subtle">avg</div>
              <div className="text-sm font-semibold tabular-nums">{m.avg}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Footer = () => (
  <footer className="border-t border-border px-4 py-8 text-center text-xs text-fg-muted">
    Arena Tracker is not endorsed by Riot Games. League of Legends and Riot
    Games are trademarks of Riot Games, Inc.
  </footer>
);

export default LandingPage;
