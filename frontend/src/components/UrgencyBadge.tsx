import clsx from "clsx";
import { urgencyTone, type Urgency } from "../data/content";

export default function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return (
    <span
      className={clsx(
        "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        urgencyTone[urgency],
      )}
    >
      {urgency}
    </span>
  );
}
