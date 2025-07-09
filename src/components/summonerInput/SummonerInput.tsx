import { useState, useEffect } from "react";
import { HashLoader } from "react-spinners";
import RegionSelector from "./RegionSelector";

interface SummonerInputProps {
  isLoading: boolean;
  onClickCallback: (name: string) => void;
}

const SummonerInput = ({
  isLoading,
  onClickCallback,
}: SummonerInputProps) => {
  const [playerInputName, setPlayerInputName] = useState<string>("");

  useEffect(() => {
    const storedLeagueAccountName = localStorage.getItem("leagueAccountName");
    if (storedLeagueAccountName) {
      setPlayerInputName(storedLeagueAccountName);
    }
  }, []);

  const handleOnClick = () => {
    localStorage.setItem("leagueAccountName", playerInputName);
    onClickCallback(playerInputName);
  };

  return (
    <div className="flex flex-row w-full md:w-[400px] items-center rounded-sm">
      <div className="relative">
        <input
          type="text"
          name="playerInput"
          className="text-left relative px-4 box-border h-[40px] bg-white rounded-l-[25px] text-black font-normal w-full focus:outline-0"
          placeholder="RiotName#TAG"
          value={playerInputName}
          onChange={(e) => setPlayerInputName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleOnClick();
          }}
        ></input>
        <div className="absolute w-[40px] h-[40px] -right-[20px] top-0 -z-0 bg-white "></div>
      </div>

      <div className="flex flex-row z-1">
        <RegionSelector />
        <button
          className="h-[44px] px-4 leading-2 bg-stone-800 rounded-r-[25px] shadow-lg shadow-black/50 disabled:bg-stone-600 disabled:text-stone-400 hover:cursor-pointer hover:bg-stone-700"
          disabled={!playerInputName.trim() || isLoading}
          onClick={() => handleOnClick()}
        >
          {isLoading ? (
            <div className="w-full flex items-center justify-center">
              <HashLoader size={20} color="#00CC00" />
            </div>
          ) : (
            <p className="text-white">Search</p>
          )}
        </button>
      </div>
    </div>
  );
};

export default SummonerInput;
