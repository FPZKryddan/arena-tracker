import React from "react";
import type { championData } from "../../types";
import { FaCheck } from "react-icons/fa6";

interface ChampionCardProps {
  champion: championData;
  updateStageCallBack: (championName: string, stage: number) => void;
}

const ChampionCard = React.memo(
  ({ champion, updateStageCallBack }: ChampionCardProps) => {
    const firstLetterBig = (name: string): string => {
      return name[0].toUpperCase() + name.slice(1);
    };

    const baseImgUrl: string =
      "https://ddragon.leagueoflegends.com/cdn/15.13.1/img/champion/";
    const finalUrl: string = baseImgUrl + firstLetterBig(champion.id) + ".png";

    return (
      <div className="flex flex-col gap-[8px] select-none">
        <div className="group w-full aspect-square flex flex-col relative rounded-full box-border">
          <img
            src={finalUrl}
            loading="lazy"
            className="w-full h-full rounded-full"
          ></img>
          <p className="absolute bottom-0 py-[2px] w-2/3 self-center text-center bg-black/80 rounded-full shadow-2xl text-white font-semibold text-[12px] no-wrap z-2 tracking-tighter">
            {firstLetterBig(champion.name)}
          </p>
          {champion.stage === 3 ? (
            <div className="absolute inset-0 bg-amber-400/40 flex items-center align-middle rounded-full">
              <FaCheck className="w-full h-full p-5 drop-shadow-lg text-yellow-300" />
            </div>
          ) : (
            <></>
          )}
        </div>
        <div className="flex flex-row gap-[4px] px-1 w-full">
          {[...Array(3).keys()].map((i) => (
            <button
              key={i}
              className={`w-full h-[15px] ${
                champion.stage > i ? "bg-green-500" : "bg-slate-300"
              } shadow-lg shadow-black/20 rounded-full cursor-pointer`}
              onClick={() => updateStageCallBack(champion.id, i + 1)}
            />
          ))}
        </div>
      </div>
    );
  }
);

export default ChampionCard;
