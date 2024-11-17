export type PageHeaderProps = {
  title: string;
  description: string;
  block?: React.ReactNode;
  className?: string;
};

export const PageHeader = ({
  title,
  description,
  block,
  className,
}: PageHeaderProps) => {
  return (
    <div className="border rounded-xl bg-card">
      <div
        className={`md:container mx-auto px-4 flex flex-wrap items-center justify-between gap-6 py-8 ${className}`}
      >
        <div>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold">{title}</p>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {block}
      </div>
    </div>
  );
};
