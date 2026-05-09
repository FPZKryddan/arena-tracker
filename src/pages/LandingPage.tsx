import { useMemo } from "react";
import {
  IoStatsChart,
  IoSparkles,
  IoPeople,
  IoTrophy,
  IoFlash,
  IoArrowDown,
} from "react-icons/io5";
import SummonerInput from "../components/summonerInput";
import ThemeToggle from "../components/themeToggle";
import FavoritesList from "../components/favoritesList/FavoritesList";
import useDdragonVersion from "../hooks/useDdragonVersion";
import { useAugmentsQuery, useChampionListQuery } from "../hooks/queries";
import type { augmentsData, championData } from "../types";

const CDRAGON_BASE = "https://raw.communitydragon.org/latest/game/";
const ddragonChampionIcon = (version: string, id: string) =>
  `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${id}.png`;
const ddragonProfileIcon = (version: string, id: number) =>
  `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${id}.png`;

const LandingPage = () => {
  return (
    <div className="relative w-full min-h-dvh bg-bg text-fg overflow-x-hidden">
      <div className="absolute top-[12px] right-[12px] md:top-[24px] md:right-[24px] z-30">
        <ThemeToggle />
      </div>

      <Hero />
      <Features />
      <UseCases />
      <FinalCta />
      <Footer />
    </div>
  );
};

const Hero = () => (
  <section className="relative flex flex-col items-center justify-center min-h-dvh px-4 py-16 overflow-hidden">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
    >
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-accent opacity-[0.07] blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-damage-magic opacity-[0.06] blur-3xl" />
      <div className="absolute top-1/3 right-0 w-[450px] h-[450px] rounded-full bg-damage-physical opacity-[0.05] blur-3xl" />
    </div>

    <div className="flex flex-col items-center gap-3 max-w-[640px] w-full text-center">
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated border border-border text-xs text-fg-muted">
        <IoFlash className="w-3.5 h-3.5 text-accent" />
        League of Legends Arena
      </span>
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
        Your <span className="text-accent">Arena</span>, by the numbers.
      </h1>
      <p className="text-base md:text-lg text-fg-muted max-w-[520px]">
        Match stats, augment picks, and teammate breakdowns — pure stat candy
        for Arena fans. Look up any player and dive in.
      </p>

      <div className="w-full mt-6">
        <SummonerInput />
      </div>

      <div className="w-full mt-2">
        <FavoritesList />
      </div>
    </div>

    <a
      href="#features"
      aria-label="Scroll to features"
      className="absolute bottom-6 left-1/2 -translate-x-1/2 text-fg-muted hover:text-fg transition-colors"
    >
      <IoArrowDown className="w-6 h-6 animate-bounce" />
    </a>
  </section>
);

const Features = () => (
  <section
    id="features"
    className="px-4 py-20 md:py-28 max-w-[1100px] mx-auto"
  >
    <div className="text-center mb-12 md:mb-16">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
        Stats for the <span className="text-accent">love of the game</span>.
      </h2>
      <p className="text-fg-muted max-w-[560px] mx-auto">
        Arena Tracker pulls every detail from your matches and turns it into
        numbers worth showing off. No coaching, no meta sermons — just the
        story of your Arena runs.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <FeatureCard
        icon={<IoStatsChart className="w-6 h-6 text-damage-magic" />}
        title="Detailed match stats"
        body="KDA, damage dealt and taken, healing, shielding, and skillshot accuracy — broken down per champion and across your full match history."
      />
      <FeatureCard
        icon={<IoSparkles className="w-6 h-6 text-accent" />}
        title="Your augment habits"
        body="Every augment you've ever drafted, ranked by how often you grab it. Find out which prismatic is your guilty pleasure."
      />
      <FeatureCard
        icon={<IoPeople className="w-6 h-6 text-damage-physical" />}
        title="Duo partner history"
        body="Every teammate you've queued with — games together, average placement, and the last time you teamed up."
      />
    </div>
  </section>
);

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  body: string;
}

const FeatureCard = ({ icon, title, body }: FeatureCardProps) => (
  <div className="flex flex-col gap-3 p-6 rounded-2xl bg-surface border border-border hover:border-border-strong transition-colors">
    <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center">
      {icon}
    </div>
    <h3 className="text-lg font-bold">{title}</h3>
    <p className="text-sm text-fg-muted leading-relaxed">{body}</p>
  </div>
);

