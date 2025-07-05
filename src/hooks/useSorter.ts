import type { championData } from "../types";

function useSorter() {
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

  return {
    SortByName,
    SortByProgress
  }
}

export default useSorter;
