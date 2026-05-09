import { useMemo } from "react";
import { AnimatePresence, easeOut, motion } from "framer-motion";
import { HiMiniXMark } from "react-icons/hi2";
import { GiBroadsword, GiShield, GiHealthNormal, GiArrowDunk, GiAcrobatic } from "react-icons/gi";
import { FaShieldAlt } from "react-icons/fa";
import { HiMiniStar } from "react-icons/hi2";
import useDdragonVersion from "../../hooks/useDdragonVersion";
import { useAugmentsQuery, useMatchQuery } from "../../hooks/queries";
import useFormatter from "../../hooks/useFormatter";
import { getChampionIconUrl } from "../../championIcon";
import type { augmentsData, MatchDto, ParticipantDto } from "../../types";

interface MatchDetailModalProps {
  matchId: string | null;
  isOpen: boolean;
  onClose: () => void;
  highlightPuuid?: string;
}

const placementClass = (placement: number): string => {
  if (placement === 1) return "bg-accent/15 border-accent";
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
}: MatchDetailModalProps) => {
  const { data: match, isLoading: loading } = useMatchQuery(
    isOpen ? matchId : null
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: easeOut }}
            className="fixed inset-0 z-50 backdrop-blur-md bg-overlay"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: easeOut }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-[12px] md:p-[24px] pointer-events-none"
          >
            <div className="bg-surface-elevated text-fg rounded-2xl w-full max-w-[1100px] max-h-[90vh] overflow-y-auto p-[16px] md:p-[24px] relative pointer-events-auto shadow-2xl">
              <button
                className="absolute top-[12px] right-[12px] text-fg hover:opacity-70"
                onClick={onClose}
              >
                <HiMiniXMark className="text-2xl" />
              </button>
              {loading && <MatchDetailSkeleton />}
              {!loading && !match && (
                <p className="text-[12px]">Could not load match.</p>
              )}
              {match && (
                <MatchDetailContent
                  match={match}
                  highlightPuuid={highlightPuuid}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

interface MatchDetailContentProps {
  match: MatchDto;
  highlightPuuid?: string;
}

const MatchDetailContent = ({
  match,
  highlightPuuid,
}: MatchDetailContentProps) => {
  const { data: augmentList = [] } = useAugmentsQuery();
  const augmentLookup = useMemo(() => {
    const map = new Map<number, augmentsData>();
    for (const a of augmentList) map.set(a.id, a);
    return map;
  }, [augmentList]);

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
      <div className="flex flex-col">
        <p className="text-[18px] md:text-[20px] font-bold">Arena Match</p>
        <p className="text-[11px] text-fg-muted">
          {new Date(match.info.gameCreation).toLocaleString()} •{" "}
          {formatDuration(match.info.gameDuration)} • {match.metadata.matchId}
        </p>
      </div>
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
}

const ParticipantRow = ({
  participant: p,
  augmentLookup,
  isHighlighted,
  leaders,
}: ParticipantRowProps) => {
  const version = useDdragonVersion();
  const { formatNumber } = useFormatter();
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
        isHighlighted ? "bg-surface-elevated ring-2 ring-info" : "bg-surface/60"
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
            {p.championName} • {p.kills}/{p.deaths}/{p.assists}
          </p>
        </div>
      </div>

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

      <div className="flex flex-row flex-wrap gap-[6px] items-center">
        <div className="flex flex-row gap-[3px]">
          {augmentIds.map((id, i) => {
            const a = augmentLookup.get(id);
            if (!a) return null;
            return (
              <div
                key={`aug-${i}-${id}`}
                className={`h-[28px] w-[28px] rounded-md bg-surface-elevated overflow-hidden augment-${a.rarity}`}
              >
                <img
                  src={`https://raw.communitydragon.org/latest/game/${a.iconSmall}`}
                  alt={a.name}
                  title={a.name}
                  className="h-full w-full object-contain"
                />
              </div>
            );
          })}
        </div>
        <div className="flex flex-row gap-[2px]">
          {items.map((id, i) => (
            <img
              key={`item-${i}-${id}`}
              src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`}
              alt=""
              className="h-[24px] w-[24px] rounded-sm"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

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
  <div className="flex flex-row items-center gap-[4px]">
    {icon}
    <div className="flex flex-col leading-tight">
      <span className="opacity-60 text-[9px] uppercase tracking-wide">
        {label}
      </span>
      <span className="font-medium tabular-nums flex flex-row items-center gap-[2px]">
        {value}
        {isLeader && (
          <HiMiniStar
            className="text-accent text-[12px]"
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
    <div className="flex flex-row flex-wrap gap-[6px] items-center">
      <div className="flex flex-row gap-[3px]">
        {[...Array(4)].map((_, i) => (
          <div key={`augment-skeleton-${i}`} className="h-[28px] w-[28px] rounded-md bg-border" />
        ))}
      </div>
      <div className="flex flex-row gap-[2px]">
        {[...Array(6)].map((_, i) => (
          <div key={`item-skeleton-${i}`} className="h-[24px] w-[24px] rounded-sm bg-border" />
        ))}
      </div>
    </div>
  </div>
);

export default MatchDetailModal;
