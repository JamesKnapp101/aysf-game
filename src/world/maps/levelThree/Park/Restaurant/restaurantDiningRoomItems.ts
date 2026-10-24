import type { Item } from "@game/types/itemTypes";

const menu =
  "-----------------------------------------------------------------" +
  "\n" +
  "                     Elephant tenderloin\n" +
  "\n" +
  "    Wagyu elephant tenderloin roasted to perfection and\n" +
  "    served in a black and pink peppercorn au jus.\n" +
  "    Accompanied by honey glazed baby carrots and grilled\n" +
  "    fennel.\n" +
  "\n" +
  "                      Baby Sea Turtle Soup\n" +
  "\n" +
  "    Succulent soft-shelled baby sea turtles fresh from the\n" +
  "    egg, poached to perfection in a consommé de bourses de\n" +
  "    sirène infused with dill and thyme.\n" +
  "    Served with fresh baked sourdough oyster crackers.\n" +
  "\n" +
  "                    Ragoût de Grands Singes\n" +
  "\n" +
  "    A rich blend of gorilla, chimpanzee, and orangutan\n" +
  "    stewed with vegetables and yam, and topped with a rose\n" +
  "    of thinly shaved bonobo ceviche.\n" +
  "    Served with fire roasted plantain and breadfruit.\n" +
  "\n" +
  "                      Bald Eagle Foie Gras\n" +
  "\n" +
  "    Rich foie gras sourced from only the most aggressively\n" +
  "    overfed and rarest of specimens.\n" +
  "    Served with toasted baguette.\n" +
  "\n" +
  "                       Shark Fin Tip Soup\n" +
  "\n" +
  "    A delicate soup created from only the very tips of only\n" +
  "    the dorsal fins of real vat-grown sharks resulting in a\n" +
  "    mouth-watering 99% waste of the animal.\n" +
  "    Accompanied by an 8oz bottle of aged cognac.\n" +
  "\n" +
  "                       Baby Seal Paillard\n" +
  "\n" +
  "    The tenderest baby seal meat mercilessly pounded thin\n" +
  "    then breaded and pan fried.\n" +
  "    Served with honey glazed adult carrots and smashed\n" +
  "    potatoes.\n" +
  "\n" +
  "                      Comme Chien et Chat\n" +
  "\n" +
  "    The cat and dog, lifelong enemies, make for exquisite\n" +
  "    friends whose flavors and textures complement each other\n" +
  "    perfectly in this slow cooked casserole.\n" +
  "    Served with a side of pickled beets.\n" +
  "\n" +
  "                      Three Whale Sashimi\n" +
  "\n" +
  "    Choice cuts from three different species of whale; blue,\n" +
  "    humpback, and sperm.\n" +
  "    Accompanied by fresh grated wasabi and a soy and miso\n" +
  "    dipping sauce.\n" +
  "\n" +
  "                        Suckling Dolphin\n" +
  "\n" +
  "    Whole suckling dolphin, spit roasted over flame with a\n" +
  "    teriyaki glaze.\n" +
  "    Served with rice pancakes and green onions.\n" +
  "\n" +
  "                            Long Pig\n" +
  "\n" +
  "    Chef's choice. Do you dare?";

export const restaurantDiningRoomItems: Item[] = [
  {
    id: "Menu",
    name: "upscale menu",
    description: menu,
    initialDescription:
      "Lying on the floor next to one of the tables is a laminated menu.",
    readableText: menu,
    location: "Restaurant",
    vocab: ["menu"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 1,
    isReadable: true,
  },
  {
    id: "EATERYDOOR2",
    name: "glass door",
    description:
      "From this side, the automatic glass door looks like a transparent wall, separating the restaurant from the outside world.",
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
      "Plates of elephant, baby seal, and other high-end dishes sit abandoned on the tables, half-eaten and long since gone cold.",
    location: "Restaurant",
    vocab: [
      "half-eaten",
      "meal",
      "meals",
      "plate",
      "plates",
      "food",
      "baby",
      "seal",
      "elephant",
      "tenderloin",
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
        "It probably smelled great at one point, but it's developed a noticeable funk.",
      taste: "It smells like it's gone off, you decide not to chance it.",
    },
  },
  {
    id: "ambiance",
    name: "chandelier",
    description:
      "A large chandelier hangs high overhead, its lights flickering uncertainly.",
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
        "It's a grand affair, spanning a good three meters and laden with thousands of dangling crystals.",
    },
  },
  {
    id: "forksnknives",
    name: "silverware",
    description:
      "Scattered silverware litters the tables and floor. Spoons, forks, and blunt butter knives are everywhere; anything sharp enough to be useful seems to have been taken.",
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
      smell: "They smell nice. Flowery, but not oppressively so.",
    },
  },
  {
    id: "candles",
    name: "candles",
    description:
      "Once-burning candles sit in holders along the tables, all burned down to stubs and gone cold.",
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
        "You don’t have anything handy to light them with. Even if you did, they've already burned down to the nub.",
    },
  },
  {
    id: "TablesNChairs",
    name: "tables and chairs",
    description:
      "The dining room’s tables and chairs are all in disarray, some overturned, some skewed as if their occupants left in a hurry.",
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
    description: "It's a delicate wine glass with a long stem.",
    location: "Restaurant",
    vocab: ["glass", "wine", "wine glass"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isContainer: true,
    isOpenable: false,
    capacity: 1,
    overrides: {
      smell: "It smells faintly sour.",
      taste: "It's empty.",
    },
  },
];
