/** Returns the display letter for the option at `index` in on-screen order (0 → "A"). */
export function optionLetter(index: number): string {
  return String.fromCharCode('A'.charCodeAt(0) + index);
}
