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
  in: "in",
  out: "out",
};

const VERB_ALIASES: Record<string, string> = {
  l: "look",
  look: "look",

  i: "inventory",
  inv: "inventory",
  inventory: "inventory",

  diagnose: "diagnose",
  status: "diagnose",

  go: "go",

  x: "examine",
  examine: "examine",
  inspect: "examine",
  check: "examine",

  read: "read",
  scan: "read",

  take: "take",
  get: "take",

  drop: "drop",

  open: "open",
  close: "close",
  press: "push",
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
  "over",
];

const SWITCH_PARTICLES = new Set(["on", "off"]);
const SWITCH_VERBS = new Set(["switch", "turn", "flip"]);

export function parseCommand(rawInput: string): ParsedCommand {
  const input = rawInput.trim().toLowerCase();
  if (!input) return { type: "unknown", raw: rawInput };

  const tokens = input.split(/\s+/);

  if (tokens.length === 1 && DIR_MAP[tokens[0]]) {
    return { type: "move", direction: DIR_MAP[tokens[0]] };
  }

  const [rawVerb, ...rest0] = tokens;
  const verb = VERB_ALIASES[rawVerb] ?? rawVerb;

  if (verb === "look") return { type: "look" };
  if (verb === "inventory") return { type: "inventory" };
  if (verb === "diagnose") return { type: "diagnose" };

  if (verb === "go" && rest0.length === 1 && DIR_MAP[rest0[0]]) {
    return { type: "move", direction: DIR_MAP[rest0[0]] };
  }

  if (DIR_MAP[verb]) {
    return { type: "move", direction: DIR_MAP[verb] };
  }

  if (rest0.length === 0) {
    return { type: "action", verb, raw: rawInput };
  }

  let rest = [...rest0];
  let preposition: Preposition | undefined;

  if (SWITCH_VERBS.has(verb)) {
    if (rest[0] && SWITCH_PARTICLES.has(rest[0])) {
      preposition = rest[0] as Preposition;
      rest = rest.slice(1);
    } else if (
      rest.length >= 2 &&
      SWITCH_PARTICLES.has(rest[rest.length - 1])
    ) {
      preposition = rest[rest.length - 1] as Preposition;
      rest = rest.slice(0, -1);
    }
  }

  if (preposition && SWITCH_PARTICLES.has(preposition)) {
    const direct = rest.join(" ").trim() || undefined;
    return {
      type: "action",
      verb,
      direct,
      preposition,
      raw: rawInput,
    };
  }

  let direct: string | undefined;
  let indirect: string | undefined;

  const prepIndex = rest.findIndex((t) =>
    PREPOSITIONS.includes(t as Preposition),
  );

  if (prepIndex === -1) {
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
