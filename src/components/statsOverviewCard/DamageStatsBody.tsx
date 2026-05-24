import { GiHealthNormal, GiArrowDunk, GiAcrobatic } from "react-icons/gi";
import { FaShieldAlt } from "react-icons/fa";
import type {
  damageStatsDto,
  damageTakenStatsDto,
  healingShieldingStatsDto,
  skillShotsDto,
} from "../../types";
import DamageStat from "./DamageStat";
import SimpleStat from "./SimpleStat";

interface DamageStatsBodyProps {
  dealtStats: damageStatsDto;
  takenStats: damageTakenStatsDto;
  healingStats?: healingShieldingStatsDto;
  shieldingStats?: Omit<healingShieldingStatsDto, "total">;
  skillShotsStats?: skillShotsDto;
  matchCount: number;
}

const DamageStatsBody = ({
  dealtStats,
  takenStats,
  healingStats,
  shieldingStats,
  skillShotsStats,
  matchCount,
}: DamageStatsBodyProps) => {
  return (
    <div className="flex flex-col w-full gap-2 box-border">
      {dealtStats && (
        <DamageStat
          type={"dealt"}
          total={dealtStats.total.champions}
          phyiscal={dealtStats.physical.champions}
          magic={dealtStats.magic.champions}
          trueDmg={dealtStats.true.champions}
          matchCount={matchCount}
        />
      )}
      {takenStats && (
        <DamageStat
          type={"taken"}
          total={takenStats.total}
          phyiscal={takenStats.physical}
          magic={takenStats.magic}
          trueDmg={takenStats.true}
          matchCount={matchCount}
        />
      )}
      <DamageLegend />
      <div className="flex flex-row flex-wrap gap-x-4 gap-y-1">
        {healingStats && (
          <SimpleStat
            icon={<GiHealthNormal className="text-success" />}
            label="Total healing"
            recordLabel="healing"
            stat={healingStats.total}
            matchCount={matchCount}
          />
        )}
        {shieldingStats && (
          <SimpleStat
            icon={<FaShieldAlt className="text-info" />}
            label="Total shielding"
            recordLabel="shielding"
            stat={shieldingStats.onTeammates}
            matchCount={matchCount}
          />
        )}
        {skillShotsStats?.hit && (
          <SimpleStat
            icon={<GiArrowDunk className="text-damage-spell" />}
            label="Skillshots hit"
            recordLabel="skillshots hit"
            stat={skillShotsStats.hit}
            matchCount={matchCount}
          />
        )}
        {skillShotsStats?.dodged && (
          <SimpleStat
            icon={<GiAcrobatic className="text-damage-magic" />}
            label="Skillshots dodged"
            recordLabel="skillshots dodged"
            stat={skillShotsStats.dodged}
            matchCount={matchCount}
          />
        )}
      </div>
    </div>
  );
};

const DAMAGE_LEGEND = [
  { label: "Physical", color: "var(--color-damage-physical)" },
  { label: "Magic", color: "var(--color-damage-magic)" },
  { label: "True", color: "var(--color-damage-true)" },
] as const;

const DamageLegend = () => (
  <div className="flex flex-row flex-wrap gap-x-2.5 gap-y-1 text-xs font-medium text-fg-muted">
    {DAMAGE_LEGEND.map((item) => (
      <div key={item.label} className="flex items-center gap-1">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        {item.label}
      </div>
    ))}
  </div>
);

export default DamageStatsBody;
