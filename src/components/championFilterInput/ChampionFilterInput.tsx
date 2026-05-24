import { useState } from "react";

const ChampionFilterInput = () => {
  const [searchFilter, setSearchFilter] = useState<string>("");

  const handleUpdateSearchFilter = (value: string) => {
    setSearchFilter(value);
  };

  return (
    <input
      type="text"
      className="t-body-sm text-center h-8 rounded-sm border border-border-strong bg-surface text-fg w-full placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-accent"
      placeholder="SEARCH"
      value={searchFilter}
      onChange={(e) => handleUpdateSearchFilter(e.target.value)}
    />
  );
};

export default ChampionFilterInput;
