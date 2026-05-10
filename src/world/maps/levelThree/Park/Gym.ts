import {
  getGymTreadmillAngleDescription,
  getGymTreadmillSettings,
  getGymTreadmillSpeedDescription,
  liftGymWeightlifterBarbell,
  moveGymExerciseBallToRoom,
} from "@game/helpers/gymHelpers";
import type { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import { Room } from "@game/types/roomTypes";

export const gymRooms: Room[] = [
  // GYM
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
  {
    id: "GymGiantTreadmill",
    name: "giant treadmill",
    description:
      "The broad black surface is a giant treadmill of sorts, wide enough to accommodate a whole group of cyclists on bikes.",
    describe: (state) =>
      [
        "On closer inspection, the flat black surface is a giant treadmill, wide enough to accommodate a group of cyclists on bikes.",
        getGymTreadmillAngleDescription(state),
        getGymTreadmillSpeedDescription(state),
      ].join(" "),
    describeScenery: (state) =>
      `To the west, the entire floor is covered with a flat black surface that emits a constant hum. Past it, the spin instructor bike is visible on its podium with a woman's body lying beside it. ${getGymTreadmillAngleDescription(
        state,
      )} ${getGymTreadmillSpeedDescription(state)}`,
    location: "Gym",
    vocab: [
      "giant treadmill",
      "flat black surface",
      "black surface",
      "surface",
      "moving conveyor",
      "conveyor",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1000,
    itemSize: 20,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "GymTreadmillAngleDial",
    name: "angle dial",
    description: `The dial is marked from -20 to 20. It controls the incline of the giant treadmill.`,
    describe: (state) => {
      const { angle } = getGymTreadmillSettings(state);
      return `The dial is marked from -20 to 20, and is currently set to ${angle}. It controls the incline of the giant treadmill.`;
    },
    sceneryDescription:
      "A sturdy angle dial is mounted near the edge of the giant treadmill.",
    location: "Gym",
    vocab: ["angle", "dial", "angle dial", "incline", "incline dial"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 2,
    isSettable: true,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "GymTreadmillSpeedDial",
    name: "speed dial",
    description:
      "The dial is marked from 0 to 100, but the display above it flashes 'Instructor Override.'",
    sceneryDescription:
      "Beside it is a dial that controls the treadmill's speed.",
    location: "Gym",
    vocab: ["speed", "dial", "speed dial", "override"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 2,
    isSettable: true,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
  {
    id: "GymLightweightBicycleRack",
    name: "lightweight bicycles",
    description:
      "The bikes are light-framed, narrow-tired, and indicate that they'll only work on the treadmill, but it looks like they're all locked down right now.",
    sceneryDescription:
      "On the eastern side is a rack of lightweight bicycles.",
    location: "Gym",
    vocab: ["lightweight", "bicycle", "bicycles", "bike", "bikes", "rack"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 7,
    meta: {
      sceneryDescriptionOrder: 5,
    },
  },
  {
    id: "GymExerciseBallRack",
    name: "wire bin",
    description:
      "The bin is built from thick wire and oversized enough for several exercise balls.",
    describeScenery: (state) => {
      const contents =
        state.itemState.containerContents.GymExerciseBallRack ?? [];
      return contents.length === 0
        ? "At the east end of the gym is a large wire bin for storing exercise balls that is currently empty."
        : "At the east end of the gym is a large wire bin for storing exercise balls.";
    },
    location: "Gym",
    vocab: ["wire", "bin", "wire bin", "ball bin", "exercise ball bin"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 80,
    itemSize: 10,
    isContainer: true,
    isOpenable: false,
    capacity: 20,
    meta: {
      sceneryDescriptionOrder: 6,
    },
  },
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
  {
    id: "GymExerciseBall",
    name: "bright orange exercise ball",
    description:
      "It's a giant rubber exercise ball colored bright orange. The surface feels springy under your hand, almost weirdly so.",
    initialDescription:
      "Near the elliptical machines sits a giant rubber exercise ball colored bright orange.",
    location: "Gym",
    vocab: ["ball", "exercise", "exercise ball", "orange", "rubber"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 6,
    itemSize: 6,
    overrides: {
      bounce: ({ state }: { state: GameState }) => ({
        state: moveGymExerciseBallToRoom(state, state.player.roomId),
        message:
          "You bounce the exercise ball and it rockets away with absurd force, rebounds off the floor, clips a machine, ricochets back across the room, and finally settles down wobbling before rolling to a stop.",
      }),
      siton:
        "You ease yourself onto the exercise ball, wobble for one undignified second, and have to throw a foot down before it dumps you. It is a lot harder than it looks.",
    },
  },
  {
    id: "SpinStagePodium",
    name: "podium",
    description:
      "The podium is just tall enough to put an instructor above a class, with the giant treadmill spread out below.",
    sceneryDescription:
      "Atop the podium sits a fancy-looking electronic stationary bike facing toward the east side of the gym, allowing an instructor to face a group of clients on the moving conveyor.",
    location: "SpinStage",
    vocab: ["podium", "stage", "platform"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 300,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "SpinStageBike",
    name: "instructor bike",
    description:
      "The stationary bike is sleek and overbuilt, with a reinforced frame, clipped pedals, and a console angled toward the rider.",
    sceneryDescription:
      "The instructor bike is fixed in place, its console still lit and waiting.",
    location: "SpinStage",
    vocab: ["bike", "bicycle", "stationary", "stationary bike", "instructor"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 6,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "SpinStageSpeedDial",
    name: "instructor speed dial",
    description: "The instructor speed dial is marked from 0 to 100.",
    describe: (state) => {
      const { speed } = getGymTreadmillSettings(state);
      return `The instructor speed dial is marked from 0 to 100, and is currently set to ${speed}.`;
    },
    describeScenery: (state) => {
      const { speed } = getGymTreadmillSettings(state);
      return speed === 100
        ? "A second speed dial is mounted beside the instructor bike, currently pegged at 100."
        : `A second speed dial is mounted beside the instructor bike, currently set to ${speed}.`;
    },
    location: "SpinStage",
    vocab: ["speed", "dial", "speed dial", "instructor", "instructor dial"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 2,
    isSettable: true,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "SpinStageCyclistCorpse",
    name: "cyclist's body",
    description:
      "The woman is dressed in black bike shorts, a green sports bra, and white sneakers. She lies still beside the stationary bike, beginning to smell of decay.",
    sceneryDescription:
      "[[newline]]The body of a woman dressed in black bike shorts, a green sports bra, and white sneakers lies on the floor next to the stationary bike, unmoving and beginning to smell of decay.",
    location: "SpinStage",
    vocab: ["body", "corpse", "woman", "cyclist", "shorts", "sports bra"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 65,
    itemSize: 7,
    meta: {
      corpse: {
        hasIntactHead: true,
        memoryExperienceId: "spin_corpse_memory",
      },
      sceneryDescriptionOrder: 4,
    },
  },
  {
    id: "GymWeightRoomMachines",
    name: "weight machines",
    description:
      "The machines are built for serious resistance work, all cable stacks, thick pads, and adjustment levers.",
    sceneryDescription:
      "Various weight machines fill one side of the room, their adjustable seats and cable stacks set at different heights.",
    location: "GymWeightRoom",
    vocab: ["weight", "weights", "machine", "machines"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 300,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "GymWeightRoomFreeWeights",
    name: "free weights",
    description:
      "The free weights range from small dumbbells to plates big enough to make your wrists ache just looking at them.",
    sceneryDescription:
      "Benches and racks of free weights range from tiny all the way up to massive.",
    location: "GymWeightRoom",
    vocab: [
      "free",
      "weights",
      "free weights",
      "dumbbells",
      "plates",
      "benches",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 400,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "GymWeightRoomMirrors",
    name: "wall mirrors",
    description:
      "The mirrors are broad and bright, positioned so lifters can admire their form or confront their mistakes from several angles at once.",
    sceneryDescription: "Several large mirrors are mounted on the walls.",
    location: "GymWeightRoom",
    vocab: ["mirror", "mirrors", "wall mirrors"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 80,
    itemSize: 8,
    isReflective: true,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "GymWeightRoomMatting",
    name: "rubber matting",
    description:
      "The thick rubber matting is scuffed, dented, and faintly chalky. It has absorbed a lot of punishment.",
    sceneryDescription:
      "The floor is covered in thick rubber matting to absorb the impact of dropped weights.",
    location: "GymWeightRoom",
    vocab: ["rubber", "matting", "mat", "floor"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 100,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
  {
    id: "GymWeightRoomCrushedBody",
    name: "crushed body",
    description:
      "The man was heavily muscled and rugged-looking, with copper hair and a barely-there black tank top. A barbell stacked with four hundred pounds has crushed his ribcage flat.",
    sceneryDescription:
      "Lying on the floor is the body of a heavily muscled, rugged-looking copper-haired man in a black tank top, camo shorts, and white sneakers. His lifeless eyes bug out at the ceiling as a barbell stacked with four hundred pounds crushes his ribcage.",
    location: "GymWeightRoom",
    vocab: [
      "body",
      "corpse",
      "man",
      "copper",
      "hair",
      "weightlifter",
      "lifter",
      "barbell",
      "barbel",
      "weights",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 9,
    meta: {
      corpse: {
        hasIntactHead: true,
        memoryExperienceId: "barbell_corpse_memory",
      },
      sceneryDescriptionOrder: 5,
    },
    overrides: {
      lift: ({ state }: { state: GameState }) =>
        liftGymWeightlifterBarbell(state),
      move: ({ state }: { state: GameState }) =>
        liftGymWeightlifterBarbell(state),
    },
  },
];
