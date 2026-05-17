import type { Item } from "@game/types/itemTypes";

export const restaurantDiningRoomItems: Item[] = [
  {
    id: "EATERYDOOR2",
    name: "glass door",
    description:
      "From this side, the automatic glass door looks like a transparent wall, separating the restaurant from the outside world.",
    sceneryDescription:
      "The interior light reflects faintly off the glass, layering ghost images of tables and chairs over the view of the Park beyond. The motion sensors are dead, but the door still sits there with the silent confidence of machinery that expects people to keep coming through.",
    location: "Restaurant",
    vocab: ["glass", "door", "automatic"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 40,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      open: "From this side, you can muscle the door along its track with a bit of effort. Automatic doesn’t mean impossible.",
    },
  },
  {
    id: "oldmeals",
    name: "half-eaten meals",
    description:
      "Plates of steak, lobster, and other high-end dishes sit abandoned on the tables, half-eaten and long since gone cold.",
    sceneryDescription:
      "The food has congealed into unappetizing sculptures: steaks with cooled fat gleaming like varnish, lobster shells cracked and drying, side dishes collapsed into unidentifiable piles. Cutlery lies where it was dropped, some forks still tangled in bites that never made it to anyone’s mouth.",
    location: "Restaurant",
    vocab: [
      "half-eaten",
      "meal",
      "meals",
      "plate",
      "plates",
      "food",
      "steak",
      "lobster",
      "natto",
      "dinner",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 6,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      smell:
        "It smells like cold grease, seafood, and the kind of money that assumed it had all the time in the world.",
      taste:
        "You consider sampling the long-dead surf and turf. Then you remember you still like living. Hard pass.",
    },
  },
  {
    id: "ambiance",
    name: "chandelier",
    description:
      "A large chandelier hangs high overhead, its lights flickering uncertainly.",
    sceneryDescription:
      "The chandelier is a branching web of metal arms and faux-crystal droplets, the kind of fixture designed to impress people into ordering the expensive wine. Several bulbs are out, and the remaining ones flicker in an uneven rhythm, turning the room into a slow strobe of fine dining gone wrong.",
    location: "Restaurant",
    vocab: ["lighting", "lights", "chandelier", "hanging"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    providesLight: true,
    overrides: {
      examine:
        "You watch the chandelier flicker for a moment. It’s like the room is trying to blink something out of its eyes and failing.",
    },
  },
  {
    id: "forksnknives",
    name: "silverware",
    description:
      "Scattered silverware litters the tables and floor. Spoons, forks, and blunt butter knives are everywhere; anything sharp enough to be useful seems to have been taken.",
    sceneryDescription:
      "Cutlery glints dully in the ambient light—curved spoons, three- and four-tined forks, and stubby knives more suited to butter than self-defense. The absence of serrated blades is obvious once you start looking, like someone methodically swept through and collected every genuine weapon in the room.",
    location: "Restaurant",
    vocab: [
      "silverware",
      "knife",
      "knives",
      "fork",
      "forks",
      "spoon",
      "spoons",
      "cutlery",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 3,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      take: "You sift through the mess again. Still just spoons, forks, and butter knives—nothing that’ll help you in a real fight.",
    },
  },
  {
    id: "silkflowers",
    name: "silk flowers",
    description:
      "Arrangements of silk flowers sit in small vases on several tables. For fakes, they’re surprisingly convincing—and they even seem to smell faintly floral.",
    sceneryDescription:
      "The petals have just enough irregularity to pass for real at a glance, though up close the weave of the fabric gives them away. A faint, artificial scent clings to them, the kind of chemically engineered fragrance that promises springtime and delivers a headache.",
    location: "Restaurant",
    vocab: ["silk", "flowers", "bouquet", "arrangement"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 2,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      smell:
        "They smell like a focus group’s idea of flowers—technically pleasant, practically suspicious.",
    },
  },
  {
    id: "candles",
    name: "candles",
    description:
      "Once-burning candles sit in holders along the tables, all burned down to stubs and gone cold.",
    sceneryDescription:
      "Wax has run in frozen rivers down the sides of the holders, pooling in hardened drips on the tablecloths. The remaining wicks are nothing but blackened nubs, each one the endpoint of a flame that went out without anyone bothering to relight it.",
    location: "Restaurant",
    vocab: ["candle", "candles"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 2,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      light:
        "You don’t have anything handy to light them with. Even if you did, they’re barely more than charred memories at this point.",
    },
  },
  {
    id: "TablesNChairs",
    name: "tables and chairs",
    description:
      "The dining room’s tables and chairs are all in disarray, some overturned, some skewed as if their occupants left in a hurry.",
    sceneryDescription:
      "Upset chairs lie on their sides or backs, legs pointing at accusatory angles. Tablecloths are tugged askew, plates and glasses skewing the symmetry. A few chairs are still perfectly aligned as if their owners were the only ones who got up calmly.",
    location: "Restaurant",
    vocab: ["table", "tables", "chair", "chairs", "furniture"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "GlassOfWine",
    name: "wine glass",
    description:
      "A delicate wine glass sits near the edge of a table, still holding a small amount of dark red wine.",
    sceneryDescription:
      "The glass is thin-stemmed and expensive-looking, the bowl stained in a slow curl where the wine has dried along the inside. What’s left of the liquid clings to the bottom, a few millimeters of almost-black red that catches the light like a blood sample no one ever sent to the lab.",
    location: "Restaurant",
    vocab: ["glass", "wine", "wine glass"],
    itemClass: "liquid",
    itemCategory: "fluid",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 1,

    overrides: {
      smell:
        "It still smells faintly of red wine—oak, fruit, and just enough alcohol to make bad decisions seem reasonable.",
      taste:
        "You consider taking a sip from the abandoned glass. Then you remember how long it’s been sitting here and decide you’re not that thirsty.",
    },
  },
];
