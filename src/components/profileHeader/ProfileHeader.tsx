import { PlayerStatsContext } from "../../contexts/PlayerStatsContext";
import useContextIfDefined from "../../hooks/useContextIfDefined";
import useDdragonVersion from "../../hooks/useDdragonVersion";
import useStatsAggregator from "../../hooks/useStatsAggregator";

const ProfileHeader = () => {
  const { playerStats } = useContextIfDefined(PlayerStatsContext);
  const { getProgressStatusOfChampions } = useStatsAggregator();
  const version = useDdragonVersion();

  const champProgressToPercent = (): number => {
    if (!playerStats) return 0;
    const { total, played, top4, won } =
      getProgressStatusOfChampions(playerStats);
    return Math.ceil(((played + top4 * 2 + won * 3) / (total * 3)) * 100);
  };

  return (
    <div className="flex flex-row gap-2 mt-6 max-w-sm">
      <img
        className="bg-surface h-14 md:h-16 w-auto aspect-square rounded-full self-center"
        src={
          playerStats && playerStats.profileIconId
            ? `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${playerStats.profileIconId}.png`
            : `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/1.png`
        }
      ></img>
      <div className="flex flex-col items-start justify-center">
        <h1 className="text-left text-base font-medium text-fg-muted text-nowrap md:text-2xl">
          {playerStats && playerStats.gameName !== ""
            ? playerStats.gameName + "#" + playerStats.tagLine
            : "RiotName#TAG"}
        </h1>
        <p className="self-start text-left text-xs font-medium text-success md:text-lg">
          {champProgressToPercent()}% to{" "}
          <span className="text-accent">Arena Mastery</span>
        </p>
      </div>
    </div>
  );
};

export default ProfileHeader;
