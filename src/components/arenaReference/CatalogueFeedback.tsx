interface CatalogueStateProps {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const CatalogueState = ({
  title,
  body,
  actionLabel,
  onAction,
}: CatalogueStateProps) => (
  <section className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface/50 p-6 text-center">
    <div>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-fg-muted">{body}</p>
    </div>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="mt-1 rounded-md border border-border bg-surface px-3 py-2 text-sm font-semibold transition-colors hover:border-border-strong hover:bg-surface-hover"
      >
        {actionLabel}
      </button>
    )}
  </section>
);

export const CatalogueSkeleton = ({
  grouped = false,
  label,
}: {
  grouped?: boolean;
  label: string;
}) => (
  <div className="flex animate-pulse flex-col gap-7" aria-label={label}>
    {Array.from({ length: grouped ? 3 : 1 }, (_, group) => (
      <section key={`catalogue-loading-${group}`} className="flex flex-col gap-3">
        {grouped && <div className="h-6 w-28 rounded-md bg-border/60" />}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(12.5rem,1fr))] gap-2.5">
          {Array.from({ length: 6 }, (_, entry) => (
            <div
              key={`catalogue-loading-${group}-${entry}`}
              className="h-20 rounded-lg border border-border bg-surface"
            />
          ))}
        </div>
      </section>
    ))}
  </div>
);
