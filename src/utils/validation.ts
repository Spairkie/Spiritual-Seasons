export function validateDay(day: unknown): day is number {
  return typeof day === 'number' && Number.isInteger(day) && day >= 1 && day <= 120;
}

export function clampDay(day: number): number {
  return Math.max(1, Math.min(120, Math.round(day)));
}
