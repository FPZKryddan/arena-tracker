import { useCallback, useState } from "react";
import ChampionList from "../components/championsView/ChampionList";
import MatchHistoryList from "../components/matchHistory";

type Tab = "champions" | "matches";

const ChampionMatchTabs = () => {
  const [tab, setTab] = useState<Tab>("champions");
  const [mountedTabs, setMountedTabs] = useState<Record<Tab, boolean>>({
    champions: true,
    matches: false,
  });

  const selectTab = useCallback((nextTab: Tab) => {
    setTab(nextTab);
    setMountedTabs((current) =>
      current[nextTab] ? current : { ...current, [nextTab]: true }
    );
  }, []);

  return (
    <div className="flex flex-col w-full gap-[8px]">
      <div
        role="tablist"
        aria-label="Profile content"
        className="flex flex-row gap-[4px] bg-surface-elevated rounded-md p-[4px] self-start"
      >
        <TabButton
          id="champions-tab"
          controls="champions-panel"
          label="Champions"
          active={tab === "champions"}
          onClick={() => selectTab("champions")}
        />
        <TabButton
          id="matches-tab"
          controls="matches-panel"
          label="Matches"
          active={tab === "matches"}
          onClick={() => selectTab("matches")}
        />
      </div>
      <div
        id="champions-panel"
        role="tabpanel"
        aria-labelledby="champions-tab"
        hidden={tab !== "champions"}
      >
        <ChampionList />
      </div>
      <div
        id="matches-panel"
        role="tabpanel"
        aria-labelledby="matches-tab"
        hidden={tab !== "matches"}
      >
        {mountedTabs.matches && <MatchHistoryList />}
      </div>
    </div>
  );
};

const TabButton = ({
  id,
  controls,
  label,
  active,
  onClick,
}: {
  id: string;
  controls: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    id={id}
    role="tab"
    type="button"
    aria-controls={controls}
    aria-selected={active}
    onClick={onClick}
    className={`px-[12px] py-[4px] text-[12px] font-bold rounded ${
      active
        ? "bg-accent text-accent-fg"
        : "text-fg-muted hover:text-fg hover:bg-surface-hover"
    }`}
  >
    {label}
  </button>
);

export default ChampionMatchTabs;
