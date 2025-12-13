import type { ParsedCommand, Preposition } from "../game/types/parserTypes";
import type { Direction } from "../game/types/roomTypes";

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

// verb synonyms -> canonical verb
const VERB_ALIASES: Record<string, string> = {
  l: "look",
  look: "look",

  i: "inventory",
  inventory: "inventory",

  go: "go",

  x: "examine",
  examine: "examine",
  inspect: "examine",

  read: "read",
  scan: "read",

  take: "take",
  get: "take",

  drop: "drop",

  open: "open",
  close: "close",

  inject: "inject",
  fill: "fill",
  ask: "ask",
};

const PREPOSITIONS: Preposition[] = [
  "in",
  "into",
  "on",
  "with",
  "from",
  "at",
  "about",
  "to",
];

export function parseCommand(rawInput: string): ParsedCommand {
  const input = rawInput.trim().toLowerCase();
  if (!input) return { type: "unknown", raw: rawInput };

  const tokens = input.split(/\s+/);

  // Single-token directions: "n", "north", etc.
  if (tokens.length === 1 && DIR_MAP[tokens[0]]) {
    return { type: "move", direction: DIR_MAP[tokens[0]] };
  }

  const [rawVerb, ...rest] = tokens;
  const verb = VERB_ALIASES[rawVerb] ?? rawVerb;

  // Simple no-arg verbs
  if (verb === "look") {
    return { type: "look" };
  }
  if (verb === "inventory") {
    return { type: "inventory" };
  }

  // "go north"
  if (verb === "go" && rest.length === 1 && DIR_MAP[rest[0]]) {
    return { type: "move", direction: DIR_MAP[rest[0]] };
  }

  // "north" already handled above, but if someone types "n" as verb token
  if (DIR_MAP[verb]) {
    return { type: "move", direction: DIR_MAP[verb] };
  }

  // Generic action verbs from here on
  if (rest.length === 0) {
    // bare verb: "jump", "wait", etc. if you ever add them
    return {
      type: "action",
      verb,
      raw: rawInput,
    };
  }

  // Try to split <direct> <prep> <indirect>
  let direct: string | undefined;
  let preposition: Preposition | undefined;
  let indirect: string | undefined;

  const prepIndex = rest.findIndex((t) =>
    PREPOSITIONS.includes(t as Preposition)
  );

  if (prepIndex === -1) {
    // no preposition → whole rest is the direct object: "syringe", "blue cartridge"
    direct = rest.join(" ");
  } else {
    direct = rest.slice(0, prepIndex).join(" ") || undefined;
    preposition = rest[prepIndex] as Preposition;
    indirect = rest.slice(prepIndex + 1).join(" ") || undefined;
  }

  return {
    type: "action",
    verb,
    direct,
    preposition,
    indirect,
    raw: rawInput,
  };
}
