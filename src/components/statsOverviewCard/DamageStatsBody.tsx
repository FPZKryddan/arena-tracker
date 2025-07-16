import { useEffect, useRef, useState } from "react";
import type { damageStatsDto, damageTakenStatsDto } from "../../types";
import DamageStat from "./DamageStat";

interface DamageStatsBodyProps {
  dealtStats: damageStatsDto;
  takenStats: damageTakenStatsDto;
}

const DamageStatsBody = ({ dealtStats, takenStats }: DamageStatsBodyProps) => {
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
      {/* <DamageStat type={"healed"} /> */}
    </div>
  );
};

export default DamageStatsBody;
