import { useMemo } from "react";
import { useAugmentsQuery } from "../../hooks/queries";
import type { augmentsData, augmentsStatsDto } from "../../types";
import FavoriteAugment from "./FavoriteAugment";

interface FavoriteAugmentsBodyProps {
  augments: augmentsStatsDto;
}

const FavoriteAugmentsBody = ({ augments }: FavoriteAugmentsBodyProps) => {
  const { data: augmentData = [] } = useAugmentsQuery();

  const augmentById = useMemo(() => {
    const map = new Map<number, augmentsData>();
    for (const a of augmentData) map.set(a.id, a);
    return map;
  }, [augmentData]);

  const mostPickedAugments = useMemo(() => {
    return Object.entries(augments)
      .filter(([id]) => id !== "0")
      .map(([id, stats]) => ({
        data: augmentById.get(Number(id)),
        picked: stats.picked,
      }))
      .filter((entry): entry is { data: augmentsData; picked: number } => !!entry.data)
      .sort((a, b) => b.picked - a.picked)
      .slice(0, 5);
  }, [augments, augmentById]);

  return (
    <div className="flex flex-col w-full gap-[8px]">
      <h2 className="text-[12px] font-semibold">Favorite Augments</h2>
      <div className="flex flex-row w-full justify-around h-[50px] sm:h-[60px]">
        {augmentData.length > 0 &&
          mostPickedAugments.map((entry) => (
            <FavoriteAugment
              key={entry.data.id}
              augmentData={entry.data}
              picked={entry.picked}
            />
          ))}
      </div>
    </div>
  );
};

export default FavoriteAugmentsBody;
