import type { DoorDefinition } from "../../game/types/doorTypes";

export const levelSixDoors: DoorDefinition[] = [
  {
    id: "InnerDoor",
    name: "inner steel door",
    descriptionFromA:
      "The door to the south is made polished steel and has a large, cumbersome metal handle.",
    descriptionFromB: "To the north is a a heavy steel door.",
    kind: "airlock",
    vocab: ["door", "inner door", "inner steel door", "steel door"],
    connects: {
      roomAId: "LevelSixCorridorBend",
      roomBId: "LevelSixCorridor",
    },
    directions: { fromA: "south", fromB: "north" },
    initiallyOpen: false,
    initiallyLocked: false,
    blockMsg: `You grab the door's handle and pull, but it won't budge.`,
  },
  {
    id: "OuterDoor",
    name: "Outer steel door",
    descriptionFromA:
      "To the south is a a heavy steel door with a large, cumbersome metal handle which seems to seal it shut when closed.",
    descriptionFromB: "To the north is a a heavy steel door.",
    kind: "airlock",
    vocab: ["door", "outer door", "outer steel door", "steel door"],
    connects: {
      roomAId: "LevelSixCorridor",
      roomBId: "StorageQuadOne",
    },
    directions: { fromA: "south", fromB: "north" },
    initiallyOpen: true,
    initiallyLocked: false,
  },
  {
    id: "HydroponicsDoor",
    name: "damaged door",
    describe: (state) => {
      if (state.worldState.conditionalTriggers.HydroponicsDoorUnblocked) {
        return `The damaged security door has been melted open down the middle. The remaining metal has sagged and curled away from a blackened opening large enough to step through. Beyond it you can see the hydroponics platform and its glassy green disk.`;
      }

      let desc = `The door is wedged tight in the frame, but the hole burned through it isn't nearly big enough to crawl through, through you could fit your head through. There's a badge reader next to it, but even if it wasn't damaged you don't think the door is functional. Through the hole you can see a glassy green disk, or platform on the floor, large enough to stand on`;
      const greenTpadState =
        state.worldState.powerRestoredSections["teleport-pads-green"];
      if (greenTpadState) {
        desc += ` and glowing a sallow green color.`;
      }
      if (greenTpadState === false) {
        desc += `.`;
      }
      return desc;
    },
    describeFromA: (state) => {
      if (state.worldState.conditionalTriggers.HydroponicsDoorUnblocked) {
        return `To the south, the damaged Hydroponics door has been melted open down the middle. Blackened metal curls away from a ragged opening, and beyond it you can see the hydroponics platform with its smooth, glassy green disk on the floor.`;
      }

      let desc = `To the south is a security door with no obvious handle, its frame skewed enough to leave an open gap along the right side, and the metal there has been melted by heat or acid leaving a decent sized hole that looks into a dimly lit room on the other side. A badge reader is mounted next to the door, but it has scorching around the seam and doesn't appear to be functional. The door is painted a neutral grey, with a green horizontal stripe across it at eye level. Stenciled across the dented banner is the word 'HYDROPONICS.' `;
      const greenTpadState =
        state.worldState.powerRestoredSections["teleport-pads-green"];
      if (greenTpadState) {
        desc += `Through the gap along the side of the door, you can see a smooth, glassy green disk on the floor, big enough to stand on. It is lit with a sallow green glow that bathes the shadows of the room beyond.`;
      }
      if (greenTpadState === false) {
        desc += `Through the gap along the side of the door, you can see a smooth, glassy green disk on the floor, big enough to stand on.`;
      }
      return desc;
    },
    descriptionFromB:
      "To the north is a heavy steel door which has been almost completely corroded away by acid, leaving a rough-edged opening. In the center of the floor is an opening with a spiral stairway leading down to the next platform.",
    kind: "standard",
    blockMsg: `The door doesn't respond at all when you approach, it's jammed tight in the damaged metal frame.`,
    vocab: ["door", "damaged door", "hydroponics door", "gap"],
    connects: {
      roomAId: "LevelSixCorridorEnd",
      roomBId: "HydroponicsPlatform",
    },
    directions: { fromA: "south", fromB: "north" },
    initiallyOpen: true,
    initiallyLocked: false,
  },
];
