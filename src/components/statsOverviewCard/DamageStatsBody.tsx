import type { damageStatsDto, damageTakenStatsDto } from "../../types";
import DamageStat from "./DamageStat";

interface DamageStatsBodyProps {
  dealtStats: damageStatsDto;
  takenStats: damageTakenStatsDto;
}


const DamageStatsBody = ({ dealtStats, takenStats }: DamageStatsBodyProps) => {
  return (
    <div className="flex flex-col w-full gap-[8px]">
      {dealtStats && 
        <DamageStat
        type={"dealt"}
        total={dealtStats.total.champions}
        phyiscal={dealtStats.physical.champions}
        magic={dealtStats.magic.champions}
        trueDmg={dealtStats.true.champions}
        />
      }
      {takenStats && 
        <DamageStat
        type={"taken"}
        total={takenStats.total}
        phyiscal={takenStats.physical}
        magic={takenStats.magic}
        trueDmg={takenStats.true}
        />
      }
      {/* <DamageStat type={"healed"} /> */}
    </div>
  );
};

export default DamageStatsBody;
