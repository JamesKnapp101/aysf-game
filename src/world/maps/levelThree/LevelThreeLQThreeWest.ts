// import { Item } from "@game/types/itemTypes";
// import { createLivingQuarter } from "src/world/maps/livingQuartersTemplate";

// const ThreeWestCustomItems: Item[] = [
//   {
//     id: "ThreeWestSharedWardrobe",
//     name: "shared wardrobe",
//     description: `
// A wide open wardrobe with neatly arranged clothing.
// Colors and styles repeat across sections, differing only in size.`,
//     itemCategory: "scenery",
//     location: "ThreeWestBed",
//     vocab: [],
//     itemClass: "solid",
//     itemWeight: 0,
//     itemSize: 0,
//   },
//   {
//     id: "ThreeWestBarCart",
//     name: "bar cart",
//     description: `
// A polished metal bar cart holding bottles, glasses, and mixers.
// Everything is arranged with deliberate symmetry.`,
//     itemCategory: "scenery",
//     location: "LivingQuartersThreeWest",
//     vocab: [],
//     itemClass: "solid",
//     itemWeight: 0,
//     itemSize: 0,
//   },
//   {
//     id: "ThreeWestMirrorWall",
//     name: "mirrored wall",
//     description: `
// A full-height mirror panel covering one wall.
// The reflections multiply the room’s furnishings.`,
//     itemCategory: "scenery",
//     location: "ThreeWestBed",
//     vocab: [],
//     itemClass: "solid",
//     itemWeight: 0,
//     itemSize: 0,
//   },
//   {
//     id: "ThreeWestFloorCushions",
//     name: "floor cushions",
//     description: `
// A loose grouping of oversized cushions in rich fabrics.
// The surfaces show shallow impressions.`,
//     itemCategory: "scenery",
//     location: "LivingQuartersThreeWest",
//     vocab: [],
//     itemClass: "solid",
//     itemWeight: 0,
//     itemSize: 0,
//   },
// ];

// export const {
//   rooms: LivingQuartersThreeWestRooms,
//   items: LivingQuartersThreeWestItems,
// } = createLivingQuarter({
//   prefix: "ThreeWest",
//   designator: "Three West",
//   livingRoomId: "LivingQuartersThreeWest",
//   bedRoomId: "ThreeWestBed",
//   bathRoomId: "ThreeWestBath",
//   corridorRoomId: "LevelThreeCorridorThree",
//   corridorDoorId: "DOOR3CW",
//   bathDoorId: "ThreeWestBDoor",
//   dirs: {
//     livingToCorridorDir: "east",
//     bedToLivingDir: "east",
//     livingToBedDir: "west",
//   },

//   livingDescription: `
// The living area is furnished with plush seating and reflective surfaces.
// Low tables hold glassware, candles, and folded fabrics.
// Soft lighting is built into shelves and wall panels.
// Doors lead east, south, and west.`,

//   bathDescription: `
// The bathroom is finished with stone and dark metal fixtures.
// Thick towels are stacked along one wall.
// The air is warm and lightly scented.
// A door leads back north.`,

//   bedDescription: `
// The bedroom is dominated by a large shared bed.
// Mirrors, draped fabrics, and low lighting fill the space.
// Personal items are arranged together rather than separated.
// A doorway leads back east.`,

//   customItems: ThreeWestCustomItems,

//   fixtureIds: {
//     endTableLiving: "ThreeWestEndtable",
//     sofaLiving: "ThreeWestSofa",
//     loveseatLiving: "ThreeWestLoveseat",
//     entertainmentLiving: "ThreeWestEntertainment",
//     bed: "ThreeWestBedding",
//     dresser: "ThreeWestDresser",
//     closet: "ThreeWestCloset",
//     phone: "PHONE3WBed",
//     sink: "ThreeWestSink",
//     mirror: "ThreeWestMirror",
//     shower: "ThreeWestShower",
//     washlet: "ThreeWestBowl",
//     medicineChest: "ThreeWestMedicineChest",
//   },

//   fixtureText: {
//     endTableLiving: {
//       description: `
// A lacquered side table with a reflective surface.
// A pair of glasses rests near the edge.`,
//       sceneryDescription: `
// A glossy side table sits near the seating.`,
//       sceneryDescriptionOrder: 0,
//     },

//     sofaLiving: {
//       description: `
// A deep sofa upholstered in dark fabric.
// The cushions are broad and soft.`,
//       sceneryDescription: `
// A large sofa anchors the seating area.`,
//       sceneryDescriptionOrder: 0,
//     },

//     loveseatLiving: {
//       description: `
// A low loveseat with smooth upholstery.
// The seat is wide enough to share.`,
//       sceneryDescription: `
// A loveseat sits angled toward the sofa.`,
//       sceneryDescriptionOrder: 0,
//     },

//     entertainmentLiving: {
//       description: `
// A sleek console with a recessed screen and hidden speakers.
// The surface is free of clutter.`,
//       sceneryDescription: `
// An entertainment console lines one wall.`,
//       sceneryDescriptionOrder: 0,
//     },

//     bed: {
//       description: `
// A wide bed with layered sheets and pillows.
// The frame is low and padded.`,
//       sceneryDescription: `
// A large bed fills the center of the bedroom.`,
//       sceneryDescriptionOrder: 0,
//     },

//     dresser: {
//       description: `
// A long dresser with shared drawers.
// Accessories and jewelry are arranged across the top.`,
//       sceneryDescription: `
// A dresser stretches along one wall.`,
//       sceneryDescriptionOrder: 0,
//     },

//     closet: {
//       description: `
// An open closet system with coordinated clothing.
// Shoes and accessories are grouped by type.`,
//       sceneryDescription: `
// An open closet occupies one side of the room.`,
//       sceneryDescriptionOrder: 0,
//     },

//     phone: {
//       description: `
// A bedside phone resting on a low table.
// The screen is dark.`,
//       sceneryDescription: `
// A phone sits near the bed.`,
//       sceneryDescriptionOrder: 0,
//       messages: [],
//     },

//     sink: {
//       description: `
// A wide sink set into a stone counter.
// Multiple personal items share the space.`,
//       sceneryDescription: `
// A sink spans the counter beneath the mirror.`,
//       sceneryDescriptionOrder: 0,
//     },

//     mirror: {
//       description: `
// A broad mirror with a thin metal frame.
// The surface is spotless.`,
//       sceneryDescription: `
// A mirror covers much of the wall above the sink.`,
//       sceneryDescriptionOrder: 0,
//     },

//     shower: {
//       description: `
// A large walk-in shower with glass walls.
// Several controls are mounted along one side.`,
//       sceneryDescription: `
// A glass shower enclosure fills the corner.`,
//       sceneryDescriptionOrder: 0,
//     },

//     washlet: {
//       description: `
// A modern washlet with a side-mounted control panel.
// The finish is matte and clean.`,
//       sceneryDescription: `
// The washlet sits against the wall.`,
//       sceneryDescriptionOrder: 0,
//     },

//     medicineChest: {
//       description: `
// A wide mirrored cabinet with internal lighting.
// Shelves inside hold shared toiletries.`,
//       sceneryDescription: `
// A mirrored cabinet is mounted above the sink.`,
//       sceneryDescriptionOrder: 0,
//     },
//   },
// });
