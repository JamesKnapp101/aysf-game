import { describe, expect, it } from "vitest";
import { DEFAULT_COMET_ENTRIES } from "../game/components/comet-entries";
import { findRelevantCometEntries } from "../game/components/cometHelpers";

function findEntryIds(query: string): string[] {
  return findRelevantCometEntries(DEFAULT_COMET_ENTRIES, [query]).map(
    (match) => match.entry.id,
  );
}

describe("Comet library entries", () => {
  it("uses unique ids and non-placeholder bodies", () => {
    const ids = new Set<string>();

    for (const entry of DEFAULT_COMET_ENTRIES) {
      expect(ids.has(entry.id), `duplicate Comet entry id: ${entry.id}`).toBe(
        false,
      );
      ids.add(entry.id);

      expect(entry.body.trim(), `empty body for ${entry.id}`).not.toBe("");
      expect(entry.body.trim(), `placeholder body for ${entry.id}`).not.toBe(
        ".",
      );
    }
  });

  it("does not contain common mojibake markers", () => {
    const serialized = JSON.stringify(DEFAULT_COMET_ENTRIES);
    const suspiciousCharCodes = [0xc3, 0xe2, 0xfffd];

    for (const charCode of suspiciousCharCodes) {
      expect(serialized).not.toContain(String.fromCharCode(charCode));
    }
  });

  it("covers high-value game lore queries", () => {
    expect(findEntryIds("tell me about the movie theater")).toContain(
      "park_movie_theater",
    );
    expect(findEntryIds("what is Ultra Fitness?")).toContain("park_gymnasium");
    expect(findEntryIds("who is Mox Eegler?")).toContain("mox_eegler");
    expect(findEntryIds("how do security badges work?")).toContain(
      "security_badges",
    );
    expect(findEntryIds("what is Bufo Clutch A?")).toContain("bufo_clutch_a");
    expect(findEntryIds("tell me about the Central Library")).toContain(
      "central_library",
    );
  });

  it("keeps the movie theater entry on-topic", () => {
    const movieTheater = DEFAULT_COMET_ENTRIES.find(
      (entry) => entry.id === "park_movie_theater",
    );

    expect(movieTheater?.body).toMatch(/Cineplexperience|movie theater/i);
    expect(movieTheater?.body).not.toMatch(/juniper|distilled spirit/i);
  });
});
