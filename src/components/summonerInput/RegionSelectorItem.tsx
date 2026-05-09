import type { Regions } from "../../types";

interface RegionSelectorItemProps {
  region: Regions;
  onClickCallBack: (region: Regions) => void;
}

const RegionSelectorItem = ({ region, onClickCallBack }: RegionSelectorItemProps) => {
  return <li className="py-[2px] hover:scale-100 hover:brightness-150 hover:tracking-widest hover:font-extrabold box-border cursor-pointer select-none transition-all duration-150 ease-out" onClick={() => onClickCallBack(region)}>{region}</li>;
};

export default RegionSelectorItem;
