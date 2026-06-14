import { stats } from "@/lib/data";

export function StatsBar() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl glass px-4 py-5 text-center transition-colors duration-300 hover:border-gold-500/30"
        >
          <p className="font-display text-2xl font-bold tracking-wide text-gold-grad sm:text-3xl">
            {s.value}
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}
