import type { augmentsData } from "../../types";
import Tooltip from "../Tooltip/Tooltip";

interface FavoriteAugmentProps {
  picked: number;
  augmentData: augmentsData;
}

const FavoriteAugment = ({ picked, augmentData }: FavoriteAugmentProps) => {
  const baseIconUrl = "https://raw.communitydragon.org/latest/game/";

  return (
    <div className="flex flex-col gap-[4px]">
      <Tooltip text={augmentData.name}>

        <div className={`w-[60px] h-[60px] augment-${augmentData.rarity}`}>
          <img src={baseIconUrl + augmentData.iconLarge} className={` bg-[#171A1C] rounded-[15px] relative`}></img>
        </div>
      </Tooltip>
      <p className="text-[12px] leading-[14px] font-normal text-center">{picked}</p>
    </div>
  );
};

export default FavoriteAugment;
