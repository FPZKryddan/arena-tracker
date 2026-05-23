const averageFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
});

export const getAveragePerMatch = (
  value: number,
  matchCount: number
): number => {
  if (!Number.isFinite(value) || !Number.isFinite(matchCount) || matchCount <= 0) {
    return 0;
  }

  return value / matchCount;
};

export const formatAveragePerMatch = (value: number): string => {
  if (!Number.isFinite(value)) return "0";
  return averageFormatter.format(value);
};

export const getAveragePerMatchLabel = (
  value: number,
  matchCount: number
): string => {
  return `${formatAveragePerMatch(
    getAveragePerMatch(value, matchCount)
  )} avg/game`;
};
