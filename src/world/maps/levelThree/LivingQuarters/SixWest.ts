import { Item } from "@game/types/itemTypes";
import { createLivingQuarter } from "src/world/maps/livingQuartersTemplate";

const SixWestCustomItems: Item[] = [
  {
    id: "SixWestBoyfriendBody",
    name: "man's body",
    description: `
He lies collapsed in the shower, shoulders hunched as if he tried to disappear into the corner.
Paint has been smeared across his skin in bright strokes turned ugly under the light.
His wrists are cut; the blood has dried in layered stains that won’t tell you the order of events.
Where his eyes should be is only damage, raw and deliberate.`,
    sceneryDescription: `
In the shower lies a man’s body, slumped against the tile, streaked with paint and dried blood.`,
    location: "SixWestBath",
    vocab: ["man", "body", "corpse", "boyfriend"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 160,
    itemSize: 6,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "SixWestPaintbrush",
    name: "paintbrush",
    description: `
A paintbrush with bristles clotted hard.
The handle has been sharpened down to a brutal point.
Dried paint crusts the wood, and darker stains cling where fingers gripped too tightly.`,
    sceneryDescription: `
Near the shower drain lies a paintbrush, its handle whittled into a sharp point and smeared with paint and blood.`,
    location: "SixWestBath",
    vocab: ["paintbrush", "brush"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "SixWestRazorBlade",
    name: "razor blade",
    description: `
A single razor blade, bare and utilitarian.
One edge is nicked. The metal is spotted with brown that isn’t rust.`,
    sceneryDescription: `
On the bathroom floor, near the shower, a razor blade lies where it fell and stayed.`,
    location: "SixWestBath",
    vocab: ["razor", "blade"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "SixWestPaintSmears",
    name: "paint smears",
    description: `
Color dragged across tile and glass in wide, impatient swipes.
Some strokes are thick enough to hold texture; others are smeared thin, wiped nearly away.
It never resolves into a picture. It only insists something happened.`,
    sceneryDescription: `
Paint is smeared across the shower and nearby surfaces, bright strokes turned grim under the bathroom light.`,
    location: "SixWestBath",
    vocab: ["paint", "smears", "streaks", "color"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "SixWestElliptical",
    name: "elliptical machine",
    description: `
A compact elliptical with clean grips and a small readout panel.
The frame is sturdy and quiet, built for repetition.
A faint saltiness clings to the handles despite the ship’s filtered air.`,
    sceneryDescription: `
Near one wall of the living area stands an elliptical machine, positioned like it belonged in the daily rhythm here.`,
    location: "LivingQuartersSixWest",
    vocab: ["elliptical", "machine", "trainer"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 180,
    itemSize: 7,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isUseable: true,
  },

  {
    id: "SixWestFicus",
    name: "synthetic ficus",
    description: `
A tall synthetic ficus with glossy leaves that never curl or brown.
The trunk is a molded twist meant to look alive.
Dust has gathered in the upper leaves where no one remembered to reach.`,
    sceneryDescription: `
In a large pot stands a synthetic ficus reaching toward the ceiling, too perfect to feel comforting.`,
    location: "LivingQuartersSixWest",
    vocab: ["ficus", "plant", "tree", "synthetic"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 60,
    itemSize: 7,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "SixWestBlackCanvas",
    name: "black canvas",
    description: `
An oil canvas painted entirely black.
The surface is matte in places, glossy in others, as if the paint was applied in layers meant to conceal.
Up close, the finish looks disturbed by faint texture beneath.`,
    sceneryDescription: `
Leaning in the bedroom is a canvas painted solid black, propped as if it was set aside rather than displayed.`,
    location: "SixWestBed",
    vocab: ["canvas", "painting", "black"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 8,
    itemSize: 4,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    meta: {
      kind: "puzzle",
      puzzleKey: "BlackCanvas",
      note: "Hidden content under paint; intended to be revealed by scanning.",
    },
  },
  {
    id: "SixWestGameConsole",
    name: "game console",
    description: `
A compact game console with a dark casing and a single status light.
The ports are clean. The power button gives no response.`,
    sceneryDescription: `
Beneath the entertainment unit sits a small game console, tucked neatly into place.`,
    location: "LivingQuartersSixWest",
    vocab: ["console", "game", "system"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 7,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isUseable: true,
  },
];

export const {
  rooms: LivingQuartersSixWestRooms,
  items: LivingQuartersSixWestItems,
} = createLivingQuarter({
  prefix: "SixWest",
  designator: "Six West",
  livingRoomId: "LivingQuartersSixWest",
  bedRoomId: "SixWestBed",
  bathRoomId: "SixWestBath",
  corridorRoomId: "LevelThreeCorridorSixPointSix",
  corridorDoorId: "DOOR3FW",
  bathDoorId: "SixWestBDoor",
  dirs: {
    livingToCorridorDir: "east",
    bedToLivingDir: "east",
    livingToBedDir: "west",
    livingToBathDir: "north",
    bathToLivingDir: "south",
  },
  livingDescription: `
The space is kept with practiced care, the kind that turns routine into a shield.
The air holds a clean edge beneath the ship’s stale breath, like someone fought hard to keep things bright.
Nothing looks broken. Nothing looks overturned.
The quiet sits too neatly in the corners.
Doors lead west, south, and east.`,
  bathDescription: `
The bathroom is bright and close, the light flattening every surface.
The air feels cold here, as if the room never warmed again after being used.
The ship’s hum is sharper in the silence.
A door leads back north.`,
  bedDescription: `
The bedroom is orderly and spare, arranged as if clutter was an enemy.
The air smells faintly of fabric and something clean, not quite pleasant.
Even here, the ship’s stillness feels watched.
A doorway leads back west.`,

  customItems: SixWestCustomItems,

  fixtureIds: {
    endTableLiving: "SixWestEndtable",
    sofaLiving: "SixWestSofa",
    loveseatLiving: "SixWestLoveseat",
    entertainmentLiving: "SixWestEntertainment",
    bed: "SixWestBedding",
    dresser: "SixWestDresser",
    closet: "SixWestCloset",
    phone: "PHONE6EBed",
    sink: "SixWestSink",
    mirror: "SixWestMirror",
    shower: "SixWestShower",
    washlet: "SixWestBowl",
    medicineChest: "SixWestMedicineChest",
  },

  fixtureText: {
    endTableLiving: {
      description: `
A low end table with a smooth top and a shallow drawer.
The surface has been wiped clean, leaving faint circular marks.`,
      sceneryDescription: `
Near the seating area sits a small end table, aligned with careful intent.`,
      sceneryDescriptionOrder: 0,
    },
    sofaLiving: {
      description: `
A modern sofa upholstered in dark fabric.
The cushions are firm and neatly set, showing more maintenance than comfort.`,
      sceneryDescription: `
A sofa faces the far wall, kept straight as if alignment mattered.`,
      sceneryDescriptionOrder: 0,
    },
    loveseatLiving: {
      description: `
A matching loveseat, compact and clean-lined.
The fabric is barely worn, the cushions squared and tidy.`,
      sceneryDescription: `
Beside the sofa sits a loveseat, positioned close enough for shared evenings.`,
      sceneryDescriptionOrder: 0,
    },
    entertainmentLiving: {
      description: `
An entertainment unit with a silent screen and neatly arranged components.
A game console is housed within the lower bay, its light dark.`,
      sceneryDescription: `
Against one wall stands an entertainment center, dormant and watchful.`,
      sceneryDescriptionOrder: 0,
    },

    bed: {
      description: `
A neatly made bed with tight corners.
The sheets are cool and undisturbed, left in mid-routine.`,
      sceneryDescription: `
The bed sits centered in the room, made with precision.`,
      sceneryDescriptionOrder: 0,
    },
    dresser: {
      description: `
A dresser with clean lines and quiet drawers.
The top is bare, the wood faintly scented with polish.`,
      sceneryDescription: `
Along one wall sits a dresser, closed and orderly.`,
      sceneryDescriptionOrder: 0,
    },
    closet: {
      description: `
A narrow closet with a sliding door.
Inside, the air smells faintly of fabric and dry cleaner solvent.`,
      sceneryDescription: `
Set into the wall is a closet, its door shut tight.`,
      sceneryDescriptionOrder: 0,
    },
    phone: {
      description: `
A bedside phone with a touch pad and a small message indicator.
Several keys are worn smooth by repeated use.`,
      sceneryDescription: `
Near the bed sits a phone, still and dark.`,
      sceneryDescriptionOrder: 0,
    },

    sink: {
      description: `
A compact sink with a spotless basin and cold chrome fixtures.
The drain is dry, the surface wiped clean.`,
      sceneryDescription: `
A small sink sits beneath the mirror, cleaned to a dull shine.`,
      sceneryDescriptionOrder: 0,
    },
    mirror: {
      description: `
A clean mirror that reflects you plainly.
Your face looks too sharp in the flat light.`,
      sceneryDescription: `
Mounted above the sink is a mirror, unmarked and still.`,
      sceneryDescriptionOrder: 0,
    },
    shower: {
      description: `
A shower stall with a translucent door and cold metal fixtures.
The interior is dry where it shouldn’t be.`,
      sceneryDescription: `
A shower occupies the corner, the door closed.`,
      sceneryDescriptionOrder: 0,
    },
    washlet: {
      description: `
A combination toilet and bidet with a small side-mounted control panel.
The buttons are clean, the panel dark.`,
      sceneryDescription: `
The washlet sits against the wall, pristine and silent.`,
      sceneryDescriptionOrder: 0,
    },
    medicineChest: {
      description: `
A wall-mounted medicine chest with a mirrored front and a thin latch.
It closes with a soft click.`,
      sceneryDescription: `
Above the sink is a medicine chest, shut tight.`,
      sceneryDescriptionOrder: 0,
    },
  },
});
