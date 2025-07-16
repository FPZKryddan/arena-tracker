import { useEffect, useRef, useState } from "react";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import type { championStatsDto } from "../../types";

type ChampionFilteringProps = {
  championList: championStatsDto[];
  filteredChampionsCallback: (champions: championStatsDto[]) => void;
};

const ChampionFiltering = ({
  championList,
  filteredChampionsCallback,
}: ChampionFilteringProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  const [showNotPlayed, setShowNotPlayed] = useState<boolean>(true);
  const [minPlayedRequired, setMinPlayedRequired] = useState<number>(0);

  useEffect(() => {
    let filteredChampions = [...championList];
    if (!showCompleted)
      filteredChampions = filteredChampions.filter(
        (champion) => champion.stage !== 3
      );

    if (!showNotPlayed)
      filteredChampions = filteredChampions.filter(
        (champion) => champion.timesPlayed !== 0
      );

    if (minPlayedRequired)
      filteredChampions = filteredChampions.filter(
        (champion) => champion.timesPlayed >= minPlayedRequired
      );

    filteredChampionsCallback(filteredChampions);
  }, [
    showCompleted,
    showNotPlayed,
    minPlayedRequired,
    championList,
    filteredChampionsCallback,
  ]);

  return (
    <>
      <div className="relative">
        <button
          className="rounded-lg p-1 bg-transparent outline-2 outline-gray-500 text-gray-500 hover:text-white hover:cursor-pointer hover:outline-white transition-all duration-100"
          onClick={() => setIsOpen(!isOpen)}
        >
          <HiOutlineAdjustmentsHorizontal className=" text-lg" />
        </button>
        <div
          className={`absolute bg-white rounded-2xl p-4 w-[250px] top-full left-1/2 -translate-x-1/2 z-20 mt-[8px] text-nowrap shadow-2xl 
        ${isOpen ? "flex" : "hidden"}`}
        >
          <ul className="text-[12px] flex flex-col gap-2 w-full">
            <ChampionFilteringCheckbox
              label="Show completed champions?"
              defaultValue={true}
              updateValueCallback={setShowCompleted}
            />
            <ChampionFilteringCheckbox
              label="Show not played champions?"
              defaultValue={true}
              updateValueCallback={setShowNotPlayed}
            />
            <ChampionFilteringNumber
              label="Min times played"
              defaultValue={"0"}
              updateValueCallback={setMinPlayedRequired}
            />
          </ul>
        </div>
      </div>
      <div
        className={`absolute top-0 left-0 w-full h-full bg-transparent z-10 ${
          isOpen ? "block" : "hidden       "
        }`}
        onClick={() => setIsOpen(false)}
      ></div>
    </>
  );
};

type ChampionFilteringCheckboxProps = {
  label: string;
  defaultValue: boolean;
  updateValueCallback: (value: boolean) => void;
};

const ChampionFilteringCheckbox = ({
  label,
  defaultValue,
  updateValueCallback,
}: ChampionFilteringCheckboxProps) => {
  const [value, setValue] = useState<boolean>(defaultValue);

  const handleUpdateCheckbox = (_value: boolean) => {
    setValue(_value);
    updateValueCallback(_value);
  };
  return (
    <li className="w-full">
      <div className="flex flex-row w-full justify-between items-center">
        <p className="text-wrap">{label}</p>
        <input
          name="checkbox"
          type="checkbox"
          checked={value}
          className="h-[22px] w-auto aspect-square rounded-2xl"
          onChange={(e) => handleUpdateCheckbox(e.target.checked)}
        />
      </div>
    </li>
  );
};

type ChampionFilteringNumberProps = {
  label: string;
  defaultValue: string;
  updateValueCallback: (value: number) => void;
};

const ChampionFilteringNumber = ({
  label,
  defaultValue,
  updateValueCallback,
}: ChampionFilteringNumberProps) => {
  const [value, setValue] = useState<string>(defaultValue);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleUpdateCheckbox = (_value: string): void => {
    setValue(_value);
    updateValueCallback(Number(_value));
  };

  const handleOnFocus = (): void => {
    if (!inputRef || !inputRef.current) return;
    const input = inputRef.current as HTMLInputElement;
    input.select();
  };

  return (
    <li className="w-full">
      <div className="flex flex-row w-full justify-between items-center">
        <p className="text-wrap">{label}</p>
        <input
          type="number"
          ref={inputRef}
          value={value}
          className="w-12 border-b-2 border-gray-500 px-0.5"
          onFocus={handleOnFocus}
          onChange={(e) => handleUpdateCheckbox(e.target.value)}
        />
      </div>
    </li>
  );
};

export default ChampionFiltering;
