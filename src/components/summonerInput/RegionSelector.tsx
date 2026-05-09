import { useEffect, useState } from "react";
import RegionSelectorItem from "./RegionSelectorItem";
import type { Regions } from "../../types";

interface RegionSelectorProps {
  updateRegionCallback: (region: Regions) => void;
  initialRegion?: Regions;
}

const RegionSelector = ({ updateRegionCallback, initialRegion }: RegionSelectorProps) => {
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);
  const [regionSelected, setRegionSelected] = useState<Regions>(
    initialRegion ?? 'EUW'
  );

  useEffect(() => {
    if (initialRegion) {
      setRegionSelected(initialRegion);
      updateRegionCallback(initialRegion);
      localStorage.setItem("region", initialRegion);
      return;
    }
    const storedRegion = localStorage.getItem("region");
    if (storedRegion) {
      const parsedRegion = storedRegion as Regions;
      setRegionSelected(parsedRegion);
      updateRegionCallback(parsedRegion);
    }
  }, [initialRegion, updateRegionCallback]);

  const regionSelectorClicked = (): void => {
    setIsSelectorOpen(!isSelectorOpen);
  };

  const selectRegion = (region: Regions): void => {
    setRegionSelected(region);
    updateRegionCallback(region);
    setIsSelectorOpen(false);

    if (region) localStorage.setItem("region", region);
  };

  return (
    <button className="relative h-full group" onClick={regionSelectorClicked}>
      <div className="bg-surface text-fg rounded-md px-2 py-1.5 text-[14px] font-normal shadow-md shadow-black/30 group-hover:cursor-pointer group-hover:bg-surface-hover">
        {regionSelected}
      </div>
      <div
        className={`absolute top-full mt-[4px] bg-surface-elevated text-fg border border-border left-1/2 -translate-x-1/2 p-2 w-[100px] rounded-md shadow-2xl overflow-hidden z-1 ${
          isSelectorOpen ? "block" : "hidden"
        }`}
      >
        <ul className="text-center text-fg">
          <RegionSelectorItem region="EUW" onClickCallBack={selectRegion} />
          <RegionSelectorItem region="EUNE" onClickCallBack={selectRegion} />
          <RegionSelectorItem region="NA" onClickCallBack={selectRegion} />
        </ul>
      </div>
    </button>
  );
};

export default RegionSelector;
