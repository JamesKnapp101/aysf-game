import { Item } from "@game/types/itemTypes";
import { Room } from "@game/types/roomTypes";
import {
  HYDROPONICS_EMPLOYEE_PROFILES,
  describeHydroponicsSignIn,
  openHydroponicsCocoon,
} from "./hydroponicsPuzzle";

export const hydroponicsRooms: Room[] = [
  {
    id: "HydroponicsPlatform",
    name: "Hydroponics: Central Platform Top",
    description: `You're standing on a huge, circular platform suspended near the top of a massive, metal silo. [[SCENERY]]`,
    exits: [
      { direction: "north", doorId: "HydroponicsDoor" },
      { direction: "west", toRoomId: "HydroponicsPlatformAdmin" },
      { direction: "down", toRoomId: "HydroponicsPlatformMid" },
    ],
  },
  {
    id: "HydroponicsPlatformAdmin",
    name: "Hydroponics: Admin Office",
    description: `This is an enclosed office space that looks out across the platform to walls of lush green. The office is a utilitarian affair, tiled floor and plain white walls, with a [[SCENERY]]`,
    exits: [{ direction: "east", toRoomId: "HydroponicsPlatform" }],
  },
  {
    id: "HydroponicsPlatformMid",
    name: "Hydroponics: Central Platform Middle",
    description: `This narrow middle platform is half-lost beneath webbing anchored to railings, pipes, and the underside of the upper deck. The air is hot, damp, and rank with plant rot. [[SCENERY]] The platform continues up toward the entry level and down into the shadowed space beneath the web canopy.`,
    exits: [
      { direction: "up", toRoomId: "HydroponicsPlatform" },
      { direction: "down", toRoomId: "HydroponicsPlatformBottom" },
    ],
  },

  {
    id: "HydroponicsPlatformBottom",
    name: "Hydroponics: Underneath Web",
    description: `You stand beneath the main Hydroponics platform where the chamber opens into a humid hollow of hanging roots, draped leaves, and ropes of silk. The web canopy above filters the light into a pale, greasy glow. [[SCENERY]] Passages through the webbing branch away in all four diagonal directions, while the central platform rises back up above you.`,
    exits: [
      { direction: "up", toRoomId: "HydroponicsPlatformMid" },
      { direction: "northwest", toRoomId: "UnderWebOne" },
      { direction: "northeast", toRoomId: "UnderWebTwo" },
      { direction: "southwest", toRoomId: "UnderWebThree" },
      { direction: "southeast", toRoomId: "UnderWebFour" },
    ],
  },

  {
    id: "UnderWebOne",
    name: "Web Underhang",
    description: `This pocket beneath the canopy is hemmed in by drooping sheets of silk attached to bent grow frames and dead stalks. Moisture beads on every strand, making the whole place glisten when the light catches it. [[SCENERY]] Narrow ways lead east, south, and back southeast toward the central space.`,
    exits: [
      { direction: "east", toRoomId: "UnderWebTwo" },
      { direction: "southeast", toRoomId: "HydroponicsPlatformBottom" },
      { direction: "south", toRoomId: "UnderWebThree" },
    ],
  },
  {
    id: "UnderWebTwo",
    name: "Web Corner",
    description: `The canopy bunches thickly here in a corner of torn foliage and web-choked support struts. The air feels close, and every shift of your weight sends small tremors through the silk overhead. [[SCENERY]] Paths run west, south, and back southwest toward the area beneath the central platform.`,
    exits: [
      { direction: "west", toRoomId: "UnderWebOne" },
      { direction: "southwest", toRoomId: "HydroponicsPlatformBottom" },
      { direction: "south", toRoomId: "UnderWebFour" },
    ],
  },
  {
    id: "UnderWebThree",
    name: "Web Pocket",
    description: `The webbing dips low here between clusters of withered growth trays and dangling roots, forming a cramped recess that smells of wet vegetation and something sharper underneath. [[SCENERY]] The silk-wrapped passages continue north, east, and back northeast toward the center.`,
    exits: [
      { direction: "north", toRoomId: "UnderWebOne" },
      { direction: "northeast", toRoomId: "HydroponicsPlatformBottom" },
      { direction: "east", toRoomId: "UnderWebFour" },
    ],
  },
  {
    id: "UnderWebFour",
    name: "Web Grotto",
    description: `This far pocket of Hydroponics feels almost cave-like, enclosed by sheeted web and curtains of dead vines. The filtered light is dimmer here, leaving the silk overhead with a dull pearly sheen. [[SCENERY]] The only ways out are west, north, or back northwest toward the center beneath the canopy.`,
    exits: [
      { direction: "west", toRoomId: "UnderWebThree" },
      { direction: "northwest", toRoomId: "HydroponicsPlatformBottom" },
      { direction: "north", toRoomId: "UnderWebThree" },
    ],
  },
];

