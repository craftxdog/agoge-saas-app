
export const calcTrend = (current: number, previous: number) => {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
};
