import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, easeOut, motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import {
  HiMiniBolt,
  HiMiniCheck,
  HiMiniChevronDown,
  HiMiniLink,
  HiMiniXMark,
} from "react-icons/hi2";
import { GiBroadsword, GiShield, GiHealthNormal, GiArrowDunk, GiAcrobatic } from "react-icons/gi";
import { FaShieldAlt } from "react-icons/fa";
import { HiMiniStar } from "react-icons/hi2";
import useDdragonVersion from "../../hooks/useDdragonVersion";
import {
  useAugmentsQuery,
  useChampionSpellIconsQuery,
  useItemDataQuery,
  useMatchQuery,
  useMatchTimelineQuery,
} from "../../hooks/queries";
import useFormatter from "../../hooks/useFormatter";
import { getChampionIconUrl } from "../../championIcon";
import { buildMatchShareUrl } from "../../utils/matchLinks";
import type {
  ChampionSpellIconDto,
  augmentsData,
  ItemDataDto,
  MatchDto,
  MatchTimelineDto,
  MatchTimelineChampionStatsDto,
  MatchTimelineDamageStatsDto,
  MatchTimelineFrameDto,
  MatchTimelineParticipantFrameDto,
  ParticipantDto,
  Regions,
} from "../../types";

ChartJS.register(
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
);

interface MatchDetailModalProps {
  matchId: string | null;
  isOpen: boolean;
  onClose: () => void;
  highlightPuuid?: string;
  region?: Exclude<Regions, null>;
}

