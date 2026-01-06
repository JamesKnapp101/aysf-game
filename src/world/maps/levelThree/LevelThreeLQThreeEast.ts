// import { Item } from "@game/types/itemTypes";
// import { createLivingQuarter } from "src/world/maps/livingQuartersTemplate";

// const ThreeEastCustomItems: Item[] = [
//   {
//     id: "ThreeEastWatercolorCanvas",
//     name: "watercolor canvas",
//     description: `
// A large watercolor painting stretched across a wooden frame.
// The image shows two figures reaching toward one another, their hands nearly touching.
// The lower figure is unfinished, with pencil lines still visible.`,
//     location: "LivingQuartersThreeEast",
//     vocab: [],
//     itemClass: "solid",
//     itemCategory: "scenery",
//     itemWeight: 0,
//     itemSize: 0,
//   },
//   {
//     id: "ThreeEastToolRack",
//     name: "tool rack",
//     description: `
// A wall-mounted rack holding chisels, clamps, and measuring tools.
// Each tool is cleaned and returned to a marked slot.`,
//     location: "LivingQuartersThreeEast",
//     vocab: [],
//     itemClass: "solid",
//     itemCategory: "scenery",
//     itemWeight: 0,
//     itemSize: 0,
//   },
//   {
//     id: "ThreeEastPaintTray",
//     name: "paint tray",
//     description: `
// A shallow tray holding watercolor pans in muted tones.
// Several wells are darkened with recent use.`,
//     location: "LivingQuartersThreeEast",
//     vocab: [],
//     itemClass: "solid",
//     itemCategory: "scenery",
//     itemWeight: 0,
//     itemSize: 0,
//   },
// ];

// export const {
//   rooms: LivingQuartersThreeEastRooms,
//   items: LivingQuartersThreeEastItems,
// } = createLivingQuarter({
//   prefix: "ThreeEast",
//   designator: "Three East",
//   livingRoomId: "LivingQuartersThreeEast",
//   bedRoomId: "ThreeEastBed",
//   bathRoomId: "ThreeEastBath",
//   corridorRoomId: "LevelThreeCorridorThree",
//   corridorDoorId: "DOOR3CE",
//   bathDoorId: "ThreeEastBDoor",
//   dirs: {
//     livingToCorridorDir: "west",
//     bedToLivingDir: "west",
//     livingToBedDir: "east",
//   },

//   livingDescription: `
// The living area is furnished almost entirely with wooden pieces.
// A hand-built table sits near the center, its surface clear except for art supplies.
// Shelves and cabinets line the walls, their grain patterns varied but deliberate.
// Doors lead west, south, and east.`,

//   bathDescription: `
// The bathroom is simple and well kept.
// Wooden accents frame the sink and mirror.
// The air is clean and lightly scented.
// A door leads back north.`,

//   bedDescription: `
// The bedroom is warm with polished wood and soft textiles.
// A solid bed frame anchors the room, flanked by matching side tables.
// A doorway leads back west.`,

//   customItems: ThreeEastCustomItems,

//   fixtureIds: {
//     endTableLiving: "ThreeEastEndtable",
//     sofaLiving: "ThreeEastSofa",
//     loveseatLiving: "ThreeEastLoveseat",
//     entertainmentLiving: "ThreeEastEntertainment",
//     bed: "ThreeEastBedding",
//     dresser: "ThreeEastDresser",
//     closet: "ThreeEastCloset",
//     phone: "PHONE3EBed",
//     sink: "ThreeEastSink",
//     mirror: "ThreeEastMirror",
//     shower: "ThreeEastShower",
//     washlet: "ThreeEastBowl",
//     medicineChest: "ThreeEastMedicineChest",
//   },

//   fixtureText: {
//     endTableLiving: {
//       description: `
// A small wooden end table with visible joinery.
// The surface is smooth and lightly varnished.`,
//       sceneryDescription: `
// A handmade end table sits beside the seating.`,
//       sceneryDescriptionOrder: 0,
//     },

//     sofaLiving: {
//       description: `
// A cushioned sofa set into a wooden frame.
// The armrests are worn smooth by use.`,
//       sceneryDescription: `
// A wooden-framed sofa rests against one wall.`,
//       sceneryDescriptionOrder: 0,
//     },

//     loveseatLiving: {
//       description: `
// A matching loveseat with fitted cushions.
// The wood grain along the back is carefully matched.`,
//       sceneryDescription: `
// A loveseat sits opposite the sofa.`,
//       sceneryDescriptionOrder: 0,
//     },

//     entertainmentLiving: {
//       description: `
// A low wooden console with a built-in screen compartment.
// The doors slide flush when closed.`,
//       sceneryDescription: `
// An entertainment console sits against the far wall.`,
//       sceneryDescriptionOrder: 0,
//     },

//     bed: {
//       description: `
// A solid wooden bed frame with a carved headboard.
// The sheets are neatly arranged.`,
//       sceneryDescription: `
// The bed occupies the center of the bedroom.`,
//       sceneryDescriptionOrder: 0,
//     },

//     dresser: {
//       description: `
// A wide dresser made from matched planks.
// The drawers slide smoothly and quietly.`,
//       sceneryDescription: `
// A wooden dresser stands along one wall.`,
//       sceneryDescriptionOrder: 0,
//     },

//     closet: {
//       description: `
// A wooden sliding-door closet with a cedar scent inside.
// Clothes are hung evenly along a single rail.`,
//       sceneryDescription: `
// A wooden closet is set into the wall.`,
//       sceneryDescriptionOrder: 0,
//     },

//     phone: {
//       description: `
// A bedside phone resting on a wooden table.
// The surface beneath it shows faint tool marks.`,
//       sceneryDescription: `
// A phone sits on the bedside table.`,
//       sceneryDescriptionOrder: 0,
//       messages: [],
//     },

//     sink: {
//       description: `
// A compact sink set into a wooden counter.
// The basin is clean and dry.`,
//       sceneryDescription: `
// A sink is mounted beneath the mirror.`,
//       sceneryDescriptionOrder: 0,
//     },

//     mirror: {
//       description: `
// A rectangular mirror framed in polished wood.
// The glass is clear and unmarked.`,
//       sceneryDescription: `
// A wooden-framed mirror hangs above the sink.`,
//       sceneryDescriptionOrder: 0,
//     },

//     shower: {
//       description: `
// A shower stall with a frosted door and metal fixtures.
// The interior is dry.`,
//       sceneryDescription: `
// A shower occupies the corner of the room.`,
//       sceneryDescriptionOrder: 0,
//     },

//     washlet: {
//       description: `
// A combination toilet and bidet with a side control panel.
// The surface is clean and warm to the touch.`,
//       sceneryDescription: `
// The washlet sits against the wall.`,
//       sceneryDescriptionOrder: 0,
//     },

//     medicineChest: {
//       description: `
// A small wooden medicine chest with a mirrored front.
// The hinge closes softly.`,
//       sceneryDescription: `
// A medicine chest is mounted above the sink.`,
//       sceneryDescriptionOrder: 0,
//     },
//   },
// });
