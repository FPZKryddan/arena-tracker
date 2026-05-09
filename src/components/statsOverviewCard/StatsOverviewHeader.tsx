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
  bannerImgUrl?: string;
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
  bannerImgUrl,
  favoriteTarget,
}: StatsOverviewHeaderProps) => {
  const kda =
    Math.ceil(((kills.value + assists.value) / deaths.value) * 10) / 10;
  const kdRatio = Math.ceil((kills.value / deaths.value) * 10) / 10;

  const stats = (
    <div className="flex flex-row gap-[16px]">
      <Tooltip text="Kills" extra={"Highest kills: " + kills.records[0]?.value}>
        <KdaStat type={"kills"} value={kills.value} />
      </Tooltip>
      <Tooltip
        text="Deaths"
        extra={"Highest deaths: " + deaths.records[0]?.value}
      >
        <KdaStat type={"deaths"} value={deaths.value} />
      </Tooltip>
      <Tooltip
        text="Assists"
        extra={"Highest assists: " + assists.records[0]?.value}
      >
        <KdaStat type={"assists"} value={assists.value} />
      </Tooltip>
      <Tooltip text="KDA Ratio" extra={"K/D: " + kdRatio}>
        <KdaStat type={"kda"} value={kda} />
      </Tooltip>
    </div>
  );

  if (bannerImgUrl) {
    return (
      <div className="relative w-full h-[160px] -mx-2 -mt-2 rounded-t-2xl overflow-hidden">
        <img
          className="absolute inset-0 w-full h-full object-cover object-[center_25%]"
          src={bannerImgUrl}
          alt={name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated via-surface-elevated/55 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6 flex flex-col gap-1.5 text-white drop-shadow">
          <div className="flex flex-row items-center gap-2">
            <h1 className="text-[20px] font-extrabold">{name}</h1>
            {favoriteTarget && <FavoriteButton favorite={favoriteTarget} />}
          </div>
          {stats}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row justify-start items-center gap-[8px]">
      <img
        className="bg-surface-elevated w-[55px] h-[55px] rounded-full"
        src={imgUrl}
      />
      <div className="flex flex-col">
        <div className="flex flex-row items-center gap-2">
          <h1 className="text-[16px] font-extrabold text-ellipsis">{name}</h1>
          {favoriteTarget && <FavoriteButton favorite={favoriteTarget} />}
        </div>
        {stats}
      </div>
    </div>
  );
};

export default StatsOverviewHeader;
