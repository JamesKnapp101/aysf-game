import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleCommand } from "../game/engine/handleCommand";
import { getCurrentRadioFrequency, setRadioFrequency } from "../game/helpers/radioHelpers";
import { updateItemLocation } from "../game/rules/items";
import * as dnaReader from "../game/rules/dnaReader";
import { resolveItemByNoun } from "../game/rules/scope";
import { useUIEffectsStore } from "../game/store/store";
import type { GameState } from "../game/types/gameTypes";
import { normalizeCommandAliases } from "../parse/commandAliases";
import { parseCommand } from "../parse/parser";
import { createTestState, setInventory } from "./helpers/gameTestHelpers";

const scannerPatterns = [
  (target: string, device = "scanner") => `use ${device} on ${target}`,
  (target: string, device = "scanner") => `point ${device} at ${target}`,
];
const wandPatterns = [
  (target: string, device = "wand") => `use ${device} on ${target}`,
  (target: string, device = "wand") => `sample ${target} with ${device}`,
  (target: string, device = "wand") => `swab ${target} with ${device}`,
];
const playMindFlash = useUIEffectsStore.getState().playMindFlash;

function fixture(): GameState {
  let state = setInventory(createTestState({ roomId: "StairWellSeven", rng: () => 0.99 }), [
    "MindGun", "MindCap", "DNAReader", "Radio", "flashlight",
  ]);
  for (const id of ["cat", "HalvedCorpse", "HeadlessCorpse"]) {
    state = updateItemLocation(state, id, "StairWellSeven");
  }
  return {
    ...state,
    itemState: {
      ...state.itemState,
      attachedTo: { ...state.itemState.attachedTo, cat: "PLAYER" },
      wornByPlayer: { ...state.itemState.wornByPlayer, head: "MindCap" },
    },
  };
}

async function equivalent(state: GameState, alias: string, canonical: string) {
  const expected = await handleCommand(state, parseCommand(canonical), { skipEcho: true });
  const actual = await handleCommand(state, parseCommand(alias), { skipEcho: true });
  // Includes narration, turn costs, inventory, progression, objectives, and effects.
  expect(actual).toEqual(expected);
  return actual;
}

beforeEach(() => {
  vi.spyOn(Date, "now").mockReturnValue(123456789);
  // These parser/device tests must never make network or paid API calls.
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Unexpected network call"));
});
afterEach(() => {
  expect(globalThis.fetch).not.toHaveBeenCalled();
  useUIEffectsStore.setState({ playMindFlash });
  vi.restoreAllMocks();
});

