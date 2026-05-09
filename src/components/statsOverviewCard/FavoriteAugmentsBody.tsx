import { useMemo } from "react";
import { useAugmentsQuery } from "../../hooks/queries";
import type { augmentsData, augmentsStatsDto } from "../../types";
import FavoriteAugment from "./FavoriteAugment";

interface FavoriteAugmentsBodyProps {
  augments: augmentsStatsDto;
}

const FavoriteAugmentsBody = ({ augments }: FavoriteAugmentsBodyProps) => {
  const {
    data: augmentData = [],
    isError,
    isLoading,
  } = useAugmentsQuery();

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
      <div className="flex h-[64px] w-full flex-row items-center justify-around gap-[8px]">
        {isLoading ? (
          <FavoriteAugmentsSkeleton />
        ) : isError ? (
          <FavoriteAugmentsMessage message="Augments unavailable" />
        ) : mostPickedAugments.length > 0 ? (
          mostPickedAugments.map((entry) => (
            <FavoriteAugment
              key={entry.data.id}
              augmentData={entry.data}
              picked={entry.picked}
            />
          ))
        ) : (
          <FavoriteAugmentsMessage message="No favorite augments yet" />
        )}
      </div>
    </div>
  );
};

const FavoriteAugmentsSkeleton = () => (
  <>
    {[...Array(5)].map((_, index) => (
      <div
        key={`favorite-augment-loading-${index}`}
        className="flex h-full aspect-square min-h-[50px] flex-col items-center gap-[4px]"
      >
        <div className="h-[42px] w-[42px] rounded-[15px] bg-border animate-pulse sm:h-[50px] sm:w-[50px]" />
        <div className="h-[10px] w-[16px] rounded bg-border animate-pulse" />
      </div>
    ))}
  </>
);

const FavoriteAugmentsMessage = ({ message }: { message: string }) => (
  <div className="flex min-h-[52px] w-full items-center justify-center rounded-md border border-dashed border-border px-3 text-center text-[12px] font-medium text-fg-muted">
    {message}
  </div>
);

export default FavoriteAugmentsBody;