type CocoonDetails = {
  name: string;
  description: string;
  sceneryDescription: string;
  sceneryOrder: number;
};

const HYDROPONICS_COCOON_DETAILS: Record<string, CocoonDetails> = {
  DizzyTsoukann: {
    name: "wispy cocoon",
    description:
      "The silk here has dried into a narrow, papery shroud around a thin woman. A tear in the wrapping exposes short, straight red hair matted to the skull and a ruined right shoulder where a leaf tattoo still shows through wet, chewed flesh. Below that, the partially eaten remains hang in sagging ropes, one arm stripped nearly to bone.",
    sceneryDescription:
      "[[newline]]A wispy cocoon hangs from above here, from which dangles the head and shoulders of a partially eaten corpse.",
    sceneryOrder: 12,
  },
  OrgrillPinthwell: {
    name: "stretched cocoon",
    description:
      "This cocoon has been stretched taut around a tall, athletic man's frame until ribs and shoulders push against the silk from inside. One hand protrudes from a split seam, the index finger ending in a ragged stump, while the chest has been torn open far enough to show slick bone and dark strings of tissue. Whatever fed here left the body hanging in a heavy, wet slump.",
    sceneryDescription:
      "[[newline]]Tucked in one corner is a stretched cocoon whose human occupant tried, and failed, to push through and escape.",
    sceneryOrder: 11,
  },
  GaGaLizSotte: {
    name: "ribboned cocoon",
    description:
      "The webbing pinches this cocoon into the compact shape of a short, athletic woman. A spill of long, straight blonde hair hangs from the upper seam, and lower down the silk has shrunk back from the midriff enough to reveal part of a cat tattoo between bite marks and torn muscle. The abdomen has been opened almost to the spine, leaving the whole bundle to drip slowly onto the roots below.",
    sceneryDescription:
      "[[newline]]Near the ceiling hangs a ribboned cocoon with a desiccated head dangling from the bottom, trailing long, straight blonde hair that touches the floor.",
    sceneryOrder: 10,
  },
  ErnwithGob: {
    name: "lank cocoon",
    description:
      "A tall, thin body sags inside this cocoon like damp laundry on a line. The face is half-collapsed, but short gray hair and a pair of bent spectacles are still caught in the silk around the skull, and the wrapping has split open at the feet to expose unmistakably webbed toes. The rest of the corpse has been hollowed in places, leaving the webbing stained and sunken.",
    sceneryDescription:
      "[[newline]]On the floor lies a lank cocoon, draped over the bony remains inside, and leaving only one acid-scarred leg exposed.",
    sceneryOrder: 9,
  },
  SlandryTexMex: {
    name: "knotted cocoon",
    description:
      "This heavy cocoon has been tied off in ugly bulges around a medium-height, heavyset man. Short black curls push through a break near the scalp, and one arm hangs partly free with a tribal tattoo still visible above strips of peeled-back flesh. The belly has burst against the silk and dried there in a dark, glossy crust.",
    sceneryDescription:
      "[[newline]]Sagging in the web is a knotted cocoon, from which sprouts an acid-burned face and curly black hair.",
    sceneryOrder: 8,
  },
  BuglousWimbly: {
    name: "compact cocoon",
    description:
      "The cocoon bulges low and squat, wrapped around the short, heavyset body inside. Damp, wavy brown hair clings to the scalp through a thumb-wide rent in the silk, and the compressed torso has split open enough to spill dark loops of viscera between the strands. Even half-eaten, the remains look densely packed into the sticky bundle.",
    sceneryDescription:
      "[[newline]]A compact cocoon containing a short but heavyset body, or what's left of it, hangs low here.",
    sceneryOrder: 7,
  },
  XiXiBo: {
    name: "narrow cocoon",
    description:
      "This cocoon narrows to the neat outline of a thin woman of medium height. The silk has stuck hard across the face, but short black hair and one arm of a crushed pair of spectacles are visible where the wrapping has torn away from the head. The throat and collarbone have been opened into a glistening notch, and something inside still shifts when the webbing sways.",
    sceneryDescription:
      "[[newline]]Dangling from silky strands from the platform above is a narrow cocoon, a pair of spectacles stuck in the sticky threads.",
    sceneryOrder: 6,
  },
  MistopherBreen: {
    name: "dangling cocoon",
    description:
      "The corpse in this cocoon hangs so long that the ankles nearly brush the floor. The body is tall and thin, with short, wavy blonde hair plastered over a skull whose cheek has been gnawed through to the teeth. Long shin bones and a collapsed chest show through the silk like broken tent poles, making the whole cocoon twitch whenever the air moves.",
    sceneryDescription:
      "[[newline]]A dangling cocoon trails almost to the floor, with short blonde hair and long, thin legs pressing through the silk.",
    sceneryOrder: 5,
  },
  CrenchfordMothworthy: {
    name: "stitched cocoon",
    description:
      "The webbing has been wrapped and rewound around a medium-height, athletic man's body, giving this cocoon a crudely stitched look. One arm has come free enough for the right hand to hang out in full view, six fingers blackened and curled like burnt roots. Higher up, the chest has been split wide enough to show the bright arcs of ribs beneath the silk.",
    sceneryDescription:
      "[[newline]]Lashed to a metal strut is a stitched cocoon, wrapped around the remains of an athletic man's body.",
    sceneryOrder: 4,
  },
  SillithLeSconce: {
    name: "statuesque cocoon",
    description:
      "Even ruined, the body inside this cocoon is unmistakably tall and athletic. A thick spill of long, straight red hair hangs from the upper seam, and one leg has been gnawed free enough to expose a bionic replacement knee slick with old blood and web residue. The rest of the remains hang limp in the silk, ribs and tendons showing through where the abdomen has been opened.",
    sceneryDescription:
      "[[newline]]A statuesque cocoon hangs from above, dangling a pair of legs, one of which has been eaten to the bone, exposing a bionic knee.",
    sceneryOrder: 3,
  },
  DaschentDwong: {
    name: "swollen cocoon",
    description:
      "This cocoon is distended around a tall, heavyset man whose remains have slumped to one side. Long, curly blonde hair spills from the top like wet rope, and the face has been eaten away far enough to leave a single bionic eye staring from a nest of torn sockets and silk. The torso has burst in several places, with broken bone and clotted tissue pressing through the weave.",
    sceneryDescription:
      "[[newline]]In a sheet of sticky threads bulges a swollen cocoon that exposes dangling skeletal arms and a skull, the flesh burned away and leaving only one bionic eye in its socket",
    sceneryOrder: 2,
  },
  WooZhangkWoo: {
    name: "trailing cocoon",
    description:
      "The silk around this body tapers into a slim, trailing sheath around a woman of medium height and narrow build. Long, straight black hair spills from the split crown all the way down the front of the cocoon, sticking to exposed ribs where the chest has been opened. The lower half has been partly eaten away, leaving pale bone and stringy tissue swinging inside the webbing.",
    sceneryDescription:
      "[[newline]]A trailing cocoon stirs here, with long black hair plastered over the ribs of a slim body inside.",
    sceneryOrder: 1,
  },
};