describe("item-owned command normalization", () => {
  it.each([
    ["use scanner on woman", "shoot", "woman", "scanner", "with"],
    ["point scanner at woman", "shoot", "woman", "scanner", "with"],
    ["use wand on woman", "touch", "woman", "wand", "with"],
    ["sample woman with wand", "touch", "woman", "wand", "with"],
    ["swab woman with wand", "touch", "woman", "wand", "with"],
    ["turn on radio", "push", "radio", undefined, undefined],
  ])("normalizes %s into the existing action", (input, verb, direct, indirect, preposition) => {
    const normalized = normalizeCommandAliases(fixture(), parseCommand(input!));
    expect(normalized).toEqual({ type: "action", verb, direct, indirect, preposition, raw: input });
    expect(normalizeCommandAliases(fixture(), normalized)).toEqual(normalized);
  });

  it.each([
    "use scanner", "use scanner on", "point scanner", "point scanner at",
    "sample woman", "swab woman", "sample woman with", "use wand", "turn on",
    "point flashlight at woman", "sample woman with scanner", "swab woman with radio",
    "use radio on woman", "use wand with woman", "point scanner on woman",
    "turn off radio", "switch on radio", "turn on flashlight", "turn on comet",
    "shoot woman with scanner", "touch woman with wand", "push call button", "use radio",
  ])("leaves incomplete, unrelated, and existing syntax unchanged: %s", (input) => {
    const parsed = parseCommand(input);
    expect(normalizeCommandAliases(fixture(), parsed)).toBe(parsed);
  });

  it("uses the existing resolver when scanner and wand share the noun reader", async () => {
    const state = fixture();
    const device = resolveItemByNoun(state, "reader")!;
    const verb = device.id === "MindGun" ? "shoot" : "touch";
    expect(normalizeCommandAliases(state, parseCommand("use reader on woman"))).toMatchObject({
      verb, direct: "woman", indirect: "reader", preposition: "with",
    });
    await equivalent(state, "use reader on woman", `${verb} woman with reader`);
  });

  it("does not mistake a scoped unrelated scanner for the missing memory extractor", async () => {
    const state = setInventory(fixture(), ["DNAReader"]);
    state.world = {
      ...state.world,
      items: [...state.world.items, {
        id: "test_badge_scanner", name: "badge scanner", vocab: ["scanner"],
        location: state.player.roomId, description: "A door badge scanner.",
        itemClass: "solid", itemCategory: "scenery", itemSize: 1, itemWeight: 1,
      }],
    };
    const input = "use scanner on woman";
    const parsed = parseCommand(input);
    expect(normalizeCommandAliases(state, parsed)).toBe(parsed);
    const next = await handleCommand(state, parsed);
    expect(next.log.at(-1)).toContain("There's nothing to use.");
    expect(next.itemState.mindGunMemoryIndex).toEqual(state.itemState.mindGunMemoryIndex);
  });
});

describe("memory extractor aliases", () => {
  const cases = scannerPatterns.flatMap((pattern) => [
    [pattern("woman"), "shoot woman with scanner", "HalvedCorpse"],
    [pattern("fallen corpse", "mind gun"), "shoot fallen corpse with mind gun", "FallenCorpse"],
    [pattern("black and white cat", "electronic scanner"), "shoot black and white cat with electronic scanner", "cat"],
    [pattern("lil-lilly", "extractor"), "shoot lil-lilly with extractor", "HalvedCorpse"],
  ]);
  it.each(cases)("matches canonical state and narration: %s", async (alias, canonical, targetId) => {
    const state = fixture();
    expect(resolveItemByNoun(state, canonical!.split(" with ")[0].slice(6))?.id).toBe(targetId);
    const next = await equivalent(state, alias!, canonical!);
    if (targetId === "cat") {
      expect(next.itemState.mindGunMemoryIndex.cat).toBe((state.itemState.mindGunMemoryIndex.cat ?? -1) + 1);
      expect(next.moves).toBe(state.moves + 1);
    } else {
      expect(next.worldState.activeExperience?.sourceId).toBe(targetId);
    }
  });

  it.each(scannerPatterns.map((pattern) => pattern("black and white cat")))("executes the memory effect exactly once: %s", async (input) => {
    const state = fixture();
    const flash = vi.fn(playMindFlash);
    useUIEffectsStore.setState({ playMindFlash: flash });
    const next = await handleCommand(state, parseCommand(input));
    expect(flash).toHaveBeenCalledTimes(1);
    expect(next.itemState.mindGunMemoryIndex.cat).toBe((state.itemState.mindGunMemoryIndex.cat ?? -1) + 1);
    expect(next.moves).toBe(state.moves + 1);
    expect(next.log.join("\n")).toContain(`> ${input}`);
  });

  it.each(scannerPatterns.flatMap((pattern) => [
    [pattern("cat"), "shoot cat with scanner", "missing"],
    [pattern("cat"), "shoot cat with scanner", "not-worn"],
    [pattern("headless corpse"), "shoot headless corpse with scanner", "headless"],
    [pattern("flashlight"), "shoot flashlight with scanner", "nonliving"],
    [pattern("absent visitor"), "shoot absent visitor with scanner", "absent"],
    [pattern("cat"), "shoot cat with scanner", "hidden"],
  ]))("preserves canonical failure/prerequisites: %s (%s, %s)", async (alias, canonical, setup) => {
    let state = fixture();
    if (setup === "missing") state = setInventory(state, ["MindCap"]);
    if (setup === "not-worn") state.itemState.wornByPlayer.head = undefined;
    if (setup === "hidden") state = updateItemLocation(state, "cat", "SecretLab");
    const next = await equivalent(state, alias!, canonical!);
    expect(next.worldState.activeExperience).toEqual(state.worldState.activeExperience);
    expect(next.itemState.mindGunMemoryIndex).toEqual(state.itemState.mindGunMemoryIndex);
  });

  it("preserves existing first-match target ambiguity and exact multiword names", async () => {
    const state = fixture();
    const first = resolveItemByNoun(state, "corpse")!;
    const next = await equivalent(state, "point scanner at corpse", "shoot corpse with scanner");
    expect(next.worldState.activeExperience?.sourceId).toBe(first.id);
    const specific = await equivalent(state, "point scanner at halved corpse", "shoot halved corpse with scanner");
    expect(specific.worldState.activeExperience?.sourceId).toBe("HalvedCorpse");
  });

  it("preserves canonical operation with a scoped scanner on the floor", async () => {
    let state = setInventory(fixture(), ["MindCap"]);
    state = updateItemLocation(state, "MindGun", state.player.roomId);
    await equivalent(state, "use scanner on woman", "shoot woman with scanner");
  });
});

