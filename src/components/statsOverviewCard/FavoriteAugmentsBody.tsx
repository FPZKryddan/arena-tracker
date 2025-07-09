import { useEffect, useState } from "react";
import useFetchData from "../../hooks/useFetchData";
import type { augmentsData, augmentsStatsDto } from "../../types";
import FavoriteAugment from "./FavoriteAugment";

interface FavoriteAugmentsBodyProps {
  augments: augmentsStatsDto;
}

const FavoriteAugmentsBody = ({ augments }: FavoriteAugmentsBodyProps) => {
  const { FetchAugmentsData } = useFetchData();
  const [augmentData, setAugmentData] = useState<augmentsData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await FetchAugmentsData();
      setAugmentData(data);
    };
    fetchData();
  }, [FetchAugmentsData]);

  const getMostPickedAugments = (): [string, { picked: number }][] => {
    return Object.entries(augments)
      .sort(([, a], [, b]) => b.picked - a.picked)
      .filter((augment) => augment[0] != "0")
      .slice(0, 5);
  };

  const mostPickedAugments = getMostPickedAugments();
  console.log(mostPickedAugments);

  const getAugmentData = (id: string): augmentsData => {
    const intId = Number(id);
    return augmentData.filter((augment) => augment.id === intId)[0];
  };

  return (
    <div className="flex flex-col w-full gap-[8px]">
      <h2 className="text-[12px] font-semibold">Favorite Augments</h2>
      <div className="flex flex-row w-full justify-between h-[74px]">
        {augmentData.length > 0 ? (
          <>
            {mostPickedAugments.length > 0 &&
              <FavoriteAugment
              augmentData={getAugmentData(mostPickedAugments[0][0])}
              picked={mostPickedAugments[0][1].picked}
              />
            }
            {mostPickedAugments.length > 1 &&
              <FavoriteAugment
                augmentData={getAugmentData(mostPickedAugments[1][0])}
                picked={mostPickedAugments[1][1].picked}
              />
            }
            {mostPickedAugments.length > 2 &&
              <FavoriteAugment
                augmentData={getAugmentData(mostPickedAugments[2][0])}
                picked={mostPickedAugments[2][1].picked}
              />
            }
            {mostPickedAugments.length > 3 &&
              <FavoriteAugment
                augmentData={getAugmentData(mostPickedAugments[3][0])}
                picked={mostPickedAugments[3][1].picked}
              />
            }
            {mostPickedAugments.length > 4 &&
              <FavoriteAugment
                augmentData={getAugmentData(mostPickedAugments[4][0])}
                picked={mostPickedAugments[4][1].picked}
              />
            }
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default FavoriteAugmentsBody;