const placementClass = (placement: number): string => {
  if (placement === 1) return "bg-placement-first/20 border-placement-first";
  if (placement <= 4) return "bg-success/15 border-success";
  return "bg-surface border-border";
};

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const MatchDetailModal = ({
  matchId,
  isOpen,
  onClose,
  highlightPuuid,
  region,
}: MatchDetailModalProps) => {
  const [shareCopied, setShareCopied] = useState(false);
  const { data: match, isLoading: loading } = useMatchQuery(
    isOpen ? matchId : null,
    region
  );
  const { data: timeline, isLoading: timelineLoading } = useMatchTimelineQuery(
    isOpen ? matchId : null,
    region
  );
  const shareUrl = useMemo(
    () =>
      match && region ? buildMatchShareUrl(region, match.metadata.matchId) : null,
    [match, region]
  );

  const handleCopyShareUrl = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1400);
    } catch {
      window.prompt("Copy match link", shareUrl);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: easeOut }}
            className="fixed inset-0 z-[110] bg-overlay"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: easeOut }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-[12px] md:p-[24px] pointer-events-none"
          >
            <div className="pointer-events-auto relative max-h-[90vh] w-full max-w-[1100px] overflow-y-auto rounded-lg border border-border bg-surface p-[16px] text-fg md:p-[24px]">
              <div className="absolute right-[12px] top-[12px] z-10 flex items-center gap-[6px]">
                {shareUrl && (
                  <button
                    type="button"
                    className="flex items-center gap-[5px] rounded-md border border-border bg-surface-elevated px-[8px] py-[5px] text-[11px] font-semibold text-fg-muted hover:border-border-strong hover:bg-surface-hover hover:text-fg"
                    onClick={handleCopyShareUrl}
                  >
                    {shareCopied ? (
                      <HiMiniCheck className="text-[14px]" />
                    ) : (
                      <HiMiniLink className="text-[14px]" />
                    )}
                    <span className="hidden sm:inline">
                      {shareCopied ? "Copied" : "Copy link"}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  className="rounded-md p-1 text-fg-muted hover:bg-surface-hover hover:text-fg"
                  onClick={onClose}
                  aria-label="Close match detail"
                >
                  <HiMiniXMark className="text-2xl" />
                </button>
              </div>
              {loading && <MatchDetailSkeleton />}
              {!loading && !match && (
                <p className="text-[12px]">Could not load match.</p>
              )}
              {match && (
                <MatchDetailContent
                  match={match}
                  timeline={timeline}
                  timelineLoading={timelineLoading}
                  highlightPuuid={highlightPuuid}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

interface MatchDetailContentProps {
  match: MatchDto;
  timeline?: MatchTimelineDto;
  timelineLoading: boolean;
  highlightPuuid?: string;
}

const MatchDetailContent = ({
  match,
  timeline,
  timelineLoading,
  highlightPuuid,
}: MatchDetailContentProps) => {
  const { data: augmentList = [] } = useAugmentsQuery();
  const { data: itemData = {} } = useItemDataQuery();
  const championNames = useMemo(
    () => match.info.participants.map((participant) => participant.championName),
    [match.info.participants]
  );
  const { data: spellIconMap = {} } =
    useChampionSpellIconsQuery(championNames);
  const augmentLookup = useMemo(() => {
    const map = new Map<number, augmentsData>();
    for (const a of augmentList) map.set(a.id, a);
    return map;
  }, [augmentList]);
  const timelineFrames = useMemo(() => {
    const frames = timeline?.info.frames ?? [];
    const framesWithParticipants = frames.filter(
      (frame) => Object.keys(frame.participantFrames ?? {}).length > 0
    );
    const finalFrame =
      framesWithParticipants[framesWithParticipants.length - 1];

    return {
      finalParticipantFrames: buildParticipantFrameMap(finalFrame),
      damageTimelines: buildPlayerDamageTimelineMap(framesWithParticipants),
      statAvailability: buildEndGameStatAvailability(finalFrame),
    };
  }, [timeline]);

  const subteams = new Map<number, ParticipantDto[]>();
  for (const p of match.info.participants) {
    const team = p.playerSubteamId;
    if (!subteams.has(team)) subteams.set(team, []);
    subteams.get(team)!.push(p);
  }
  const orderedTeams = Array.from(subteams.entries()).sort(
    (a, b) => a[1][0].subteamPlacement - b[1][0].subteamPlacement
  );

  const findLeader = (
    accessor: (p: ParticipantDto) => number
  ): string | undefined => {
    let best: ParticipantDto | undefined;
    for (const p of match.info.participants) {
      if (!best || accessor(p) > accessor(best)) best = p;
    }
    return best && accessor(best) > 0 ? best.puuid : undefined;
  };

  const leaders = {
    dealt: findLeader((p) => p.totalDamageDealtToChampions),
    taken: findLeader((p) => p.totalDamageTaken),
    healed: findLeader((p) => p.totalHeal),
    shielded: findLeader((p) => p.totalDamageShieldedOnTeammates),
    skillshotsHit: findLeader((p) => p.challenges?.skillshotsHit ?? 0),
    skillshotsDodged: findLeader((p) => p.challenges?.skillshotsDodged ?? 0),
  };

  return (
    <div className="flex flex-col gap-[16px]">
      <MatchSummaryHeader match={match} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
        {orderedTeams.map(([teamId, players]) => (
          <div
            key={teamId}
            className={`rounded-md border-l-4 p-[8px] ${placementClass(
              players[0].subteamPlacement
            )}`}
          >
            <p className="text-[12px] font-bold mb-[6px]">
              #{players[0].subteamPlacement} Place
            </p>
            <div className="flex flex-col gap-[8px]">
              {players.map((p) => (
                <ParticipantRow
                  key={p.puuid}
                  participant={p}
                  augmentLookup={augmentLookup}
                  isHighlighted={p.puuid === highlightPuuid}
                  leaders={leaders}
                  finalParticipantFrame={timelineFrames.finalParticipantFrames.get(
                    p.participantId
                  )}
                  damageTimeline={timelineFrames.damageTimelines.get(
                    p.participantId
                  )}
                  statAvailability={timelineFrames.statAvailability}
                  itemData={itemData}
                  isTimelineLoading={timelineLoading}
                  spellIcons={spellIconMap[p.championName] ?? []}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface StatLeaders {
  dealt: string | undefined;
  taken: string | undefined;
  healed: string | undefined;
  shielded: string | undefined;
  skillshotsHit: string | undefined;
  skillshotsDodged: string | undefined;
}

interface ParticipantRowProps {
  participant: ParticipantDto;
  augmentLookup: Map<number, augmentsData>;
  isHighlighted: boolean;
  leaders: StatLeaders;
  finalParticipantFrame?: MatchTimelineParticipantFrameDto;
  damageTimeline?: PlayerDamageTimeline;
  statAvailability: EndGameStatAvailability;
  itemData: Record<number, ItemDataDto>;
  isTimelineLoading: boolean;
  spellIcons: ChampionSpellIconDto[];
}

const ParticipantRow = ({
  participant: p,
  augmentLookup,
  isHighlighted,
  leaders,
  finalParticipantFrame,
  damageTimeline,
  statAvailability,
  itemData,
  isTimelineLoading,
  spellIcons,
}: ParticipantRowProps) => {
  const version = useDdragonVersion();
  const { formatNumber } = useFormatter();
  const abilityCasts = [
    p.spell1Casts ?? 0,
    p.spell2Casts ?? 0,
    p.spell3Casts ?? 0,
    p.spell4Casts ?? 0,
  ];
  const augmentIds = [
    p.playerAugment1,
    p.playerAugment2,
    p.playerAugment3,
    p.playerAugment4,
  ].filter((id) => id && id !== 0);
  const items = [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5].filter(
    (id) => id && id !== 0
  );

  return (
    <div
      className={`flex flex-col gap-[6px] text-[11px] p-[8px] rounded ${
        isHighlighted ? "bg-info/15 outline outline-1 outline-info" : "bg-bg/35"
      }`}
    >
      <div className="flex flex-row items-center gap-[8px]">
        <div className="h-[40px] aspect-square rounded-full overflow-hidden shrink-0">
          <img
            className="h-full w-auto aspect-square scale-110"
            src={getChampionIconUrl(version, p.championName)}
            alt={p.championName}
          />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="truncate font-medium text-[12px]">
            {p.riotIdGameName}
            <span className="opacity-50">#{p.riotIdTagline}</span>
          </p>
          <p className="opacity-70">
            {p.championName} / {p.kills}/{p.deaths}/{p.assists}
          </p>
        </div>
      </div>

      <LoadoutStrip
        augmentIds={augmentIds}
        augmentLookup={augmentLookup}
        items={items}
        version={version}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-[4px] text-[11px]">
        <Stat
          icon={<GiBroadsword className="text-damage-physical" />}
          label="Dealt"
          value={formatNumber(p.totalDamageDealtToChampions)}
          isLeader={leaders.dealt === p.puuid}
        />
        <Stat
          icon={<GiShield className="text-damage-true" />}
          label="Taken"
          value={formatNumber(p.totalDamageTaken)}
          isLeader={leaders.taken === p.puuid}
        />
        <Stat
          icon={<GiHealthNormal className="text-success" />}
          label="Healed"
          value={formatNumber(p.totalHeal)}
          isLeader={leaders.healed === p.puuid}
        />
        <Stat
          icon={<FaShieldAlt className="text-info" />}
          label="Shielded"
          value={formatNumber(p.totalDamageShieldedOnTeammates)}
          isLeader={leaders.shielded === p.puuid}
        />
        <Stat
          icon={<GiArrowDunk className="text-damage-spell" />}
          label="SS Hit"
          value={formatNumber(p.challenges?.skillshotsHit ?? 0)}
          isLeader={leaders.skillshotsHit === p.puuid}
        />
        <Stat
          icon={<GiAcrobatic className="text-damage-magic" />}
          label="SS Dodged"
          value={formatNumber(p.challenges?.skillshotsDodged ?? 0)}
          isLeader={leaders.skillshotsDodged === p.puuid}
        />
      </div>

      {finalParticipantFrame ? (
        <EndGameStats
          finalFrame={finalParticipantFrame}
          damageTimeline={damageTimeline}
          availability={statAvailability}
          itemIds={items}
          itemData={itemData}
          abilityCasts={abilityCasts}
          spellIcons={spellIcons}
        />
      ) : isTimelineLoading ? (
        <EndGameStatsSkeleton />
      ) : null}

    </div>
  );
};

const LoadoutStrip = ({
  augmentIds,
  augmentLookup,
  items,
  version,
}: {
  augmentIds: number[];
  augmentLookup: Map<number, augmentsData>;
  items: number[];
  version: string;
}) => {
  const augmentSlots = Array.from({ length: 4 }, (_, index) => augmentIds[index]);
  const itemSlots = Array.from({ length: 6 }, (_, index) => items[index]);

  return (
    <div className="grid grid-cols-1 gap-[8px] rounded-md border border-border/70 bg-surface/45 p-[7px] xl:grid-cols-[auto_minmax(0,1fr)]">
      <div className="min-w-0">
        <p className="mb-[4px] text-[9px] font-semibold uppercase text-fg-muted">
          Augments
        </p>
        <div className="flex flex-row flex-wrap gap-[6px]">
          {augmentSlots.map((id, index) => {
            const augment = id ? augmentLookup.get(id) : undefined;

            return (
              <div
                key={`augment-slot-${index}-${id ?? "empty"}`}
                className={`h-[34px] w-[34px] shrink-0 rounded-md border border-border bg-surface-elevated
                }`}
                title={augment?.name}
              >
                {augment && (
                  <div className="relative h-full w-full overflow-hidden rounded-md bg-surface-elevated">
                    <img
                      src={`https://raw.communitydragon.org/latest/game/${augment.iconLarge}`}
                      alt={augment.name}
                      className="h-full w-full object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="min-w-0">
        <p className="mb-[4px] text-[9px] font-semibold uppercase text-fg-muted">
          Items
        </p>
        <div className="flex flex-row flex-wrap gap-[6px]">
          {itemSlots.map((id, index) => (
            <div
              key={`item-slot-${index}-${id ?? "empty"}`}
              className="h-[34px] w-[34px] shrink-0 overflow-hidden rounded-md border border-border bg-bg/45"
            >
              {id && (
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AbilityCasts = ({
  casts,
  spellIcons,
}: {
  casts: number[];
  spellIcons: ChampionSpellIconDto[];
}) => {
  const totalCasts = casts.reduce((total, value) => total + value, 0);

  return (
    <div className="rounded-md border border-border/70 bg-surface/35 px-[7px] py-[6px]">
      <div className="mb-[5px] flex items-center justify-between gap-[8px]">
        <div className="flex min-w-0 items-center gap-[5px]">
          <p className="truncate text-[9px] font-semibold uppercase text-fg-muted">
            Ability casts
          </p>
        </div>
        <p className="shrink-0 text-[10px] font-bold tabular-nums text-fg">
          {totalCasts}
        </p>
      </div>
      <div className="grid grid-cols-4 gap-[4px]">
        {casts.map((value, index) => {
          const spell = spellIcons[index];
          const spellName = spell?.name ?? `Spell ${index + 1}`;

          return (
            <div
              key={`${spellName}-${index}`}
              className="flex min-w-0 items-center gap-[5px] rounded-sm bg-bg/45 px-[5px] py-[4px]"
              title={`${spellName}: ${value} casts`}
              aria-label={`${spellName}: ${value} casts`}
            >
              {spell?.icon ? (
                <img
                  src={spell.icon}
                  alt={spellName}
                  className="h-[20px] w-[20px] shrink-0 rounded-sm object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <HiMiniBolt className="h-[20px] w-[20px] shrink-0 text-accent" />
              )}
              <span className="min-w-0 flex-1 truncate text-right text-[11px] font-semibold tabular-nums text-fg">
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MatchSummaryHeader = ({
  match,
}: {
  match: MatchDto;
}) => (
  <section className="relative overflow-hidden rounded-lg px-[12px] py-[12px] md:px-[14px]">
    <div className="flex flex-col gap-[10px] md:flex-row md:items-end md:justify-start">
      <div className="min-w-0">
        <p className="text-[18px] font-bold leading-tight md:text-[20px]">
          Arena Match
        </p>
        <p className="mt-[3px] truncate text-[11px] text-fg-muted">
          {new Date(match.info.gameCreation).toLocaleString()} /{" "}
          {match.metadata.matchId} / Game duration {formatDuration(match.info.gameDuration)}
        </p>
      </div>
    </div>
  </section>
);

const CDRAGON_GAME_BASE = "https://raw.communitydragon.org/latest/game/";
const STATMOD_ICON_BASE = `${CDRAGON_GAME_BASE}assets/perks/statmods/`;
const STRAWBERRY_STAT_ICON_BASE = `${CDRAGON_GAME_BASE}assets/ux/strawberry/detailview/statsicons/`;
const END_GAME_PRIMARY_STAT_COUNT = 9;
const MISSING_STAT_VALUE = "\u2014";

const statIcon = (file: string): string => `${STATMOD_ICON_BASE}${file}`;
const strawberryStatIcon = (file: string): string =>
  `${STRAWBERRY_STAT_ICON_BASE}${file}`;
const FALLBACK_STAT_ICON = statIcon("statmodsadaptiveforceicon.png");

type EndGameStatRow = {
  label: string;
  value: string;
  icon: string;
};

type EndGameStatSection = {
  title: string;
  rows: EndGameStatRow[];
};

type EndGameStatAvailability = {
  critChance: boolean;
  critDamage: boolean;
  lifesteal: boolean;
  omnivamp: boolean;
  spellVamp: boolean;
  ccReduction: boolean;
  healthRegen: boolean;
  magicPen: boolean;
  magicPenPercent: boolean;
  bonusMagicPenPercent: boolean;
};

type PlayerDamageTimeline = {
  labels: string[];
  dealt: number[];
  taken: number[];
  finalDealt: number;
  finalTaken: number;
};

const EMPTY_END_GAME_STAT_AVAILABILITY: EndGameStatAvailability = {
  critChance: false,
  critDamage: false,
  lifesteal: false,
  omnivamp: false,
  spellVamp: false,
  ccReduction: false,
  healthRegen: false,
  magicPen: false,
  magicPenPercent: false,
  bonusMagicPenPercent: false,
};

const buildParticipantFrameMap = (
  frame?: MatchTimelineFrameDto
): Map<number, MatchTimelineParticipantFrameDto> => {
  const map = new Map<number, MatchTimelineParticipantFrameDto>();

  Object.values(frame?.participantFrames ?? {}).forEach((participantFrame) => {
    map.set(participantFrame.participantId, participantFrame);
  });

  return map;
};

const buildPlayerDamageTimelineMap = (
  frames: MatchTimelineFrameDto[]
): Map<number, PlayerDamageTimeline> => {
  const partialTimelines = new Map<
    number,
    Pick<PlayerDamageTimeline, "labels" | "dealt" | "taken">
  >();

  frames.forEach((frame) => {
    Object.values(frame.participantFrames ?? {}).forEach(
      (participantFrame) => {
        const existing = partialTimelines.get(participantFrame.participantId) ?? {
          labels: [],
          dealt: [],
          taken: [],
        };

        existing.labels.push(formatTimelineTimestamp(frame.timestamp));
        existing.dealt.push(
          participantFrame.damageStats.totalDamageDoneToChampions
        );
        existing.taken.push(participantFrame.damageStats.totalDamageTaken);
        partialTimelines.set(participantFrame.participantId, existing);
      }
    );
  });

  return new Map(
    Array.from(partialTimelines.entries())
      .filter(([, timeline]) => timeline.labels.length >= 2)
      .map(([participantId, timeline]) => [
        participantId,
        {
          ...timeline,
          finalDealt: timeline.dealt[timeline.dealt.length - 1] ?? 0,
          finalTaken: timeline.taken[timeline.taken.length - 1] ?? 0,
        },
      ])
  );
};

const hasOwnField = <T extends object>(
  source: T | undefined,
  key: keyof T
): boolean =>
  !!source && Object.prototype.hasOwnProperty.call(source, key);

const championStatExistsInFrame = (
  frame: MatchTimelineFrameDto | undefined,
  key: keyof MatchTimelineChampionStatsDto
): boolean =>
  Object.values(frame?.participantFrames ?? {}).some((participantFrame) =>
    hasOwnField(participantFrame.championStats, key)
  );

const buildEndGameStatAvailability = (
  finalFrame?: MatchTimelineFrameDto
): EndGameStatAvailability => {
  if (!finalFrame) return EMPTY_END_GAME_STAT_AVAILABILITY;

  return {
    critChance: championStatExistsInFrame(finalFrame, "critChance"),
    critDamage: championStatExistsInFrame(finalFrame, "critDamage"),
    lifesteal: championStatExistsInFrame(finalFrame, "lifesteal"),
    omnivamp: championStatExistsInFrame(finalFrame, "omnivamp"),
    spellVamp: championStatExistsInFrame(finalFrame, "spellVamp"),
    ccReduction: championStatExistsInFrame(finalFrame, "ccReduction"),
    healthRegen: championStatExistsInFrame(finalFrame, "healthRegen"),
    magicPen: championStatExistsInFrame(finalFrame, "magicPen"),
    magicPenPercent: championStatExistsInFrame(finalFrame, "magicPenPercent"),
    bonusMagicPenPercent: championStatExistsInFrame(
      finalFrame,
      "bonusMagicPenPercent"
    ),
  };
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const getChampionStatValue = (
  stats: MatchTimelineChampionStatsDto,
  key: keyof MatchTimelineChampionStatsDto
): number | undefined => {
  const value = stats[key];
  return isFiniteNumber(value) ? value : undefined;
};

const getDamageStatValue = (
  stats: MatchTimelineDamageStatsDto,
  key: keyof MatchTimelineDamageStatsDto
): number | undefined => {
  const value = stats[key];
  return isFiniteNumber(value) ? value : undefined;
};

const formatDecimalStat = (value: number): string => {
  const sign = value < 0 ? "-" : "";
  const absoluteValue = Math.abs(value);
  const normalized = absoluteValue > 10 ? absoluteValue / 100 : absoluteValue;
  return `${sign}${normalized.toFixed(2)}`;
};

const formatPercentStat = (value: number): string => {
  const normalized = Math.abs(value) <= 1 ? value * 100 : value;
  return `${Math.round(normalized)}%`;
};

const formatNumberValue = (
  value: number | undefined,
  formatNumber: (value: number) => string
): string =>
  isFiniteNumber(value) ? formatNumber(value) : MISSING_STAT_VALUE;

const formatDecimalValue = (value: number | undefined): string =>
  isFiniteNumber(value) ? formatDecimalStat(value) : MISSING_STAT_VALUE;

const formatPercentValue = (value: number | undefined): string =>
  isFiniteNumber(value) ? formatPercentStat(value) : MISSING_STAT_VALUE;

const formatCritDamageValue = (value: number | undefined): string => {
  if (!isFiniteNumber(value)) return MISSING_STAT_VALUE;

  const normalized = value <= 5 ? value * 100 : value;
  return `${Math.round(normalized)}%`;
};

const stripItemHtml = (value: string): string =>
  value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractItemArmorPen = (item: ItemDataDto | undefined) => {
  const stats = item?.stats ?? {};
  const text = stripItemHtml(
    `${item?.description ?? ""} ${item?.plaintext ?? ""}`
  );
  const statsFlat = stats.FlatArmorPenetrationMod ?? 0;
  const statsPercent = stats.PercentArmorPenetrationMod ?? 0;
  const statsBonusPercent = stats.PercentBonusArmorPenetrationMod ?? 0;
  let textFlat = 0;
  let textPercent = 0;
  let textBonusPercent = 0;

  for (const match of text.matchAll(/(\d+(?:\.\d+)?)\s+Lethality/gi)) {
    textFlat += Number(match[1]);
  }

  for (const match of text.matchAll(
    /(\d+(?:\.\d+)?)%\s+Armor Penetration/gi
  )) {
    textPercent += Number(match[1]) / 100;
  }

  for (const match of text.matchAll(
    /(\d+(?:\.\d+)?)%\s+Bonus Armor Penetration/gi
  )) {
    textBonusPercent += Number(match[1]) / 100;
  }

  return {
    flat: Math.max(statsFlat, textFlat),
    percent: Math.max(statsPercent, textPercent),
    bonusPercent: Math.max(statsBonusPercent, textBonusPercent),
  };
};

const trustedPositiveStat = (value: number): number | undefined =>
  isFiniteNumber(value) && value > 0 ? value : undefined;

const formatTrustedPercentValue = (value: number | undefined): string =>
  isFiniteNumber(value) && value > 0
    ? formatPercentStat(value)
    : MISSING_STAT_VALUE;

const buildArmorPenRows = ({
  itemData,
  itemIds,
  stats,
  formatNumber,
}: {
  itemData: Record<number, ItemDataDto>;
  itemIds: number[];
  stats: MatchTimelineChampionStatsDto;
  formatNumber: (value: number) => string;
}): EndGameStatRow[] => {
  const itemArmorPen = itemIds.reduce(
    (total, itemId) => {
      const itemPen = extractItemArmorPen(itemData[itemId]);
      return {
        flat: total.flat + itemPen.flat,
        percent: total.percent + itemPen.percent,
        bonusPercent: total.bonusPercent + itemPen.bonusPercent,
      };
    },
    { flat: 0, percent: 0, bonusPercent: 0 }
  );
  const flat =
    trustedPositiveStat(stats.armorPen) ??
    trustedPositiveStat(itemArmorPen.flat);
  const percent =
    trustedPositiveStat(stats.armorPenPercent) ??
    trustedPositiveStat(itemArmorPen.percent);
  const bonusPercent =
    trustedPositiveStat(stats.bonusArmorPenPercent) ??
    trustedPositiveStat(itemArmorPen.bonusPercent);

  return [
    {
      label: "Armor penetration",
      value: isFiniteNumber(flat) ? formatNumber(flat) : MISSING_STAT_VALUE,
      icon: statIcon("statmodsattackdamageicon.png"),
    },
    {
      label: "Armor penetration percent",
      value: formatTrustedPercentValue(percent),
      icon: statIcon("statmodsattackdamageicon.png"),
    },
    {
      label: "Bonus armor penetration",
      value: formatTrustedPercentValue(bonusPercent),
      icon: statIcon("statmodsattackdamageicon.png"),
    },
  ];
};

const cssVar = (name: string): string => {
  if (typeof window === "undefined") return `var(${name})`;
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    `var(${name})`
  );
};

const formatTimelineTimestamp = (milliseconds: number): string => {
  const seconds = Math.max(0, Math.round(milliseconds / 1000));
  return formatDuration(seconds);
};

const formatPlainNumber = (value: number): string =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

const buildEndGameStatSections = ({
  finalFrame,
  availability,
  itemIds,
  itemData,
  formatNumber,
}: {
  finalFrame: MatchTimelineParticipantFrameDto;
  availability: EndGameStatAvailability;
  itemIds: number[];
  itemData: Record<number, ItemDataDto>;
  formatNumber: (value: number) => string;
}): {
  primaryRows: EndGameStatRow[];
  advancedSections: EndGameStatSection[];
} => {
  const finalStats = finalFrame.championStats;
  const armorPenRows = buildArmorPenRows({
    itemData,
    itemIds,
    stats: finalStats,
    formatNumber,
  });

  const championRow = (
    label: string,
    key: keyof MatchTimelineChampionStatsDto,
    icon: string,
    formatter: (value: number | undefined) => string = (value) =>
      formatNumberValue(value, formatNumber)
  ): EndGameStatRow => ({
    label,
    value: formatter(getChampionStatValue(finalStats, key)),
    icon,
  });

  const optionalChampionRow = (
    isAvailable: boolean,
    label: string,
    key: keyof MatchTimelineChampionStatsDto,
    icon: string,
    formatter?: (value: number | undefined) => string
  ): EndGameStatRow | null =>
    isAvailable ? championRow(label, key, icon, formatter) : null;

  const damageRow = (
    label: string,
    key: keyof MatchTimelineDamageStatsDto,
    icon: string
  ): EndGameStatRow => ({
    label,
    value: formatNumberValue(
      getDamageStatValue(finalFrame.damageStats, key),
      formatNumber
    ),
    icon,
  });

  const primaryRows: EndGameStatRow[] = [
    {
      label: "Level",
      value: formatNumberValue(finalFrame.level, formatNumber),
      icon: strawberryStatIcon("exp.png"),
    },
    championRow(
      "Attack damage",
      "attackDamage",
      statIcon("statmodsattackdamageicon.png")
    ),
    championRow(
      "Ability power",
      "abilityPower",
      statIcon("statmodsabilitypowericon.png")
    ),
    championRow("Armor", "armor", statIcon("statmodsarmoricon.png")),
    championRow(
      "Magic resist",
      "magicResist",
      statIcon("statmodsmagicresicon.png")
    ),
    championRow(
      "Attack speed",
      "attackSpeed",
      statIcon("statmodsattackspeedicon.png"),
      formatDecimalValue
    ),
    championRow(
      "Ability haste",
      "abilityHaste",
      statIcon("statmodscdrscalingicon.png")
    ),
    championRow(
      "Max health",
      "healthMax",
      statIcon("statmodshealthplusicon.png")
    ),
    championRow(
      "Movement speed",
      "movementSpeed",
      statIcon("statmodsmovementspeedicon.png")
    ),
  ];

  const advancedSections: EndGameStatSection[] = [
    {
      title: "Crit",
      rows: [
        optionalChampionRow(
          availability.critChance,
          "Critical strike chance",
          "critChance",
          strawberryStatIcon("criticalstrikechance.png"),
          formatPercentValue
        ),
        optionalChampionRow(
          availability.critDamage,
          "Critical strike damage",
          "critDamage",
          strawberryStatIcon("criticalstrikechance.png"),
          formatCritDamageValue
        ),
      ].filter((row): row is EndGameStatRow => row !== null),
    },
    {
      title: "Sustain",
      rows: [
        optionalChampionRow(
          availability.lifesteal,
          "Life steal",
          "lifesteal",
          statIcon("statmodsattackdamageicon.png"),
          formatPercentValue
        ),
        optionalChampionRow(
          availability.omnivamp,
          "Omnivamp",
          "omnivamp",
          FALLBACK_STAT_ICON,
          formatPercentValue
        ),
        optionalChampionRow(
          availability.spellVamp,
          "Spell vamp",
          "spellVamp",
          statIcon("statmodsabilitypowericon.png"),
          formatPercentValue
        ),
      ].filter((row): row is EndGameStatRow => row !== null),
    },
    {
      title: "Survivability",
      rows: [
        optionalChampionRow(
          availability.ccReduction,
          "Tenacity",
          "ccReduction",
          statIcon("statmodstenacityicon.png"),
          formatPercentValue
        ),
        optionalChampionRow(
          availability.healthRegen,
          "Health regen",
          "healthRegen",
          statIcon("statmodshealthplusicon.png")
        ),
      ].filter((row): row is EndGameStatRow => row !== null),
    },
    {
      title: "Armor pen",
      rows: armorPenRows,
    },
    {
      title: "Magic pen",
      rows: [
        optionalChampionRow(
          availability.magicPen,
          "Magic penetration",
          "magicPen",
          statIcon("statmodsabilitypowericon.png")
        ),
        optionalChampionRow(
          availability.magicPenPercent,
          "Magic penetration percent",
          "magicPenPercent",
          statIcon("statmodsabilitypowericon.png"),
          formatPercentValue
        ),
        optionalChampionRow(
          availability.bonusMagicPenPercent,
          "Bonus magic penetration",
          "bonusMagicPenPercent",
          statIcon("statmodsabilitypowericon.png"),
          formatPercentValue
        ),
      ].filter((row): row is EndGameStatRow => row !== null),
    },
    {
      title: "Damage to champions",
      rows: [
        damageRow(
          "Magic",
          "magicDamageDoneToChampions",
          statIcon("statmodsabilitypowericon.png")
        ),
        damageRow(
          "Physical",
          "physicalDamageDoneToChampions",
          statIcon("statmodsattackdamageicon.png")
        ),
        damageRow("True", "trueDamageDoneToChampions", FALLBACK_STAT_ICON),
      ],
    },
    {
      title: "Damage taken",
      rows: [
        damageRow(
          "Magic",
          "magicDamageTaken",
          statIcon("statmodsmagicresicon.png")
        ),
        damageRow(
          "Physical",
          "physicalDamageTaken",
          statIcon("statmodsarmoricon.png")
        ),
        damageRow("True", "trueDamageTaken", FALLBACK_STAT_ICON),
      ],
    },
  ].filter((section) => section.rows.length > 0);

  return { primaryRows, advancedSections };
};

const buildSparklinePoints = (
  values: number[],
  width: number,
  height: number,
  maxValue: number
): string => {
  if (values.length === 0) return "";

  const max = Math.max(maxValue, 1);
  const lastIndex = Math.max(values.length - 1, 1);

  return values
    .map((value, index) => {
      const x = (index / lastIndex) * width;
      const y = height - (value / max) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
};

const PlayerDamageSparkline = ({
  timeline,
}: {
  timeline: PlayerDamageTimeline;
}) => {
  const dealtColor = cssVar("--color-damage-physical");
  const takenColor = cssVar("--color-info");
  const width = 180;
  const height = 34;
  const max = Math.max(...timeline.dealt, ...timeline.taken, 1);
  const dealtPoints = buildSparklinePoints(timeline.dealt, width, height, max);
  const takenPoints = buildSparklinePoints(timeline.taken, width, height, max);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[8px] rounded-sm bg-bg/30 px-[6px] py-[5px]">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[34px] min-w-0"
        role="img"
        aria-label="Damage dealt and tanked preview"
        preserveAspectRatio="none"
      >
        <polyline
          points={takenPoints}
          fill="none"
          stroke={takenColor}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          opacity="0.85"
        />
        <polyline
          points={dealtPoints}
          fill="none"
          stroke={dealtColor}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
      <div className="flex shrink-0 flex-col items-end leading-tight">
        <span className="text-[9px] font-semibold uppercase text-fg-muted">
          Dealt / Tanked
        </span>
        <span className="text-[10px] font-medium tabular-nums text-fg">
          {formatPlainNumber(timeline.finalDealt)} /{" "}
          {formatPlainNumber(timeline.finalTaken)}
        </span>
      </div>
    </div>
  );
};

const PlayerDamageLineChart = ({
  timeline,
}: {
  timeline: PlayerDamageTimeline;
}) => {
  const dealtColor = cssVar("--color-damage-physical");
  const takenColor = cssVar("--color-info");
  const gridColor = cssVar("--color-border");
  const textColor = cssVar("--color-fg-muted");
  const data: ChartData<"line"> = {
    labels: timeline.labels,
    datasets: [
      {
        label: "Damage dealt",
        data: timeline.dealt,
        backgroundColor: `${dealtColor}22`,
        borderColor: dealtColor,
        borderWidth: 2,
        fill: true,
        pointHitRadius: 10,
        pointRadius: 0,
        tension: 0.34,
      },
      {
        label: "Damage tanked",
        data: timeline.taken,
        backgroundColor: `${takenColor}18`,
        borderColor: takenColor,
        borderWidth: 2,
        fill: true,
        pointHitRadius: 10,
        pointRadius: 0,
        tension: 0.34,
      },
    ],
  };
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: {
        labels: {
          boxHeight: 8,
          boxWidth: 8,
          color: textColor,
          font: {
            size: 10,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${formatPlainNumber(
              Number(context.parsed.y)
            )}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: textColor,
          maxTicksLimit: 5,
        },
      },
      y: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
          maxTicksLimit: 4,
          callback: (value) => formatPlainNumber(Number(value)),
        },
      },
    },
  };

  return (
    <div className="flex flex-col gap-[7px] rounded-md border border-border/70 bg-surface/45 p-[8px]">
      <div className="flex flex-row flex-wrap items-center justify-between gap-[6px]">
        <p className="text-[9px] font-semibold uppercase tracking-normal text-fg-muted">
          Damage curve
        </p>
        <p className="text-[10px] font-medium tabular-nums text-fg-muted">
          Dealt {formatPlainNumber(timeline.finalDealt)} / Tanked{" "}
          {formatPlainNumber(timeline.finalTaken)}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-[6px]">
        <DamageCurveTotal
          label="Final dealt"
          value={timeline.finalDealt}
          color={dealtColor}
        />
        <DamageCurveTotal
          label="Final tanked"
          value={timeline.finalTaken}
          color={takenColor}
        />
      </div>
      <div className="h-[178px] min-w-0">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

const DamageCurveTotal = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div className="rounded-sm bg-bg/35 px-[7px] py-[5px]">
    <div className="flex items-center gap-[5px]">
      <span
        className="h-[7px] w-[7px] rounded-full"
        style={{ backgroundColor: color }}
      />
      <p className="text-[9px] font-semibold uppercase text-fg-muted">
        {label}
      </p>
    </div>
    <p className="mt-[2px] text-[12px] font-bold tabular-nums text-fg">
      {formatPlainNumber(value)}
    </p>
  </div>
);

const EndGameStats = ({
  finalFrame,
  damageTimeline,
  availability,
  itemIds,
  itemData,
  abilityCasts,
  spellIcons,
}: {
  finalFrame: MatchTimelineParticipantFrameDto;
  damageTimeline?: PlayerDamageTimeline;
  availability: EndGameStatAvailability;
  itemIds: number[];
  itemData: Record<number, ItemDataDto>;
  abilityCasts: number[];
  spellIcons: ChampionSpellIconDto[];
}) => {
  const [expanded, setExpanded] = useState(false);
  const { formatNumber } = useFormatter();
  const { primaryRows, advancedSections } = buildEndGameStatSections({
    finalFrame,
    availability,
    itemIds,
    itemData,
    formatNumber,
  });
  const hasAdvancedDetails = advancedSections.length > 0 || abilityCasts.length > 0;

  return (
    <div className="flex flex-col gap-[5px] border-t border-border/60 pt-[7px]">
      <div className="grid grid-cols-3 gap-[5px] sm:grid-cols-4 xl:grid-cols-6">
        {primaryRows.map((row) => (
          <EndGameStatChip key={row.label} row={row} />
        ))}
      </div>
      <button
        type="button"
        className="flex w-fit flex-row items-center gap-[3px] rounded-sm px-[2px] text-[10px] font-medium uppercase text-fg-muted hover:text-fg disabled:pointer-events-none disabled:opacity-40"
        aria-expanded={expanded}
        disabled={!hasAdvancedDetails}
        onClick={() => setExpanded((isExpanded) => !isExpanded)}
      >
        Advanced
        <HiMiniChevronDown
          className={`text-[13px] transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>
      {damageTimeline && !expanded && (
        <PlayerDamageSparkline timeline={damageTimeline} />
      )}
      {expanded && hasAdvancedDetails && (
        <div className="flex flex-col gap-[7px] rounded-sm bg-bg/30 p-[6px]">
          {damageTimeline && (
            <PlayerDamageLineChart timeline={damageTimeline} />
          )}
          <AbilityCasts casts={abilityCasts} spellIcons={spellIcons} />
          {advancedSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-[4px]">
              <p className="text-[9px] font-semibold uppercase tracking-normal text-fg-muted">
                {section.title}
              </p>
              <div className="grid grid-cols-2 gap-[5px] sm:grid-cols-3 xl:grid-cols-4">
                {section.rows.map((row) => (
                  <EndGameStatChip key={row.label} row={row} compact />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EndGameStatsSkeleton = () => (
  <div
    className="flex flex-col gap-[5px] border-t border-border/60 pt-[7px]"
    aria-label="Loading end-game stats"
  >
    <div className="grid grid-cols-3 gap-[5px] sm:grid-cols-4 xl:grid-cols-6">
      {[...Array(END_GAME_PRIMARY_STAT_COUNT)].map((_, i) => (
        <div
          key={`end-stat-skeleton-${i}`}
          className="flex min-w-0 flex-row items-center gap-[5px] rounded-sm bg-surface-elevated/40 px-[7px] py-[5px]"
        >
          <div className="h-[20px] w-[20px] shrink-0 animate-pulse rounded-sm bg-border/70" />
          <div className="h-[12px] min-w-0 flex-1 animate-pulse rounded bg-border/60" />
        </div>
      ))}
    </div>
    <div className="h-[14px] w-[76px] animate-pulse rounded-sm bg-border/50" />
  </div>
);

const EndGameStatChip = ({
  row,
  compact = false,
}: {
  row: EndGameStatRow;
  compact?: boolean;
}) => (
  <div
    className={`flex min-w-0 flex-row items-center gap-[5px] rounded-sm bg-surface-elevated/55 leading-tight ${
      compact ? "px-[5px] py-[3px]" : "px-[7px] py-[5px]"
    }`}
    title={row.label}
  >
    <img
      src={row.icon}
      alt={row.label}
      className={`${compact ? "h-[16px] w-[16px]" : "h-[20px] w-[20px]"} shrink-0 object-contain`}
      loading="lazy"
      decoding="async"
      onError={(event) => {
        const image = event.currentTarget;

        if (image.dataset.fallbackApplied === "true") {
          image.style.display = "none";
          return;
        }

        image.dataset.fallbackApplied = "true";
        image.src = FALLBACK_STAT_ICON;
      }}
    />
    <p
      className={`min-w-0 truncate font-medium tabular-nums text-fg ${
        compact ? "text-[11px]" : "text-[12px]"
      }`}
    >
      {row.value}
    </p>
  </div>
);

const Stat = ({
  icon,
  label,
  value,
  isLeader = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLeader?: boolean;
}) => (
  <div className="grid grid-cols-[14px_minmax(0,1fr)] items-center gap-[4px]">
    <span className="flex items-center justify-center">{icon}</span>
    <div className="flex flex-col leading-tight">
      <span className="text-[9px] uppercase opacity-60">{label}</span>
      <span className="grid grid-cols-[minmax(0,auto)_12px] items-center gap-[2px] font-medium tabular-nums leading-none">
        <span className="min-w-0 truncate">{value}</span>
        {isLeader && (
          <HiMiniStar
            className="text-[12px] text-accent"
            title={`Match leader: ${label.toLowerCase()}`}
          />
        )}
      </span>
    </div>
  </div>
);

const MatchDetailSkeleton = () => (
  <div className="flex flex-col gap-[16px] animate-pulse">
    <div className="flex flex-col gap-[6px]">
      <div className="h-[20px] w-[140px] bg-border rounded" />
      <div className="h-[11px] w-[260px] bg-border/70 rounded" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
      {[...Array(4)].map((_, teamIdx) => (
        <div
          key={`team-skeleton-${teamIdx}`}
          className="rounded-md border-l-4 border-border bg-surface p-[8px]"
        >
          <div className="h-[12px] w-[64px] bg-border rounded mb-[8px]" />
          <div className="flex flex-col gap-[8px]">
            {[...Array(2)].map((_, playerIdx) => (
              <ParticipantRowSkeleton key={`player-skeleton-${playerIdx}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ParticipantRowSkeleton = () => (
  <div className="flex flex-col gap-[6px] p-[8px] rounded bg-surface/60">
    <div className="flex flex-row items-center gap-[8px]">
      <div className="h-[40px] w-[40px] rounded-full bg-border shrink-0" />
      <div className="flex flex-col flex-1 gap-[4px] min-w-0">
        <div className="h-[12px] w-[140px] bg-border rounded" />
        <div className="h-[10px] w-[100px] bg-border/70 rounded" />
      </div>
    </div>
    <div className="grid grid-cols-1 gap-[8px] rounded-md border border-border/70 bg-surface/45 p-[7px] xl:grid-cols-[auto_minmax(0,1fr)]">
      <div className="min-w-0">
        <div className="mb-[4px] h-[9px] w-[52px] rounded bg-border/70" />
        <div className="flex flex-row flex-wrap gap-[6px]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`augment-skeleton-${i}`}
              className="h-[34px] w-[34px] shrink-0 rounded-md bg-border"
            />
          ))}
        </div>
      </div>
      <div className="min-w-0">
        <div className="mb-[4px] h-[9px] w-[34px] rounded bg-border/70" />
        <div className="flex flex-row flex-wrap gap-[6px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`item-skeleton-${i}`}
              className="h-[34px] w-[34px] shrink-0 rounded-md bg-border"
            />
          ))}
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-[4px]">
      {[...Array(6)].map((_, i) => (
        <div key={`stat-skeleton-${i}`} className="flex flex-row items-center gap-[4px]">
          <div className="h-[14px] w-[14px] bg-border rounded" />
          <div className="flex flex-col gap-[2px]">
            <div className="h-[8px] w-[40px] bg-border/70 rounded" />
            <div className="h-[10px] w-[28px] bg-border rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default MatchDetailModal;
