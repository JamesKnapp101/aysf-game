export function triggerTeleportFlash(el: HTMLElement | null) {
  if (!el) return;
  el.classList.remove("teleport-flash");
  void el.offsetWidth;
  el.classList.add("teleport-flash");
}

export function anyIn<T>(arrayA: T[], arrayB: T[]): boolean {
  const setA = new Set(arrayA);
  return arrayB.some((item) => setA.has(item));
}

type PowerRestoredSections = Record<string, boolean>;

const TPAD_COLORS_IN_ORDER = [
  "green",
  "blue",
  "yellow",
  "brown",
  "white",
  "grey",
] as const;

export function generateTerminalTpadDescription(
  power: PowerRestoredSections
): string {
  const onColors = TPAD_COLORS_IN_ORDER.filter(
    (c) => power[`teleport-pads-${c}`] === true
  );

  const base =
    "Against the wall is a row of colored, glossy disks, side by side, ordered green, blue, yellow, brown, white, and grey. Each of them is large enough to stand on.";

  const glowTail = "lit, emitting a serene glow.";

  if (onColors.length === 0) {
    return base; // none powered; don't add a second sentence
  }

  if (onColors.length === TPAD_COLORS_IN_ORDER.length) {
    return `${base} Each of the disks is ${glowTail}`;
  }

  const list = formatColorList(onColors);
  const plural = onColors.length > 1 ? "are" : "is";
  return `${base} Of the disks, the ${list} one${
    onColors.length > 1 ? "s" : ""
  } ${plural} ${glowTail}`;
}

function formatColorList(colors: readonly string[]): string {
  if (colors.length === 1) return colors[0];
  if (colors.length === 2) return `${colors[0]} and ${colors[1]}`;
  // Oxford comma
  return `${colors.slice(0, -1).join(", ")}, and ${colors[colors.length - 1]}`;
}
