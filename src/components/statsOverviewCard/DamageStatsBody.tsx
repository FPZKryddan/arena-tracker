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
  shieldingStats?: Omit<healingShieldingStatsDto, 'total'>;
  skillShotsStats?: skillShotsDto;
}

const DamageStatsBody = ({
  dealtStats,
  takenStats,
  healingStats,
  shieldingStats,
  skillShotsStats,
}: DamageStatsBodyProps) => {
  return (
    <div className="flex flex-col w-full gap-[8px] box-border">
      {dealtStats && (
        <DamageStat
          type={"dealt"}
          total={dealtStats.total.champions}
          phyiscal={dealtStats.physical.champions}
          magic={dealtStats.magic.champions}
          trueDmg={dealtStats.true.champions}
        />
      )}
      {takenStats && (
        <DamageStat
          type={"taken"}
          total={takenStats.total}
          phyiscal={takenStats.physical}
          magic={takenStats.magic}
          trueDmg={takenStats.true}
        />
      )}
      <DamageLegend />
      <div className="flex flex-row flex-wrap gap-x-[16px] gap-y-[4px]">
        {healingStats && (
          <SimpleStat
            icon={<GiHealthNormal className="text-success" />}
            label="Total healing"
            recordLabel="healing"
            stat={healingStats.total}
          />
        )}
        {shieldingStats && (
          <SimpleStat
            icon={<FaShieldAlt className="text-info" />}
            label="Total shielding"
            recordLabel="shielding"
            stat={shieldingStats.onTeammates}
          />
        )}
        {skillShotsStats?.hit && (
          <SimpleStat
            icon={<GiArrowDunk className="text-damage-spell" />}
            label="Skillshots hit"
            recordLabel="skillshots hit"
            stat={skillShotsStats.hit}
          />
        )}
        {skillShotsStats?.dodged && (
          <SimpleStat
            icon={<GiAcrobatic className="text-damage-magic" />}
            label="Skillshots dodged"
            recordLabel="skillshots dodged"
            stat={skillShotsStats.dodged}
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
  <div className="flex flex-row flex-wrap gap-x-[10px] gap-y-[4px] text-[10px] font-medium text-fg-muted">
    {DAMAGE_LEGEND.map((item) => (
      <div key={item.label} className="flex items-center gap-[4px]">
        <span
          className="h-[7px] w-[7px] rounded-full"
          style={{ backgroundColor: item.color }}
        />
        {item.label}
      </div>
    ))}
  </div>
);

export default DamageStatsBody;
