import { createContext, useState, type ReactNode, type SetStateAction } from "react";
import type { championData } from "../types";

type ChampionsProps = {
    children: ReactNode
}

type ChampionsContextValue = {
    champions: championData[],
    setChampions: React.Dispatch<SetStateAction<championData[]>>
}

// eslint-disable-next-line react-refresh/only-export-components
export const ChampionsContext = createContext<ChampionsContextValue | undefined>(undefined);

const ChampionsProvider = ({ children }: ChampionsProps) => {
    const [champions, setChampions] = useState<championData[]>([]);

    return (
        <ChampionsContext.Provider value={{ champions, setChampions }}>
            {children}
        </ChampionsContext.Provider>
    );
};

export default ChampionsProvider;