import { type JSX } from "react";
import { GiBroadsword, GiShield, GiHealthNormal } from "react-icons/gi";
import Tooltip from "../Tooltip/Tooltip";
import type { numericalStatsDto } from "../../types";
import useFormatter from "../../hooks/useFormatter";

interface DamageStatProps {
  type: "dealt" | "taken" | "healed";
  total: numericalStatsDto;
  phyiscal: numericalStatsDto;
  magic: numericalStatsDto;
  trueDmg: numericalStatsDto;
  parentBarWidth: number;
}

const DamageStat = ({
  type,
  phyiscal,
  total,
  magic,
  trueDmg,
  parentBarWidth
}: DamageStatProps) => {
  const { formatNumber } = useFormatter(); 

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

  const getBarWidthStyling = (value: number): string => {
    return (value / total.value) * parentBarWidth + "px";
  };



  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-[4px] items-center">
        <p className="text-[12px] font-normal">{formatNumber(total.value)}</p>
        <Tooltip
          text={type === "dealt" ? "Total damage dealt" : "Total damage taken"}
          extra={
            type === "dealt"
              ? "Highest damage dealt: " + formatNumber(total.records[0]?.value)
              : "Highest damage taken: " + formatNumber(total.records[0]?.value)
          }
        >
          {iconSwitch()}
        </Tooltip>
      </div>
      <div
        className={`flex flex-row w-full bg-transparent h-[10px] rounded-2xl`}
      >
        <Tooltip
          text={"Total physical damage " + (type === "dealt" ? 'dealt: ' : 'taken: ')  + formatNumber(phyiscal.value)}
          extra={"Highest physical damage " + (type === "dealt" ? 'dealt: ' : 'taken: ') + formatNumber(phyiscal.records[0]?.value)}
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
          text={"Total magic damage " + (type === "dealt" ? 'dealt: ' : 'taken: ')  + formatNumber(magic.value)}
          extra={"Highest magic damage " + (type === "dealt" ? 'dealt: ' : 'taken: ') + formatNumber(magic.records[0]?.value)}
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
          text={"Total true damage " + (type === "dealt" ? 'dealt: ' : 'taken: ')  + formatNumber(trueDmg.value)}
          extra={"Highest true damage " + (type === "dealt" ? 'dealt: ' : 'taken: ') + formatNumber(trueDmg.records[0]?.value)}
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
