import type { Direction } from "../world/types";

export type ParsedCommand =
  | { type: "look" }
  | { type: "inventory" }
  | { type: "move"; direction: Direction }
  | { type: "examine"; noun: string }
  | { type: "take"; noun: string }
  | { type: "drop"; noun: string }
  | { type: "open"; noun: string }
  | { type: "close"; noun: string }
  | { type: "unknown"; raw: string };

const DIR_MAP: Record<string, Direction> = {
  n: "north",
  north: "north",
  s: "south",
  south: "south",
  e: "east",
  east: "east",
  w: "west",
  west: "west",
  u: "up",
  up: "up",
  d: "down",
  down: "down",
  nw: "northwest",
  northwest: "northwest",
  ne: "northeast",
  northeast: "northeast",
  sw: "southwest",
  southwest: "southwest",
  se: "southeast",
  southeast: "southeast",
};

export function parseCommand(rawInput: string): ParsedCommand {
  const input = rawInput.trim().toLowerCase();
  if (!input) return { type: "unknown", raw: rawInput };

  const tokens = input.split(/\s+/);
  if (tokens.length === 1 && DIR_MAP[tokens[0]]) {
    return { type: "move", direction: DIR_MAP[tokens[0]] };
  }

  const [verb, ...rest] = tokens;
  const noun = rest.join(" ");

  switch (verb) {
    case "look":
    case "l":
      return { type: "look" };
    case "inventory":
    case "i":
      return { type: "inventory" };
    case "go":
      if (DIR_MAP[noun]) return { type: "move", direction: DIR_MAP[noun] };
      return { type: "unknown", raw: rawInput };
    case "examine":
    case "x":
    case "inspect":
      if (!noun) return { type: "unknown", raw: rawInput };
      return { type: "examine", noun };
    case "take":
    case "get":
      if (!noun) return { type: "unknown", raw: rawInput };
      return { type: "take", noun };
    case "drop":
      if (!noun) return { type: "unknown", raw: rawInput };
      return { type: "drop", noun };
    case "open":
      if (!noun) return { type: "unknown", raw: rawInput };
      return { type: "open", noun };
    default:
      if (DIR_MAP[verb]) return { type: "move", direction: DIR_MAP[verb] };
      return { type: "unknown", raw: rawInput };
  }
}
