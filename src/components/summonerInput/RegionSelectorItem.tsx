interface RegionSelectorItemProps {
  label: string;
  onClickCallBack: (label: string) => void;
}

const RegionSelectorItem = ({ label, onClickCallBack }: RegionSelectorItemProps) => {
  return <li className="py-[2px] hover:bg-stone-600 cursor-pointer select-none" onClick={() => onClickCallBack(label)}>{label}</li>;
};

export default RegionSelectorItem;