const UseCases = () => (
  <section className="px-4 py-20 md:py-28 max-w-[1100px] mx-auto flex flex-col gap-20 md:gap-28">
    <UseCaseRow
      eyebrow="Champion lineup"
      title="See the champs you can't put down."
      body="Sort by placement, games played, or KDA. The comfort picks you keep coming back to — and the questionable ones you forget you've played."
      preview={<ChampionsMock />}
    />

    <UseCaseRow
      reverse
      eyebrow="Augment picks"
      title="See which augments you can't resist."
      body="Every augment you've ever drafted, ranked by how often you take it. Spot the prismatic you grab without thinking — and the ones you've never tried."
      preview={<AugmentsMock />}
    />

    <UseCaseRow
      eyebrow="Your Arena duo"
      title="Find out who your real partner is."
      body="Average placement, total games, and last-played for every Arena teammate. Settle the duo debate with receipts."
      preview={<TeammatesMock />}
    />
  </section>
);

interface UseCaseRowProps {
  eyebrow: string;
  title: string;
  body: string;
  preview: React.ReactNode;
  reverse?: boolean;
}

const UseCaseRow = ({ eyebrow, title, body, preview, reverse }: UseCaseRowProps) => (
  <div
    className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center ${
      reverse ? "md:[&>*:first-child]:order-2" : ""
    }`}
  >
    <div className="flex flex-col gap-3">
      <span className="text-xs uppercase tracking-widest text-accent font-bold">
        {eyebrow}
      </span>
      <h3 className="text-2xl md:text-3xl font-extrabold leading-tight">
        {title}
      </h3>
      <p className="text-fg-muted leading-relaxed">{body}</p>
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
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-3 text-xs text-fg-muted">
        <span>Top champions</span>
        <span>Avg placement</span>
      </div>
      <ul className="flex flex-col gap-2">
        {FEATURED_CHAMPIONS.map((r) => {
          const data = championsById.get(r.id);
          const displayName = data?.displayName ?? r.fallbackName;
          return (
            <li
              key={r.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-surface-elevated"
            >
              {version ? (
                <img
                  src={ddragonChampionIcon(version, r.id)}
                  alt={displayName}
                  loading="lazy"
                  decoding="async"
                  className="w-8 h-8 rounded-full bg-surface object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-surface-elevated" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{displayName}</div>
                <div className="text-xs text-fg-muted">{r.games} games</div>
              </div>
              <div className="text-sm font-bold text-fg">{r.avg}</div>
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
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-2xl">
      <div className="text-xs text-fg-muted mb-3">Most picked augments</div>
      <ul className="grid grid-cols-2 gap-2 min-h-[124px]">
        {featured.map((a, i) => (
          <li
            key={a.id}
            className="flex items-center gap-2 p-2 rounded-lg bg-surface-elevated"
          >
            <div className={`w-9 h-9 shrink-0 augment-${a.rarity}`}>
              <img
                src={CDRAGON_BASE + a.iconLarge}
                alt={a.name}
                loading="lazy"
                decoding="async"
                className="bg-surface-elevated rounded-[10px] relative h-full w-full"
              />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-xs truncate">{a.name}</div>
              <div className="text-[10px] text-fg-muted">
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
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-3 text-xs text-fg-muted">
        <span>Top duo partners</span>
        <IoTrophy className="w-3.5 h-3.5 text-accent" />
      </div>
      <ul className="flex flex-col gap-2">
        {TEAMMATES.map((m) => (
          <li
            key={m.name}
            className="flex items-center gap-3 p-2 rounded-lg bg-surface-elevated"
          >
            {version ? (
              <img
                src={ddragonProfileIcon(version, m.profileIcon)}
                alt={`${m.name} icon`}
                loading="lazy"
                decoding="async"
                className="w-9 h-9 rounded-full bg-surface object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-surface-elevated" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">
                {m.name}
                <span className="text-fg-muted">#{m.tag}</span>
              </div>
              <div className="text-xs text-fg-muted">{m.games} games together</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-xs text-fg-muted">avg</div>
              <div className="text-sm font-bold">{m.avg}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const FinalCta = () => (
  <section className="px-4 py-20 md:py-28">
    <div className="max-w-[700px] mx-auto text-center flex flex-col items-center gap-4">
      <h2 className="text-3xl md:text-4xl font-extrabold">
        Ready to see your numbers?
      </h2>
      <p className="text-fg-muted max-w-[480px]">
        Search any Riot ID to pull a full Arena profile in seconds. Favorite
        the ones you'll come back to.
      </p>
      <div className="w-full max-w-[520px] mt-4">
        <SummonerInput />
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="px-4 py-8 border-t border-border text-center text-xs text-fg-muted">
    Arena Tracker isn't endorsed by Riot Games. League of Legends and Riot
    Games are trademarks of Riot Games, Inc.
  </footer>
);

export default LandingPage;
