import type { ReactNode } from "react";

export default function Panel({
  title,
  subtitle,
  children,
  accent,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  accent?: string;
}) {
  return (
    <section className="glass rounded-[2rem] border border-stone-900/10 overflow-hidden">
      {accent && <div className={`h-1.5 w-full ${accent}`} />}
      <div className="px-6 pt-8 pb-6 md:px-8 md:pt-10 md:pb-8 lg:px-10 lg:pt-12 lg:pb-10">
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-xl font-semibold text-stone-950 sm:text-2xl md:text-3xl">{title}</h3>
          {subtitle && <p className="max-w-2xl text-sm text-stone-500 leading-relaxed">{subtitle}</p>}
        </div>
        <div className="mt-6 md:mt-7">{children}</div>
      </div>
    </section>
  );
}
