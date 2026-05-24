import { buildRoomDescription } from "@game/text/roomDescription";
import {
  MOVIE_THEATER_AUDITORIUM_ROOM_IDS,
  MOVIE_THEATER_CHEWABLE_ID,
  MOVIE_THEATER_MOVIE_SEGMENTS,
  MOVIE_THEATER_ROOM_IDS,
  MOVIE_THEATER_TOTAL_MOVIE_TURNS,
  getMovieTheaterMovieLine,
} from "src/world/maps/levelThree/Park/MovieTheater";
import { describe, expect, it } from "vitest";
import { getItemsInRoom } from "../game/selectors/roomSelectors";
import {
  createTestState,
  expectInventoryToContain,
  getLastLogEntry,
  runCommand,
  runCommands,
  setInventory,
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

  it("blocks entering the auditorium while the usher bot is at its post", async () => {
    const blocked = await runCommands(createTestState({ roomId: "MovieEntrance" }), [
      "northwest",
      "north",
    ]);

    expect(blocked.player.roomId).toBe("MovieTheaterLobby");
    expect(getCommandEntry(blocked, "north")).toContain(
      "sorry, but the movie is already in progress, please wait for the next showing",
    );
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

    const reachedQuadrantD = await runCommand(
      createTestState({ roomId: "MovieTheaterA" }),
      "east",
    );
    expect(reachedQuadrantD.player.roomId).toBe("MovieTheaterD");

    const reachedQuadrantC = await runCommand(reachedQuadrantD, "north");
    expect(reachedQuadrantC.player.roomId).toBe("MovieTheaterC");
  });

  it("tracks bathroom vapor from the e-cigar or TrixPen and ejects the player at three clouds", async () => {
    const trixUsed = await runCommand(
      setInventory(createTestState({ roomId: "MovieTheaterBathroom" }), [
        "TrixPen",
      ]),
      "use trixpen",
    );

    expect(trixUsed.worldState.movieTheater.bathroomSmokiness).toBe(1);
    expect(trixUsed.player.statusEffects.map((effect) => effect.id)).toContain(
      "trixophine",
    );

    const smokedTwice = await runCommands(
      setInventory(createTestState({ roomId: "MovieTheaterBathroom" }), [
        "ECigar",
      ]),
      ["use e-cigar", "use e-cigar"],
    );

    expect(smokedTwice.worldState.movieTheater.bathroomSmokiness).toBe(2);
    expect(
      smokedTwice.player.statusEffects.map((effect) => effect.id),
    ).not.toContain("trixophine");

    const ejected = await runCommand(smokedTwice, "use e-cigar");

    expect(ejected.player.roomId).toBe("MovieEntrance");
    expect(ejected.worldState.movieTheater.bathroomSmokiness).toBe(0);
    expect(getCommandEntry(ejected, "use e-cigar")).toContain(
      "Did you see the sign? Did you read the sign? CAN you read the sign?",
    );
  });

  it("keeps the usher bot at the auditorium doors when the smoke report is too weak", async () => {
    const reported = await runCommands(
      setInventory(createTestState({ roomId: "MovieTheaterBathroom" }), [
        "ECigar",
      ]),
      ["use e-cigar", "east", "tell usher about somebody smoking in bathroom"],
    );

    expect(reported.player.roomId).toBe("MovieTheaterLobby");
    expect(
      getCommandEntry(reported, "tell usher about somebody smoking in bathroom"),
    ).toContain(
      "I'm not picking anything up, are you sure you aren't having a stroke?",
    );

    const blocked = await runCommand(reported, "north");
    expect(blocked.player.roomId).toBe("MovieTheaterLobby");
  });

  it("sends the usher bot to investigate a smoky bathroom long enough to enter the theater", async () => {
    const reported = await runCommands(
      setInventory(createTestState({ roomId: "MovieTheaterBathroom" }), [
        "ECigar",
      ]),
      [
        "use e-cigar",
        "use e-cigar",
        "east",
        "tell usher about somebody smoking in bathroom",
      ],
    );

    expect(reported.worldState.movieTheater.bathroomSmokiness).toBe(0);
    expect(reported.worldState.movieTheater.usherBotBathroomTurnsRemaining).toBe(
      2,
    );
    expect(reported.itemState.itemRoomId.UsherBot).toBe(
      "MovieTheaterBathroom",
    );
    expect(
      getCommandEntry(reported, "tell usher about somebody smoking in bathroom"),
    ).toContain("Confirmed. Bathroom vapor detected.");

    const entered = await runCommand(reported, "north");
    expect(entered.player.roomId).toBe("MovieTheaterA");

    const expired = await runCommands(reported, ["wait", "wait", "north"]);
    expect(expired.player.roomId).toBe("MovieTheaterLobby");
    expect(getCommandEntry(expired, "north")).toContain(
      "movie is already in progress",
    );
  });

  it("lets the player recover vape items the usher bot throws in the lobby trash bin", async () => {
    const reported = await runCommands(
      setInventory(createTestState({ roomId: "MovieTheaterBathroom" }), [
        "ECigar",
        "TrixPen",
      ]),
      [
        "use e-cigar",
        "use e-cigar",
        "drop e-cigar",
        "drop vape pen",
        "east",
        "tell usher about somebody smoking in bathroom",
      ],
    );

    expect(reported.itemState.itemRoomId.ECigar).toBe(
      "MovieLobbyPedalTrashBin",
    );
    expect(reported.itemState.itemRoomId.TrixPen).toBe(
      "MovieLobbyPedalTrashBin",
    );
    expect(
      reported.itemState.containerContents.MovieLobbyPedalTrashBin,
    ).toEqual(expect.arrayContaining(["ECigar", "TrixPen"]));

    const opened = await runCommand(reported, "open trash bin");
    expect(getCommandEntry(opened, "open trash bin")).toContain("e-cigar");
    expect(getCommandEntry(opened, "open trash bin")).toContain("vape pen");

    const recovered = await runCommands(opened, [
      "take e-cigar",
      "take vape pen",
    ]);
    expect(expectInventoryToContain(recovered, "ECigar")).toBe(true);
    expect(expectInventoryToContain(recovered, "TrixPen")).toBe(true);
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
      "The movie narrator continues...",
    );
    expect(getCommandEntry(waited, "wait")).toContain(
      "[[MOVIE_STAGE]]",
    );

    const lobbyWait = await runCommand(
      createTestState({ roomId: "MovieTheaterLobby" }),
      "wait",
    );
    expect(getLastLogEntry(lobbyWait)).not.toContain(
      "The movie narrator continues...",
    );
  });

  it("formats projected movie stage text as an indented italic block", () => {
    expect(getMovieTheaterMovieLine(0)).toMatch(
      /^The movie narrator continues\.\.\.\n\[\[MOVIE_STAGE\]\].+\[\[\/MOVIE_STAGE\]\]$/s,
    );
  });

  it("inserts fade-to-black transition beats between movie segments and before looping", () => {
    const introTransitionTurn = MOVIE_THEATER_MOVIE_SEGMENTS[0].stages.length;

    expect(getMovieTheaterMovieLine(introTransitionTurn)).toContain(
      "fades to black",
    );
    expect(getMovieTheaterMovieLine(MOVIE_THEATER_TOTAL_MOVIE_TURNS - 1))
      .toContain("fades to black");
    expect(getMovieTheaterMovieLine(MOVIE_THEATER_TOTAL_MOVIE_TURNS)).toMatch(
      /^The movie narrator continues\.\.\.\n\[\[MOVIE_STAGE\]\]/,
    );
  });

  it("darkens the whole movie theater for one transition turn", async () => {
    const start = createTestState({ roomId: "MovieTheaterA" });
    const transition = await runCommands(start, ["wait", "wait", "wait", "wait"]);

    expect(getCommandEntry(transition, "wait")).toContain("fades to black");
    for (const roomId of MOVIE_THEATER_ROOM_IDS) {
      expect(transition.worldState.darkRooms[roomId]).toBe(true);
    }

    const relit = await runCommand(transition, "wait");

    for (const roomId of MOVIE_THEATER_ROOM_IDS) {
      expect(relit.worldState.darkRooms[roomId]).toBe(false);
    }
  });
});
