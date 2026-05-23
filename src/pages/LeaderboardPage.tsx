import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  IoChevronBack,
  IoChevronDown,
  IoChevronForward,
  IoStatsChart,
  IoTrophy,
} from "react-icons/io5";
import { ClipLoader } from "react-spinners";
import { getChampionIconUrl, getProfileIconUrl } from "../championIcon";
import ArenaModeSelector from "../components/arenaModeSelector";
import RegionSelector from "../components/summonerInput/RegionSelector";
import Tooltip from "../components/Tooltip/Tooltip";
import { useAugmentsQuery, useLeaderboardQuery } from "../hooks/queries";
import { getStoredRegion, normalizeRegion } from "../hooks/useApiBase";
import useDdragonVersion from "../hooks/useDdragonVersion";
import { ApiError, formatApiError } from "../utils/apiError";
import {
  DEFAULT_ARENA_MODE,
  parseArenaMode,
} from "../utils/arenaModes";
import type {
  ArenaModeSelection,
  augmentsData,
  LeaderboardAugment,
  LeaderboardChampion,
  LeaderboardOrder,
  LeaderboardPlayer,
  LeaderboardSort,
  Regions,
} from "../types";

type Region = Exclude<Regions, null>;
type AugmentsById = Map<number, augmentsData>;

type LeaderboardColumn = {
  label: string;
  sortBy: LeaderboardSort;
  headerClassName?: string;
  cellClassName?: string;
  render: (player: LeaderboardPlayer) => string;
};

const PAGE_SIZE = 20;
const CDRAGON_BASE = "https://raw.communitydragon.org/latest/game/";

const numberFormatter = new Intl.NumberFormat("en-US");
const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const formatInteger = (value: number) => numberFormatter.format(value);
const formatCompact = (value: number) => compactFormatter.format(value);
const formatPlacement = (value: number) => value.toFixed(2);

const LEADERBOARD_COLUMNS: LeaderboardColumn[] = [
  {
    label: "Games",
    sortBy: "gamesPlayed",
    render: (player) => formatInteger(player.gamesPlayed),
  },
  {
    label: "1sts",
    sortBy: "firstPlaces",
    render: (player) => formatInteger(player.firstPlaces),
  },
  {
    label: "Top 4",
    sortBy: "top4",
    render: (player) => formatInteger(player.top4),
  },
  {
    label: "Avg",
    sortBy: "placementAvg",
    render: (player) => formatPlacement(player.placementAvg),
  },
  {
    label: "Damage",
    sortBy: "damageDealt",
    headerClassName: "min-w-28",
    render: (player) => formatCompact(player.totalDamageDealt),
  },
  {
    label: "Tanked",
    sortBy: "damageTanked",
    headerClassName: "min-w-28",
    render: (player) => formatCompact(player.totalDamageTanked),
  },
  {
    label: "Healing",
    sortBy: "healing",
    headerClassName: "min-w-24",
    render: (player) => formatCompact(player.healing),
  },
  {
    label: "Shielding",
    sortBy: "shielding",
    headerClassName: "min-w-24",
    render: (player) => formatCompact(player.shielding),
  },
  {
    label: "Hit",
    sortBy: "skillshotsHit",
    headerClassName: "min-w-24",
    render: (player) => formatInteger(player.skillshotsHit),
  },
  {
    label: "Dodged",
    sortBy: "skillshotsDodged",
    headerClassName: "min-w-24",
    render: (player) => formatInteger(player.skillshotsDodged),
  },
];

const getDefaultOrder = (nextSortBy: LeaderboardSort): LeaderboardOrder =>
  nextSortBy === "placementAvg" ? "asc" : "desc";

const getPlayerKey = (player: LeaderboardPlayer) =>
  `${player.region}:${player.name.toLowerCase()}#${player.tag.toLowerCase()}`;

