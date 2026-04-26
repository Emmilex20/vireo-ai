type StudioSectionTitleProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function StudioSectionTitle({
  title,
  subtitle,
  action
}: StudioSectionTitleProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="font-(family-name:--font-heading) text-lg font-semibold text-white sm:text-xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>

      {action ? <div>{action}</div> : null}
    </div>
  );
}