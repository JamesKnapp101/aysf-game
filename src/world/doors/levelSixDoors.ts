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
      let desc = `The door is damaged, becoming wedged tight in the frame. There's a badge reader next to it, but even if it wasn't damaged you don't think the door is functional. Through the gap along the side you can see a glassy green disk, or platform on the floor, large enough to stand on`;
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
      let desc = `To the south is a security door with no obvious handle, its frame skewed enough to leave an open gap along the right side. A badge reader is mounted next to the door, but it has scorching around the seam and doesn't appear to be functional. The door is painted a neutral grey, with a green horizontal stripe across it at eye level. Stenciled across the dented banner is the word 'HYDROPONICS.' `;
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
    descriptionFromB: "To the north is a a heavy steel door.",
    kind: "blocked",
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
