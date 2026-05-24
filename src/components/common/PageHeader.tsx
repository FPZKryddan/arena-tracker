interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
}

const PageHeader = ({ eyebrow, title, description }: PageHeaderProps) => (
  <div className="min-w-0">
    <p className="t-eyebrow text-fg-subtle">{eyebrow}</p>
    <h1 className="t-h1 mt-1 truncate">
      {title}
    </h1>
    {description && <p className="t-body-sm mt-1 text-fg-muted">{description}</p>}
  </div>
);

export default PageHeader;
