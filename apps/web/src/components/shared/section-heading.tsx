type SectionHeadingProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function SectionHeading({
  title,
  description,
  action
}: SectionHeadingProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0 self-start sm:self-auto">{action}</div> : null}
    </div>
  );
}
