import { useState, useEffect } from "react";
import { HashLoader } from "react-spinners";

interface SummonerInputProps {
  isLoading: boolean;
  onLatestClickCallback: (name: string) => void;
  onAllClickCallback: (name: string) => void;
}

const SummonerInput = ({ isLoading, onLatestClickCallback, onAllClickCallback }: SummonerInputProps) => {
  const [playerInputName, setPlayerInputName] = useState<string>("");

  useEffect(() => {
    const storedLeagueAccountName = localStorage.getItem("leagueAccountName");
    if (storedLeagueAccountName) {
      setPlayerInputName(storedLeagueAccountName);  
    }
  }, [])

  const handleOnLatestClick = () => {
    localStorage.setItem("leagueAccountName", playerInputName);
    onLatestClickCallback(playerInputName);
  }

  const handleOnAllClick = () => {
    localStorage.setItem("leagueAccountName", playerInputName);
    onAllClickCallback(playerInputName);
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
          if (e.key === "Enter") handleOnLatestClick();
        }}
      ></input>
      <button
        className="h-full w-24 leading-2 bg-stone-500 rounded-r-sm disabled:bg-stone-600 disabled:text-stone-400 hover:cursor-pointer hover:bg-stone-400"
        disabled={!playerInputName.trim() || isLoading}
        onClick={() => handleOnLatestClick()}
      >
        {isLoading 
        ? <div className="w-full flex items-center justify-center"><HashLoader size={20} color="#00CC00" /></div>
        : "Retrieve"
        }
      </button>
      <button
        className="h-full w-24 leading-2 bg-stone-500 rounded-r-sm disabled:bg-stone-600 disabled:text-stone-400 hover:cursor-pointer hover:bg-stone-400"
        disabled={!playerInputName.trim() || isLoading}
        onClick={() => handleOnAllClick()}
      >
        {isLoading 
        ? <div className="w-full flex items-center justify-center"><HashLoader size={20} color="#00CC00" /></div>
        : "ALL"
        }
      </button>
    </div>
  );
};

export default SummonerInput;
