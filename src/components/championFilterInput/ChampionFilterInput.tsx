import { useState } from "react";

const ChampionFilterInput = () => {
  const [searchFilter, setSearchFilter] = useState<string>("");

  const handleUpdateSearchFilter = (value: string) => {
    setSearchFilter(value);
  }

  return (
    <input
      type="text"
      className="text-center h-8 rounded-sm bg-stone-700 text-white font-semibold w-full"
      placeholder="SEARCH"
      value={searchFilter}
      onChange={(e) => handleUpdateSearchFilter(e.target.value)}
    />
  );
};

export default ChampionFilterInput;
