import { type JSX } from "react";
import { GiBroadsword, GiShield, GiHealthNormal } from "react-icons/gi";
import Tooltip from "../Tooltip/Tooltip";
import type { numericalStatsDto } from "../../types";
import useFormatter from "../../hooks/useFormatter";
import RecordMatchButton from "../matchDetail/RecordMatchButton";
import { getAveragePerMatchLabel } from "./statAverages";

interface DamageStatProps {
  type: "dealt" | "taken" | "healed";
  total: numericalStatsDto;
  phyiscal: numericalStatsDto;
  magic: numericalStatsDto;
  trueDmg: numericalStatsDto;
  matchCount: number;
}

const DamageStat = ({
  type,
  phyiscal,
  total,
  magic,
  trueDmg,
  matchCount,
}: DamageStatProps) => {
  const { formatNumber } = useFormatter();
  const label = type === "dealt" ? "Damage Dealt" : "Damage Taken";
  const damageVerb = type === "dealt" ? "dealt" : "taken";
  const totalAverage = getAveragePerMatchLabel(total.value, matchCount);

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
      <div className="flex flex-row flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
        <div className="flex flex-row gap-1 items-center">
          <Tooltip
            text={
              type === "dealt" ? "Total damage dealt" : "Total damage taken"
            }
            extra={`Highest damage ${damageVerb}: ${formatNumber(
              total.records[0]?.value,
            )} | ${totalAverage}`}
          >
            {iconSwitch()}
          </Tooltip>
          <p className="text-xs font-semibold">{label}</p>
          <RecordMatchButton
            matchId={total.records[0]?.matchId}
            label={
              type === "dealt"
                ? "View highest damage dealt match"
                : "View highest damage taken match"
            }
          />
        </div>
        <p className="flex flex-row flex-wrap justify-end gap-x-1 text-xs font-medium tabular-nums">
          <span>{formatNumber(total.value)}</span>
          <span className="text-fg-muted">({totalAverage})</span>
        </p>
      </div>
      <div className="flex h-2.5 w-full flex-row overflow-hidden rounded-sm bg-border/60">
        <div
          className="h-full"
          style={{ width: getBarWidthStyling(phyiscal.value) }}
        >
          <Tooltip
            text={
              "Total physical damage " +
              (type === "dealt" ? "dealt: " : "taken: ") +
              formatNumber(phyiscal.value)
            }
            extra={`Highest physical damage ${damageVerb}: ${formatNumber(
              phyiscal.records[0]?.value,
            )} | ${getAveragePerMatchLabel(phyiscal.value, matchCount)}`}
          >
            <div
              className="h-2.5 w-full hover:z-2 hover:outline-1 outline-border-strong"
              style={{ backgroundColor: getColor("physical") }}
            ></div>
          </Tooltip>
        </div>
        <div
          className="h-full"
          style={{ width: getBarWidthStyling(magic.value) }}
        >
          <Tooltip
            text={
              "Total magic damage " +
              (type === "dealt" ? "dealt: " : "taken: ") +
              formatNumber(magic.value)
            }
            extra={`Highest magic damage ${damageVerb}: ${formatNumber(
              magic.records[0]?.value,
            )} | ${getAveragePerMatchLabel(magic.value, matchCount)}`}
          >
            <div
              className="h-2.5 w-full hover:outline-1 outline-border-strong hover:z-2"
              style={{ backgroundColor: getColor("magic") }}
            ></div>
          </Tooltip>
        </div>
        <div
          className="h-full"
          style={{ width: getBarWidthStyling(trueDmg.value) }}
        >
          <Tooltip
            text={
              "Total true damage " +
              (type === "dealt" ? "dealt: " : "taken: ") +
              formatNumber(trueDmg.value)
            }
            extra={`Highest true damage ${damageVerb}: ${formatNumber(
              trueDmg.records[0]?.value,
            )} | ${getAveragePerMatchLabel(trueDmg.value, matchCount)}`}
          >
            <div
              className="h-2.5 w-full hover:z-2 hover:outline-1 outline-border-strong"
              style={{ backgroundColor: getColor("true") }}
            ></div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default DamageStat;
