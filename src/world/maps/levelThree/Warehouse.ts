import { Item } from "@game/types/itemTypes";
import { Room } from "@game/types/roomTypes";

export const warehouseRooms: Room[] = [
  {
    id: "L3Warehouse",
    name: "Warehouse",
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
    description: `It's quite a belt.`,
    sceneryDescription: `A big old conveyor belt is there doing it's thing.`,
    location: "RobotRefuge",
    vocab: ["conveyor", "belt"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 1,
    },
    itemWeight: 2,
    itemSize: 3,
  },
  {
    id: "Conveyor2",
    name: "conveyor belt 2",
    description: `It's quite a belt.`,
    sceneryDescription: `A big old conveyor belt is there doing it's thing.`,
    location: "Storage",
    vocab: ["conveyor", "belt"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 1,
    },
    itemWeight: 2,
    itemSize: 3,
  },
];
