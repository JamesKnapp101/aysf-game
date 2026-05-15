import { Item } from "@game/types/itemTypes";
import type { Room } from "@game/types/roomTypes";

export const experienceRooms: Room[] = [
  {
    id: "FallenCorpseMemory",
    name: "Memory: Stairwell",
    description:
      "You're in midair, wind rushing in your ears as you fall down the center of a building stairwell that dissolves into darkness at the edges.",
    exits: [],
  },
  {
    id: "HalvedCorpseMemory",
    name: "Memory: Sanyi Residence: Living Area",
    description: `You're standing in a spacious living area that doubles as an entryway and den. The interior is carpeted in a warm mocha, and on one wall is a holographic image of three identical-looking young men. Arranged around an impressive entertainment center is a large, U-shaped sectional with wooden trim and cream-colored upholstery. Across from the sectional is a large flat-screen television, currently dark and reflecting the room back at itself. Between the sectional and the television is a squat, glass-topped coffee table.`,
    exits: [],
  },
  {
    id: "SpinInstructorSpinStageMemory",
    name: "Memory: Spin Stage",
    description:
      "You're standing on a small podium overlooking the west side of the gym where you can make out the frantic movement of other people in the gym but everything beyond the stage is fuzzy and indistinct. Atop the podium sits a fancy-looking electronic stationary bike facing toward the east side of the gym its console still lit and waiting. A second speed dial is mounted beside the instructor bike, currently set to 20.",
    exits: [],
  },
  {
    id: "CrushedWeightlifterGymMemory",
    name: "Memory: Gymnasium: Weight Room",
    description:
      "This is the weight room portion of the gymnasium. Various weight machines fill one side of the room, their adjustable seats and cable stacks set at different heights. Benches and racks of free weights range from tiny all the way up to massive. Several large mirrors are mounted on the walls. The floor is covered in thick rubber matting to absorb the impact of dropped weights.",
    exits: [],
  },
  {
    id: "BarBasementHeadMemory",
    name: "Memory: Bar: Bathroom",
    description: `The bathroom is a simple affair, designed to do a lot of business without much fanfare. The space is small, painted black, and covered in scribbles and overlapping old fliers. There's a porcelain sink in front of a wide mirror, which could use a good cleaning. Across from that is a toilet with no stall, right next to a wall mounted urinal, in the bottom of which a plastic net cradles a partially dissolved urinal cake.\n\nMounted on the wall next to the sink is a little dispensing machine with a silver turn crank and a metal flap beneath it. The dispenser is painted with a breezy logo that reads 'Snap out of It!'.`,
    exits: [],
  },
  {
    id: "BarBasementHeadMemory2",
    name: "Memory: Bar: Basement",
    description:
      "You're standing in the bar's cellar. Boxes of liquor line the walls, garnish crates crowd the corners, and a rectangle of warm bar light spills down the wooden steps from the open hatch above.",
    exits: [],
  },
];

export const experienceRoomsItems: Item[] = [
  {
    id: "HalvedCorpseMemoryClone",
    name: "clone",
    description: `The man looks angry, but also tired, even distraught. He looks like he hasn't slept in a while.`,
    sceneryDescription: `A young man, fit with short black hair but looking disheveled in a stained t-shirt and sweatpants. He stands in the doorway to the bedroom as if he's worried the woman will try and force her way in.`,
    location: "HalvedCorpseMemory",
    vocab: ["man", "clone", "gim"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 1,
    },
    itemWeight: 2,
    itemSize: 3,
  },
  {
    id: "SpinStageMemoryBike",
    name: "instructor bike",
    description: `The console is lit up and displaying the selected workout program. At the bottom of the console is a label that reads: PW: YX34-D940-6`,
    sceneryDescription: `Atop the podium sits a fancy-looking electronic stationary bike facing toward the east side of the gym, its console still lit and waiting. A label at the bottom of the console reads: PW: YX34-D940-6`,
    location: "SpinInstructorSpinStageMemory",
    vocab: [
      "bike",
      "bicycle",
      "stationary",
      "stationary bike",
      "instructor",
      "console",
      "password",
      "label",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 2,
    },
    itemWeight: 2,
    itemSize: 3,
  },
];
