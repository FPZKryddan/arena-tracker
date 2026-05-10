import { lazy, Suspense, useMemo, useState } from "react";
import { PlayerStatsContext } from "../../contexts/PlayerStatsContext";
import useContextIfDefined from "../../hooks/useContextIfDefined";
import useDdragonVersion from "../../hooks/useDdragonVersion";
import {
  useAugmentsQuery,
  useMatchesQuery,
  useRecentMatchIdsQuery,
} from "../../hooks/queries";
import type { augmentsData, MatchDto, ParticipantDto } from "../../types";
import { getChampionIconUrl, getProfileIconUrl } from "../../championIcon";
const MatchDetailModal = lazy(() => import("../matchDetail"));

const RECENT_LIMIT = 10;

const placementColor = (placement: number): string => {
  if (placement === 1) return "bg-placement-first/20 border-placement-first";
  if (placement <= 4) return "bg-success/15 border-success";
  return "bg-surface-elevated border-border";
};

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const formatRelative = (timestamp: number): string => {
  const diffMs = Date.now() - timestamp;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days}d ago`;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours > 0) return `${hours}h ago`;
  const mins = Math.floor(diffMs / (1000 * 60));
  return `${mins}m ago`;
};

const MatchHistoryList = () => {
  const { playerStats } = useContextIfDefined(PlayerStatsContext);
  const { data: matchIds = [], isLoading: idsLoading } = useRecentMatchIdsQuery(
    playerStats?.gameName,
    playerStats?.tagLine,
    RECENT_LIMIT
  );

  const matchQueries = useMatchesQuery(matchIds);
  const matches = useMemo(
    () =>
      matchQueries
        .map((q) => q.data)
        .filter((m): m is MatchDto => !!m),
    [matchQueries]
  );
  const matchesLoading = matchQueries.some((q) => q.isLoading);

  const [openMatchId, setOpenMatchId] = useState<string | null>(null);

  const loading = !playerStats || idsLoading || matchesLoading;

  const matchRows = useMemo(() => {
    if (!playerStats) return [];
    return matches.map((match) => ({
      match,
      me:
        match.info.participants.find((p) => p.puuid === playerStats.puuid) ??
        match.info.participants[0],
    }));
  }, [matches, playerStats]);

  return (
    <div className="flex flex-col gap-[8px] w-full">
      <h2 className="text-[12px] font-bold text-fg">
        MATCH HISTORY
      </h2>
      {loading && matches.length === 0 && <MatchHistorySkeleton />}
      {!loading && matches.length === 0 && (
        <p className="text-fg-muted text-[12px]">No recent matches.</p>
      )}
      {matchRows.length > 0 && (
        <ul className="flex flex-col gap-[6px]">
          {matchRows.map(({ match, me }) => (
            <MatchHistoryRow
              key={match.metadata.matchId}
              match={match}
              me={me}
              onClick={() => setOpenMatchId(match.metadata.matchId)}
            />
          ))}
        </ul>
      )}
      <Suspense fallback={null}>
        <MatchDetailModal
          matchId={openMatchId}
          isOpen={openMatchId !== null}
          onClose={() => setOpenMatchId(null)}
          highlightPuuid={playerStats?.puuid}
        />
      </Suspense>
    </div>
  );
};

interface MatchHistoryRowProps {
  match: MatchDto;
  me: ParticipantDto;
  onClick: () => void;
}

const MatchHistoryRow = ({ match, me, onClick }: MatchHistoryRowProps) => {
  const version = useDdragonVersion();
  const { data: augmentList = [] } = useAugmentsQuery();
  const augments = useMemo(() => {
    const map = new Map<number, augmentsData>();
    for (const a of augmentList) map.set(a.id, a);
    return map;
  }, [augmentList]);

  const teammate = useMemo(
    () =>
      match.info.participants.find(
        (p) => p.puuid !== me.puuid && p.playerSubteamId === me.playerSubteamId
      ),
    [match, me]
  );

  const items = useMemo(
    () =>
      [me.item0, me.item1, me.item2, me.item3, me.item4, me.item5].filter(
        (id) => id && id !== 0
      ),
    [me]
  );

  const augmentIds = useMemo(
    () =>
      [
        me.playerAugment1,
        me.playerAugment2,
        me.playerAugment3,
        me.playerAugment4,
      ].filter((id) => id && id !== 0),
    [me]
  );

  return (
    <li
      onClick={onClick}
      className={`flex flex-row items-center gap-[8px] rounded-md border-l-4 p-[8px] text-[10px] text-fg transition-colors hover:cursor-pointer hover:bg-surface-hover ${placementColor(
        me.placement
      )}`}
    >
      <div className="h-[40px] aspect-square rounded-full overflow-hidden shrink-0">
        <img
          className="h-full w-auto aspect-square scale-110"
          src={getChampionIconUrl(version, me.championName)}
          alt={me.championName}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <p className="font-bold">#{me.placement}</p>
        <p className="truncate">{me.championName}</p>
        {teammate && <TeammatePreview teammate={teammate} version={version} />}
      </div>
      <div className="flex flex-col gap-[2px]">
        <div className="flex flex-row gap-[2px]">
          {augmentIds.map((id, i) => {
            const a = augments.get(id);
            if (!a) return null;
            return (
              <div
                key={`a-${i}-${id}`}
                className={`h-[28px] w-[28px] rounded-sm bg-surface-elevated overflow-hidden augment-${a.rarity}`}
              >
                <img
                  src={`https://raw.communitydragon.org/latest/game/${a.iconSmall}`}
                  alt={a.name}
                  title={a.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain"
                />
              </div>
            );
          })}
        </div>
        <div className="flex flex-row gap-[2px]">
          {items.map((id, i) => (
            <img
              key={`i-${i}-${id}`}
              src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-[28px] w-[28px] rounded-sm"
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col text-right shrink-0">
        <p>
          {me.kills}/{me.deaths}/{me.assists}
        </p>
        <p className="text-fg-muted">{formatDuration(match.info.gameDuration)}</p>
        <p className="text-fg-subtle">{formatRelative(match.info.gameCreation)}</p>
      </div>
    </li>
  );
};

interface TeammatePreviewProps {
  teammate: ParticipantDto;
  version: string;
}

const TeammatePreview = ({ teammate, version }: TeammatePreviewProps) => {
  const teammateName = teammate.riotIdGameName || teammate.summonerName;

  return (
    <div className="flex flex-row items-center gap-[4px] min-w-0 text-fg-muted">
      <div className="relative h-[22px] w-[38px] shrink-0">
        <img
          src={getProfileIconUrl(version, teammate.profileIcon)}
          alt={`${teammateName} profile icon`}
          title={`${teammateName} profile icon`}
          loading="lazy"
          decoding="async"
          className="absolute left-0 top-[1px] h-[20px] w-[20px] rounded-full object-cover bg-surface-elevated"
        />
        <img
          src={getChampionIconUrl(version, teammate.championName)}
          alt={teammate.championName}
          title={teammate.championName}
          loading="lazy"
          decoding="async"
          className="absolute left-[16px] top-0 h-[22px] w-[22px] rounded-full object-cover bg-surface-elevated ring-2 ring-surface"
        />
      </div>
      <p className="truncate">
        w/ {teammateName} on {teammate.championName}
      </p>
    </div>
  );
};

const MatchHistorySkeleton = () => {
  return (
    <ul className="flex flex-col gap-[6px]">
      {Array.from({ length: RECENT_LIMIT }).map((_, i) => (
        <li
          key={`match-skeleton-${i}`}
          className="h-[56px] rounded-md bg-surface-elevated/50 animate-pulse"
        />
      ))}
    </ul>
  );
};

export default MatchHistoryList;
