import type { Item } from "@game/types/itemTypes";
import type { Room } from "@game/types/roomTypes";
import { gymExerciseBallItems } from "./gymExerciseBall";
import { gymTreadmillItems } from "./gymTreadmill";
import { gymWeightRoomItems } from "./gymWeightlifterPuzzle";

export const gymRooms: Room[] = [
  {
    id: "GymEntrance",
    name: "Gymnasium Entrance",
    description: `The grassy park gives way to the stone paved exterior of a large gymnasium. [[SCENERY]]`,
    exits: [
      { direction: "southwest", toRoomId: "ParkCenter" },
      { direction: "northeast", toRoomId: "Gym" },
      { direction: "south", toRoomId: "ParkEast" },
      { direction: "west", toRoomId: "ParkNorth" },
    ],
  },
  {
    id: "Gym",
    name: "Gymnasium: Cardio Center",
    description: `This is a large gymnasium broken down into several parts. [[SCENERY]]`,
    exits: [
      { direction: "northeast", toRoomId: "WomensShower" },
      { direction: "northwest", toRoomId: "MensShower" },
      { direction: "southwest", toRoomId: "GymEntrance" },
      { direction: "north", toRoomId: "GymWeightRoom" },
      { direction: "west", toRoomId: "SpinStage" },
    ],
  },
  {
    id: "SpinStage",
    name: "Gymnasium: Spin Stage",
    description: `This is a small podium overlooking the west side of the gym. [[SCENERY]]`,
    exits: [{ direction: "east", toRoomId: "Gym" }],
  },
  {
    id: "GymWeightRoom",
    name: "Gymnasium: Weight Room",
    description: `This is the weight room portion of the gymnasium. [[SCENERY]] There is an exit back to the main gym area to the south.`,
    exits: [{ direction: "south", toRoomId: "Gym" }],
  },
  {
    id: "MensShower",
    name: "Gymnasium: Men's Locker Room",
    description: `This is the men's locker room, dimly lit and eerily quiet. There are a series of thin, worn wooden benches running alongside rows of lockers. At the other end is a tiled communal shower, currently empty, and dry. A doorway to the southeast leads back out to the gymnasium.`,
    exits: [{ direction: "southeast", toRoomId: "Gym" }],
  },
  {
    id: "WomensShower",
    name: "Gymnasium: Women's Locker Room",
    description: `This is the women's locker room, dimly lit and eerily quiet. There are a series of thin, worn wooden benches running alongside rows of lockers. At the other end is a communal shower, currently empty, leaving only a slow drip to echo in the small space. A doorway to the southwest leads back out to the gymnasium.`,
    exits: [{ direction: "southwest", toRoomId: "Gym" }],
  },
];

export const gymItems: Item[] = [
  {
    id: "GymEntranceSteps",
    name: "stone steps",
    description:
      "The steps are broad and shallow, worn smooth down the center by years of people streaming in and out of the gym.",
    sceneryDescription:
      "A set of broad stone steps leads up from the park to the building's entrance,",
    location: "GymEntrance",
    vocab: ["steps", "stone", "stairs", "stairway"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 200,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "GymEntranceGlassPanels",
    name: "glass panels",
    description:
      "Through the glass you can see rows of cardio equipment and weight machines waiting under the dead quiet. Nothing moves inside.",
    sceneryDescription:
      "where tall glass panels offer a view inside at rows of cardio equipment and weight machines, though you don't see anybody in there at the moment.",
    location: "GymEntrance",
    vocab: ["glass", "panels", "window", "windows", "inside"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 100,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "GymEntranceSign",
    name: "Ultra Fitness sign",
    description:
      "The sign reads 'ULTRA FITNESS' in bold block letters. It looks expensive, motivational, and feels faintly judgmental.",
    sceneryDescription:
      "A large sign mounted over the entryway reads 'ULTRA FITNESS' in bold block letters.",
    location: "GymEntrance",
    vocab: ["sign", "ultra", "fitness", "ultra fitness", "entryway"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 5,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "GymEntranceRobotTrainerPoster",
    name: "robot trainer poster",
    description:
      "The poster shows a stylized robot trainer wearing an Ultra Fitness t-shirt, one chrome thumb raised in relentless encouragement. Under it are the words 'State of the art robot trainers: Blood, Sweat & Gears.'",
    sceneryDescription:
      "A large poster in one of the windows shows a stylized robot trainer wearing an Ultra Fitness t-shirt, along with the words 'State of the art robot trainers: Blood, Sweat & Gears.'",
    location: "GymEntrance",
    vocab: [
      "poster",
      "robot",
      "trainer",
      "robot trainer",
      "blood",
      "sweat",
      "gears",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 2,
    itemSize: 3,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
  {
    id: "GymOpenWeightRoomEntrance",
    name: "weight room entrance",
    description:
      "The opening leads north into an impressive weight room that includes a large variety of machines and free weights.",
    sceneryDescription:
      "A large, open entrance to the north leads to another area filled with weight machines and free weights.",
    location: "Gym",
    vocab: ["open", "entrance", "north", "weight", "weight room"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  ...gymTreadmillItems,
  ...gymExerciseBallItems,
  {
    id: "GymShowerSigns",
    name: "shower signs",
    description:
      "The northwest sign reads 'MEN'S SHOWERS' and the northeast sign reads 'WOMEN'S SHOWERS.'",
    sceneryDescription:
      "To the northwest is a doorway marked 'MEN'S SHOWERS', and to the northeast is another doorway marked 'WOMEN'S SHOWERS'. The gym's exit is to the southwest.",
    location: "Gym",
    vocab: ["sign", "signs", "shower", "showers", "men", "women"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 2,
    itemSize: 2,
    meta: {
      sceneryDescriptionOrder: 7,
    },
  },
  ...gymWeightRoomItems,
];
