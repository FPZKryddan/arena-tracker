import type { JSX } from "react";
import { GiBroadsword, GiShield, GiHealthNormal } from "react-icons/gi";
import Tooltip from "../Tooltip/Tooltip";
import type { numericalStatsDto } from "../../types";

interface DamageStatProps {
  type: "dealt" | "taken" | "healed";
  total: numericalStatsDto;
  phyiscal: numericalStatsDto;
  magic: numericalStatsDto;
  trueDmg: numericalStatsDto;
}

const DamageStat = ({
  type,
  phyiscal,
  total,
  magic,
  trueDmg,
}: DamageStatProps) => {
  const iconSwitch = (): JSX.Element | undefined => {
    switch (type) {
      case "dealt":
        return <GiBroadsword />;
      case "taken":
        return <GiShield />;
      case "healed":
        return <GiHealthNormal />;
      default:
        return undefined;
    }
  };

  const getColor = (source: "physical" | "magic" | "true"): string => {
    switch (source) {
      case "physical":
        return type === "dealt" ? "#FF6000" : "#FFBA0E";
      case "magic":
        return type === "dealt" ? "#10CCDD" : "#CE8FD3";
      case "true":
        return "#fff";
    }
  };

  const BAR_WIDTH = 350;

  const getBarWidthStyling = (value: number): string => {
    return (value / total.value) * BAR_WIDTH + "px";
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-[4px] items-center">
        <p className="text-[12px] font-normal">{total.value}</p>
        <Tooltip
          text={type === "dealt" ? "Total damage dealt" : "Total damage taken"}
          extra={
            type === "dealt"
              ? "Highest damage dealt: " + total.records[0]?.value
              : "Highest damage taken: " + total.records[0]?.value
          }
        >
          {iconSwitch()}
        </Tooltip>
      </div>
      <div
        className={`flex flex-row w-[${BAR_WIDTH}px] bg-transparent h-[10px] rounded-2xl`}
      >
        <Tooltip
          text={"Total physical damage dealt: " + phyiscal.value}
          extra={"Highest physical damage dealt: " + phyiscal.records[0]?.value}
        >
          <div
            className="h-full rounded-l-2xl hover:outline-1 outline-black-400 hover:z-2"
            style={{
              width: getBarWidthStyling(phyiscal.value),
              backgroundColor: getColor("physical"),
            }}
          ></div>
        </Tooltip>
        <Tooltip
          text={"Total magic damage dealt: " + magic.value}
          extra={"Highest magic damage dealt: " + magic.records[0]?.value}
        >
          <div
            className="h-full hover:outline-1 outline-black-400 hover:z-2"
            style={{
              width: getBarWidthStyling(magic.value),
              backgroundColor: getColor("magic"),
            }}
          ></div>
        </Tooltip>
        <Tooltip
          text={"Total true damage dealt: " + trueDmg.value}
          extra={"Highest true damage dealt: " + trueDmg.records[0]?.value}
        >
          <div
            className="h-full grow rounded-r-2xl hover:outline-1 outline-black-400 hover:z-2"
            style={{
              width: getBarWidthStyling(trueDmg.value),
              backgroundColor: getColor("true"),
            }}
          ></div>
        </Tooltip>
      </div>
    </div>
  );
};

export default DamageStat;
