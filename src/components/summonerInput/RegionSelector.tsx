import { useEffect, useState, type MouseEvent } from "react";
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

  const regionSelectorClicked = (event: MouseEvent): void => {
    event.stopPropagation();
    setIsSelectorOpen(!isSelectorOpen);
  };

  const selectRegion = (region: Regions): void => {
    setRegionSelected(region);
    updateRegionCallback(region);
    setIsSelectorOpen(false);

    if (region) localStorage.setItem("region", region);
  };

  return (
    <div className="relative flex h-full items-center">
      <button
        type="button"
        className="rounded-md border border-border bg-surface-elevated px-2 py-1.5 text-sm font-medium text-fg transition-colors hover:cursor-pointer hover:border-border-strong hover:bg-surface-hover"
        onClick={(e) => regionSelectorClicked(e)}
      >
        {regionSelected}
      </button>
      <div
        className={`absolute left-1/2 top-full z-30 mt-1.5 w-24 -translate-x-1/2 overflow-hidden rounded-md border border-border bg-surface p-1 text-fg ${
          isSelectorOpen ? "block" : "hidden"
        }`}
      >
        <ul className="text-center text-fg">
          <RegionSelectorItem region="EUW" onClickCallBack={selectRegion} />
          <RegionSelectorItem region="EUNE" onClickCallBack={selectRegion} />
          <RegionSelectorItem region="NA" onClickCallBack={selectRegion} />
        </ul>
      </div>
    </div>
  );
};

export default RegionSelector;