describe("DNA wand aliases", () => {
  it.each(wandPatterns.map((pattern) => pattern("woman")))("takes exactly one sample: %s", async (input) => {
    const sample = vi.spyOn(dnaReader, "takeDNASample");
    const state = fixture();
    const next = await handleCommand(state, parseCommand(input));
    expect(sample).toHaveBeenCalledTimes(1);
    expect(next.player.dnaBank).toHaveLength(1);
    expect(next.moves).toBe(state.moves + 1);
  });

  it.each(wandPatterns.flatMap((pattern) => [
    [pattern("woman"), "touch woman with wand"],
    [pattern("fallen corpse", "dna sampler"), "touch fallen corpse with dna sampler"],
    [pattern("black and white cat", "slim electronic wand"), "touch black and white cat with slim electronic wand"],
    [pattern("lil-lilly", "analyzer"), "touch lil-lilly with analyzer"],
  ]))("matches canonical state and narration: %s", async (alias, canonical) => {
    const state = fixture();
    const next = await equivalent(state, alias!, canonical!);
    expect(next.player.dnaBank).toHaveLength(1);
    expect(next.moves).toBe(state.moves + 1);
    const again = await equivalent(next, alias!, canonical!);
    expect(again.player.dnaBank).toHaveLength(1);
    expect(again.log.join("\n")).toContain("Sample already banked.");
    expect(again.moves).toBe(next.moves + 1);
  });

  it.each(wandPatterns.flatMap((pattern) => [
    [pattern("woman"), "touch woman with wand", "missing"],
    [pattern("woman"), "touch woman with wand", "floor"],
    [pattern("woman"), "touch woman with wand", "hidden"],
    [pattern("absent visitor"), "touch absent visitor with wand", "absent"],
  ]))("preserves missing equipment and target scope: %s (%s, %s)", async (alias, canonical, setup) => {
    let state = fixture();
    if (setup === "missing" || setup === "floor") state = setInventory(state, []);
    if (setup === "floor") state = updateItemLocation(state, "DNAReader", state.player.roomId);
    if (setup === "hidden") state = updateItemLocation(state, "HalvedCorpse", "SecretLab");
    const next = await equivalent(state, alias!, canonical!);
    expect(next.player.dnaBank).toHaveLength(0);
  });

  it("preserves the canonical unknown result for an unrecognized target", async () => {
    const next = await equivalent(fixture(), "swab flashlight with wand", "touch flashlight with wand");
    expect(next.player.dnaBank[0]?.id).toBe("unknown:flashlight");
  });

  it("preserves ambiguous target selection", async () => {
    const state = fixture();
    const target = resolveItemByNoun(state, "corpse")!;
    const named = await equivalent(state, `sample ${target.name} with wand`, `touch ${target.name} with wand`);
    const ambiguous = await equivalent(state, "sample corpse with wand", "touch corpse with wand");
    expect(ambiguous.player.dnaBank).toEqual(named.player.dnaBank);
  });
});

