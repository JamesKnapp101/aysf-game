import { describe, expect, it } from "vitest";
import { buildCometPromptContext } from "../game/components/cometPromptHelpers";
import { DEFAULT_COMET_INDEXED_ENTRIES } from "../game/components/comet-indexed-entries";
import { findRelevantCometEntries } from "../game/components/cometHelpers";
import { createTestState } from "./helpers/gameTestHelpers";

describe("Comet help entries", () => {
  it("finds the interface overview for layout questions", () => {
    const matches = findRelevantCometEntries(DEFAULT_COMET_INDEXED_ENTRIES, [
      "I don't understand the game layout, help me",
    ]);

    expect(matches.map((match) => match.entry.id)).toContain(
      "app_interface_overview",
    );
  });

  it("finds the compass symbol help entry for compass icon questions", () => {
    const matches = findRelevantCometEntries(DEFAULT_COMET_INDEXED_ENTRIES, [
      "what are the four symbols around the compass?",
    ]);

    expect(matches.map((match) => match.entry.id)).toContain("compass_symbols");
  });

  it("finds the inventory help entry for inventory questions", () => {
    const matches = findRelevantCometEntries(DEFAULT_COMET_INDEXED_ENTRIES, [
      "How does the inventory work?",
    ]);

    expect(matches.map((match) => match.entry.id)).toContain("inventory_tab");
  });

  it("labels matched help entries as player interface guide context", () => {
    const context = buildCometPromptContext(
      createTestState(),
      DEFAULT_COMET_INDEXED_ENTRIES,
      "How does the inventory work?",
    );

    expect(context.assistantContext).toContain(
      "Player Interface Guide",
    );
    expect(context.assistantContext).toContain("Inventory [Player Interface Guide]");
  });
});
