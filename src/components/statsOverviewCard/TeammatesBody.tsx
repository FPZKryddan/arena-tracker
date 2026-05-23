import { useMemo, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import type {
  ArenaModeSelection,
  ProfileLookupDto,
  Regions,
  teammateStatDto,
  teammateStatsDto,
} from "../../types";
import BottomSheet from "../common/BottomSheet";
import TeammateDetailCard from "./TeammateDetailCard";
import { useProfileLookupByPuuid } from "../../hooks/useProfileLookup";
import useDdragonVersion from "../../hooks/useDdragonVersion";
import { createPortal } from "react-dom";

interface TeammatesBodyProps {
  teammateStats: teammateStatsDto;
  region: Exclude<Regions, null>;
  arenaMode?: ArenaModeSelection;
  interactive?: boolean;
  profileOverrides?: Record<string, ProfileLookupDto>;
  resolveProfiles?: boolean;
}

type TeammateEntry = {
  puuid: string;
  stats: teammateStatDto;
};

const FREQUENT_TEAMMATES_LIMIT = 6;
const MINIMUM_PLAYED_WITH_LIMIT = 3

const getProfilePath = (
  region: Exclude<Regions, null>,
  gameName: string,
  tagLine: string
): string =>
  `/profile/${region}/${encodeURIComponent(gameName)}/${encodeURIComponent(
    tagLine
  )}`;

const getAvgColor = (avg: number): string => {
  if (avg >= 8) return "text-fg";
  if (avg >= 5) return "text-danger";
  if (avg >= 3) return "text-info";
  return "text-warning";
};

const TeammatesBody = ({
  teammateStats,
  region,
  arenaMode,
  interactive = true,
  profileOverrides = {},
  resolveProfiles = true,
}: TeammatesBodyProps) => {
  const [selected, setSelected] = useState<TeammateEntry>();
  const [visibleTeammatesCount, setVisibleTeammatesCount] = useState<number>(FREQUENT_TEAMMATES_LIMIT);
  const [bottomSheetIsOpen, setBottomSheetIsOpen] = useState<boolean>(false);

  const teammates = useMemo<TeammateEntry[]>(() => {
    const teammates = Object.entries(teammateStats)
      .map(([puuid, stats]) => ({ puuid, stats }))
      .filter((teammate) => teammate.stats.gamesPlayed >= MINIMUM_PLAYED_WITH_LIMIT)
      .sort((a, b) => b.stats.gamesPlayed - a.stats.gamesPlayed)

    return teammates.slice(0, visibleTeammatesCount);
  }, [teammateStats, visibleTeammatesCount]);
  const isShowingAllTeammates =
    Object.values(teammateStats).filter(
      (stats) => stats.gamesPlayed >= MINIMUM_PLAYED_WITH_LIMIT
    ).length <= visibleTeammatesCount;

  if (teammates.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold">Frequent Teammates</p>
      <ul className="flex flex-col gap-1">
        {teammates.map((teammate) => (
          <TeammateRow
            key={teammate.puuid}
            puuid={teammate.puuid}
            teammate={teammate.stats}
            region={region}
            interactive={interactive}
            profileOverride={profileOverrides[teammate.puuid]}
            resolveProfile={resolveProfiles}
            onSelect={() => {
              if (!interactive) return;
              setSelected(teammate);
              setBottomSheetIsOpen(true);
            }}
          />
        ))}
        {interactive && (
          <button className="hover:text-accent hover:cursor-pointer disabled:hidden" disabled={isShowingAllTeammates} onClick={() => setVisibleTeammatesCount(visibleTeammatesCount + 3)}>show more</button>
        )}
      </ul>
      {interactive && createPortal(

        <BottomSheet
        isOpen={bottomSheetIsOpen}
        closeCallback={() => setBottomSheetIsOpen(false)}
      >
        {selected ? (
          <TeammateDetailCard
          teammate={selected.stats}
          puuid={selected.puuid}
          region={region}
          arenaMode={arenaMode}
          onProfileClick={() => setBottomSheetIsOpen(false)}
          />
        ) : (
          <></>
        )}
      </BottomSheet>
        , document.body)}
    </div>
  );
};

interface TeammateRowProps {
  puuid: string;
  teammate: teammateStatDto;
  region: Exclude<Regions, null>;
  interactive: boolean;
  profileOverride?: ProfileLookupDto;
  resolveProfile: boolean;
  onSelect: () => void;
}

const TeammateRow = ({
  puuid,
  teammate,
  region,
  interactive,
  profileOverride,
  resolveProfile,
  onSelect,
}: TeammateRowProps) => {
  const { profile: resolvedProfile } = useProfileLookupByPuuid(
    resolveProfile && !profileOverride ? puuid : undefined,
    region
  );
  const profile = profileOverride ?? resolvedProfile;
  const version = useDdragonVersion();
  const displayGameName = profile?.gameName ?? teammate.gameName;
  const displayTagLine = profile?.tagLine ?? teammate.tagLine;
  const profilePath = getProfilePath(
    profile?.region ?? region,
    displayGameName,
    displayTagLine
  );
  const initial = displayGameName.trim().charAt(0).toUpperCase() || "?";
  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
    if (event.currentTarget !== event.target) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    onSelect();
  };

  return (
    <li
      className={`flex flex-row items-center gap-2 rounded-md p-1.5 transition-colors ${
        interactive
          ? "hover:cursor-pointer hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          : ""
      }`}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onSelect : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
    >
      <div className="h-9 w-9 aspect-square rounded-full overflow-hidden bg-surface-elevated text-fg flex items-center justify-center text-sm font-semibold shrink-0">
        {profile ? (
          <img
            src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${profile.profileIconId}.png`}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          initial
        )}
      </div>
      <div className="flex flex-col grow min-w-0">
        {interactive ? (
          <Link
            to={profilePath}
            aria-label={`Open ${displayGameName}#${displayTagLine} profile`}
            className="block truncate text-xs font-medium transition-colors hover:text-accent"
            onClick={(event) => event.stopPropagation()}
          >
            {displayGameName}
            <span className="opacity-60">#{displayTagLine}</span>
          </Link>
        ) : (
          <p className="block truncate text-xs font-medium">
            {displayGameName}
            <span className="opacity-60">#{displayTagLine}</span>
          </p>
        )}
        <p className="text-xs opacity-70">
          {profile ? `Lv. ${profile.summonerLevel} / ` : ""}
          {teammate.gamesPlayed} games
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end leading-tight">
        <span className="text-xs font-semibold uppercase text-fg-muted">
          Avg
        </span>
        <p
          className={`text-sm font-semibold tabular-nums ${getAvgColor(
            teammate.placementAvg
          )}`}
        >
          {(Math.ceil(teammate.placementAvg * 100) / 100).toFixed(2)}
        </p>
      </div>
    </li>
  );
};

export default TeammatesBody;
