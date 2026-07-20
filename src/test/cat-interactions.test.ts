import { getCameraFeedDescription } from "@game/components/cameraGunViewerHelpers";
import { buildRoomItemsDescription } from "@game/helpers/descriptionHelpers";
import { getItemsInRoom } from "@game/selectors/roomSelectors";
import { describe, expect, it } from "vitest";
import {
  addInventoryItems,
  createTestState,
  expectInventoryToContain,
  getLastLogEntry,
  runCommand,
} from "./helpers/gameTestHelpers";

describe("cat interactions", () => {
  it("lets the player call the cat within the cat's home rooms", async () => {
    let state = createTestState({ roomId: "LevelThreeCorridorSeven" });

    state = await runCommand(state, "call cat");

    expect(state.itemState.itemRoomId.cat).toBe("LevelThreeCorridorSeven");
    expect(state.itemState.itemRoomId.IggyCollar).toBe(
      "LevelThreeCorridorSeven",
    );
    expect(state.itemState.attachedTo.IggyCollar).toBe("cat");
    expect(getLastLogEntry(state)).toMatch(/cat pads into view/i);
    expect(getItemsInRoom(state, "LevelThreeCorridorSeven").map((item) => item.id))
      .not.toContain("IggyCollar");
  });

  it("uses custom NPC prose when listing the cat in a room", async () => {
    let state = createTestState({ roomId: "LevelThreeCorridorSeven" });

    state = await runCommand(state, "call cat");

    const description = buildRoomItemsDescription(
      state,
      "LevelThreeCorridorSeven",
    );

    expect(description).toContain(
      "A black and white cat watches from a cautious distance",
    );
    expect(description).not.toContain("There is black and white cat here.");
  });

  it("introduces the cat before listing it after the first corridor encounter", async () => {
    const state = await runCommand(
      createTestState({
        roomId: "LevelThreeCorridorSix",
        visitedRooms: ["LevelThreeCorridorSix"],
      }),
      "north",
    );
    const entry = getLastLogEntry(state);

    expect(entry).toContain("As you enter the room");
    expect(entry).not.toContain("There is black and white cat here.");
    expect(state.worldState.catState.suppressRoomListOnce).toBe(false);
    expect(state.itemState.itemRoomId.cat).toBe("LevelThreeCorridorSeven");
  });

  it("lets the player pick up the cat briefly before it jumps down", async () => {
    let state = createTestState({ roomId: "LevelThreeCorridorSeven" });

    state = await runCommand(state, "call cat");
    state = await runCommand(state, "get cat");

    expect(state.itemState.attachedTo.cat).toBe("PLAYER");
    expect(state.worldState.catState.heldTurns).toBe(1);

    state = await runCommand(state, "wait");
    expect(state.worldState.catState.heldTurns).toBe(2);
    expect(getLastLogEntry(state)).toMatch(/begins to fidget/i);

    state = await runCommand(state, "wait");
    state = await runCommand(state, "wait");
    expect(state.worldState.catState.heldTurns).toBe(4);
    expect(getLastLogEntry(state)).toMatch(/squirms more urgently/i);

    state = await runCommand(state, "wait");
    expect(state.itemState.attachedTo.cat).toBeUndefined();
    expect(state.worldState.catState.heldTurns).toBeUndefined();
    expect(state.itemState.itemRoomId.cat).toBe("LevelThreeCorridorSeven");
    expect(getLastLogEntry(state)).toMatch(/jumps lightly down/i);
  });

  it("blocks removing the collar while the cat is wearing it", async () => {
    let state = createTestState({ roomId: "LevelThreeCorridorSeven" });

    state = await runCommand(state, "call cat");
    state = await runCommand(state, "remove collar");

    expect(state.worldState.catState.isWearingCollar).toBe(true);
    expect(state.itemState.attachedTo.IggyCollar).toBe("cat");
    expect(expectInventoryToContain(state, "IggyCollar")).toBe(false);
    expect(state.log.join("\n")).toMatch(/cat squirms away/i);
  });

  it("sticks a carried gel camera to the cat when targeting the collar", async () => {
    let state = createTestState({ roomId: "LevelThreeCorridorSeven" });

    state = await runCommand(state, "call cat");
    state = addInventoryItems(state, ["GelRound2"]);
    state = await runCommand(state, "stick camera to collar");

    expect(state.itemState.attachedTo.GelRound2).toBe("cat");
    expect(state.itemState.activeGelCameras.GelRound2).toBe(true);
    expect(expectInventoryToContain(state, "GelRound2")).toBe(false);
    expect(state.log.join("\n")).toMatch(/cat's collar/i);
  });

  it("builds camera feed descriptions with resolved scenery text", () => {
    const state = createTestState({ roomId: "LevelThreeCorridorSeven" });
    const description = getCameraFeedDescription(
      state,
      "LivingQuartersSixEast",
    );

    expect(description).not.toContain("[[SCENERY]]");
    expect(description).toContain("faintly red-tinged light");
    expect(description).toContain("large television screen");
  });
});
