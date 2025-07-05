import React from "react";
import type { championData } from "../../types";
import { FaCheck } from "react-icons/fa6";

interface ChampionCardProps {
  champion: championData;
  updateStageCallBack: (championName: string, stage: number) => void;
}

const IMAGE_SIZE: number = 125;

const ChampionCard = React.memo(({ champion, updateStageCallBack }: ChampionCardProps) => {
  const firstLetterBig = (name: string): string => {
    return name[0].toUpperCase() + name.slice(1);
  }


  const baseImgUrl: string =
    "https://ddragon.leagueoflegends.com/cdn/15.13.1/img/champion/";
  const finalUrl: string = baseImgUrl + firstLetterBig(champion.id) + ".png";


  return (
    <div className="flex flex-col gap-[8px] select-none">
      <div className="group w-[125px] outline-2 flex flex-col relative">
        <img src={finalUrl} width={IMAGE_SIZE} height={IMAGE_SIZE} loading="lazy"></img>
        <div className="absolute bottom-[0px] w-full translate-y-full outline-2">
          <div className="flex flex-row w-full mt-auto h-[10px] group-hover:h-[44px] transition-all duration-75 ease-out">
            <button
              className={`grow h-full border-2 border-r-1 border-black cursor-pointer ${
                champion.stage >= 1
                  ? "bg-amber-300 hover:bg-amber-400"
                  : "bg-sky-200 hover:bg-amber-200"
              }`}
              onClick={() => updateStageCallBack(firstLetterBig(champion.name), 1)}
            ></button>
            <button
              className={`grow h-full border-2 border-r-1 border-l-1 border-black cursor-pointer ${
                champion.stage >= 2
                  ? "bg-amber-300 hover:bg-amber-400"
                  : "bg-sky-200 hover:bg-amber-200"
              }`}
              onClick={() => updateStageCallBack(firstLetterBig(champion.name), 2)}
            ></button>
            <button
              className={`grow h-full border-2 border-l-1 border-black cursor-pointer ${
                champion.stage >= 3
                  ? "bg-amber-300 hover:bg-amber-400"
                  : "bg-sky-200 hover:bg-amber-200"
              }`}
              onClick={() => updateStageCallBack(firstLetterBig(champion.name), 3)}
            ></button>
          </div>
          <p className="w-full text-center bg-black text-white font-semibold text-lg no-wrap tracking-tighter">
            {firstLetterBig(champion.name)}
          </p>
        </div>
        {champion.stage === 3
        ? <div className="absolute inset-0 bg-amber-400/40 flex items-center align-middle">
          <FaCheck className="w-full h-full p-5 drop-shadow-lg text-yellow-300"/>
        </div>
        : <></> 
        }
      </div>
    </div>
  );
});

export default ChampionCard;
