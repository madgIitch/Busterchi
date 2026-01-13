type StatItem = {
  label: string;
  value: number;
};

export default function StatsBars({ stats }: { stats: StatItem[] }) {
  return (
    <section className="w-full space-y-3">
      {stats.map((stat) => (
        <div key={stat.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm font-medium text-[var(--color-text)]">
            <span>{stat.label}</span>
            <span className="text-[var(--color-muted)]">{stat.value}</span>
          </div>
          <div className="h-3 w-full rounded-full bg-white/50">
            <div
              className="h-3 rounded-full bg-[var(--color-primary)]"
              style={{ width: `${stat.value}%` }}
            />
          </div>
        </div>
      ))}
    </section>
  );
}