const getProfilePath = (
  player: LeaderboardPlayer,
  arenaMode: ArenaModeSelection = DEFAULT_ARENA_MODE
): string => {
  const path = `/profile/${player.region}/${encodeURIComponent(
    player.name
  )}/${encodeURIComponent(player.tag)}`;
  if (arenaMode === DEFAULT_ARENA_MODE) return path;
  return `${path}?${new URLSearchParams({ mode: arenaMode }).toString()}`;
};

const LeaderboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [region, setRegion] = useState<Region>(() => getStoredRegion());
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<LeaderboardSort>("firstPlaces");
  const [order, setOrder] = useState<LeaderboardOrder>("desc");
  const arenaMode = parseArenaMode(searchParams.get("mode"));

  const { data, error, isFetching, isLoading } = useLeaderboardQuery(
    page,
    PAGE_SIZE,
    region,
    sortBy,
    order,
    arenaMode
  );
  const { data: augments = [] } = useAugmentsQuery();
  const augmentsById = useMemo(() => {
    const map: AugmentsById = new Map();
    for (const augment of augments) map.set(augment.id, augment);
    return map;
  }, [augments]);

  const players = data?.players ?? [];
  const pagination = data?.pagination;
  const startRank = pagination
    ? (pagination.page - 1) * pagination.limit + 1
    : (page - 1) * PAGE_SIZE + 1;
  const errorMessage = getLeaderboardError(error, region);

  const podiumPlayers = players.slice(0, 3);

  const handleRegionChange = useCallback((value: Regions) => {
    if (!value) return;
    setRegion(normalizeRegion(value));
    setPage(1);
  }, []);
  const handleArenaModeChange = useCallback(
    (nextMode: ArenaModeSelection) => {
      setPage(1);
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        if (nextMode === DEFAULT_ARENA_MODE) {
          next.delete("mode");
        } else {
          next.set("mode", nextMode);
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const handleSortClick = useCallback(
    (nextSortBy: LeaderboardSort) => {
      setPage(1);
      if (nextSortBy === sortBy) {
        setOrder((current) => (current === "asc" ? "desc" : "asc"));
        return;
      }
      setSortBy(nextSortBy);
      setOrder(getDefaultOrder(nextSortBy));
    },
    [sortBy]
  );

  return (
    <div className="box-border flex min-h-dvh w-full flex-col gap-5 bg-bg p-3 text-fg md:gap-7 md:p-6">
      <main className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4">
        <section className="flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-fg-subtle">
              {region} standings
            </p>
            <h1 className="mt-1 truncate text-2xl font-semibold leading-tight md:text-2xl">
              Leaderboard
            </h1>
            <p className="mt-1 text-sm text-fg-muted">
              Tracked Arena players ranked by the selected stat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ArenaModeSelector
              value={arenaMode}
              onChange={handleArenaModeChange}
            />
            <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-bg px-3">
              <span className="text-xs font-semibold uppercase text-fg-subtle">
                Region
              </span>
              <RegionSelector
                initialRegion={region}
                updateRegionCallback={handleRegionChange}
              />
            </div>
            {isFetching && !isLoading && (
              <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-bg px-3 text-xs font-semibold text-info">
                <ClipLoader size={14} color="var(--color-info)" />
                Updating
              </div>
            )}
          </div>
        </section>

        {isLoading ? (
          <LeaderboardSkeleton />
        ) : errorMessage ? (
          <LeaderboardState
            icon={<IoStatsChart className="h-5 w-5" />}
            title="Could not load leaderboard"
            body={errorMessage}
          />
        ) : players.length === 0 ? (
          <LeaderboardState
            icon={<IoTrophy className="h-5 w-5" />}
            title="No leaderboard results"
            body={`No tracked players were found for ${region}.`}
          />
        ) : (
          <>
            {page === 1 && (
              <LeaderboardPodium
                players={podiumPlayers}
                startRank={startRank}
                arenaMode={arenaMode}
              />
            )}
            <LeaderboardTable
              players={players}
              startRank={startRank}
              sortBy={sortBy}
              order={order}
              arenaMode={arenaMode}
              onSortClick={handleSortClick}
              augmentsById={augmentsById}
            />
            {pagination && (
              <LeaderboardPagination
                page={pagination.page}
                total={pagination.total}
                totalPages={pagination.totalPages}
                hasNextPage={pagination.hasNextPage}
                hasPreviousPage={pagination.hasPreviousPage}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

interface LeaderboardPodiumProps {
  players: LeaderboardPlayer[];
  startRank: number;
  arenaMode: ArenaModeSelection;
}

const LeaderboardPodium = ({
  players,
  startRank,
  arenaMode,
}: LeaderboardPodiumProps) => {
  if (players.length === 0) return null;

  const [first, second, third] = players;

  return (
    <section className="flex flex-row items-end justify-center gap-2 sm:gap-3">
      {second && (
        <PodiumSlot
          player={second}
          rank={startRank + 1}
          placement={2}
          arenaMode={arenaMode}
        />
      )}
      <PodiumSlot
        player={first}
        rank={startRank}
        placement={1}
        arenaMode={arenaMode}
      />
      {third && (
        <PodiumSlot
          player={third}
          rank={startRank + 2}
          placement={3}
          arenaMode={arenaMode}
        />
      )}
    </section>
  );
};

type RankStyle = {
  height: string;
  border: string;
  badge: string;
  label: string;
};

const RANK_STYLES: Record<1 | 2 | 3, RankStyle> = {
  1: {
    height: "h-56 sm:h-72",
    border: "border-placement-first",
    badge: "bg-placement-first text-placement-first-fg",
    label: "1st",
  },
  2: {
    height: "h-52 sm:h-60",
    border: "border-rank-second",
    badge: "bg-rank-second text-rank-second-fg",
    label: "2nd",
  },
  3: {
    height: "h-48 sm:h-56",
    border: "border-rank-third",
    badge: "bg-rank-third text-rank-third-fg",
    label: "3rd",
  },
};

interface PodiumSlotProps {
  player: LeaderboardPlayer;
  rank: number;
  placement: 1 | 2 | 3;
  arenaMode: ArenaModeSelection;
}

const PodiumSlot = ({
  player,
  rank,
  placement,
  arenaMode,
}: PodiumSlotProps) => {
  const version = useDdragonVersion();
  const style = RANK_STYLES[placement];
  const topChampion = player.topChampions[0];

  return (
    <Link
      to={getProfilePath(player, arenaMode)}
      className={`group relative min-w-0 flex-1 overflow-hidden rounded-md border ${style.height} ${style.border} bg-surface transition-colors hover:border-accent`}
    >
      {topChampion && (
        <img
          src={getChampionIconUrl(version, topChampion.id)}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full scale-125 object-cover opacity-20 blur-sm transition-transform duration-300 group-hover:scale-125"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-media-scrim via-media-scrim/75 to-media-scrim/20" />
      <div
        className={`absolute left-2 top-2 rounded-sm ${style.badge} px-2 py-0.5 text-xs font-semibold`}
      >
        {style.label}
      </div>
      <span className="absolute right-2 top-2 rounded-sm bg-media-scrim/55 px-2 py-0.5 text-xs font-semibold text-on-media">
        #{rank}
      </span>

      <div className="absolute inset-x-0 top-10 flex justify-center px-2">
        <img
          src={getProfileIconUrl(version, player.profileIconId)}
          alt={`${player.name} profile icon`}
          loading="lazy"
          decoding="async"
          className="h-16 w-16 rounded-md border border-border-strong bg-surface-elevated object-cover shadow-raised sm:h-20 sm:w-20"
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-2 text-left text-on-media sm:p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold sm:text-base">
            {player.name}
          </p>
          <p className="truncate text-xs font-semibold uppercase opacity-75">
            #{player.tag}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-1 text-xs">
          <PodiumStat label="1sts" value={formatInteger(player.firstPlaces)} />
          <PodiumStat label="Top 4" value={formatInteger(player.top4)} />
          <PodiumStat label="Avg" value={formatPlacement(player.placementAvg)} />
        </div>
      </div>
    </Link>
  );
};

const PodiumStat = ({ label, value }: { label: string; value: string }) => (
  <div className="flex min-w-0 flex-col leading-tight">
    <span className="truncate text-xs uppercase opacity-70">{label}</span>
    <span className="truncate font-semibold tabular-nums">{value}</span>
  </div>
);

interface LeaderboardTableProps {
  players: LeaderboardPlayer[];
  startRank: number;
  sortBy: LeaderboardSort;
  order: LeaderboardOrder;
  arenaMode: ArenaModeSelection;
  augmentsById: AugmentsById;
  onSortClick: (sortBy: LeaderboardSort) => void;
}

const LeaderboardTable = ({
  players,
  startRank,
  sortBy,
  order,
  arenaMode,
  augmentsById,
  onSortClick,
}: LeaderboardTableProps) => (
  <section className="overflow-x-auto rounded-lg border border-border bg-surface">
    <table className="w-full min-w-96 border-collapse text-left">
      <thead className="border-b border-border text-xs font-semibold uppercase text-fg-subtle">
        <tr>
          <th className="w-16 px-3 py-3">Rank</th>
          <th className="min-w-96 px-3 py-3">Player</th>
          {LEADERBOARD_COLUMNS.map((column) => (
            <th
              key={column.sortBy}
              className={`px-3 py-3 text-right ${
                column.headerClassName ?? "min-w-20"
              }`}
              aria-sort={
                sortBy === column.sortBy
                  ? order === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
            >
              <button
                type="button"
                className={`ml-auto flex items-center justify-end gap-1 rounded-md px-2 py-1 transition-colors hover:cursor-pointer hover:bg-surface-hover hover:text-fg ${
                  sortBy === column.sortBy ? "text-accent" : ""
                }`}
                onClick={() => onSortClick(column.sortBy)}
              >
                <span>{column.label}</span>
                <IoChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${
                    sortBy === column.sortBy && order === "asc"
                      ? "-rotate-180"
                      : ""
                  } ${sortBy === column.sortBy ? "opacity-100" : "opacity-35"}`}
                />
              </button>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {players.map((player, index) => (
          <LeaderboardRow
            key={getPlayerKey(player)}
            player={player}
            rank={startRank + index}
            arenaMode={arenaMode}
            augmentsById={augmentsById}
          />
        ))}
      </tbody>
    </table>
  </section>
);

interface LeaderboardRowProps {
  player: LeaderboardPlayer;
  rank: number;
  arenaMode: ArenaModeSelection;
  augmentsById: AugmentsById;
}

const LeaderboardRow = ({
  player,
  rank,
  arenaMode,
  augmentsById,
}: LeaderboardRowProps) => {
  const version = useDdragonVersion();

  return (
    <tr className="transition-colors hover:bg-surface-hover/55">
      <td className="px-3 py-3 text-sm font-semibold tabular-nums text-fg-muted">
        #{rank}
      </td>
      <td className="px-3 py-3">
        <Link
          to={getProfilePath(player, arenaMode)}
          className="flex min-w-0 items-start gap-3 transition-colors hover:text-accent"
        >
          <img
            src={getProfileIconUrl(version, player.profileIconId)}
            alt={`${player.name} profile icon`}
            loading="lazy"
            decoding="async"
            className="h-11 w-11 shrink-0 rounded-md border border-border bg-surface-elevated object-cover"
          />
          <div className="flex min-w-0 flex-col gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {player.name}
                <span className="font-semibold text-fg-muted">#{player.tag}</span>
              </p>
              <p className="mt-1 text-xs font-semibold text-fg-subtle">
                Level <span className="tabular-nums">{player.level}</span>
              </p>
            </div>
            <PlayerTopPicks
              champions={player.topChampions.slice(0, 3)}
              augments={player.topAugments.slice(0, 3)}
              augmentsById={augmentsById}
              version={version}
            />
          </div>
        </Link>
      </td>
      {LEADERBOARD_COLUMNS.map((column) => (
        <td
          key={`${getPlayerKey(player)}-${column.sortBy}`}
          className={`px-3 py-3 text-right text-sm font-semibold tabular-nums text-fg ${
            column.cellClassName ?? ""
          }`}
        >
          {column.render(player)}
        </td>
      ))}
    </tr>
  );
};

interface PlayerTopPicksProps {
  champions: LeaderboardChampion[];
  augments: LeaderboardAugment[];
  augmentsById: AugmentsById;
  version: string;
}

const PlayerTopPicks = ({
  champions,
  augments,
  augmentsById,
  version,
}: PlayerTopPicksProps) => {
  if (champions.length === 0 && augments.length === 0) return null;

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      {champions.length > 0 && (
        <div className="flex items-center gap-1">
          {champions.map((champion) => (
            <ChampionPickIcon
              key={champion.id}
              champion={champion}
              version={version}
            />
          ))}
        </div>
      )}
      {champions.length > 0 && augments.length > 0 && (
        <span className="h-5 w-px bg-border" aria-hidden />
      )}
      {augments.length > 0 && (
        <div className="flex items-center gap-1">
          {augments.map((augment) => (
            <AugmentPickIcon
              key={augment.id}
              augment={augment}
              augmentData={augmentsById.get(augment.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ChampionPickIcon = ({
  champion,
  version,
}: {
  champion: LeaderboardChampion;
  version: string;
}) => (
  <Tooltip
    renderContent={() => (
      <PickTooltip
        title={champion.name}
        details={`${formatInteger(champion.gamesPlayed)} games / ${formatPlacement(
          champion.placementAvg
        )} avg`}
      />
    )}
  >
    <div className="h-7 w-7 overflow-hidden rounded-md border border-border bg-surface-elevated">
      <img
        src={getChampionIconUrl(version, champion.id)}
        alt={champion.name}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
    </div>
  </Tooltip>
);

const AugmentPickIcon = ({
  augment,
  augmentData,
}: {
  augment: LeaderboardAugment;
  augmentData?: augmentsData;
}) => {
  const title = augmentData?.name ?? `Augment ${augment.id}`;
  const details = `${formatInteger(augment.picked)} ${
    augment.picked === 1 ? "pick" : "picks"
  }`;

  return (
    <Tooltip
      renderContent={() => <PickTooltip title={title} details={details} />}
    >
      {augmentData ? (
        <div
          className={`h-7 w-7 overflow-hidden rounded-md bg-surface-elevated augment-${augmentData.rarity}`}
        >
          <img
            src={CDRAGON_BASE + augmentData.iconLarge}
            alt={augmentData.name}
            loading="lazy"
            decoding="async"
            className="relative h-full w-full rounded-md object-cover"
          />
        </div>
      ) : (
        <div className="grid h-7 min-w-7 place-items-center rounded-md border border-border bg-surface-elevated px-1 text-xs font-semibold text-fg-muted">
          {augment.id}
        </div>
      )}
    </Tooltip>
  );
};

const PickTooltip = ({
  title,
  details,
}: {
  title: string;
  details: string;
}) => (
  <div className="max-w-xs whitespace-normal px-2.5 py-2">
    <p className="text-sm font-semibold leading-4">{title}</p>
    <p className="mt-1 text-xs font-semibold leading-4 text-fg-muted">
      {details}
    </p>
  </div>
);

interface LeaderboardPaginationProps {
  page: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
}

const LeaderboardPagination = ({
  page,
  total,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
}: LeaderboardPaginationProps) => {
  const safeTotalPages = Math.max(1, totalPages);
  const [draftPage, setDraftPage] = useState(String(page));

  useEffect(() => {
    setDraftPage(String(page));
  }, [page]);

  const goToPage = (nextPage: number) => {
    const clamped = Math.min(safeTotalPages, Math.max(1, nextPage));
    setDraftPage(String(clamped));
    if (clamped !== page) onPageChange(clamped);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = Number.parseInt(draftPage, 10);
    if (!Number.isFinite(parsed)) {
      setDraftPage(String(page));
      return;
    }
    goToPage(parsed);
  };

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 lg:flex-row lg:items-center lg:justify-between">
      <p className="text-sm font-semibold text-fg-muted">
        Page{" "}
        <span className="text-fg tabular-nums">
          {page} / {safeTotalPages}
        </span>
        <span className="text-fg-subtle"> / {formatInteger(total)} players</span>
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <PaginationButton
            label="First"
            onClick={() => goToPage(1)}
            disabled={!hasPreviousPage}
          />
          <PaginationButton
            label="Previous"
            onClick={() => goToPage(page - 1)}
            disabled={!hasPreviousPage}
            iconBefore={<IoChevronBack className="h-4 w-4" />}
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex h-9 items-center rounded-md border border-border bg-bg text-sm font-semibold text-fg-muted focus-within:border-accent"
        >
          <label htmlFor="leaderboard-page" className="px-3 text-xs">
            Go to
          </label>
          <input
            id="leaderboard-page"
            type="number"
            min={1}
            max={safeTotalPages}
            value={draftPage}
            onChange={(event) => setDraftPage(event.target.value)}
            className="h-full w-16 border-x border-border bg-transparent px-2 text-center text-sm font-semibold tabular-nums text-fg focus:outline-none"
          />
          <button
            type="submit"
            className="h-full px-3 text-xs font-semibold transition-colors hover:bg-surface-hover hover:text-fg"
          >
            Go
          </button>
        </form>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <PaginationButton
            label="Next"
            onClick={() => goToPage(page + 1)}
            disabled={!hasNextPage}
            iconAfter={<IoChevronForward className="h-4 w-4" />}
          />
          <PaginationButton
            label="Last"
            onClick={() => goToPage(safeTotalPages)}
            disabled={!hasNextPage}
          />
        </div>
      </div>
    </section>
  );
};

interface PaginationButtonProps {
  label: string;
  disabled: boolean;
  onClick: () => void;
  iconBefore?: ReactNode;
  iconAfter?: ReactNode;
}

const PaginationButton = ({
  label,
  disabled,
  onClick,
  iconBefore,
  iconAfter,
}: PaginationButtonProps) => (
  <button
    type="button"
    className="flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-bg px-3 text-sm font-semibold text-fg-muted transition-colors hover:border-border-strong hover:bg-surface-hover hover:text-fg disabled:cursor-not-allowed disabled:opacity-45"
    onClick={onClick}
    disabled={disabled}
  >
    {iconBefore}
    {label}
    {iconAfter}
  </button>
);

interface LeaderboardStateProps {
  icon: ReactNode;
  title: string;
  body: string;
}

const LeaderboardState = ({ icon, title, body }: LeaderboardStateProps) => (
  <section className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface p-6 text-center">
    <div className="grid h-11 w-11 place-items-center rounded-md border border-border bg-bg text-accent">
      {icon}
    </div>
    <div>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 max-w-md text-sm leading-6 text-fg-muted">
        {body}
      </p>
    </div>
  </section>
);

const LeaderboardSkeleton = () => (
  <div className="flex animate-pulse flex-col gap-3">
    <div className="flex flex-row items-end justify-center gap-2 sm:gap-3">
      <div className="h-52 flex-1 rounded-md border border-border bg-surface-elevated sm:h-60" />
      <div className="h-56 flex-1 rounded-md border border-border bg-surface-elevated sm:h-72" />
      <div className="h-48 flex-1 rounded-md border border-border bg-surface-elevated sm:h-56" />
    </div>
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="mb-3 grid grid-cols-[4.5rem_minmax(14rem,1fr)_repeat(5,minmax(5rem,1fr))] gap-3">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={`leaderboard-header-skeleton-${index}`}
            className="h-4 rounded-sm bg-border"
          />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={`leaderboard-row-skeleton-${index}`}
            className="h-12 rounded-sm bg-surface-elevated"
          />
        ))}
      </div>
    </div>
  </div>
);

const getLeaderboardError = (
  error: unknown,
  region: Region
): string | null => {
  if (!error) return null;
  if (error instanceof ApiError) {
    return formatApiError(error.payload, { region });
  }
  return "Something went wrong while loading the leaderboard.";
};

export default LeaderboardPage;
