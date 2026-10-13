/** The sentence fragments displayed by the browser's automatic mind flash. */
export function splitMemory(memory: string): string[] {
  return memory
    .split(".")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.endsWith(".") ? s : `${s}.`));
}
