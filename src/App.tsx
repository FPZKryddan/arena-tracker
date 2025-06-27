import "./App.css";
import { useEffect, useState } from "react";
import ChampionCard from "./components/championCard";
import type { championData } from "./types";
import useFuzzy from "./hooks/useFuzzy";
import { Selector } from "./components/selector";

function App() {
  const [championData, setChampionData] = useState<championData[]>([]);
  const [renderedData, setRenderedData] =
    useState<championData[]>(championData);
  const [isLoadingChampions, setIsLoadingChampions] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"Name" | "Progress">("Name");
  const [orderBy, setOrderBy] = useState<"asc" | "desc">("asc");

  const [isSortSelectorOpen, setIsSortSelectorOpen] = useState<boolean>(false);
  const [isOrderSelectorOpen, setIsOrderSelectorOpen] =
    useState<boolean>(false);

  const fuzzySearch = useFuzzy();

  const FetchChampionData = async () => {
    const data = await fetch(
      "https://ddragon.leagueoflegends.com/cdn/15.13.1/data/en_US/champion.json"
    ).then((res) => res.json());

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fetchedData: championData[] = Object.values(data.data).map(
      (champion: any) => ({
        name: champion.name,
        id: champion.id,
        stage: 0,
      })
    );

    return fetchedData;
  };

  useEffect(() => {
    const fetchData = async () => {
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        try {
          const parsedData: championData[] = JSON.parse(storedData);
          setChampionData(parsedData);
        } catch (error) {
          console.error("Failed to parse stored data:", error);
        }
      } else {
        setIsLoadingChampions(true);
        const fetchedData = await FetchChampionData();
        setChampionData(fetchedData);
        setIsLoadingChampions(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let toBeRenderedData = [...championData];
    if (searchFilter) {
      toBeRenderedData = fuzzySearch(championData, searchFilter);
    }

    if (sortBy === "Name") {
      SortByName(toBeRenderedData, orderBy);
    } else if (sortBy === "Progress") {
      SortByProgress(toBeRenderedData, orderBy);
    }

    setRenderedData(toBeRenderedData);
  }, [championData, searchFilter, sortBy, orderBy, fuzzySearch]);

  const SortByName = (
    data: championData[],
    order: "asc" | "desc"
  ): championData[] => {
    if (order === "asc") {
      return data.sort((a, b) =>
        a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
      );
    }

    return data.sort((a, b) =>
      b.name.toLocaleLowerCase().localeCompare(a.name.toLocaleLowerCase())
    );
  };

  const SortByProgress = (
    data: championData[],
    order: "asc" | "desc"
  ): championData[] => {
    if (order === "asc") {
      return data.sort((a, b) => b.stage - a.stage);
    }

    return data.sort((a, b) => a.stage - b.stage);
  };

  const handleUpdateSearchFilter = (filter: string): void => {
    setSearchFilter(filter);
  };

  const UpdateChampionStage = (championName: string, stage: number): void => {
    const updatedData: championData[] = championData.map((champion) => {
      if (champion.name === championName) {
        let newStage: number = stage;
        if (champion.stage === stage) newStage = 0;
        return { ...champion, stage: newStage };
      }
      return champion;
    });

    setChampionData(updatedData);
    localStorage.setItem("userData", JSON.stringify(updatedData));
  };

  const ToggleSortSelecctorState = (): void => {
    setIsSortSelectorOpen(!isSortSelectorOpen);
    setIsOrderSelectorOpen(false);
  };

  const CloseSortSelector = (): void => {
    setIsSortSelectorOpen(false);
  };

  const UpdateSortingMethod = (value: string): void => {
    if (value === "Name" || value === "Progress") {
      const sortingMethod = value as "Name" | "Progress";
      setSortBy(sortingMethod);
    } else {
      console.error("Invalid Sorting Method:", value);
    }
  };

  const ToggleOrderSelectorState = (): void => {
    setIsOrderSelectorOpen(!isOrderSelectorOpen);
    setIsSortSelectorOpen(false);
  };

  const CloseOrderSelector = (): void => {
    setIsOrderSelectorOpen(false);
  };

  const UpdateOrderMethod = (value: string): void => {
    if (value === "asc" || value === "desc") {
      const orderingMethod = value as "asc" | "desc";
      setOrderBy(orderingMethod);
    } else {
      console.error("Invalid Order Method:", value);
    }
  };

  return (
    <div className="flex flex-col w-full h-dvh items-center p-x-16 gap-2 bg-linear-to-b to-stone-900 from-gray-900 overflow-y-auto" id="scrollContainer">
      <div className="mt-32 flex flex-col gap-2">
        <input
          type="text"
          className="text-center h-8 rounded-sm bg-stone-700 text-white font-semibold w-[300px]"
          placeholder="SEARCH"
          value={searchFilter}
          onChange={(e) => handleUpdateSearchFilter(e.target.value)}
        />
        <div className="self-start flex flex-row gap-2 w-full">
          <Selector
            label={sortBy}
            items={["Name", "Progress"]}
            isOpen={isSortSelectorOpen}
            toggleCallBack={ToggleSortSelecctorState}
            closeCallBack={CloseSortSelector}
            selectCallBack={UpdateSortingMethod}
          ></Selector>
          <Selector
            label={orderBy}
            items={["asc", "desc"]}
            isOpen={isOrderSelectorOpen}
            toggleCallBack={ToggleOrderSelectorState}
            closeCallBack={CloseOrderSelector}
            selectCallBack={UpdateOrderMethod}
          ></Selector>
        </div>
      </div>
      {isLoadingChampions ? (
        <p>Loading</p>
      ) : (
        <div className="grid gap-x-4 gap-y-20 grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 mt-12 mb-24 pb-24">
          {renderedData.map((champion) => (
            <ChampionCard
              key={champion.name}
              champion={champion}
              updateStageCallBack={UpdateChampionStage}
            ></ChampionCard>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