function buildCocoonVocab(cocoonName: string): string[] {
  const nameTokens = cocoonName
    .toLowerCase()
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  return [
    ...nameTokens,
    cocoonName.toLowerCase(),
    "cocoon",
    "body",
    "corpse",
    "remains",
    "webbed body",
    "cocooned body",
  ];
}

const cocoonBodyItems: Item[] = HYDROPONICS_EMPLOYEE_PROFILES.map((profile) => {
  const cocoonDetails = HYDROPONICS_COCOON_DETAILS[profile.id];

  return {
    id: profile.id,
    name: cocoonDetails?.name ?? "cocoon",
    description:
      cocoonDetails?.description ??
      "The remains inside the silk have been too badly mangled to identify at a glance.",
    sceneryDescription:
      cocoonDetails?.sceneryDescription ??
      "A cocooned body hangs here in the webbing.",
    location: "seeded",
    vocab: buildCocoonVocab(cocoonDetails?.name ?? "cocoon"),
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 40,
    itemSize: 40,
    overrides: {
      open: ({ state }: { state: any }) =>
        openHydroponicsCocoon(state, profile.id),
    },
    meta: {
      sceneryDescriptionOrder: cocoonDetails.sceneryOrder,
    },
  };
});

export const hydroponicsItems: Item[] = [
  // Platform top
  {
    id: "HydroponicsDome",
    name: "domed ceiling",
    description:
      "The dome looms overhead, reaching up into the shadows. You can see sheets of translucent webbing crossing the gap, up there, moving in the convected warmth.",
    sceneryDescription: " Above is a high, domed ceiling ",
    location: "HydroponicsPlatform",
    vocab: ["dome", "ceiling", "silo"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 101,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "HydroponicsDomeWebs",
    name: "dome webbing",
    description: "The sheets of translucent webbing stir in the rising warmth.",
    sceneryDescription:
      "where some sort of fabric or webbing hangs in layers, like giant hammocks that billow occasionally when the air currents shift. ",
    location: "HydroponicsPlatform",
    vocab: ["fabric", "webbing", "hammock", "hammocks"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 101,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "HydroponicsPipesTop",
    name: "hydroponic pipes",
    description:
      "The pipes start at the base of the platform and are about a half-meter in diameter, running the circumference of the platform. Each ring is stacked upon the last, with a half-meter gap between them to give the plants room to grow. Each pipe has openings at regular intervals where different plants sprout.",
    sceneryDescription:
      "Circling the edges of the platform are layers upon layers of thick piping, with a half-meter gap between them, ",
    location: "HydroponicsPlatform",
    vocab: ["pipes", "pipe", "piping", "wall"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 101,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "HydroponicsPlantsTop",
    name: "hydroponic plants",
    description:
      "You couldn't even begin to identify all of them, but you do recognize some, such as what looks like a wall of carrot greens, then feathery fennel greens. They seem to be exclusively food crops.",
    sceneryDescription:
      "and sprouting from openings in the pipes at regular intervals are a staggering array of plant life. The plants from each row drape down toward the next to form a continuous wall of lush green that circles the platform, stirring in a gentle updraft from below. ",
    location: "HydroponicsPlatform",
    vocab: ["plants", "plant", "vegetation", "carrot", "greens", "fennel"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 101,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
  {
    id: "HydroponicsFloorTop",
    name: "floor",
    description:
      "The floor consists of a metal grate that is sturdy but still offers some view of what is going on below.",
    sceneryDescription:
      "The floor is all metal grating, allowing a view down to the platform beneath it.[[newline]]",
    location: "HydroponicsPlatform",
    vocab: ["floor", "grate", "platform"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 101,
    meta: {
      sceneryDescriptionOrder: 5,
    },
  },
  {
    id: "HydroponicsAdminTop",
    name: "floor",
    description:
      "It's a small enclosed structure with an open doorway that looks inside. It looks like some kind of office in there.",
    sceneryDescription:
      "[[newline]]To the west is a small, enclosed structure with an open door on its east wall. Over the door is a sign that reads 'Admin'",
    location: "HydroponicsPlatform",
    vocab: ["structure", "office", "admin"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 101,
    meta: {
      sceneryDescriptionOrder: 100,
    },
  },
  // Admin Office
  {
    id: "AdminOfficeDesk",
    name: "admin desk",
    description:
      "The desk is old, and worn. It looks like it hasn't moved from that spot in a long time.",
    sceneryDescription:
      "single large desk that looks out toward the exit from the northwestern corner of the room. ",
    location: "HydroponicsPlatformAdmin",
    vocab: ["desk", "large", "old"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 101,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "AdminOfficeTerminal",
    name: "admin terminal",
    description:
      "The computer terminal looks as old as the desk itself, but is quite alive, with green readout visible on the black screen.",
    sceneryDescription:
      "Sitting on the desk is a computer terminal, next to which is ",
    location: "HydroponicsPlatformAdmin",
    vocab: ["computer", "terminal"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 101,
    meta: {
      kind: "hydroponics-admin-terminal",
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "AdminOfficeDeskKitsch",
    name: "desk kitsch",
    description: "It's cute, if you're into that sort of thing.",
    sceneryDescription:
      "a little sculpture of three plants with smiling faces sprouting from a section of hydroponics pipe, and a little sign that reads 'I'm Always Wetting My Plants'. ",
    location: "HydroponicsPlatformAdmin",
    vocab: ["sculpture", "kitsch"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 101,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "AdminOfficeWastebin",
    name: "waste bin",
    description: "It's a black plastic waste bin, with no liner.",
    sceneryDescription:
      "Next to the desk is a plastic waste bin with no liner.",
    location: "HydroponicsPlatformAdmin",
    vocab: ["trash", "waste", "bin", "wastebin"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 101,
    meta: {
      sceneryDescriptionOrder: 4,
    },
    isContainer: true,
    isOpenable: false,
  },
  {
    id: "AdminOfficeWastebinNote",
    name: "a crumpled note",
    readableTitle: `Crumpled Note`,
    description: "It's a wrinkled piece of paper with writing on it.",
    readableText: `This is a note found in the trash of the admin office`,
    location: "seeded",
    vocab: ["note", "paper", "wrinkled"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
    isReadable: true,
    isLoggable: true,
  },
  {
    id: "AdminOfficeSignIn",
    name: "sign in tablet",
    description: "It's a slim tablet, tethered to the desk by a thin chain.",
    describe: (state) => describeHydroponicsSignIn(state),
    sceneryDescription: `Sitting next to the terminal is a slim sign-in tablet, tethered to the desk by a thin chain.`,
    readableText: (state) => describeHydroponicsSignIn(state),
    location: "HydroponicsPlatformAdmin",
    vocab: ["tablet", "sign-in", "signin", "sheet", "sign in tablet"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 2,
    itemSize: 2,
    isReadable: true,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
  ...cocoonBodyItems,
];
