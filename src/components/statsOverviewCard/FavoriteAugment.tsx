import type { augmentsData } from "../../types";
import Tooltip from "../Tooltip/Tooltip";

interface FavoriteAugmentProps {
  picked: number;
  augmentData: augmentsData;
}

const FavoriteAugment = ({ picked, augmentData }: FavoriteAugmentProps) => {
  const baseIconUrl = "https://raw.communitydragon.org/latest/game/";

  return (
    <div className="flex flex-col h-full aspect-square w-auto gap-[4px]">
      <Tooltip text={augmentData.name}>

        <div className={`grow-1 w-auto aspect-square augment-${augmentData.rarity}`}>
          <img src={baseIconUrl + augmentData.iconLarge} className={` bg-[#171A1C] rounded-[15px] relative h-full w-full`}></img>
        </div>
      </Tooltip>
      <p className="text-[12px] leading-[14px] h-[14px] font-normal text-center">{picked}</p>
    </div>
  );
};

export default FavoriteAugment;
