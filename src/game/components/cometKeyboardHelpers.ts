const COMET_KEY_ROWS: string[][] = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

export function getCometKeyRows(): string[][] {
  return COMET_KEY_ROWS;
}

export function isCometKeyboardKey(key: string): boolean {
  return COMET_KEY_ROWS.some((row) => row.includes(key));
}
