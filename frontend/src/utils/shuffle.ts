/**
 * Returns a shuffled copy of `items` (Fisher–Yates), leaving the input untouched.
 * `random` must return a number in [0, 1); it defaults to `Math.random`.
 */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
