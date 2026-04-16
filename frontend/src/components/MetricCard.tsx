import clsx from "clsx";

export default function MetricCard({
  label,
  value,
  accent,
  onClick,
  icon,
}: {
  label: string;
  value: string;
  accent: string;
  onClick?: () => void;
  icon?: string;
}) {
  return (
    <div
      className={clsx(
        "group rounded-[1.75rem] border border-stone-900/10 bg-white/90 p-6 transition-all duration-200",
        onClick && "cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/8 active:translate-y-0",
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-2xl leading-none">{icon}</span>}
          <span
            className={clsx(
              "inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]",
              accent,
            )}
          >
            {label}
          </span>
        </div>
        {onClick && (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 text-stone-400 opacity-0 transition-all group-hover:opacity-100 group-hover:bg-stone-900 group-hover:text-white text-sm">→</span>
        )}
      </div>
      <p className="mt-5 font-display text-5xl font-semibold text-stone-950 tracking-tight">{value}</p>
    </div>
  );
}
