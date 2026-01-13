type StatItem = {
  label: string;
  value: number;
  icon: string;
  barGradient: string;
  endIcon?: string;
};

export default function StatsBars({ stats }: { stats: StatItem[] }) {
  return (
    <section className="w-full space-y-3 rounded-3xl bg-surface p-4 shadow-sm shadow-black/10">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-base shadow-sm shadow-black/10">
            <span aria-hidden="true">{stat.icon}</span>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-sm font-semibold text-[var(--color-text)]">
              <span>{stat.label}</span>
              <span className="text-[var(--color-muted)]">
                {Math.round(stat.value)}
              </span>
            </div>
            <div className="h-4 w-full rounded-full bg-background/80 shadow-inner">
              <div
                className="h-4 rounded-full"
                style={{
                  width: `${Math.round(stat.value)}%`,
                  backgroundImage: stat.barGradient,
                }}
              />
            </div>
          </div>
          <div className="text-sm text-rose-300">{stat.endIcon ?? "♥"}</div>
        </div>
      ))}
    </section>
  );
}
