"use client";

import { useEffect, useRef, useState } from "react";

type StatItem = {
  label: string;
  value: number;
  icon: string;
  barEmptySrc: string;
  barFullSrc: string;
  endIcon?: string;
};

function StatRow({ stat }: { stat: StatItem }) {
  const prev = useRef(stat.value);
  const [sparkle, setSparkle] = useState(false);

  useEffect(() => {
    if (stat.value > prev.current) {
      setSparkle(true);
      const id = setTimeout(() => setSparkle(false), 600);
      return () => clearTimeout(id);
    }
    prev.current = stat.value;
  }, [stat.value]);

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-base shadow-sm shadow-black/10">
        <span aria-hidden="true">{stat.icon}</span>
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between text-sm font-normal text-text">
          <span>{stat.label}</span>
          <span className="text-muted">{Math.round(stat.value)}</span>
        </div>
        <div className="relative h-6 w-full overflow-hidden rounded-full bg-background/80 shadow-inner">
          <div
            className="pixelated absolute left-0 top-0 h-full w-full"
            style={{
              backgroundImage: `url(${stat.barFullSrc})`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              clipPath: `inset(0 ${100 - Math.round(stat.value)}% 0 0)`,
            }}
          />
          <div
            className="pixelated h-full w-full"
            style={{
              backgroundImage: `url(${stat.barEmptySrc})`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          />
          {sparkle ? (
            <span className="sparkle" aria-hidden="true" />
          ) : null}
        </div>
      </div>
      <div className="text-sm text-rose-300">{stat.endIcon ?? "♥"}</div>
    </div>
  );
}

export default function StatsBars({ stats }: { stats: StatItem[] }) {
  return (
    <section className="w-full space-y-3 rounded-3xl bg-surface p-4 shadow-sm shadow-black/10">
      {stats.map((stat) => (
        <StatRow key={stat.label} stat={stat} />
      ))}
    </section>
  );
}
