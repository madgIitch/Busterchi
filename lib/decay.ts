export type PetStats = {
  food: number;
  walk: number;
  love: number;
  energy: number;
};

export type DecayRates = {
  food: number;
  walk: number;
  love: number;
  energy: number;
};

export const DEFAULT_DECAY_RATES: DecayRates = {
  food: 0.5,
  walk: 0.08,
  love: 0.095,
  energy: 0.065,
};

const clampStat = (value: number) => Math.max(0, Math.min(100, value));

export function applyDecay(
  stats: PetStats,
  deltaMinutes: number,
  rates: DecayRates = DEFAULT_DECAY_RATES,
): PetStats {
  if (deltaMinutes <= 0) {
    return stats;
  }

  return {
    food: clampStat(stats.food - deltaMinutes * rates.food),
    walk: clampStat(stats.walk - deltaMinutes * rates.walk),
    love: clampStat(stats.love - deltaMinutes * rates.love),
    energy: clampStat(stats.energy - deltaMinutes * rates.energy),
  };
}
