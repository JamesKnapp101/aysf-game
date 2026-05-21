import { buildRoomDescription } from "@game/text/roomDescription";
import {
  MOVIE_THEATER_AUDITORIUM_ROOM_IDS,
  MOVIE_THEATER_CHEWABLE_ID,
} from "src/world/maps/levelThree/Park/MovieTheater";
import { describe, expect, it } from "vitest";
import { getItemsInRoom } from "../game/selectors/roomSelectors";
import {
  createTestState,
  expectInventoryToContain,
  getLastLogEntry,
  runCommand,
  runCommands,
} from "./helpers/gameTestHelpers";

function getCommandEntry(state: { log: string[] }, command: string): string {
  for (let index = state.log.length - 1; index >= 0; index -= 1) {
    const entry = state.log[index];
    if (entry.includes(`> ${command}`)) return entry;
  }

  return "";
}

describe("movie theater zone", () => {
  it("builds entrance, lobby, and auditorium descriptions from ordered scenery", () => {
    const state = createTestState({ roomId: "MovieEntrance" });
    const entrance = buildRoomDescription(state, "MovieEntrance", {
      mode: "panel",
    });
    const lobby = buildRoomDescription(state, "MovieTheaterLobby", {
      mode: "panel",
    });
    const auditorium = buildRoomDescription(state, "MovieTheaterB", {
      mode: "panel",
    });

    expect(entrance.indexOf("A pair of glass doors")).toBeLessThan(
      entrance.indexOf("hanging over which is a lit marquee"),
    );
    expect(lobby.indexOf("vacuum tracks")).toBeLessThan(
      lobby.indexOf("ticket counter"),
    );
    expect(auditorium.indexOf("Rows of reclining")).toBeLessThan(
      auditorium.indexOf("Sitting in one of the seats"),
    );
    expect(auditorium).toContain(
      "Clutched in the dead man's hand is some sort of little timer or stopwatch.",
    );

    const theaterRoomIds = new Set([
      "MovieEntrance",
      "MovieTheaterLobby",
      "MovieTheaterBathroom",
      "Projection",
      ...MOVIE_THEATER_AUDITORIUM_ROOM_IDS,
    ]);
    const unorderedScenery = state.world.items
      .filter(
        (item) =>
          theaterRoomIds.has(item.location) && item.itemCategory === "scenery",
      )
      .filter(
        (item) => typeof item.meta?.sceneryDescriptionOrder !== "number",
      )
      .map((item) => item.id);

    expect(unorderedScenery).toEqual([]);
  });

  it("places the usher bot in the lobby", () => {
    const state = createTestState({ roomId: "MovieTheaterLobby" });

    expect(getItemsInRoom(state, "MovieTheaterLobby").map((item) => item.id))
      .toContain("UsherBot");
    expect(getItemsInRoom(state, "MovieEntrance").map((item) => item.id)).not
      .toContain("UsherBot");
  });

  it("connects the theater lobby, bathroom, projection room, and auditorium quadrants", async () => {
    const start = createTestState({ roomId: "MovieEntrance" });

    const reachedProjection = await runCommands(start, [
      "northwest",
      "east",
    ]);
    expect(reachedProjection.player.roomId).toBe("Projection");

    const reachedBathroom = await runCommands(start, [
      "northwest",
      "west",
    ]);
    expect(reachedBathroom.player.roomId).toBe("MovieTheaterBathroom");

    const reachedQuadrantD = await runCommands(start, [
      "northwest",
      "north",
      "east",
    ]);
    expect(reachedQuadrantD.player.roomId).toBe("MovieTheaterD");

    const reachedQuadrantC = await runCommand(reachedQuadrantD, "north");
    expect(reachedQuadrantC.player.roomId).toBe("MovieTheaterC");
  });

  it("dispenses one salty grape chewable and applies supercontinent when eaten", async () => {
    const start = createTestState({ roomId: "MovieTheaterBathroom" });
    const dispensed = await runCommand(start, "turn crank");

    expect(expectInventoryToContain(dispensed, MOVIE_THEATER_CHEWABLE_ID)).toBe(
      true,
    );

    const duplicate = await runCommand(dispensed, "turn dispenser crank");
    expect(getCommandEntry(duplicate, "turn dispenser crank")).toContain(
      "You already have one.",
    );

    const eaten = await runCommand(dispensed, "eat chewable");
    const supercontinent = eaten.player.statusEffects.find(
      (effect) => effect.id === "supercontinent",
    );

    expect(expectInventoryToContain(eaten, MOVIE_THEATER_CHEWABLE_ID)).toBe(
      false,
    );
    expect(supercontinent).toMatchObject({
      intensity: 100,
      remainingTurns: 99,
    });
    expect(getCommandEntry(eaten, "eat chewable")).toContain("salty grape");
  });

  it("plays movie dialogue on auditorium turns without taking over exploration", async () => {
    const start = createTestState({ roomId: "MovieTheaterA" });
    const waited = await runCommand(start, "wait");

    expect(waited.player.roomId).toBe("MovieTheaterA");
    expect(getCommandEntry(waited, "wait")).toContain(
      "From the movie overhead:",
    );

    const lobbyWait = await runCommand(
      createTestState({ roomId: "MovieTheaterLobby" }),
      "wait",
    );
    expect(getLastLogEntry(lobbyWait)).not.toContain(
      "From the movie overhead:",
    );
  });
});
