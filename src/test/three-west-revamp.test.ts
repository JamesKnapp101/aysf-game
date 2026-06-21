import { buildRoomDescription } from "@game/text/roomDescription";
import { describe, expect, it } from "vitest";
import {
  THREE_WEST_BATHROOM_CLOSE_WARNING,
  THREE_WEST_BATHROOM_DEATH_MESSAGE,
  THREE_WEST_BEDROOM_DEATH_MESSAGE,
  THREE_WEST_BEDROOM_DOOR_ID,
  THREE_WEST_FIRST_ENTRY_MESSAGE,
  THREE_WEST_FRONT_DOOR_DEATH_MESSAGE,
} from "../world/maps/levelThree/LivingQuarters/threeWestRevamp";
import {
  createTestState,
  runCommand,
} from "./helpers/gameTestHelpers";

describe("Sanyi residence darkness tutorial", () => {
  it("starts with dim living and bedroom light while the bathroom stays dark", () => {
    const state = createTestState({ roomId: "LivingQuartersThreeWest" });
    const livingRoom = state.world.rooms.find(
      (room) => room.id === "LivingQuartersThreeWest",
    );
    const bedroom = state.world.rooms.find(
      (room) => room.id === "ThreeWestBed",
    );

    expect(state.worldState.darkRooms.LivingQuartersThreeWest).toBe(false);
    expect(state.worldState.darkRooms.ThreeWestBed).toBe(false);
    expect(state.worldState.darkRooms.ThreeWestBath).toBe(true);
    expect(livingRoom?.ambientLightLevel).toBe("dim");
    expect(bedroom?.ambientLightLevel).toBe("very-dim");
    expect(state.worldState.doors.DOOR3CW?.isOpen).toBe(true);
    expect(state.worldState.doors.ThreeWestBDoor?.isOpen).toBe(true);
    expect(state.worldState.doors[THREE_WEST_BEDROOM_DOOR_ID]?.isOpen).toBe(
      true,
    );

    const description = buildRoomDescription(
      state,
      "LivingQuartersThreeWest",
      { mode: "panel", forceFull: true },
    );
    expect(description).toContain("strange, glassy black sculpture");
  });

  it("calls attention to the dark bathroom only on the first entry", async () => {
    let state = createTestState({
      roomId: "LevelThreeCorridorThree",
      visitedRooms: ["LevelThreeCorridorThree"],
    });

    state = await runCommand(state, "west");
    expect(state.log.join("\n")).toContain(THREE_WEST_FIRST_ENTRY_MESSAGE);

    state = await runCommand(state, "east");
    state = await runCommand(state, "west");

    expect(
      state.log.join("\n").split(THREE_WEST_FIRST_ENTRY_MESSAGE).length - 1,
    ).toBe(1);
  });

  it("describes the unseen organism beyond the open bathroom door", async () => {
    const state = createTestState({ roomId: "LivingQuartersThreeWest" });

    const examined = await runCommand(state, "examine bathroom door");

    expect(examined.log.join("\n")).toContain(
      "too dark inside to see anything",
    );
    expect(examined.log.join("\n")).toContain(
      "unwilling to cross into the light",
    );
  });

  it("warns once before the bathroom organism kills on a second close attempt", async () => {
    const state = createTestState({
      roomId: "LivingQuartersThreeWest",
      visitedRooms: ["LivingQuartersThreeWest", "LevelThreeCorridorThree"],
    });

    const warned = await runCommand(state, "close bathroom door");
    expect(warned.log.join("\n")).toContain(
      THREE_WEST_BATHROOM_CLOSE_WARNING,
    );
    expect(warned.worldState.doors.ThreeWestBDoor?.isOpen).toBe(true);

    const killed = await runCommand(warned, "close bathroom door");
    const transcript = killed.log.join("\n");
    const commandIndex = transcript.lastIndexOf("> close bathroom door");
    const deathIndex = transcript.indexOf(
      THREE_WEST_BATHROOM_DEATH_MESSAGE,
      commandIndex,
    );
    const respawnIndex = transcript.indexOf(
      "Level Three Corridor Three",
      deathIndex,
    );

    expect(commandIndex).toBeGreaterThan(-1);
    expect(deathIndex).toBeGreaterThan(commandIndex);
    expect(respawnIndex).toBeGreaterThan(deathIndex);
    expect(
      transcript.split(THREE_WEST_BATHROOM_DEATH_MESSAGE).length - 1,
    ).toBe(1);
    expect(
      killed.worldState.playerDeaths.LivingQuartersThreeWest?.cause,
    ).toBe("organism");
  });

  it("darkens the bedroom on close and freezes its movement when reopened", async () => {
    const state = createTestState({ roomId: "LivingQuartersThreeWest" });

    const closed = await runCommand(state, "close bedroom door");
    expect(closed.worldState.darkRooms.LivingQuartersThreeWest).toBe(false);
    expect(closed.worldState.darkRooms.ThreeWestBed).toBe(true);
    expect(closed.log.join("\n")).toContain(
      "something large shifts on the other side",
    );

    const reopened = await runCommand(closed, "open bedroom door");
    expect(reopened.worldState.darkRooms.ThreeWestBed).toBe(false);
    expect(reopened.log.join("\n")).toContain(
      "becomes abruptly, unnaturally still",
    );
  });

  it("kills the player who shuts themselves inside the bedroom", async () => {
    const state = createTestState({
      roomId: "ThreeWestBed",
      visitedRooms: [
        "ThreeWestBed",
        "LivingQuartersThreeWest",
        "LevelThreeCorridorThree",
      ],
    });

    const killed = await runCommand(state, "close bedroom door");

    expect(killed.log.join("\n")).toContain(THREE_WEST_BEDROOM_DEATH_MESSAGE);
    expect(killed.worldState.playerDeaths.ThreeWestBed?.cause).toBe("organism");
  });

  it("kills the player who cuts off the hallway light from inside", async () => {
    const state = createTestState({
      roomId: "LivingQuartersThreeWest",
      visitedRooms: ["LivingQuartersThreeWest", "LevelThreeCorridorThree"],
    });

    const killed = await runCommand(state, "close front door");

    expect(killed.log.join("\n")).toContain(
      THREE_WEST_FRONT_DOOR_DEATH_MESSAGE,
    );
    expect(
      killed.worldState.playerDeaths.LivingQuartersThreeWest?.cause,
    ).toBe("organism");
  });

  it("lets the hallway-side front door safely control the apartment light", async () => {
    const state = createTestState({ roomId: "LevelThreeCorridorThree" });

    const closed = await runCommand(state, "close west door");
    expect(closed.player.roomId).toBe("LevelThreeCorridorThree");
    expect(closed.worldState.darkRooms.LivingQuartersThreeWest).toBe(true);
    expect(closed.worldState.darkRooms.ThreeWestBed).toBe(true);

    const reopened = await runCommand(closed, "open west door");
    expect(reopened.worldState.darkRooms.LivingQuartersThreeWest).toBe(false);
    expect(reopened.worldState.darkRooms.ThreeWestBed).toBe(false);
  });
});
