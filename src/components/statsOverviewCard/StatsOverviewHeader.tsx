import type { numericalStatsDto, Regions } from "../../types";
import FavoriteButton from "../favoriteButton/FavoriteButton";
import Tooltip from "../Tooltip/Tooltip";
import KdaStat from "./KdaStat";

interface StatsOverviewHeaderProps {
  kills: numericalStatsDto;
  deaths: numericalStatsDto;
  assists: numericalStatsDto;
  name: string;
  imgUrl: string;
  favoriteTarget?: {
    gameName: string;
    tagLine: string;
    region: Exclude<Regions, null>;
  };
}

const StatsOverviewHeader = ({
  kills,
  deaths,
  assists,
  name,
  imgUrl,
  favoriteTarget,
}: StatsOverviewHeaderProps) => {
  return (
    <div className="flex flex-row justify-start items-center gap-[8px]">
      <img className="bg-surface-elevated w-[55px] h-[55px] rounded-full" src={imgUrl} />
      <div className="flex flex-col">
        <div className="flex flex-row items-center gap-2">
          <h1 className="text-[16px] font-extrabold text-ellipsis">{name}</h1>
          {favoriteTarget && <FavoriteButton favorite={favoriteTarget} />}
        </div>
        <div className="flex flex-row gap-[16px]">
          <Tooltip text="Kills" extra={'Highest kills: ' + kills.records[0]?.value}>
            <KdaStat type={"kills"} value={kills.value} />
          </Tooltip>
          <Tooltip text="Deaths" extra={'Highest deaths: ' + deaths.records[0]?.value}>
            <KdaStat type={"deaths"} value={deaths.value} />
          </Tooltip>
          <Tooltip text="Assists" extra={'Highest assists: ' + assists.records[0]?.value}>
            <KdaStat type={"assists"} value={assists.value} />
          </Tooltip>
          <Tooltip text="KDA Ratio" extra={'K/D: ' + Math.ceil((kills.value)/deaths.value * 10) / 10 }>
            <KdaStat type={"kda"} value={Math.ceil((kills.value+assists.value)/deaths.value * 10) / 10} />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default StatsOverviewHeader;
