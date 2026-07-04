import { movePlayerToRoom } from "@game/helpers/gameHelpers";
import type { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import { Room } from "@game/types/roomTypes";
import { hasLevelTwoBombDetonated } from "src/world/maps/levelTwo/levelTwoBomb";

function rideWarehouseConveyor(toRoomId: string) {
  return ({
    state,
  }: {
    state: GameState;
  }): {
    message: string;
    state: GameState;
  } => {
    if (!hasLevelTwoBombDetonated(state)) {
      return {
        state,
        message:
          "The conveyor belt twitches under you, but a large piece of scrap is jammed deep in the rollers. The motor hums and strains without moving the belt more than a few centimeters.",
      };
    }

    return {
      state: movePlayerToRoom(state, toRoomId),
      message: "You ride the belt to the end.",
    };
  };
}

function describeConveyor(state: GameState): string {
  if (!hasLevelTwoBombDetonated(state)) {
    return "The conveyor belt is powered, but not moving. A large piece of twisted scrap is wedged between the rollers near the far end, holding the whole thing in a trembling mechanical stalemate.";
  }

  return "The conveyor belt is running now, its black rubber surface crawling steadily between scuffed metal guide rails.";
}

function describeConveyorScenery(state: GameState): string {
  if (!hasLevelTwoBombDetonated(state)) {
    return "A conveyor belt occupies one side of the refuge, trembling in place around a large piece of scrap wedged deep in its rollers.";
  }

  return "A conveyor belt runs along one side of the refuge, its surface moving steadily toward an opening in the wall.";
}

function describeConveyorScrap(state: GameState): string {
  if (!hasLevelTwoBombDetonated(state)) {
    return "It is a heavy, jagged slab of scrap metal jammed hard into the conveyor rollers. You can get your hands on it, but it has too much leverage against the belt assembly to pull free.";
  }

  return "It is a heavy, jagged slab of scrap metal lying beside the conveyor where the blast shook it loose. It still looks too awkward and sharp to carry around.";
}

function describeConveyorScrapScenery(state: GameState): string {
  if (!hasLevelTwoBombDetonated(state)) {
    return "The jammed scrap squeals softly whenever the conveyor motor strains against it.";
  }

  return "A large piece of scrap lies beside the conveyor, freshly shaken loose.";
}

function dislodgeConveyorScrap(state: GameState): string {
  if (!hasLevelTwoBombDetonated(state)) {
    return "You brace yourself and haul on the scrap until your hands ache, but it is wedged too deeply in the rollers to dislodge.";
  }

  return "The blast already did the useful part. The scrap is loose now, but still too heavy and jagged to do anything productive with.";
}

export const warehouseRooms: Room[] = [
  {
    id: "L3Warehouse",
    name: "Storage L3",
    description: `This is a large storage space with a high ceiling and towering metal racks on either side. The racks are largely populated with stacks of crates held together with metal bands, their exteriors stamped with scannable codes. Except for a faint buzz coming from one of the overhead lights high above the room is very quiet, and the air is still, here.[[SCENERY]] `,
    exits: [
      { direction: "east", toRoomId: "RobotRefuge" },
      { direction: "west", doorId: "WarehouseDoor" },
    ],
  },
  {
    id: "RobotRefuge",
    name: "Robot Refuge",
    description: `.`,
    exits: [{ direction: "west", toRoomId: "L3Warehouse" }],
  },
];

export const warehouseItems: Item[] = [
  {
    id: "TracksInDust",
    name: "a series of tracks",
    description: `The tracks and scuffs indicate that at least one person walked the length of the warehouse between the racks, then back again, moving east to west. The overlap of the tracks suggests that the trip was made many times, maybe to check inventory, but it's hard to tell how long they've been there.`,
    sceneryDescription: ` The floor is gray concrete, and covered in a visible film of dust where overlapping footprints can be made out.`,
    location: "L3Warehouse",
    vocab: ["footprints", "tracks", "dust"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 1,
    },
    itemWeight: 2,
    itemSize: 3,
  },
  {
    id: "SpyCam",
    name: "a small camera",
    description: `You peer closer and are able to make out a white, plastic orb with a black eye at its center and a tiny red LED on one side. It appears to be some kind of hidden camera that looks down over the warehouse. It must be sending the footage somewhere nearby.`,
    sceneryDescription: ` Way up near the ceiling a tiny, glowing red light can be barely made out from the shadows.`,
    location: "L3Warehouse",
    vocab: ["camera", "spycam", "webcam", "red", "light"],
    itemClass: "solid",
    itemCategory: "scenery",
    overrides: {
      take: `It's way too high for you to reach, whoever put it there must have used a ladder.`,
      switch: `You can't reach it.`,
    },
    meta: {
      sceneryDescriptionOrder: 2,
    },
    isSwitchable: true,
    itemWeight: 2,
    itemSize: 3,
  },
  {
    id: "Conveyor",
    name: "conveyor belt",
    description: "",
    describe: (state) => describeConveyor(state),
    describeScenery: (state) => describeConveyorScenery(state),
    location: "RobotRefuge",
    vocab: ["conveyor", "belt"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 1,
    },
    overrides: {
      ride: rideWarehouseConveyor("Storage"),
    },
    itemWeight: 2,
    itemSize: 3,
  },
  {
    id: "RobotRefugeConveyorScrap",
    name: "large piece of scrap",
    description: "",
    describe: (state) => describeConveyorScrap(state),
    describeScenery: (state) => describeConveyorScrapScenery(state),
    location: "RobotRefuge",
    vocab: ["scrap", "large scrap", "piece of scrap", "metal", "scrap metal"],
    itemClass: "solid",
    itemCategory: "scenery",
    isPushable: true,
    meta: {
      sceneryDescriptionOrder: 2,
    },
    overrides: {
      lift: ({ state }: { state: GameState }) => dislodgeConveyorScrap(state),
      move: ({ state }: { state: GameState }) => dislodgeConveyorScrap(state),
      pull: ({ state }: { state: GameState }) => dislodgeConveyorScrap(state),
      push: ({ state }: { state: GameState }) => dislodgeConveyorScrap(state),
      take: "You can barely shift it with both hands. Carrying it around is out of the question.",
    },
    itemWeight: 80,
    itemSize: 6,
  },
  {
    id: "Conveyor2",
    name: "conveyor belt 2",
    description: "",
    describe: (state) => describeConveyor(state),
    describeScenery: (state) => describeConveyorScenery(state),
    location: "Storage",
    vocab: ["conveyor", "belt"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 1,
    },
    overrides: {
      ride: rideWarehouseConveyor("RobotRefuge"),
    },
    itemWeight: 2,
    itemSize: 3,
  },
];