describe("radio turn-on alias", () => {
  it("dispatches the existing push override exactly once", async () => {
    const state = fixture();
    const radio = state.world.items.find((item) => item.id === "Radio")!;
    const push = vi.fn(radio.overrides!.push);
    state.world = {
      ...state.world,
      items: state.world.items.map((item) => item.id === radio.id
        ? { ...item, overrides: { ...item.overrides, push } }
        : item),
    };
    const next = await handleCommand(state, parseCommand("turn on radio"));
    expect(push).toHaveBeenCalledTimes(1);
    expect(next.moves).toBe(state.moves + 1);
  });

  it.each(["radio", "walkie-talkie", "walkie", "cb", "two-way radio"])("reuses the call-button action for %s", async (noun) => {
    const state = fixture();
    const next = await equivalent(state, `turn on ${noun}`, "push call button");
    expect(next.worldState.conditionalTriggers.radioFirstCall).toBe(true);
    expect(next.radio?.activeNpcId).toBe("you_1st_contact");
    expect(next.moves).toBe(state.moves + 1);
    expect(next.log.join("\n").match(/emits a beep/g)).toHaveLength(1);
    const again = await equivalent(next, `turn on ${noun}`, "push call button");
    expect(again.moves).toBe(next.moves + 1);
  });

  it.each(["turn on radio", "turn on walkie-talkie"])("fails like the canonical action when the radio is absent: %s", async (input) => {
    const state = setInventory(fixture(), []);
    const next = await equivalent(state, input, "push call button");
    expect(next.worldState.conditionalTriggers.radioFirstCall).toBeFalsy();
    expect(next.radio).toEqual(state.radio);
    expect(next.log.at(-1)).toContain("There's nothing to push.");
  });

  it.each([146.52, 150, 168.88])("preserves frequency %s and registered call effects", async (frequency) => {
    const state = setRadioFrequency(setInventory(createTestState({ roomId: "Greenhouse" }), ["Radio"]), frequency);
    const next = await equivalent(state, "turn on radio", "push call button");
    expect(getCurrentRadioFrequency(next)).toBe(frequency);
    expect(next.log.join("\n")).toContain(`${frequency.toFixed(3)} MHz`);
    expect(next.worldState.conditionalTriggers.greenhouseBeesDeactivated).toBe(frequency === 168.88 ? true : undefined);
    expect(next.itemState.itemSettings).toEqual(state.itemState.itemSettings);
  });

  it("preserves canonical operation with the scoped radio on the floor", async () => {
    const state = setInventory(createTestState({ roomId: "StairSix" }), []);
    await equivalent(state, "turn on radio", "push call button");
  });

  it("does not change the secondary radio's existing power switch", async () => {
    const state = createTestState({ roomId: "Warehouse" });
    const parsed = parseCommand("turn on radio");
    expect(resolveItemByNoun(state, "radio")?.id).toBe("RadioTwo");
    expect(normalizeCommandAliases(state, parsed)).toBe(parsed);
    const next = await handleCommand(state, parsed);
    expect(next.worldState.conditionalTriggers.radioFirstCall).toBeFalsy();
    expect(next.log.join("\n")).not.toContain("emits a beep");
  });
});

