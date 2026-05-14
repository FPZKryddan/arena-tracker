import { lazy, Suspense, useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { PlayerStatsContext } from "../../contexts/PlayerStatsContext";
import useContextIfDefined from "../../hooks/useContextIfDefined";
import useDdragonVersion from "../../hooks/useDdragonVersion";
import { normalizeRegion } from "../../hooks/useApiBase";
import {
  useAugmentsQuery,
  useMatchesQuery,
  useRecentMatchIdsQuery,
} from "../../hooks/queries";
import { MATCH_QUERY_PARAM } from "../../utils/matchLinks";
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
  const { playerStats, loadedProfile } = useContextIfDefined(PlayerStatsContext);
  const params = useParams<{ region: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const profileRegion = loadedProfile?.region ?? normalizeRegion(params.region);
  const openMatchId = searchParams.get(MATCH_QUERY_PARAM);
  const { data: matchIds = [], isLoading: idsLoading } = useRecentMatchIdsQuery(
    playerStats?.gameName,
    playerStats?.tagLine,
    RECENT_LIMIT,
    profileRegion
  );

  const matchQueries = useMatchesQuery(matchIds, profileRegion);
  const matches = useMemo(
    () =>
      matchQueries
        .map((q) => q.data)
        .filter((m): m is MatchDto => !!m),
    [matchQueries]
  );
  const matchesLoading = matchQueries.some((q) => q.isLoading);

  const setOpenMatchId = useCallback(
    (matchId: string | null) => {
      const nextParams = new URLSearchParams(searchParams);

      if (matchId) {
        nextParams.set(MATCH_QUERY_PARAM, matchId);
      } else {
        nextParams.delete(MATCH_QUERY_PARAM);
      }

      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams]
  );

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
    <div className="flex flex-col gap-2 w-full">
      <h2 className="text-xs font-semibold text-fg">
        MATCH HISTORY
      </h2>
      {loading && matches.length === 0 && <MatchHistorySkeleton />}
      {!loading && matches.length === 0 && (
        <p className="text-fg-muted text-xs">No recent matches.</p>
      )}
      {matchRows.length > 0 && (
        <ul className="flex flex-col gap-1.5">
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
          region={profileRegion}
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
      [me.item0, me.item1, me.item2, me.item3, me.item4, me.item5],
    [me]
  );

  const augmentIds = useMemo(
    () =>
      [
        me.playerAugment1,
        me.playerAugment2,
        me.playerAugment3,
        me.playerAugment4,
      ],
    [me]
  );

  return (
    <li
      onClick={onClick}
      className={`flex flex-row items-center gap-2 rounded-md border-l-4 p-2 text-xs text-fg transition-colors hover:cursor-pointer hover:bg-surface-hover ${placementColor(
        me.placement
      )}`}
    >
      <div className="h-10 aspect-square rounded-full overflow-hidden shrink-0">
        <img
          className="h-full w-auto aspect-square scale-110"
          src={getChampionIconUrl(version, me.championName)}
          alt={me.championName}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <p className="font-semibold">#{me.placement}</p>
        <p className="truncate">{me.championName}</p>
        {teammate && <TeammatePreview teammate={teammate} version={version} />}
      </div>
      <MatchHistoryLoadout
        augmentIds={augmentIds}
        augments={augments}
        items={items}
        version={version}
      />
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

const MatchHistoryLoadout = ({
  augmentIds,
  augments,
  items,
  version,
}: {
  augmentIds: number[];
  augments: Map<number, augmentsData>;
  items: number[];
  version: string;
}) => (
  <div className="grid w-44 shrink-0 grid-cols-6 gap-0.5">
    {Array.from({ length: 6 }).map((_, slot) => {
      const id = augmentIds[slot];
      const augment = id ? augments.get(id) : undefined;

      return (
        <div
          key={`a-slot-${slot}-${id ?? "empty"}`}
          className="h-7 w-7 overflow-hidden rounded-sm border border-border bg-surface-elevated"
          title={augment?.name}
        >
          {augment && (
            <img
              src={`https://raw.communitydragon.org/latest/game/${augment.iconLarge}`}
              alt={augment.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain"
            />
          )}
        </div>
      );
    })}
    {Array.from({ length: 6 }).map((_, slot) => {
      const id = items[slot];

      return (
        <div
          key={`i-slot-${slot}-${id ?? "empty"}`}
          className="h-7 w-7 overflow-hidden rounded-sm border border-border bg-surface-elevated"
        >
          {id ? (
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
      );
    })}
  </div>
);

interface TeammatePreviewProps {
  teammate: ParticipantDto;
  version: string;
}

const TeammatePreview = ({ teammate, version }: TeammatePreviewProps) => {
  const teammateName = teammate.riotIdGameName || teammate.summonerName;

  return (
    <div className="flex flex-row items-center gap-1 min-w-0 text-fg-muted">
      <div className="relative h-5 w-9 shrink-0">
        <img
          src={getProfileIconUrl(version, teammate.profileIcon)}
          alt={`${teammateName} profile icon`}
          title={`${teammateName} profile icon`}
          loading="lazy"
          decoding="async"
          className="absolute left-0 top-0 h-5 w-5 rounded-full object-cover bg-surface-elevated"
        />
        <img
          src={getChampionIconUrl(version, teammate.championName)}
          alt={teammate.championName}
          title={teammate.championName}
          loading="lazy"
          decoding="async"
          className="absolute left-4 top-0 h-5 w-5 rounded-full object-cover bg-surface-elevated ring-2 ring-surface"
        />
      </div>
      <p className="truncate">
        w/ {teammateName} on {teammate.championName}
      </p>
    </div>
  );
};

const MatchHistorySkeleton = () => {
  const rowTones = [
    "border-placement-first/60 bg-placement-first/10",
    "border-success/60 bg-success/10",
    "border-surface-elevated bg-surface-elevated/70",
    "border-border bg-surface-elevated/50",
  ];

  return (
    <ul className="flex flex-col gap-1.5 animate-pulse" aria-label="Loading match history">
      {Array.from({ length: RECENT_LIMIT }).map((_, i) => (
        <li
          key={`match-skeleton-${i}`}
          className={`flex flex-row items-center gap-2 rounded-md border-l-4 p-2 ${rowTones[i % rowTones.length]}`}
        >
          <div className="h-10 aspect-square shrink-0 rounded-full bg-border" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="h-2.5 w-6 rounded-sm bg-border" />
            <div className="h-2.5 w-20 max-w-full rounded-sm bg-border/80" />
            <div className="flex min-w-0 flex-row items-center gap-1">
              <div className="relative h-5 w-9 shrink-0">
                <div className="absolute left-0 top-0 h-5 w-5 rounded-full bg-border/70" />
                <div className="absolute left-4 top-0 h-5 w-5 rounded-full bg-border ring-2 ring-surface" />
              </div>
              <div className="h-2 w-28 max-w-[70%] rounded-sm bg-border/70" />
            </div>
          </div>
          <div className="grid w-44 shrink-0 grid-cols-6 gap-0.5">
            {Array.from({ length: 12 }).map((_, slot) => (
              <div
                key={`match-loadout-skeleton-${i}-${slot}`}
                className="h-7 w-7 rounded-sm bg-border"
              />
            ))}
          </div>
          <div className="flex w-10 shrink-0 flex-col items-end gap-1">
            <div className="h-2.5 w-8 rounded-sm bg-border" />
            <div className="h-2 w-7 rounded-sm bg-border/75" />
            <div className="h-2 w-9 rounded-sm bg-border/60" />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default MatchHistoryList;
