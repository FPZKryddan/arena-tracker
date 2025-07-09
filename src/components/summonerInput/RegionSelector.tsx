import { useEffect, useState } from "react";
import { HiChevronDown } from "react-icons/hi2";
import RegionSelectorItem from "./RegionSelectorItem";


const RegionSelector = () => {
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);
  const [regionSelected, setRegionSelected] = useState<string | null>(null);

  useEffect(() => {
    const storedRegion = localStorage.getItem('region');
    if (storedRegion) {
      setRegionSelected(storedRegion);
      return;
    }
  }, [regionSelected])

  const regionSelectorClicked = (): void => {
    setIsSelectorOpen(!isSelectorOpen);
  }

  const selectRegion = (label: string): void => {
    setRegionSelected(label);
    setIsSelectorOpen(false);
    localStorage.setItem('region', label);
  }

  return (
    <div className="relative inline-block">
      <button
        className="relative h-[44px] w-[100px] leading-2 bg-stone-800 rounded-l-[25px] z-20 shadow-lg shadow-black/50 disabled:bg-stone-600 disabled:text-stone-400 hover:cursor-pointer hover:bg-stone-700 border-r-1 border-white"
        // disabled={!playerInputName.trim() || isLoading}
        onClick={() => regionSelectorClicked()}
      >
        {/* {isLoading ? (
          <div className="w-full flex items-center justify-center">
            <HashLoader size={20} color="#00CC00" />
          </div>
        ) : ( */}
          <div className="flex flex-row text-white justify-center items-center gap-[2px]">
            <p>{regionSelected ? regionSelected : 'Region'}</p>
            <HiChevronDown className="text-xl" />
          </div>
        {/* )} */}
      </button>
      <div className={`absolute top-full w-full bg-stone-700 left-0 transform -translate-y-[22px] pt-[30px] pb-[8px] rounded-b-2xl shadow-2xl overflow-hidden z-10 ${isSelectorOpen ? 'block' : 'hidden'}`}>
        <ul className="text-center text-white">
          <RegionSelectorItem label="EUW" onClickCallBack={selectRegion}/>
          <RegionSelectorItem label="EUNE" onClickCallBack={selectRegion}/>
          <RegionSelectorItem label="NA" onClickCallBack={selectRegion}/>
        </ul>
      </div>
    </div>
  );
};

export default RegionSelector;
