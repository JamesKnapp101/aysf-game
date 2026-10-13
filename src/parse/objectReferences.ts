import {
  findDoorsByNoun,
  findItemsByVocabulary,
  getItemsInScope,
  normalize,
  resolveDoorByNoun,
  resolveItemByNoun,
} from "@game/rules/scope";
import type { GameState } from "@game/types/gameTypes";
import type { ParsedCommand } from "@game/types/parserTypes";

// These arguments are nouns. Dialogue, orders, terminal input, and unknown
// verbs deliberately stay outside this grammar. SET's value is free text.
const DIRECT_OBJECT_VERBS = new Set([
  "open", "close", "take", "get", "drop", "read", "examine", "drink",
  "eat", "set", "wear", "remove", "switch", "lift", "move", "search",
  "turn", "push", "pet", "play", "call", "ride", "smell", "blow",
  "bounce", "shake", "fix", "sit", "drown",
]);
const TWO_OBJECT_VERBS = new Set([
  "put", "use", "give", "shoot", "touch", "throw", "apply", "load",
  "empty", "pour", "fill", "stick", "hit", "punch", "inject",
  "look", "listen", "stand", "smell", "bounce", "sit",
]);

/** Semantic noun normalization; raw input and non-object arguments survive. */
export function normalizeObjectReferences(
  state: GameState,
  command: ParsedCommand,
): { command: ParsedCommand; ambiguousNoun?: string } {
  if (command.type !== "action") return { command };
  if (![command.direct, command.indirect].some(noun => noun && /^(?:the|a|an)\s+\S/i.test(noun))) {
    return { command };
  }

  const roles = new Set<"direct" | "indirect">();
  if (DIRECT_OBJECT_VERBS.has(command.verb)) roles.add("direct");
  if (TWO_OBJECT_VERBS.has(command.verb)) {
    roles.add("direct");
    roles.add("indirect");
  }
  // Shooting THROUGH uses a weapon/projectile phrase, rather than a target
  // object ("the camera" can refer to the loaded round). Its handler owns it.
  if (command.verb === "shoot" && command.preposition === "through") {
    roles.delete("direct");
  }
  // Item-owned syntax (e.g. SAMPLE target WITH device) declares its noun roles.
  for (const item of state.world.items) {
    for (const alias of item.commandAliases ?? []) {
      if (alias.verb !== command.verb || alias.preposition !== command.preposition) continue;
      roles.add(alias.device);
      if (alias.target) roles.add(alias.target);
    }
  }

  let next = command;
  for (const role of roles) {
    const noun = command[role];
    if (!noun || !/^(?:the|a|an)\s+\S/i.test(noun)) continue;

    // Preserve an existing name/alias, including names containing articles.
    if (resolveItemByNoun(state, noun) || resolveDoorByNoun(state, noun)) continue;
    const scopedItems = getItemsInScope(state);
    if (scopedItems.some(item => item.named && normalize(item.named(state, item)) === normalize(noun))) continue;

    const stripped = noun.replace(/^(?:the|a|an)\s+/i, "");
    // Bulk selectors aren't ordinary object references.
    if ((command.verb === "take" || command.verb === "get") && stripped === "all") continue;
    const items = findItemsByVocabulary(scopedItems, stripped);
    const doors = findDoorsByNoun(state, stripped);
    // OPEN/CLOSE prefer doors; examination and LOOK prefer items. Keep that
    // precedence when checking ties, including scenery sharing door aliases.
    const matches = (command.verb === "open" || command.verb === "close") && doors.length
      ? doors : items.length ? items : doors;
    if (matches.length > 1) {
      return { command, ambiguousNoun: noun };
    }

    // Pass the noun to the existing handlers, rather than substituting an ID:
    // specialized TAKE/DROP rules and item overrides still own resolution.
    next = { ...next, [role]: stripped };
  }
  return { command: next };
}
