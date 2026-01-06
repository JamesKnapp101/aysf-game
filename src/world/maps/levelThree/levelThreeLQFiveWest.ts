import type { Item } from "../../../game/types/itemTypes";
import { createLivingQuarter } from "../livingQuartersTemplate";

export const LQFiveWestCustomItems: Item[] = [
  {
    id: "FiveWestElderlyMan",
    name: "elderly man's body",
    description: `
He sits slack against the sofa cushions, posture softened into a final surrender.
His skin is cool and waxy to the touch, and the corners of his eyes are rimmed with faint red speckling.
One hand rests close to the other body, as if he tried to keep contact even as everything stopped.
`,
    sceneryDescription: `
On the sofa sits an elderly man, slumped but still angled toward the person beside him, like closeness was the last thing he chose.
`,
    location: "LivingQuartersFiveWest",
    vocab: ["elderly", "man", "body", "corpse", "husband"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 130,
    itemSize: 7,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "FiveWestElderlyWoman",
    name: "elderly woman's body",
    description: `
She sits beside him, shoulders drawn inward beneath the shared blanket, as if she was trying to keep warm.
Her face is calm in a way that feels earned—lines softened by stillness, lips slightly parted.
The same faint red speckling marks the edges of her mouth and eyes, delicate and wrong.
`,
    sceneryDescription: `
Beside him sits an elderly woman, leaned close enough that their shoulders still touch.
It looks like they meant to wait something out together, and never got the chance to stand again.
`,
    location: "LivingQuartersFiveWest",
    vocab: ["elderly", "woman", "body", "corpse", "wife"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 110,
    itemSize: 7,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "FiveWestKnitBlanket",
    name: "knit blanket",
    description: `
A thick knit blanket, heavy with warmth it can’t deliver anymore.
The yarn is slightly pilled and repaired in places, kept alive by patient hands.
`,
    sceneryDescription: `
A knit blanket is wrapped around both of their shoulders, arranged with quiet care, as if someone tried to make the end less frightening.
`,
    location: "LivingQuartersFiveWest",
    vocab: ["knit", "blanket", "throw", "afghan"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 3,
    itemSize: 4,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "FiveWestCarpet",
    name: "carpet",
    description: `
A faded carpet with a careful vacuum pattern that stops abruptly near the doorway,
as if whoever kept it up finally ran out of time.
`,
    sceneryDescription: `
A worn carpet covers the living room floor, its fibers flattened in places where people paused and sat for long hours.
`,
    location: "LivingQuartersFiveWest",
    vocab: ["carpet", "floor", "rug"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },

  {
    id: "FiveWestFootprints",
    name: "footprints",
    description: `
Overlapping prints cross the carpet—lighter house-shoe marks and heavier boots that don’t belong in a home.
`,
    sceneryDescription: `
Footprints overlap in muted layers: slow, shuffling steps, and then sharper boot treads that cut through them like an intrusion.
`,
    location: "LivingQuartersFiveWest",
    vocab: ["footprints", "prints", "tracks"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "FiveWestPillDust",
    name: "white residue",
    description: `
A faint white residue clings to the corner of the counter, like something crushed and wiped away in a hurry.
`,
    sceneryDescription: `
There’s a faint white residue on the bathroom counter, easy to miss unless you’re already looking for signs of routine and need.
`,
    location: "FiveWestBath",
    vocab: ["white", "residue", "powder", "dust"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "FiveWestWalker",
    name: "folding walker",
    description: `
A lightweight folding walker, the grips smoothed by constant use.
One rubber foot is newer than the others.
`,
    sceneryDescription: `
Leaning near the bedroom doorway is a folding walker, parked with the muscle memory of long practice.
`,
    location: "LivingQuartersFiveWest",
    vocab: ["walker", "frame", "folding", "walking"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 8,
    itemSize: 6,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
];

export const {
  rooms: LivingQuartersFiveWestRooms,
  items: LivingQuartersFiveWestItems,
} = createLivingQuarter({
  prefix: "FiveWest",
  designator: "Five West",
  livingRoomId: "LivingQuartersFiveWest",
  bedRoomId: "FiveWestBed",
  bathRoomId: "FiveWestBath",
  corridorRoomId: "LevelThreeCorridorFive",
  corridorDoorId: "DOOR3CW",
  bathDoorId: "FiveWestBDoor",
  dirs: {
    livingToCorridorDir: "east",
    livingToBedDir: "west",
    bedToLivingDir: "east",
  },
  livingDescription: `
This living room feels practiced—arranged for comfort, for rest, for long evenings that came too early.
The air holds a faint medicinal cleanliness beneath the softer ghost of old fabric and warmed dust.
Nothing is overturned. Nothing is broken. The absence is the only damage, and it sits everywhere.
Doors lead west, south, and east.
`,

  bathDescription: `
A small bathroom built for function, but adapted by necessity.
The light is unforgiving, the surfaces wiped down with the discipline of people who couldn’t afford infections or accidents.
Even so, the stillness here feels staged, like the room is pretending nothing ever happened.
A door leads back north.
`,

  bedDescription: `
The bedroom is tidy in the way people get tidy when sleep comes with conditions.
The space feels measured: clear paths, reachable surfaces, things placed where a hand would go without thinking.
The air is thin with detergent and something sterile, as if comfort had to share a room with procedure.
A doorway leads back west.
`,

  customItems: LQFiveWestCustomItems,

  fixtureIds: {
    endTableLiving: "FiveWestEndtable",
    sofaLiving: "FiveWestSofa",
    loveseatLiving: "FiveWestLoveseat",
    entertainmentLiving: "FiveWestEntertainment",

    bed: "FiveWestBedding",
    dresser: "FiveWestDresser",
    closet: "FiveWestCloset",
    phone: "PHONE5WBed",

    sink: "FiveWestSink",
    mirror: "FiveWestMirror",
    shower: "FiveWestShower",
    washlet: "FiveWestBowl",
    medicineChest: "FiveWestMedicineChest",
  },

  fixtureText: {
    endTableLiving: {
      description: `
A low end table with a shallow drawer and a surface kept strangely clear.
The wood bears faint scuffs where something was set down and picked up, again and again.
`,
      sceneryDescription: `
Beside the seating area sits a small end table, positioned like an anchor for habits that mattered.
`,
      sceneryDescriptionOrder: 0,
    },

    sofaLiving: {
      description: `
A firm sofa upholstered in muted fabric.
The seat cushions are subtly shaped by years of careful sitting and slow standing.
`,
      sceneryDescription: `
A sofa faces the entertainment center, arranged for quiet evenings and bodies that needed rest more than excitement.
`,
      sceneryDescriptionOrder: 0,
    },

    loveseatLiving: {
      description: `
A matching loveseat angled slightly toward the sofa, like conversation was always the point.
The fabric is less worn, as if it belonged to the one who could still shift easily.
`,
      sceneryDescription: `
A loveseat sits near the sofa, close enough to share warmth, far enough to breathe.
`,
      sceneryDescriptionOrder: 0,
    },

    entertainmentLiving: {
      description: `
An older entertainment unit with a dark television screen and simple audio components.
The display is blank, reflecting the room back without offering distraction.
`,
      sceneryDescription: `
An entertainment center stands against the wall, a quiet relic of evenings spent counting commercials and minutes.
`,
      sceneryDescriptionOrder: 0,
    },
    bed: {
      description: `
A double bed made with care, the sheets tucked tight.
It doesn’t look inviting. It looks prepared—like someone expected to need it without delay.
`,
      sceneryDescription: `
The bed dominates the room, made in a way that feels less like comfort and more like readiness.
`,
      sceneryDescriptionOrder: 0,
    },

    dresser: {
      description: `
A wooden dresser with drawers that don’t glide smoothly anymore.
The handles are polished by hands that opened them daily, sometimes in the dark.
`,
      sceneryDescription: `
A dresser rests against the wall, its drawers closed but not quite aligned, as if hurried shut.
`,
      sceneryDescriptionOrder: 0,
    },

    closet: {
      description: `
A narrow closet door with a simple handle and a quiet latch.
The faint smell of clean fabric leaks from the seams.
`,
      sceneryDescription: `
Set into the wall is a closet, closed and patient, as if it expects to be opened again.
`,
      sceneryDescriptionOrder: 0,
    },

    phone: {
      description: `
A bedside phone with touch contacts and a small indicator window.
The plastic is dulled and yellowed, worn smooth in the places fingers returned to most.
`,
      sceneryDescription: `
On the bedside surface sits a phone, the kind kept close when help might need to be called quickly.
`,
      sceneryDescriptionOrder: 0,
    },
    sink: {
      description: `
A compact sink with a spotless basin and a chrome fixture.
The drain is dry. The metal is cold.
`,
      sceneryDescription: `
A small sink is mounted under the mirror, wiped clean with the care of people who couldn’t risk getting sick.
`,
      sceneryDescriptionOrder: 0,
    },

    mirror: {
      description: `
A plain mirror, clean enough to feel accusatory.
It reflects you too clearly, and for a moment you expect a second shape to settle into frame.
`,
      sceneryDescription: `
A mirror hangs above the sink, spotless and severe under the bathroom light.
`,
      sceneryDescriptionOrder: 0,
    },

    shower: {
      description: `
A shower stall with a translucent door and simple controls.
The interior is dry, the fixtures untouched.
`,
      sceneryDescription: `
A shower occupies the corner, closed up as if it was used on schedule and then suddenly never again.
`,
      sceneryDescriptionOrder: 0,
    },

    washlet: {
      description: `
A standard washlet with side-mounted controls.
A faint discoloration rings the interior, the subtle evidence of ordinary use.
`,
      sceneryDescription: `
The washlet sits against the wall, its control panel dark beneath the harsh bathroom light.
`,
      sceneryDescriptionOrder: 0,
    },

    medicineChest: {
      description: `
A small medicine chest with a mirrored face and a shallow latch.
The hinge is slightly loose, as if it was opened often—sometimes with shaking hands.
`,
      sceneryDescription: `
Above the sink is a medicine chest, the sort of thing that turns a bathroom into a quiet dispensary.
`,
      sceneryDescriptionOrder: 0,
    },
  },
});
