export type ReferenceTab = "augments" | "items";

interface ReferenceTabsProps {
  value: ReferenceTab;
  onChange: (value: ReferenceTab) => void;
}

const TABS: Array<{ value: ReferenceTab; label: string }> = [
  { value: "augments", label: "Augments" },
  { value: "items", label: "Items" },
];

const ReferenceTabs = ({ value, onChange }: ReferenceTabsProps) => (
  <div
    role="tablist"
    aria-label="Arena reference content"
    className="flex flex-row gap-1 self-start rounded-md border border-border bg-surface p-1"
  >
    {TABS.map((tab) => (
      <button
        key={tab.value}
        id={`${tab.value}-tab`}
        type="button"
        role="tab"
        aria-controls={`${tab.value}-panel`}
        aria-selected={value === tab.value}
        onClick={() => onChange(tab.value)}
        className={`rounded-sm px-3 py-1 text-xs font-semibold transition-colors ${
          value === tab.value
            ? "bg-accent text-accent-fg"
            : "text-fg-muted hover:bg-surface-hover hover:text-fg"
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default ReferenceTabs;
