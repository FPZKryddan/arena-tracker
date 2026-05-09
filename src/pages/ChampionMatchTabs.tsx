import { useState } from "react";
import ChampionList from "../components/championsView/ChampionList";
import MatchHistoryList from "../components/matchHistory";

type Tab = "champions" | "matches";

const ChampionMatchTabs = () => {
  const [tab, setTab] = useState<Tab>("champions");

  return (
    <div className="flex flex-col w-full gap-[8px]">
      <div className="flex flex-row gap-[4px] bg-surface-elevated rounded-md p-[4px] self-start">
        <TabButton
          label="Champions"
          active={tab === "champions"}
          onClick={() => setTab("champions")}
        />
        <TabButton
          label="Matches"
          active={tab === "matches"}
          onClick={() => setTab("matches")}
        />
      </div>
      {tab === "champions" ? <ChampionList /> : <MatchHistoryList />}
    </div>
  );
};

const TabButton = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
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
