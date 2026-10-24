import type { Item } from "@game/types/itemTypes";
import { Room } from "@game/types/roomTypes";
import { chefSampleItems } from "./chefSample";
import { restaurantBathroomItems } from "./restaurantBathroomItems";
import { restaurantDiningRoomItems } from "./restaurantDiningRoomItems";
import { restaurantEntranceItems } from "./restaurantEntranceItems";
import { restaurantKitchenItems } from "./restaurantKitchenItems";

export const restaurantRooms: Room[] = [
  // RESTAURANT AREA
  {
    id: "RestaurantEntrance",
    name: "Restaurant Entrance",
    description:
      "This is the entrance to the park's upscale restaurant. It stands next to a quaint outdoor-cafe space covered in pale salmon colored tile, where several tables are arranged with upholstered stools that have rope backrests. Mounted over the door leading in is a large white sign, painted in black script with the name 'La Belle Débauche'. A paved brick path leads away from the restaurant to the northeast, through a grassy area toward a large, stone obelisk. The path around the park's perimeter also continues to the north, and to the east. A set of automatic glass doors that are stuck in the open position lead southwest, into the establishment.",
    exits: [
      { direction: "northwest", toRoomId: "ParkWest" },
      { direction: "northeast", toRoomId: "ParkCenter" },
      { direction: "southwest", toRoomId: "Restaurant" },
      { direction: "north", toRoomId: "ParkMaintenance" },
      { direction: "east", toRoomId: "ParkSouth" },
      { direction: "up", toRoomId: "UpOnTheRoof" },
    ],
  },
  {
    id: "UpOnTheRoof",
    name: "On the Roof",
    description: `This is the roof of the restaurant. From this vantage `,
    exits: [{ direction: "down", toRoomId: "RestaurantEntrance" }],
  },
  {
    id: "Restaurant",
    name: "Restaurant",
    description:
      "The restaurant's interior is a single grand dining salon with the kitchen tucked behind a pair of swinging doors to the west. Many of the tables are littered with the remains of half-eaten meals, chairs pushed away, and some even knocked over, as if the place were abandoned in a sudden rush. Chandelier-style lights hang from the high ceiling overhead, casting weak flickers of light and eerie shadows among the scattered silverware, silk flowers, extinguished candles, and elegant glassware. To the south is an open doorway with a sign mounted over it that reads 'Toilettes', and the exit back to the park is to the northeast.",
    exits: [
      { direction: "south", toRoomId: "Toilettes" },
      { direction: "west", toRoomId: "Kitchen" },
      { direction: "northeast", toRoomId: "RestaurantEntrance" },
    ],
  },
  {
    id: "Kitchen",
    name: "Kitchen",
    description:
      "This is the restaurant's kitchen which is outfitted with magnetic induction stoves, pots and pans askew, along with a fry station, pizza oven, flame grill, and a huge sous-vide tank, or what's left of it, anyway. The tank looks to have exploded from the inside out and shotgunned shards of glass across the room along with what looks like chunks of meat. The floor in front of the tank is spattered with blood that forms a trail that heads to the west, where a large steel door leads to a walk-in freezer, an open padlock hanging from its hasp.",
    exits: [
      { direction: "east", toRoomId: "Restaurant" },
      { direction: "west", doorId: "WalkInDoor" },
    ],
  },
  {
    id: "WalkIn",
    name: "Walk In",
    description:
      "The walk-in freezer is a short, tight corridor and the air is bitterly cold. Frost coats the metal shelving to either side, tightly packed with frozen meats, seafood, sauces, and stocks. There's blood on the floor, frozen and flecked with pink crystals, that leads to the back of the freezer. The heavy steel door leads east, back to the kitchen.",
    exits: [{ direction: "east", doorId: "WalkInDoor" }],
  },
  {
    id: "Toilettes",
    name: "Toilettes",
    description:
      "The restaurant's bathroom shares the same open salon seating as the dining room does, with no stalls, no curtains, and some toilets even arranged side by side facing opposite directions, in order to encourage conversation. There's a counter with three porcelain sinks along with southern wall, with a long beveled mirror that runs the length of it where it looks like something was scribbled.",
    exits: [{ direction: "north", toRoomId: "Restaurant" }],
  },
  // {
  //   id: "MensRoom",
  //   name: "Men's Room",
  //   description: `This is a small bathroom. There is a sink mounted on the north wall, with a mirror mounted in front of it. Against the southern wall there is a single enclosed stall which is closed, and next to that a porcelin, wall-mounted urinal.`,
  //   exits: [{ direction: "east", toRoomId: "BathroomEntrance" }],
  // },
  // {
  //   id: "WomensRoom",
  //   name: "Women's Room",
  //   description: `This is a small bathroom. There is a sink mounted on the north wall, with a mirror mounted in front of it. To the south, there is an enclosed stall. Lying in the middle of the floor is the body of a middle-aged woman with black hair. She looks like she was involved in a struggle.`,
  //   exits: [{ direction: "west", toRoomId: "BathroomEntrance" }],
  // },
];

export const restaurantItems: Item[] = [
  ...chefSampleItems,
  ...restaurantEntranceItems,
  ...restaurantDiningRoomItems,
  ...restaurantKitchenItems,
  ...restaurantBathroomItems,
];
