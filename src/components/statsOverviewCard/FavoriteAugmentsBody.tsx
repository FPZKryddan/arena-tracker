import { useMemo } from "react";
import { useAugmentsQuery } from "../../hooks/queries";
import type { augmentsData, augmentsStatsDto } from "../../types";
import FavoriteAugment from "./FavoriteAugment";

interface FavoriteAugmentsBodyProps {
  augments: augmentsStatsDto;
}

type FavoriteAugmentEntry = {
  data: augmentsData;
  picked: number;
  rank: number;
};

const MAX_FAVORITE_AUGMENTS = 8;

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

  const totalPicked = useMemo(() => {
    return Object.entries(augments).reduce((total, [id, stats]) => {
      if (id === "0") return total;
      return total + Math.max(0, Number(stats.picked) || 0);
    }, 0);
  }, [augments]);

  const mostPickedAugments = useMemo((): FavoriteAugmentEntry[] => {
    return Object.entries(augments)
      .filter(([id]) => id !== "0")
      .map(([id, stats]) => {
        const picked = Math.max(0, Number(stats.picked) || 0);

        return {
          data: augmentById.get(Number(id)),
          picked,
        };
      })
      .filter(
        (entry): entry is Omit<FavoriteAugmentEntry, "rank"> =>
          !!entry.data && entry.picked > 0
      )
      .sort((a, b) => b.picked - a.picked)
      .slice(0, MAX_FAVORITE_AUGMENTS)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [augments, augmentById]);

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex flex-row items-center justify-between gap-2">
        <h2 className="text-xs font-semibold">Favorite Augments</h2>
        {!isLoading && !isError && totalPicked > 0 && (
          <p className="text-xs font-medium tabular-nums text-fg-muted">
            {totalPicked} picks
          </p>
        )}
      </div>

      {isLoading ? (
        <FavoriteAugmentsSkeleton />
      ) : isError ? (
        <FavoriteAugmentsMessage message="Augments unavailable" />
      ) : mostPickedAugments.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(8.25rem,1fr))] gap-2">
          {mostPickedAugments.map((entry) => (
            <FavoriteAugment
              key={entry.data.id}
              augmentData={entry.data}
              picked={entry.picked}
              rank={entry.rank}
            />
          ))}
        </div>
      ) : (
        <FavoriteAugmentsMessage message="No favorite augments yet" />
      )}
    </div>
  );
};

const FavoriteAugmentsSkeleton = () => (
  <div className="grid grid-cols-[repeat(auto-fit,minmax(8.25rem,1fr))] gap-2">
    {[...Array(MAX_FAVORITE_AUGMENTS)].map((_, index) => (
      <div
        key={`favorite-augment-loading-${index}`}
        className="h-12 animate-pulse rounded-md border border-border bg-border/50"
      />
    ))}
  </div>
);

const FavoriteAugmentsMessage = ({ message }: { message: string }) => (
  <div className="flex min-h-12 w-full items-center justify-center rounded-md border border-dashed border-border px-3 text-center text-xs font-medium text-fg-muted">
    {message}
  </div>
);

export default FavoriteAugmentsBody;