describe("unrelated and malformed commands", () => {
  it.each([
    "point flashlight at woman", "sample woman", "sample woman with scanner",
    "swab woman with radio", "use scanner", "use scanner on", "point scanner at",
  ])("does not execute unintended device actions: %s", async (input) => {
    const state = fixture();
    const flash = vi.fn(playMindFlash);
    useUIEffectsStore.setState({ playMindFlash: flash });
    const next = await handleCommand(state, parseCommand(input));
    expect(next.itemState.mindGunMemoryIndex).toEqual(state.itemState.mindGunMemoryIndex);
    expect(next.player.dnaBank).toEqual(state.player.dnaBank);
    expect(next.worldState.conditionalTriggers.radioFirstCall).toBeFalsy();
    expect(flash).not.toHaveBeenCalled();
    expect(next.log.at(-1)).toMatch(/don't understand|nothing to use|on what/i);
  });

  it("keeps the flashlight turn-on action and its one-turn drain", async () => {
    const state = fixture();
    const next = await handleCommand(state, parseCommand("turn on flashlight"));
    expect(next.itemState.itemSettings.flashlight).toMatchObject({ isOn: true, currentCharge: 99.95 });
    expect(next.moves).toBe(state.moves + 1);
    expect(next.log.at(-1)).toContain("You turn the LED flashlight on.");
    expect(next.worldState.conditionalTriggers.radioFirstCall).toBeFalsy();
  });
});

describe("shared encounter guards", () => {
  it.each([
    ...scannerPatterns.map((pattern) => [pattern("woman"), "shoot woman with scanner"]),
    ...wandPatterns.map((pattern) => [pattern("woman"), "touch woman with wand"]),
  ])("keeps targets inside closed containers out of scope: %s", async (alias, canonical) => {
    let state = fixture();
    state.world = {
      ...state.world,
      items: [...state.world.items, {
        id: "test_closed_box", name: "closed box", vocab: ["box"],
        location: state.player.roomId, description: "A closed opaque container.",
        itemClass: "solid", itemCategory: "scenery", itemSize: 1, itemWeight: 1,
        isContainer: true, isOpenable: true,
      }],
    };
    state = updateItemLocation(state, "HalvedCorpse", "test_closed_box");
    expect(resolveItemByNoun(state, "woman")).toBeUndefined();
    const next = await equivalent(state, alias!, canonical!);
    expect(next.player.dnaBank).toHaveLength(0);
    expect(next.worldState.activeExperience).toEqual(state.worldState.activeExperience);
  });

  it.each([
    ...scannerPatterns.map((pattern) => [pattern("spider"), "shoot spider with scanner"]),
    ...wandPatterns.map((pattern) => [pattern("spider"), "touch spider with wand"]),
  ])("preserves reachability restrictions: %s", async (alias, canonical) => {
    const state = setInventory(createTestState({ roomId: "HydroponicsPlatform" }), ["MindGun", "DNAReader"]);
    const next = await equivalent(state, alias!, canonical!);
    expect(next.log.join("\n")).toContain("You can't reach it from where you are.");
    expect(next.player.dnaBank).toHaveLength(0);
  });

  it.each([
    ...scannerPatterns.map((pattern) => [pattern("fallen corpse"), "shoot fallen corpse with scanner"]),
    ...wandPatterns.map((pattern) => [pattern("fallen corpse"), "touch fallen corpse with wand"]),
    ["turn on radio", "push call button"],
  ])("preserves suit interaction restrictions: %s", async (alias, canonical) => {
    const suited = await handleCommand(createTestState({ roomId: "Stasis" }), parseCommand("wear suit"));
    const state = setInventory(suited, ["MindGun", "DNAReader", "Radio"]);
    const next = await equivalent(state, alias!, canonical!);
    expect(next.log.join("\n")).toContain("all you can do is move");
    expect(next.player.dnaBank).toHaveLength(0);
    expect(next.worldState.conditionalTriggers.radioFirstCall).toBeFalsy();
  });
});
