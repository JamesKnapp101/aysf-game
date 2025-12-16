import type { Item } from "../../../game/types/itemTypes";
import { createLivingQuarter } from "../../maps/livingQuartersTemplate";

const SixWestCustomItems: Item[] = [
  {
    id: "SixWestWetBar",
    name: "wet bar",
    description: `
A built-in wet bar with a small counter and cabinet doors below.
The finish is immaculate, the handles polished.
The sink is dry and the glassware is put away.`,
    sceneryDescription: `
Along one wall is a wet bar, kept with careful pride.`,
    location: "LivingQuartersSixWest",
    vocab: ["wet", "bar", "counter", "cabinet"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 250,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: true,
    capacity: 12,
    isSurface: true,
    capacityOn: 4,
  },
  {
    id: "SixWestBourbon",
    name: "bottle of bourbon",
    description: `
A heavy glass bottle with a paper label and a sealed cap.
The amber liquid inside catches the light without warmth.`,
    location: "SixWestWetBar",
    vocab: ["bourbon", "bottle"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 3,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "SixWestScotch",
    name: "bottle of scotch",
    description: `
A tall bottle with a clean label and an unbroken seal.
The glass is clear, the contents dark.`,
    location: "SixWestWetBar",
    vocab: ["scotch", "bottle"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 3,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    doses: 5,
    meta: {
      consumable: {
        kind: "drink",
        perDose: [
          { type: "status", id: "drunk", intensity: 15, duration: 600 },
          {
            type: "message",
            text: "The burn hits first, then the warmth. Not bad!",
          },
        ],
        onEmpty: [{ type: "message", text: "It's empty." }],
      },
    },
  },
  {
    id: "SixWestBeer",
    name: "bottle of beer",
    description: `
A brown glass bottle, unopened.
Condensation never formed; it was never chilled long enough to matter.`,
    location: "SixWestWetBar",
    vocab: ["beer", "bottle"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "SixWestWineRack",
    name: "wine rack",
    description: `
A compact wine rack holding a few dark bottles.
The wood is clean and the slots are dusted, maintained out of habit.`,
    sceneryDescription: `
Near the living area is a small wine rack, arranged with quiet care.`,
    location: "LivingQuartersSixWest",
    vocab: ["wine", "rack", "bottles"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 40,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 6,
  },
  {
    id: "SixWestWine1",
    name: "bottle of wine",
    description: `
A dark bottle with a crisp label and an intact foil seal.
The cork has never been touched.`,
    location: "SixWestWineRack",
    vocab: ["wine", "bottle"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 3,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    meta: { wine: "snooty-1" },
  },
  {
    id: "SixWestWine2",
    name: "bottle of wine",
    description: `
A dark bottle with a narrow neck and a pristine label.
The seal is unbroken.`,
    location: "SixWestWineRack",
    vocab: ["wine", "bottle"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 3,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    meta: { wine: "snooty-2" },
  },
  {
    id: "SixWestWine3",
    name: "bottle of wine",
    description: `
A bottle with a heavy punt and an immaculate foil wrap.
It looks chosen to impress someone who would notice.`,
    location: "SixWestWineRack",
    vocab: ["wine", "bottle"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 3,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    meta: { wine: "snooty-3" },
  },
  {
    id: "SixWestCologne",
    name: "bottle of cologne",
    description: `
A glass bottle with a metal atomizer and a clean label.
The scent that clings to it is sharp and expensive.`,
    sceneryDescription: `
On the bathroom counter sits a bottle of cologne, placed squarely as if it mattered.`,
    location: "SixWestBath",
    vocab: ["cologne", "bottle"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "SixWestShavingKit",
    name: "shaving kit",
    description: `
A compact kit with neatly arranged tools.
Everything is cleaned, dried, and returned to place.`,
    sceneryDescription: `
Near the sink is a shaving kit, laid out with careful order.`,
    location: "SixWestBath",
    vocab: ["shaving", "kit", "razor", "brush"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 2,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "SixWestPotpourriBasket",
    name: "wicker basket",
    description: `
A small wicker basket filled with dried petals and curled leaves.
The scent is sweet, dusty, and wrong in recycled air.`,
    sceneryDescription: `
On the back of the washlet sits a wicker basket of potpourri, placed like an apology for the sterile light.`,
    location: "SixWestBath",
    vocab: ["wicker", "basket", "potpourri", "petals"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "SixWestBedroomEye",
    name: "painted eye",
    description: `
A massive eye painted across the ceiling.
The sclera is bloodshot with red veins worked in too carefully.
The iris is layered dark, as if the painter kept trying to reach the same depth and never could.`,
    sceneryDescription: `
Across the bedroom ceiling is a painted eye, bloodshot and enormous, staring straight down.`,
    location: "SixWestBed",
    vocab: ["eye", "painted", "ceiling", "bloodshot"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "SixWestWallScribbles",
    name: "painted scribbles",
    description: `
The walls are covered in symbols and lines that refuse to become language.
Some marks are careful, repeated as if rehearsed.
Others are slashed on in uneven strokes that look like panic made visible.`,
    sceneryDescription: `
The bedroom walls are scrawled with painted symbols, arrows, and circles, layered over and over.`,
    location: "SixWestBed",
    vocab: ["scribbles", "symbols", "marks", "paint", "writing"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "SixWestBedroomLamps",
    name: "lamps",
    description: `
A set of lamps arranged to flood the room with light.
The glow is harsh and constant, flattening shadows into thin stains.
They feel less decorative than defensive.`,
    sceneryDescription: `
Several lamps brighten the bedroom far beyond the rest of the unit, as if darkness was not allowed here.`,
    location: "SixWestBed",
    vocab: ["lamp", "lamps", "light", "lights"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 3,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    providesLight: true,
  },
  {
    id: "SixWestDiary",
    name: "scribbled diary",
    description: `
A thin diary with a warped cover and pages swollen slightly at the edges.
The handwriting is tight, repeated, corrected over itself.
Ink has bled through in places, as if the pen never stopped long enough to dry.`,
    readableText: `
[Entry: 87.14]
It wasn’t always like this. I know that. The ship used to feel empty in the normal way—just metal and distance.
Now there is attention in the walls. Not sound. Not movement. Attention.

[Entry: 87.19]
I tried to say it out loud today. I watched their faces change the moment I did.
They want it to be dreams, or stress, or loneliness. It isn’t.
There is a pattern to the anomalies. A shape, if you stop pretending you don’t see it.
Even she looked at me like I’d broken.

[Entry: 87.24]
Something is trying to speak. Not in words.
It’s like pressure behind the eyes, like a rhythm under the hum of the ship.
I can’t tell who else hears it. I have to be careful.
If they decide I’m unstable, they’ll put me somewhere I can’t watch back.

[Entry: 87.31]
The dream again.
A dark plain with no horizon. I walk until I forget why I started.
A man stands there—featureless, smooth, like a mannequin without seams.
He extends his hand. When I take it, our hands merge, skin to skin to something else.
My fingers dissolve. My face goes next. Then even the idea of my shape feels borrowed.

[Entry: 88.03]
They put her across from me. Of course they did.
She says it was her choice, concern, love—words people use to hide motives.
Her boyfriend watches me too long. Too still.
I keep hearing that rhythm when he’s nearby, like the ship is listening through him.

[Entry: 88.09]
I brought them evidence. Real evidence.
A fluctuation on the instruments that shouldn’t be possible, a spike that repeats when I repeat the tests.
They dismissed it like I’d brought them a ghost story.
I am watching the numbers grow more intense. They are choosing blindness.
If this turns violent, it won’t be because I didn’t warn them.

[Entry: 88.15]
I hate admitting this, but there is a thread of hope.
The boyfriend—idiot, posturing, empty—he flinched today at the same moment I felt the pressure.
He looked around like he was searching for the source.
Maybe he hears it too. Maybe I’m not alone in this. Maybe that’s why it chose to get close.`,
    sceneryDescription: `
Partly hidden beneath the bed is a thin diary, shoved back as if it was meant to stay out of sight.`,
    location: "SixWestBed",
    vocab: ["diary", "journal", "scribbles", "book"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: true,
    isContainer: false,
    meta: {
      hiddenUnder: "SixWestBedding",
      kind: "diary",
    },
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
  corridorRoomId: "LevelThreeCorridorSix",
  corridorDoorId: "DOOR3FW",
  bathDoorId: "SixWestBDoor",
  dirs: {
    livingToCorridorDir: "east",
    bedToLivingDir: "east",
    livingToBedDir: "west",
  },
  livingDescription: `
The living area is clean and composed, arranged like someone cared how it looked from the doorway.
The air holds a faint trace of something sweet and dry beneath the ship’s recycled breath.
Nothing appears disturbed. Nothing appears hurried.
The silence feels practiced.
Doors lead east, south, and west.`,
  bathDescription: `
The bathroom is orderly and functional, maintained by habit.
The light is flat, the air cool, the surfaces wiped down until they give no stories away.
Even so, the room feels used too often, too carefully.
A door leads back north.`,
  bedDescription: `
The bedroom is bright and uncomfortable in its clarity.
Paint and light compete for the walls, leaving no place for your eyes to rest.
The ship’s hum feels louder here, as if the room is tuned to it.
A doorway leads back east.`,

  customItems: SixWestCustomItems,
  fixtureIds: {
    endTableLiving: "SixWestEndtable",
    sofaLiving: "SixWestSofa",
    loveseatLiving: "SixWestLoveseat",
    entertainmentLiving: "SixWestEntertainment",
    bed: "SixWestBedding",
    dresser: "SixWestDresser",
    closet: "SixWestCloset",
    phone: "PHONE6WBed",
    sink: "SixWestSink",
    mirror: "SixWestMirror",
    shower: "SixWestShower",
    washlet: "SixWestBowl",
    medicineChest: "SixWestMedicineChest",
  },
  fixtureText: {
    endTableLiving: {
      description: `
A small end table with a smooth top and a single drawer.
The surface is bare, wiped clean.`,
      sceneryDescription: `
Near the seating area sits an end table, squared to the room.`,
    },
    sofaLiving: {
      description: `
A neutral sofa with firm cushions and clean seams.
It looks chosen for appearance first.`,
      sceneryDescription: `
A sofa faces the far wall, aligned as if measured into place.`,
    },
    loveseatLiving: {
      description: `
A matching loveseat, compact and minimally worn.
The fabric is clean, the cushions squared.`,
      sceneryDescription: `
Beside the sofa sits a loveseat, close enough to imply company.`,
    },
    entertainmentLiving: {
      description: `
An entertainment unit with a silent screen and neatly stacked components.
The display reflects only dim shapes.`,
      sceneryDescription: `
Against one wall stands an entertainment center, dormant and dark.`,
    },
    bed: {
      description: `
A neatly made bed with covers pulled tight.
The sheets are cool and undisturbed.`,
      sceneryDescription: `
The bed sits centered beneath the ceiling, arranged with rigid neatness.`,
    },
    dresser: {
      description: `
A wooden dresser with drawers that close flush and quietly.
The surface smells faintly of polish.`,
      sceneryDescription: `
Along one wall sits a dresser, closed tight.`,
    },
    closet: {
      description: `
A narrow closet with a sliding door.
Inside, the air is dry and faintly scented.`,
      sceneryDescription: `
Set into the wall is a closet, its door shut.`,
    },
    phone: {
      description: `
A bedside phone with a touch pad and a small message indicator.
Several keys are worn smooth.`,
      sceneryDescription: `
Near the bed sits a phone, still and dark.`,
      // messages: [] // add later
    },

    sink: {
      description: `
A compact sink with a clean basin and cold chrome fixtures.
The drain is dry.`,
      sceneryDescription: `
A small sink sits beneath the mirror, maintained with habitual care.`,
    },
    mirror: {
      description: `
A clean mirror with no spots or streaks.
Your reflection looks too sharp in the flat light.`,
      sceneryDescription: `
Mounted above the sink is a mirror, unmarked and still.`,
    },
    shower: {
      description: `
A shower stall with a translucent door and cold metal fixtures.
Everything inside is dry.`,
      sceneryDescription: `
A shower occupies the corner, the door closed.`,
    },
    washlet: {
      description: `
A combination toilet and bidet with a small side control panel.
The buttons are clean and slightly worn.`,
      sceneryDescription: `
The washlet sits against the wall, sterile at first glance.`,
    },
    medicineChest: {
      description: `
A wall-mounted medicine chest with a mirrored front.
It closes tightly.`,
      sceneryDescription: `
Above the sink is a medicine chest, shut and centered.`,
    },
  },
});
