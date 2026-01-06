import { Item } from "@game/types/itemTypes";
import { createLivingQuarter } from "src/world/maps/livingQuartersTemplate";

const OneWestCustomItems: Item[] = [
  // This is a list of any custom items to flesh out the room
];

export const {
  rooms: LivingQuartersOneWestRooms,
  items: LivingQuartersOneWestItems,
} = createLivingQuarter({
  prefix: "OneWest",
  designator: "One West",
  livingRoomId: "LivingQuartersOneWest",
  bedRoomId: "OneWestBed",
  bathRoomId: "OneWestBath",
  corridorRoomId: "LevelThreeCorridorOne",
  corridorDoorId: "DOOR3AW",
  bathDoorId: "OneWestBDoor",
  dirs: {
    livingToCorridorDir: "east",
    bedToLivingDir: "east",
    livingToBedDir: "west",
  },

  livingDescription: `
The living area is crowded with practical furniture and scattered equipment.
A low table is half-covered in parts trays, cables, and a few hand tools.
Folded printouts and thin manuals sit in loose stacks near an open terminal.
Old posters and small decals cling to the walls.
Doors lead east, south, and west.`,

  bathDescription: `
The bathroom is compact and serviceable.
A few personal items sit along the edge of the sink in careful rows.
The air is cool and dry, with faint cleanser underneath the ship’s recycled breath.
A door leads back north.`,

  bedDescription: `
The bedroom is arranged for shared use.
Several cots line the walls, each with a thin blanket and a small storage space beneath.
Lockers and soft bags fill the gaps between frames.
A doorway leads back east.`,

  customItems: OneWestCustomItems,

  fixtureIds: {
    endTableLiving: "OneWestEndtable",
    sofaLiving: "OneWestSofa",
    loveseatLiving: "OneWestLoveseat",
    entertainmentLiving: "OneWestEntertainment",
    bed: "OneWestBedding",
    dresser: "OneWestDresser",
    closet: "OneWestCloset",
    phone: "PHONE1WBed",
    sink: "OneWestSink",
    mirror: "OneWestMirror",
    shower: "OneWestShower",
    washlet: "OneWestBowl",
    medicineChest: "OneWestMedicineChest",
  },

  fixtureText: {
    endTableLiving: {
      description: `
A small rolling side table with a scarred top and a shallow drawer.
The surface is cluttered with a parts tray and a coil of cable.`,
      sceneryDescription: `
A rolling side table sits near the seating, crowded with small gear.`,
      sceneryDescriptionOrder: 0,
    },

    sofaLiving: {
      description: `
A worn sectional with mismatched cushions.
The fabric is clean in spots and shiny in others.`,
      sceneryDescription: `
A sectional sofa occupies most of the seating area.`,
      sceneryDescriptionOrder: 0,
    },

    loveseatLiving: {
      description: `
A compact loveseat with a blanket tossed over one arm.
A couple of small pillows are stacked at one end.`,
      sceneryDescription: `
A loveseat sits beside the sofa, angled toward the far wall.`,
      sceneryDescriptionOrder: 0,
    },

    entertainmentLiving: {
      description: `
A wall-mounted screen with a small stack of components and a docking cradle.
One of the indicator lights is dimly lit.`,
      sceneryDescription: `
Against one wall is a screen and a compact equipment shelf.`,
      sceneryDescriptionOrder: 0,
    },

    bed: {
      description: `
A row of narrow cots with thin mattresses and tight blankets.
Each cot has a small label strip at the frame and storage beneath.`,
      sceneryDescription: `
Several cots line the bedroom walls in a tight arrangement.`,
      sceneryDescriptionOrder: 0,
    },

    dresser: {
      description: `
A set of shared drawers and cubbies with scuffed handles.
A few compartments have simple tags taped to the fronts.`,
      sceneryDescription: `
Along one wall is a shared dresser unit with multiple drawers.`,
      sceneryDescriptionOrder: 0,
    },

    closet: {
      description: `
A tall locker-style closet with a sliding door.
Inside are hanging coveralls and a couple of sealed storage bins.`,
      sceneryDescription: `
Set into the wall is a locker-style closet, its door shut.`,
      sceneryDescriptionOrder: 0,
    },

    phone: {
      description: `
A bedside comm handset with a touch pad and a small message indicator.
Several keys are worn smooth.`,
      sceneryDescription: `
Near the cots is a comm handset, still and dark.`,
      sceneryDescriptionOrder: 0,
      messages: [],
    },

    sink: {
      description: `
A compact sink with a clean basin and cold chrome fixtures.
A few personal items sit along the back edge.`,
      sceneryDescription: `
A small sink sits beneath the mirror.`,
      sceneryDescriptionOrder: 0,
    },

    mirror: {
      description: `
A clean mirror with faint smudges near one corner.
Your reflection looks sharp in the flat light.`,
      sceneryDescription: `
Mounted above the sink is a mirror.`,
      sceneryDescriptionOrder: 0,
    },

    shower: {
      description: `
A shower stall with a translucent door and metal fixtures.
The floor pan is dry.`,
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
The latch closes tightly.`,
      sceneryDescription: `
Above the sink is a medicine chest, shut and centered.`,
      sceneryDescriptionOrder: 0,
    },
  },
});
