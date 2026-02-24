import { Item } from "@game/types/itemTypes";
import { createLivingQuarter } from "src/world/maps/livingQuartersTemplate";

export const LQThreeEastCustomItems: Item[] = [
  {
    id: "AlicesDaughter",
    name: "little girl's body",
    description: `
The girl lies completely still, her body cold.
Red speckling rims the corners of her mouth and eyes, marring an otherwise peaceful face framed in curly brown hair.
She wears pajamas, her posture suggesting sleep rather than death, which makes it harder to look at for long.
`,
    sceneryDescription: `
[[newline]]Lying on the living room floor is the body of a young girl who looks to have been no more than nine, now still, and cold.
`,
    initialDescription: undefined,
    location: "LivingQuartersThreeEast",
    vocab: ["little", "girl", "body", "corpse"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 6,
    },
    itemWeight: 40,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },
  {
    id: "BLANKIE",
    name: "blanket",
    description: `
The flannel blanket is soft and well-worn, the fabric creased by years of being folded, dragged, and clutched.
It’s twisted tightly in small fists, as though letting go was never an option.
`,
    sceneryDescription: `
Draped over the girl’s body is a flannel blanket, wrapped around her with a care that feels careful, and deliberate. 
`,
    location: "LivingQuartersThreeEast",
    vocab: ["flannel", "blanket"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 7,
    },
    itemWeight: 2,
    itemSize: 3,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },

  {
    id: "CARPET",
    name: "carpet",
    description: `
The pile has been brushed in one direction to a uniform sheen, the kind of fastidious upkeep that doesn’t survive toddlers or reality.
Dark boot tracks interrupt the neatness at odd intervals, meandering from door to door like someone pacing with bad news.
`,
    sceneryDescription: `
    The carpet is a soft, light cream color, the fibers clean and plush underfoot, except where a series of dark boot prints have crushed it flat

`,
    location: "LivingQuartersThreeEast",
    vocab: ["cream", "colored", "carpet"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 4,
    },
    itemWeight: 20,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },

  {
    id: "BOOTTRACKS",
    name: "boot tracks",
    description: `
The pattern of the prints tells a whole story without needing faces: multiple people, moving with purpose, checking doors and exits before regrouping.
`,
    sceneryDescription: `
    Heavy boot tracks cross the carpet, several pairs at least. They enter from the west, fan out toward the southern door and eastern doorway, then converge and then leave the way they came.
`,
    location: "LivingQuartersThreeEast",
    vocab: ["boot", "tracks", "footprints", "prints"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 5,
    },
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },

  {
    id: "ThreeEastBrownStains",
    name: "brown stains",
    description: `
A faint trail of little brown marks—too deliberate to be random, too small to be made by shoes.
They look like something crawled here, paused, then continued on.
`,
    sceneryDescription: `
On the bathroom surfaces are faint brown marks, like tiny tracks pressed into place and forgotten.
`,
    location: "ThreeEastBath",
    vocab: ["brown", "stain", "stains", "marks", "spot", "spots"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isContainer: false,
    isWearable: false,
    isReadable: false,
  },
];

export const {
  rooms: LivingQuartersThreeEastRooms,
  items: LivingQuartersThreeEastItems,
} = createLivingQuarter({
  prefix: "ThreeEast",
  designator: "Three East",
  livingRoomId: "LivingQuartersThreeEast",
  bedRoomId: "ThreeEastBed",
  bathRoomId: "ThreeEastBath",
  corridorRoomId: "LevelThreeCorridorThree",
  corridorDoorId: "DOOR3CE",
  bathDoorId: "ThreeEastBDoor",

  livingDescription: `
This is a small living room dominated by a large seating area, with a cozy decor that has recently been upset, as if the furniture had been jostled by frantic movement through the room. [[SCENERY]] The room is dimly lit, with eerie shadows playing across the walls and ceiling. An open doorway to the east leads to a bedroom.
`,
  bathDescription: `
This bathroom is small and carefully maintained, the kind of space meant to be used quickly and forgotten.
The lighting is flat and clinical, leaving nowhere for shadows to soften the room’s edges.
Despite the orderliness, something about the stillness here feels wrong, as though the room remembers being disturbed.
A door leads back north.
`,
  bedDescription: `
The bedroom is neat to the point of denial.
Nothing here suggests panic or struggle; the room presents itself as if it expects its occupants to return at any moment.
The air smells faintly of fabric and something antiseptic, a combination that lingers uncomfortably.
A doorway leads back west into the living area.
`,

  customItems: LQThreeEastCustomItems,

  fixtureIds: {
    endTableLiving: "ThreeEastEndtable",
    sofaLiving: "ThreeEastSofa",
    loveseatLiving: "ThreeEastLoveseat",
    entertainmentLiving: "ThreeEastEntertainment",
    bed: "ThreeEastBedding",
    dresser: "ThreeEastDresser",
    closet: "ThreeEastCloset",
    phone: "PHONE5EBed",
    sink: "ThreeEastSink",
    mirror: "ThreeEastMirror",
    shower: "ThreeEastShower",
    washlet: "ThreeEastBowl",
    medicineChest: "ThreeEastMedicineChest",
  },

  fixtureText: {
    endTableLiving: {
      description: `
A low wooden end table with a smooth top and a single shallow drawer.
The surface has been wiped clean, leaving only faint circular marks where objects once rested.
`,
      sceneryDescription: `
Laying on its side near the seating area is a wooden end table with a single, shallow drawer and a crack in one leg.
`,
      sceneryDescriptionOrder: 0,
    },
    sofaLiving: {
      description: `
A cushioned sofa upholstered in neutral fabric.
One seat is slightly more worn than the others, the stuffing compressed by repeated use.
`,
      sceneryDescription: `
A sofa sits angled toward the cabinet for an entertainment center, and its cushions, which are comfortable and well-worn, look to have been recently occupied.
`,
      sceneryDescriptionOrder: 1,
    },

    loveseatLiving: {
      description: `
A smaller matching loveseat, its cushions firmer and less worn.
It looks like the kind of furniture chosen to complete a set rather than fill a need.
`,
      sceneryDescription: `
Next to the sofa is a loveseat, also positioned toward the cabinet
`,
      sceneryDescriptionOrder: 2,
    },

    entertainmentLiving: {
      description: `
A compact entertainment unit housing an older television and audio components.
The screen is dark, faintly reflective, and unresponsive to casual input.
`,
      sceneryDescription: `
which contains an entertainment center, whose dormant screen reflects the room back at itself.
`,
      sceneryDescriptionOrder: 3,
    },

    bed: {
      description: `
A neatly made double bed with tight corners.
The sheets are cool and undisturbed, as though no one ever lay down to sleep.
`,
      sceneryDescription: `
The bed dominates the bedroom, perfectly made in a way that feels more memorial than inviting.
`,
      sceneryDescriptionOrder: 1,
    },

    dresser: {
      description: `
A scarred wooden dresser with several misaligned drawers and a faint chemical smell.
`,
      sceneryDescription: `
Against the wall sits a battered wooden dresser, its drawers slightly ajar as if searched in a hurry.
`,
      sceneryDescriptionOrder: 2,
    },

    closet: {
      description: `
A narrow closet with a sliding door.
Inside, the space smells faintly of fabric and cleaning solvent.
`,
      sceneryDescription: `
Set into the wall is a closet, its door fully closed, offering no hint of what might be inside.
`,
      sceneryDescriptionOrder: 3,
    },

    phone: {
      description: `
A slightly older handset, its plastic yellowed just enough to betray the model year.
The touch contacts still respond with crisp little flashes of light.
`,
      sceneryDescription: `
The cord at the back of the cradle has been twisted and re-twisted until it holds a permanent spiral kink.
A couple of the touch pads are more worn than others.
`,
      sceneryDescriptionOrder: 4,
      messages: [
        {
          id: "5EM1",
          title: "CALLER ID: PAGE RIPLEY",
          transcript:
            "Hey, it's me...I'm, just calling because...I've seen something strange. I know this probably sounds ridiculous, but it kind of weirded me out...give me a call when you get this. Bye.",
        },
        {
          id: "5EM2",
          title: "CALLER ID: SUNI SINGH",
          transcript:
            "Alice..? It's me...I got your message...oh dear God, poor Cathy, my heart is breaking. Please call me as soon as you get this.",
        },
        {
          id: "5EM3",
          title: "CALLER ID: PAGE RIPLEY",
          transcript:
            "- and stay together! Alice, if you're there, pick up the phone! Alice!? The lights went out on all of three and all hell is breaking loose! Damn...I hope you're alright...a group of us are going to try and hole up in the Park, we think it's safe there! I'll...look for you...if you get this message, meet us there!",
        },
      ],
    },

    sink: {
      description: `
A compact sink with a spotless basin and a chrome fixture.
The drain is dry, as if it hasn’t been used in some time.
`,
      sceneryDescription: `
A small sink is mounted beneath the mirror, its surface unnervingly clean.
`,
      sceneryDescriptionOrder: 1,
    },

    mirror: {
      description: `
The mirror reflects you without distortion or mercy.
For a moment, it feels like it’s waiting for something else to appear behind you.
`,
      sceneryDescription: `
Mounted above the sink is a mirror, its surface pristine and unmarked.
`,
      sceneryDescriptionOrder: 2,
    },

    shower: {
      description: `
A standalone shower stall with a translucent door.
The interior is dry, the metal fixtures cold to the touch.
`,
      sceneryDescription: `
A shower occupies one corner of the bathroom, its door sealed and undisturbed.
`,
      sceneryDescriptionOrder: 3,
    },

    washlet: {
      description: `
A combination toilet and bidet with a small control panel mounted at the side.
A faint discoloration rings the interior.
`,
      sceneryDescription: `
The washlet sits against the wall, its control panel dark and unresponsive.
`,
      sceneryDescriptionOrder: 4,
    },

    medicineChest: {
      description: `
A small mirrored medicine chest with a shallow latch.
It looks rarely used, stocked more out of caution than routine.
`,
      sceneryDescription: `
Above the sink is a medicine chest, closed and unassuming against the wall.
`,
      sceneryDescriptionOrder: 5,
    },
  },
});
