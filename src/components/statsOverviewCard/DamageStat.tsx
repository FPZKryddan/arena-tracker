import { type JSX } from "react";
import { GiBroadsword, GiShield, GiHealthNormal } from "react-icons/gi";
import Tooltip from "../Tooltip/Tooltip";
import type { numericalStatsDto } from "../../types";
import useFormatter from "../../hooks/useFormatter";
import RecordMatchButton from "../matchDetail/RecordMatchButton";

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
  const { formatNumber } = useFormatter(); 
  const label = type === "dealt" ? "Damage Dealt" : "Damage Taken";

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
        return "var(--color-damage-physical)";
      case "magic":
        return "var(--color-damage-magic)";
      case "true":
        return "var(--color-damage-true)";
    }
  };

  const getBarWidthStyling = (value: number): string => {
    if (total.value <= 0) return "0%";
    return (value / total.value) * 100 + "%";
  };



  return (
    <div className="flex flex-col">
      <div className="flex flex-row flex-wrap items-center justify-between gap-x-[8px] gap-y-[2px]">
        <div className="flex flex-row gap-[4px] items-center">
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
          <p className="text-[12px] font-semibold">{label}</p>
          <RecordMatchButton
            matchId={total.records[0]?.matchId}
            label={
              type === "dealt"
                ? "View highest damage dealt match"
                : "View highest damage taken match"
            }
          />
        </div>
        <p className="text-[12px] font-medium tabular-nums">
          {formatNumber(total.value)}
        </p>
      </div>
      <div
        className={`flex flex-row w-full bg-border/60 h-[10px] rounded-2xl overflow-hidden`}
      >
        <div
          className="h-full"
          style={{ width: getBarWidthStyling(phyiscal.value) }}
        >
          <Tooltip
            text={"Total physical damage " + (type === "dealt" ? 'dealt: ' : 'taken: ')  + formatNumber(phyiscal.value)}
            extra={"Highest physical damage " + (type === "dealt" ? 'dealt: ' : 'taken: ') + formatNumber(phyiscal.records[0]?.value)}
          >
            <div
              className="h-[10px] w-full rounded-l-2xl hover:outline-1 outline-black-400 hover:z-2"
              style={{ backgroundColor: getColor("physical") }}
            ></div>
          </Tooltip>
        </div>
        <div className="h-full" style={{ width: getBarWidthStyling(magic.value) }}>
          <Tooltip
            text={"Total magic damage " + (type === "dealt" ? 'dealt: ' : 'taken: ')  + formatNumber(magic.value)}
            extra={"Highest magic damage " + (type === "dealt" ? 'dealt: ' : 'taken: ') + formatNumber(magic.records[0]?.value)}
          >
            <div
              className="h-[10px] w-full hover:outline-1 outline-black-400 hover:z-2"
              style={{ backgroundColor: getColor("magic") }}
            ></div>
          </Tooltip>
        </div>
        <div
          className="h-full"
          style={{ width: getBarWidthStyling(trueDmg.value) }}
        >
          <Tooltip
            text={"Total true damage " + (type === "dealt" ? 'dealt: ' : 'taken: ')  + formatNumber(trueDmg.value)}
            extra={"Highest true damage " + (type === "dealt" ? 'dealt: ' : 'taken: ') + formatNumber(trueDmg.records[0]?.value)}
          >
            <div
              className="h-[10px] w-full rounded-r-2xl hover:outline-1 outline-black-400 hover:z-2"
              style={{ backgroundColor: getColor("true") }}
            ></div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default DamageStat;
