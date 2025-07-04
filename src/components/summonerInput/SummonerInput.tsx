import { useState, useEffect } from "react";
import { HashLoader } from "react-spinners";

interface SummonerInputProps {
  isLoading: boolean;
  onClickCallback: (name: string) => void;
}

const SummonerInput = ({ isLoading, onClickCallback }: SummonerInputProps) => {
  const [playerInputName, setPlayerInputName] = useState<string>("");

  useEffect(() => {
    const storedLeagueAccountName = localStorage.getItem("leagueAccountName");
    if (storedLeagueAccountName) {
      setPlayerInputName(storedLeagueAccountName);  
    }
  }, [])

  const handleOnClick = () => {
    localStorage.setItem("leagueAccountName", playerInputName);
    onClickCallback(playerInputName);
  }

  return (
    <div className="flex flex-row h-12 w-full bg-stone-700 rounded-sm text-white focus-within:outline-2 outline-white">
      <input
        type="text"
        name="playerInput"
        className="text-center h-full rounded-l-sm font-semibold w-full"
        placeholder="Name#Tag"
        value={playerInputName}
        onChange={(e) => setPlayerInputName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleOnClick();
        }}
      ></input>
      <button
        className="h-full w-24 leading-2 bg-stone-500 rounded-r-sm disabled:bg-stone-600 disabled:text-stone-400 hover:cursor-pointer hover:bg-stone-400"
        disabled={!playerInputName.trim() || isLoading}
        onClick={() => handleOnClick()}
      >
        {isLoading 
        ? <div className="w-full flex items-center justify-center"><HashLoader size={20} color="#00CC00" /></div>
        : "Retrieve"
        }
      </button>
    </div>
  );
};

export default SummonerInput;
