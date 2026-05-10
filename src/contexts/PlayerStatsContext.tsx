import { createContext, useState, type ReactNode } from "react";
import type { PlayerStats, Regions } from "../types";

type PlayerStatsProps = {
  children: ReactNode;
};

export type LoadedProfile = {
  region: Exclude<Regions, null>;
  gameName: string;
  tagLine: string;
};

type PlayerStatsContextValue = {
  playerStats: PlayerStats | null;
  setPlayerStats: React.Dispatch<React.SetStateAction<PlayerStats | null>>;
  loadedProfile: LoadedProfile | null;
  setLoadedProfile: React.Dispatch<React.SetStateAction<LoadedProfile | null>>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const PlayerStatsContext = createContext<PlayerStatsContextValue | undefined>(undefined);

const PlayerStatsProvider = ({ children }: PlayerStatsProps) => {
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loadedProfile, setLoadedProfile] = useState<LoadedProfile | null>(
    null
  );

  return (
    <PlayerStatsContext.Provider
      value={{ playerStats, setPlayerStats, loadedProfile, setLoadedProfile }}
    >
      {children}
    </PlayerStatsContext.Provider>
  );
};

export default PlayerStatsProvider;
