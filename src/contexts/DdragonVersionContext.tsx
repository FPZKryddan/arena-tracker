import { createContext, useEffect, useState, type ReactNode } from "react";

const FALLBACK_VERSION = "15.13.1";

// eslint-disable-next-line react-refresh/only-export-components
export const DdragonVersionContext = createContext<string>(FALLBACK_VERSION);

type DdragonVersionProps = {
  children: ReactNode;
};

const DdragonVersionProvider = ({ children }: DdragonVersionProps) => {
  const [version, setVersion] = useState<string>(FALLBACK_VERSION);

  useEffect(() => {
    let cancelled = false;
    fetch("https://ddragon.leagueoflegends.com/api/versions.json")
      .then((res) => {
        if (!res.ok)
          throw new Error(`DDragon versions fetch failed: ${res.status}`);
        return res.json() as Promise<string[]>;
      })
      .then((versions) => {
        if (cancelled) return;
        if (versions[0]) setVersion(versions[0]);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("failed to fetch latest ddragon version:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DdragonVersionContext.Provider value={version}>
      {children}
    </DdragonVersionContext.Provider>
  );
};

export default DdragonVersionProvider;
