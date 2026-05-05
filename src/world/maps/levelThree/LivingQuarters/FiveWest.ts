import { describeScotchBottle } from "@game/rules/items";
import { Item } from "@game/types/itemTypes";
import { Room } from "@game/types/roomTypes";

export const FiveWestRooms: Room[] = [
  {
    id: "LivingQuartersFiveWest",
    name: "Umboltz Residence: Living Area",
    description: `The entryway to the quarters has been decorated to give it a rustic sort of feel, with natural unpainted wood and giving the impression of stepping into a cabin out in the woods somewhere. Inside, wooden beams run the length of the ceiling at regular intervals, from which several overhead lights hang from wrought iron chains. [[SCENERY]]`,
    exits: [
      { direction: "east", doorId: "UmboltzResidenceDoor" },
      { direction: "north", doorId: "FiveWestBDoor" },
      { direction: "west", toRoomId: "FiveWestBed" },
    ],
  },
  {
    id: "FiveWestBath",
    name: "Umboltz Residence: Bathroom",
    description: `This is a small bathroom, [[SCENERY]]`,
    exits: [{ direction: "south", doorId: "FiveWestBDoor" }],
  },
  {
    id: "FiveWestBed",
    name: "Umboltz Residence: Bedroom",
    description: `The inside of the bedroom is purposefully sparse, and is lit by a very good approximation of moonlight, which with the dim lighting and high ceiling help create the illusion that you're outside underneath a starry sky. The room is mostly empty except for a [[SCENERY]]`,
    exits: [{ direction: "east", toRoomId: "LivingQuartersFiveWest" }],
  },
];

