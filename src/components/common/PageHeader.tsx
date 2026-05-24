interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
}

const PageHeader = ({ eyebrow, title, description }: PageHeaderProps) => (
  <div className="min-w-0">
    <p className="text-xs font-semibold uppercase text-fg-subtle">{eyebrow}</p>
    <h1 className="mt-1 truncate text-2xl font-semibold leading-tight">
      {title}
    </h1>
    {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
  </div>
);

export default PageHeader;
