export type PetStats = {
  food: number;
  walk: number;
  love: number;
  energy: number;
  hygiene: number;
};

export type DecayRates = {
  food: number;
  walk: number;
  love: number;
  energy: number;
  hygiene: number;
};

export const DEFAULT_DECAY_RATES: DecayRates = {
  food: 0.5,
  walk: 0.08,
  love: 0.095,
  energy: 0.065,
  hygiene: 0.15,
};

const clampStat = (value: number, fallback = 100) =>
  Number.isFinite(value)
    ? Math.max(0, Math.min(100, value))
    : Number.isFinite(fallback)
      ? Math.max(0, Math.min(100, fallback))
      : 100;

export function applyDecay(
  stats: PetStats,
  deltaMinutes: number,
  rates: DecayRates = DEFAULT_DECAY_RATES,
): PetStats {
  if (deltaMinutes <= 0) {
    return stats;
  }

  return {
    food: clampStat(stats.food - deltaMinutes * rates.food, stats.food),
    walk: clampStat(stats.walk - deltaMinutes * rates.walk, stats.walk),
    love: clampStat(stats.love - deltaMinutes * rates.love, stats.love),
    energy: clampStat(stats.energy - deltaMinutes * rates.energy, stats.energy),
    hygiene: clampStat(
      stats.hygiene - deltaMinutes * rates.hygiene,
      stats.hygiene,
    ),
  };
}
