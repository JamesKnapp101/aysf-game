import { resolveItemByNoun, resolveItemByVocabulary } from "@game/rules/scope";
import type { GameState } from "@game/types/gameTypes";
import type { ParsedCommand } from "@game/types/parserTypes";

/** Semantic parsing: preserve noun roles and let canonical handlers enforce rules. */
export function normalizeCommandAliases(
  state: GameState,
  cmd: ParsedCommand,
): ParsedCommand {
  if (cmd.type !== "action") return cmd;
  if (
    !state.world.items.some((item) =>
      item.commandAliases?.some(
        (alias) => alias.verb === cmd.verb && alias.preposition === cmd.preposition,
      ),
    )
  ) return cmd;

  for (const deviceRole of ["direct", "indirect"] as const) {
    const noun = cmd[deviceRole];
    if (!noun?.trim()) continue;

    // A scoped object always wins, including an unrelated device sharing a name.
    // Definition-only fallback recognizes missing equipment without making it
    // available: the canonical handler resolves the original nouns in scope.
    const item =
      resolveItemByNoun(state, noun) ??
      resolveItemByVocabulary(state.world.items, noun);
    const alias = item?.commandAliases?.find(
      (entry) =>
        entry.device === deviceRole &&
        entry.verb === cmd.verb &&
        entry.preposition === cmd.preposition &&
        (entry.target ? Boolean(cmd[entry.target]?.trim()) : !cmd.indirect),
    );
    if (!alias) continue;

    return {
      type: "action",
      verb: alias.canonicalVerb,
      direct: alias.target ? cmd[alias.target] : noun,
      indirect: alias.target ? noun : undefined,
      preposition: alias.canonicalPreposition,
      raw: cmd.raw,
    };
  }

  return cmd;
}