export const fiveWestItems: Item[] = [
  // Bathroom
  {
    id: "FiveWestBathroomOverheadLight",
    name: "a single overhead light",
    description: `The light shines down from the ceiling, bright enough to throw warmth as it chases shadows from every corner.`,
    sceneryDescription: `brightly lit from above by a large, disk-shaped overhead light that you can feel the warmth of when standing underneath it. `,
    location: "FiveWestBath",
    vocab: ["overhead light", "overhead", "light"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 1,
    },
    itemWeight: 2,
    itemSize: 3,
  },
  {
    id: "FiveWestBathroomTub",
    name: "utilitarian bathtub",
    description: `The bath isn't very deep, suggesting someone who prefers showers.`,
    sceneryDescription: `To the right is a shallow bathtub and shower combo with a simple white shower curtain, and next to that is `,
    location: "FiveWestBath",
    vocab: ["tub", "bathtub", "shower", "curtain"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 2,
    },
    itemWeight: 2,
    itemSize: 3,
  },
  {
    id: "FiveWestBathroomToilet",
    name: "FiveWestBathToilet",
    description: `The toilet is a clean, bright white, like it was scrubbed with a toothbrush.`,
    sceneryDescription: `a porcelain toilet with steel fixtures and a wooden seat. `,
    location: "FiveWestBath",
    vocab: ["toilet"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 3,
      onUse: `You might want to hold off on that, since there's no water in it, and it probably won't flush.`,
      onFlush: `You push the handle but nothing happens. It's not getting any water.`,
    },
    itemWeight: 2,
    itemSize: 3,
  },
  {
    id: "FiveWestBathroomSink",
    name: "a utilitarian sink",
    description: `It's simple, unadorned, and very clean.`,
    sceneryDescription: `Against the opposite wall stands a porcelain sink with a shallow basin, `,
    location: "FiveWestBath",
    vocab: ["sink", "basin"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 4,
      onUse: `You turn the faucet but no water comes out.`,
    },
    itemWeight: 2,
    itemSize: 3,
  },
  {
    id: "FiveWestMedicineChest",
    name: "a medicine chest",
    description: `It's a shallow medicine chest mounted above the sink.`,
    sceneryDescription: `mounted above which is a medicine chest with a `,
    location: "FiveWestBath",
    vocab: [
      "medicine",
      "chest",
      "medicine chest",
      "cabinet",
      "medicine cabinet",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 5,
    },
    itemWeight: 2,
    itemSize: 3,
    isContainer: true,
    isOpenable: true,
  },
  {
    id: "FiveWestBathMirror",
    name: "an ornate mirror",
    description: `It's a fancy ornate mirror.`,
    sceneryDescription: `mirrored door. `,
    location: "FiveWestBath",
    vocab: ["mirror"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 6,
    },
    itemWeight: 2,
    itemSize: 3,
    isReflective: true,
  },
  {
    id: "hornychewToo",
    name: "sour chewable",
    description: `It's a small, brick-shaped chewable inside a thin papery wrapper. The black wrapper displays a blocky logo for something called 'Sledgehammer.' It also promises, in tiny print, that the wrapper is also edible.`,
    initialDescription: `an individually wrapped chewable sits on one shelf of the medicine chest.`,
    location: "seeded",
    vocab: ["chewable", "gummy", "sledgehammer"],
    itemClass: "solid",
    itemCategory: "collectable",
    meta: {
      consumable: {
        kind: "food",
        perDose: [
          { type: "status", id: "hyperaroused", intensity: 69, duration: 69 },
          {
            type: "message",
            text: `You pop the chewable in your mouth and squish it between your back teeth. It yields like gum for a moment, then dissolves all at once into a sour, minty syrup. You're not sure what you think of it.`,
          },
        ],
        onEmpty: [{ type: "message", text: "It's empty." }],
      },
    },
    itemWeight: 2,
    itemSize: 3,
    isConsumable: true,
    doses: 1,
  },
  {
    id: "hairychew",
    name: "sweet chewable",
    description: `It's a small, brick-shaped chewable inside a thin papery wrapper. The black wrapper displays a flame-lettered logo for something called 'Follicle King' It also promises, in tiny print, that the wrapper is also edible.`,
    initialDescription: `an individually wrapped chewable sits on the bottom shelf of the medicine chest.`,
    location: "seeded",
    vocab: ["chewable", "gummy", "follicle", "king"],
    itemClass: "solid",
    itemCategory: "collectable",
    meta: {
      consumable: {
        kind: "food",
        perDose: [
          {
            type: "status",
            id: "explosive follicle growth",
            intensity: 100,
            duration: 4,
          },
          {
            type: "message",
            text: `You pop the chewable in your mouth and squish it between your back teeth. It yields like gum for a moment, then dissolves all at once into a intensely sweet syrup that doesn't quite mask a very bitter undercurrent.`,
          },
        ],
        onEmpty: [{ type: "message", text: "It's empty." }],
      },
    },
    itemWeight: 2,
    itemSize: 3,
    isConsumable: true,
    doses: 1,
  },
  // Bedroom
  {
    id: "UmboltzBedroll",
    name: "bedroll",
    description:
      "A little fancier than a common bedroll, it's made of a matte-black lightweight fabric and is well padded without being bulky.",
    sceneryDescription:
      "modest bedroll that lays along the wall in the far corner.",
    location: "FiveWestBed",
    vocab: ["bed", "bedroll", "sleeping bag"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 3,
    itemSize: 2,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "UmboltzAccolade",
    name: "award plaque",
    description:
      "The plaque was awarded by the 'Flosshausen-Fob Academy for Advanced Crime-Fighting Technology' to one 'Henk Soo-Hoo Umboltz' for graduating with honors.",
    readableText:
      "Bestowed by the\nFlosshausen-Fob Academy\nfor\nAdvanced Crime-fighting Technology\nto one\nHenk Soo-Hoo Umboltz\nfor\nGraduating with Full Honors",
    isLoggable: false,
    sceneryDescription:
      "On the north wall hangs a wooden plaque with gold trim, some sort of award, ",
    location: "FiveWestBed",
    vocab: ["plaque", "award", "certificate"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 3,
    itemSize: 2,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "UmboltzCanvasChair",
    name: "canvas chair",
    description:
      "The white canvas drapes from the wooden frame, and the back is reclined back at a twenty-degree angle.",
    sceneryDescription:
      "and in the corner is a low-sitting canvas chair with a wooden frame.",
    location: "FiveWestBed",
    vocab: ["chair", "canvas", "wooden"],
    itemClass: "solid",
    itemCategory: "scenery",
    isSurface: true,
    itemWeight: 3,
    itemSize: 2,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "UmboltzFootlocker",
    name: "footlocker",
    description:
      "This is a large, sturdy trunk with metal clasps in the front that is serving as a dresser of sorts.",
    sceneryDescription:
      "[[newline]]Resting near the foot of the bedroll is a heavy-looking footlocker with metal latches and ",
    location: "FiveWestBed",
    vocab: ["footlocker", "trunk", "locker"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 3,
    itemSize: 2,
    meta: {
      sceneryDescriptionOrder: 4,
    },
    isContainer: true,
  },
  {
    id: "UmboltzFootlockerNameplate",
    name: "footlocker nameplate",
    description:
      "The nameplate indicates the trunk belongs to Henk Umboltz, who is the head of security.",
    readableText: "HENK UMBOLTZ\nHead of Security",
    isLoggable: false,
    sceneryDescription: "an engraved nameplate.",
    location: "FiveWestBed",
    vocab: ["engraved", "nameplate"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 3,
    itemSize: 2,
    meta: {
      sceneryDescriptionOrder: 5,
    },
    isContainer: true,
  },
  // Living Area
  {
    id: "LionSkinRug",
    name: "lion skin rug",
    description:
      "The fur is thick and soft. The animal must have been formidable, even if it was probably 3D printed.",
    sceneryDescription:
      "The floor is all hardwood, partially covered by a lion skin rug, head and mane intact, ",
    location: "LivingQuartersFiveWest",
    vocab: ["rug", "lion", "skin", "mane", "teeth"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 3,
    itemSize: 2,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "TigerSkinRug",
    name: "tiger skin rug",
    description:
      "The fur is thick and plush. The animal must have been something to see in life, even if it was probably 3D printed.",
    sceneryDescription:
      "and a tiger skin rug, also with the head intact, both with glassy, staring feline eyes and long sharp teeth. ",
    location: "LivingQuartersFiveWest",
    vocab: ["rug", "tiger", "skin", "mane", "teeth"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 3,
    itemSize: 2,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "BadgerPainting",
    name: "badger painting",
    description:
      "The man carries a powerful rifle, which he's used to blow a decent-sized hole through the torso of the badger. It looks like he took some damage before he managed it, though, the little thing must have been tougher than it looks.",
    sceneryDescription:
      "On the northern wall hang a series of four paintings, all of the same rugged looking, copper haired man, with an empty spot for a fifth. The first painting depicts the man, his face and neck deeply scratched, crouching next to the body of a huge honey badger, tongue lolling from its sharp-toothed mouth. ",
    location: "LivingQuartersFiveWest",
    vocab: ["badger", "oil", "painting", "picture"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 3,
    itemSize: 2,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "BoarPainting",
    name: "boar painting",
    description:
      "The man crouches over the boar, which has a significant hole going through the middle of it, holding his rifle and grinning. The boar isn't that large, but its tusks look sharp.",
    sceneryDescription:
      "The second painting depicts the man crouching next to the body of a wild boar laying on its side, tusks jutting up from its open mouth. ",
    location: "LivingQuartersFiveWest",
    vocab: ["boar", "oil", "painting", "picture"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 3,
    itemSize: 2,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
  {
    id: "BullPainting",
    name: "bull painting",
    description:
      "The man is standing on top of the dead bull as if he were about to plant a flag in it, one foot up on the creature's mighty horn. He has his rifle propped against his shoulder and is making a 'horns' sign with his free hand.",
    sceneryDescription:
      "The third depicts the man standing atop the body of a massive bull, one boot upon the curve of a mighty horn. ",
    location: "LivingQuartersFiveWest",
    vocab: ["bull", "oil", "painting", "picture"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 3,
    itemSize: 2,
    meta: {
      sceneryDescriptionOrder: 5,
    },
  },
  {
    id: "BearPainting",
    name: "bear painting",
    description:
      "The man is standing at the edge of a rocky crag, legs spread, and holding the body of a black bear up over his head, muscles bulging under the weight of it. The painting has to have taken some creative liberties; there's no way that guy lifted that bear. It's pretty bad-ass though.",
    sceneryDescription:
      "The last picture is of the copper haired man, shirtless, using both muscular arms to hold the body of a black bear up over his head.",
    location: "LivingQuartersFiveWest",
    vocab: ["bear", "oil", "painting", "picture"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 3,
    itemSize: 2,
    meta: {
      sceneryDescriptionOrder: 6,
    },
  },
  {
    id: "BottleOfScotch",
    name: "a bottle of scotch",
    description:
      "A tall bottle of dark scotch with a clean label and a heavy glass bottom.",
    describe: (_state, item) => describeScotchBottle(item),
    location: "seeded",
    vocab: ["scotch", "bottle", "whisky", "whiskey", "liquor"],
    itemClass: "liquid",
    itemCategory: "collectable",
    itemWeight: 3,
    itemSize: 2,
    isConsumable: true,
    isContainer: true,
    isOpenable: false,
    doses: 17,
    meta: {
      consumable: {
        kind: "drink",
        perDose: [
          { type: "status", id: "drunk", intensity: 20, duration: 20 },
          {
            type: "message",
            text: "You take a bracing drink of scotch. It burns all the way down.",
          },
        ],
        onEmpty: [{ type: "message", text: "The bottle is empty." }],
      },
    },
  },
  {
    id: "MensLockerKey4",
    name: "blue locker key, labeled '4'",
    description:
      "It's a small key with a blue rubber grip. The grip has the number '4' pressed into it.",
    location: "seeded",
    vocab: ["key", "locker key", "four", "4"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    meta: {
      lockerType: "men",
      lockerIndex: 4,
      kind: "key",
    },
  },
];
