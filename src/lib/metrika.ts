// Обёртки для целей Яндекс.Метрики
const YM_ID = 110945277;

type YmFn = (id: number, action: string, ...args: unknown[]) => void;

export function reachGoal(goal: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const ym = (window as unknown as { ym?: YmFn }).ym;
  if (typeof ym !== "function") return;
  try {
    if (params) ym(YM_ID, "reachGoal", goal, params);
    else ym(YM_ID, "reachGoal", goal);
  } catch {
    /* noop */
  }
}
