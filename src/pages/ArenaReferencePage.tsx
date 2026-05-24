import { useState } from "react";
import { IoSearch } from "react-icons/io5";
import {
  AugmentsCatalogue,
  ItemsCatalogue,
  ReferenceTabs,
  type ReferenceTab,
} from "../components/arenaReference";
import PageHeader from "../components/common/PageHeader";

const ArenaReferencePage = () => {
  const [tab, setTab] = useState<ReferenceTab>("augments");
  const [search, setSearch] = useState("");

  return (
    <div className="box-border flex min-h-dvh w-full flex-col gap-5 bg-bg p-3 text-fg md:gap-7 md:p-6">
      <main className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4">
        <section className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
          <PageHeader
            eyebrow="Arena"
            title="Codex"
            description="Browse current Arena augments and items."
          />

          <label className="flex h-10 w-full items-center gap-2 rounded-md border border-border bg-surface px-3 transition-colors focus-within:border-border-strong md:max-w-xs">
            <IoSearch className="h-4 w-4 shrink-0 text-fg-subtle" />
            <span className="sr-only">Search {tab}</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${tab}`}
              className="t-body-sm min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-fg-subtle"
            />
          </label>
        </section>

        <ReferenceTabs value={tab} onChange={setTab} />

        <section
          id="augments-panel"
          role="tabpanel"
          aria-labelledby="augments-tab"
          hidden={tab !== "augments"}
        >
          <AugmentsCatalogue search={search} />
        </section>

        <section
          id="items-panel"
          role="tabpanel"
          aria-labelledby="items-tab"
          hidden={tab !== "items"}
        >
          <ItemsCatalogue search={search} />
        </section>
      </main>
    </div>
  );
};

export default ArenaReferencePage;
