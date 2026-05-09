import { useEffect } from "react";
import { ChampionsContext } from "../contexts/ChampionsContext";
import { useChampionListQuery } from "./queries";
import useContextIfDefined from "./useContextIfDefined";

function useInitializeAppState() {
  const { setChampions } = useContextIfDefined(ChampionsContext);
  const { data: championList } = useChampionListQuery();

  useEffect(() => {
    if (championList) setChampions(championList);
  }, [championList, setChampions]);
}

export default useInitializeAppState;
