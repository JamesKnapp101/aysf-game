import { Item } from "@game/types/itemTypes";
import { createLivingQuarter } from "src/world/maps/livingQuartersTemplate";

const FourEastCustomItems: Item[] = [
  {
    id: "FourEastBareFloorPanel",
    name: "removed floor panel",
    description: `
A rectangular floor panel has been lifted out and set aside.
The opening exposes a shallow service bay beneath the deck plating.`,
    itemCategory: "scenery",
    location: "FourEastBed",
    vocab: [],
    itemClass: "solid",
    itemWeight: 0,
    itemSize: 0,
  },
  {
    id: "FourEastExposedWiring",
    name: "exposed wires",
    description: `
A bundle of insulated wires has been pulled up from the service bay.
Several leads are separated and held in place with small clamps.`,
    itemCategory: "scenery",
    location: "FourEastBed",
    vocab: [],
    itemClass: "solid",
    itemWeight: 0,
    itemSize: 0,
  },
  {
    id: "FourEastWireClamps",
    name: "wire clamps",
    description: `
Small metal clamps grip the wires to keep them from slipping back into the bay.
Their edges are smooth and unmarked.`,
    itemCategory: "scenery",
    location: "FourEastBed",
    vocab: [],
    itemClass: "solid",
    itemWeight: 0,
    itemSize: 0,
  },
  {
    id: "FourEastServiceTool",
    name: "service tool",
    description: `
A compact tool with a folding handle and multiple tips.
The casing is plain and free of markings.`,
    location: "FourEastBed",
    vocab: [],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
  },
];

export const {
  rooms: LivingQuartersFourEastRooms,
  items: LivingQuartersFourEastItems,
} = createLivingQuarter({
  prefix: "FourEast",
  designator: "Four East",
  livingRoomId: "LivingQuartersFourEast",
  bedRoomId: "FourEastBed",
  bathRoomId: "FourEastBath",
  corridorRoomId: "LevelThreeCorridorFour",
  corridorDoorId: "DOOR3DE",
  bathDoorId: "FourEastBDoor",
  dirs: {
    livingToCorridorDir: "west",
    bedToLivingDir: "west",
    livingToBedDir: "east",
    livingToBathDir: "north",
    bathToLivingDir: "south",
  },

  livingDescription: `
The living area is empty and clean.
The deck is bare, the walls clear, and the corners free of dust.
Only the ship’s hum and ventilation are present.
Doors lead west, south, and east.`,

  bathDescription: `
The bathroom is clean and unused.
The fixtures are dry, the counter bare, and the mirror clear.
A door leads back north.`,

  bedDescription: `
The bedroom is empty and clean.
One floor panel has been removed, exposing a service bay beneath.
A bundle of wires has been pulled up from the opening.
A doorway leads back west.`,

  customItems: FourEastCustomItems,

  fixtureIds: {
    endTableLiving: "FourEastEndtable",
    sofaLiving: "FourEastSofa",
    loveseatLiving: "FourEastLoveseat",
    entertainmentLiving: "FourEastEntertainment",
    bed: "FourEastBedding",
    dresser: "FourEastDresser",
    closet: "FourEastCloset",
    phone: "PHONE4EBed",
    sink: "FourEastSink",
    mirror: "FourEastMirror",
    shower: "FourEastShower",
    washlet: "FourEastBowl",
    medicineChest: "FourEastMedicineChest",
  },

  fixtureText: {
    endTableLiving: {
      description: `
There is no end table here.`,
      sceneryDescription: `
The space where an end table would normally sit is empty.`,
      sceneryDescriptionOrder: 0,
    },

    sofaLiving: {
      description: `
There is no sofa here.`,
      sceneryDescription: `
The living area has no seating.`,
      sceneryDescriptionOrder: 0,
    },

    loveseatLiving: {
      description: `
There is no loveseat here.`,
      sceneryDescription: `
The room is devoid of furniture.`,
      sceneryDescriptionOrder: 0,
    },

    entertainmentLiving: {
      description: `
There is no entertainment unit here.`,
      sceneryDescription: `
One wall is bare where an entertainment unit would normally be.`,
      sceneryDescriptionOrder: 0,
    },

    bed: {
      description: `
There is no bed here.`,
      sceneryDescription: `
The bedroom contains no bed or bedding.`,
      sceneryDescriptionOrder: 0,
    },

    dresser: {
      description: `
There is no dresser here.`,
      sceneryDescription: `
The wall space is clear where a dresser would normally stand.`,
      sceneryDescriptionOrder: 0,
    },

    closet: {
      description: `
The closet is empty.
The interior is clean and dry.`,
      sceneryDescription: `
A closet is set into the wall, its interior empty.`,
      sceneryDescriptionOrder: 0,
    },

    phone: {
      description: `
There is no phone here.`,
      sceneryDescription: `
No phone is present.`,
      sceneryDescriptionOrder: 0,
      messages: [],
    },

    sink: {
      description: `
A compact sink with a clean basin and cold chrome fixtures.
The drain is dry and the counter is bare.`,
      sceneryDescription: `
A small sink sits beneath the mirror.`,
      sceneryDescriptionOrder: 0,
    },

    mirror: {
      description: `
A clean mirror with no spots or streaks.
The glass is clear.`,
      sceneryDescription: `
Mounted above the sink is a mirror, unmarked and still.`,
      sceneryDescriptionOrder: 0,
    },

    shower: {
      description: `
A shower stall with a translucent door and metal fixtures.
Everything inside is dry.`,
      sceneryDescription: `
A shower occupies the corner, the door closed.`,
      sceneryDescriptionOrder: 0,
    },

    washlet: {
      description: `
A combination toilet and bidet with a small side control panel.
The buttons are clean and slightly worn.`,
      sceneryDescription: `
The washlet sits against the wall.`,
      sceneryDescriptionOrder: 0,
    },

    medicineChest: {
      description: `
A wall-mounted medicine chest with a mirrored front.
It closes tightly.`,
      sceneryDescription: `
Above the sink is a medicine chest, shut and centered.`,
      sceneryDescriptionOrder: 0,
    },
  },
});
