import { createContext, useState, type ReactNode } from "react";
import type { PlayerStats } from "../types";

type PlayerStatsProps = {
  children: ReactNode;
};

type PlayerStatsContextValue = {
  playerStats: PlayerStats | null;
  setPlayerStats: React.Dispatch<React.SetStateAction<PlayerStats | null>>
};

// eslint-disable-next-line react-refresh/only-export-components
export const PlayerStatsContext = createContext<PlayerStatsContextValue | undefined>(undefined);

const PlayerStatsProvider = ({ children }: PlayerStatsProps) => {
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);

  return (
    <PlayerStatsContext.Provider value={{ playerStats, setPlayerStats }}>
      {children}
    </PlayerStatsContext.Provider>
  );
};

export default PlayerStatsProvider;
