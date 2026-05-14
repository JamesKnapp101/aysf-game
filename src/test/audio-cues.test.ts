import { resolveAudioCue } from "@game/helpers/audioCues";
import { describe, expect, it } from "vitest";

describe("audio cues", () => {
  it("uses natural language for vertical movement directions", () => {
    const state = {} as any;
    const item = { id: "BarBasementOrganism", meta: { hostility: "hostile" } };

    expect(resolveAudioCue({ state, item, dirFromPlayer: "down" })).toBe(
      "You hear something moving down below.",
    );
    expect(resolveAudioCue({ state, item, dirFromPlayer: "up" })).toBe(
      "You hear something moving up above.",
    );
    expect(resolveAudioCue({ state, item, dirFromPlayer: "north" })).toBe(
      "You hear something moving to the north.",
    );
  });
});
