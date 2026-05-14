import type { Regions } from "../../types";

interface RegionSelectorItemProps {
  region: Regions;
  onClickCallBack: (region: Regions) => void;
}

const RegionSelectorItem = ({ region, onClickCallBack }: RegionSelectorItemProps) => {
  return (
    <li>
      <button
        type="button"
        className="w-full rounded-sm px-2 py-1 text-sm text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
        onClick={() => onClickCallBack(region)}
      >
        {region}
      </button>
    </li>
  );
};

export default RegionSelectorItem;
