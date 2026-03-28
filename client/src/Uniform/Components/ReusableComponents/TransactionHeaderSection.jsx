const TransactionHeaderSection = ({
  title,
  children,
  className = "",
  bodyClassName = "",
  titleClassName = "",
}) => {
  const sectionClasses = [
    "relative mt-2 rounded-md border border-slate-200 bg-white px-2 pb-2 pt-4 shadow-sm",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const bodyClasses = ["grid gap-1 overflow-visible", bodyClassName].filter(Boolean).join(" ");
  const legendClasses = [
    "absolute -top-3 left-3 bg-white px-2 text-[12px] font-medium text-slate-700",
    titleClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={sectionClasses}>
      <h2 className={legendClasses}>{title}</h2>
      <div className={bodyClasses}>{children}</div>
    </div>
  );
};

export default TransactionHeaderSection;
