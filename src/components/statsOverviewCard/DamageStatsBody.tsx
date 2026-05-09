import { useEffect, useRef, useState } from "react";
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
  shieldingStats?: healingShieldingStatsDto;
  skillShotsStats?: skillShotsDto;
}

const DamageStatsBody = ({
  dealtStats,
  takenStats,
  healingStats,
  shieldingStats,
  skillShotsStats,
}: DamageStatsBodyProps) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    if (!barRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setBarWidth(entry.contentRect.width);
        }
      }
    });

    observer.observe(barRef.current);

    return () => observer.disconnect();
  }, []);
  console.log(shieldingStats);

  return (
    <div className="flex flex-col w-full gap-[8px] box-border" ref={barRef}>
      {dealtStats && (
        <DamageStat
          type={"dealt"}
          total={dealtStats.total.champions}
          phyiscal={dealtStats.physical.champions}
          magic={dealtStats.magic.champions}
          trueDmg={dealtStats.true.champions}
          parentBarWidth={barWidth}
        />
      )}
      {takenStats && (
        <DamageStat
          type={"taken"}
          total={takenStats.total}
          phyiscal={takenStats.physical}
          magic={takenStats.magic}
          trueDmg={takenStats.true}
          parentBarWidth={barWidth}
        />
      )}
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

export default DamageStatsBody;
