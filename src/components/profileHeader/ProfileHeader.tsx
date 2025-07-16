import { PlayerStatsContext } from "../../contexts/PlayerStatsContext";
import useContextIfDefined from "../../hooks/useContextIfDefined";
import useStatsAggregator from "../../hooks/useStatsAggregator";

const ProfileHeader = () => {
  const { playerStats } = useContextIfDefined(PlayerStatsContext);
  const { getProgressStatusOfChampions } = useStatsAggregator();

  const champProgressToPercent = (): number => {
    if (!playerStats) return 0;
    const { total, played, top4, won } =
      getProgressStatusOfChampions(playerStats);
    return Math.ceil(((played + top4 * 2 + won * 3) / (total * 3)) * 100);
  };

  return (
    <div className="flex flex-row gap-[8px] mt-[24px] max-w-[350px]">
      <img
        className="bg-gray-200 h-[55px] md:h-[65px] w-auto aspect-square rounded-[25px] self-center"
        src={
          playerStats && playerStats.profileIconId
            ? `https://ddragon.leagueoflegends.com/cdn/15.13.1/img/profileicon/${playerStats.profileIconId}.png`
            : `https://ddragon.leagueoflegends.com/cdn/15.13.1/img/profileicon/1.png`
        }
      ></img>
      <div className="flex flex-col items-start justify-center">
        <h1
          style={{fontSize: 'clamp(16px, 4vw, 24px)', lineHeight: 'clamp(24px, 3vw, 36px)'}}
          className="text-[#757575] text-nowrap font-medium stroke-2 stroke-black text-left"
        >
          {playerStats && playerStats.gameName !== ""
            ? playerStats.gameName + "#" + playerStats.tagLine
            : "RiotName#TAG"}
        </h1>
        <p 
        style={{fontSize: 'clamp(10px, 3vw, 18px)'}}
        className="text-[#49CA5C] text-left self-start">
          {champProgressToPercent()}% to{" "}
          <span className="text-[#F6F600]">Arena Mastery</span>
        </p>
      </div>
    </div>
  );
};

export default ProfileHeader;
