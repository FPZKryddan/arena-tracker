import { useState, useEffect } from "react";
import RegionSelector from "./RegionSelector";
import { IoSearch } from "react-icons/io5";
import useGetPlayerStats from "../../hooks/useGetPlayerStats";
import { type Regions } from "../../types";

// interface SummonerInputProps {
//   isLoading: boolean;
//   onClickCallback: (name: string) => void;
// }

const SummonerInput = () => {
  const [playerInputName, setPlayerInputName] = useState<string>("");
  const [region, setRegion] = useState<Regions>(null);
  const {
    retrievePlayerData,
    isFetching
  } = useGetPlayerStats(region);

  useEffect(() => {
    const storedLeagueAccountName = localStorage.getItem("leagueAccountName");
    if (storedLeagueAccountName) {
      setPlayerInputName(storedLeagueAccountName);
    }
  }, []);

  const handleOnClick = async () => {
    localStorage.setItem("leagueAccountName", playerInputName);
    await retrievePlayerData(playerInputName);
  };

  return (
    <div className="w-full items-center rounded-sm">
      <div className="flex flex-row w-full px-4 box-border h-[44px] bg-white rounded-[25px]">
        <input
          type="text"
          name="playerInput"
          className="text-left text-black font-normal h-full w-full focus:outline-0 autofill:shadow-none"
          placeholder="RiotName#TAG"
          value={playerInputName}
          onChange={(e) => setPlayerInputName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleOnClick();
          }}
          disabled={isFetching}
        ></input>
          
        <div className="flex flex-row h-full ml-auto has-disabled:opacity-50">
          <RegionSelector updateRegionCallback={setRegion} />
          <button onClick={handleOnClick} className="hover:cursor-pointer" disabled={isFetching}>
            <IoSearch className="h-full w-auto aspect-square p-2 text-[#171a1c]"/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummonerInput;
