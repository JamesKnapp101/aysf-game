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
    description: `This is the entrance to a restaurant with a small outdoor-cafe area. There are several round tables, each surrounded by several chairs, situated on a level area covered in pale salmon colored tile. Mounted over the door leading in is a large, rustic-looking painted sign which reads 'Saveurs du Passé'. A paved brick path leads northeast through a grassy area toward a large, stone obelisk. The path around the park's perimeter also leads north and east. A set of automatic glass doors lead southwest into the establishment, stuck in the open position.`,
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
    description: `This is a cozy, italian-style restaurant which looks to have been hastilly abandoned; there are many overturned chairs, and many of the tables are littered with the remains of half-eaten meals. The chandelier-style lights which hang overhead are all flickering weakly, casting eerie shadows amongst the scattered silverware, silk flowers, extinguished candles and wine glasses. There is an exit back outside to the northeast, and a swinging door to the northwest. To the south is an open doorway mounted to the side of which is a small sign stating 'Rest Rooms'.`,
    exits: [
      { direction: "south", toRoomId: "BathroomEntrance" },
      { direction: "west", toRoomId: "Kitchen" },
      { direction: "northeast", toRoomId: "RestaurantEntrance" },
    ],
  },
  {
    id: "Kitchen",
    name: "Kitchen",
    description: `This is the kitchen area for the restaurant. It appears to have been hastily abandoned, and you see signs of things having been cleaned up quickly, then perhaps abandoned before the clean-up was quite complete. Most of the food has been put away, with only some scattered flour, bread crumbs, and a few pieces of stray pasta to betray the fact that this was a once busy kitchen. One wall is dominated by a large steel door leading west into a walk-in freezer. An open padlock hangs from its hasp.`,
    exits: [
      { direction: "east", toRoomId: "Restaurant" },
      { direction: "west", doorId: "WalkInDoor" },
    ],
  },
  {
    id: "WalkIn",
    name: "Walk In",
    description: `This is the restaurant's walk-in freezer. Frost coats the metal shelves and the air is bitterly cold. The heavy steel door leads east into the Kitchen.`,
    exits: [{ direction: "east", doorId: "WalkInDoor" }],
  },
  {
    id: "BathroomEntrance",
    name: "Rest Rooms",
    description: `This is a short corridor extending east and west. To the east is a wooden door with a plaque mounted on it which reads 'Donne' and to the west is a wooden door with a plaque mounted on it which reads 'Uomini'.^^Mounted on the southern wall is a phone which is designed with a retro older-style wireless-headset look, although it still uses the modern touch contacts on its keypad. Mounted on the wall next to that is a small plaque with some numbers printed on it.`,
    exits: [
      { direction: "north", toRoomId: "Restaurant" },
      { direction: "west", toRoomId: "MensRoom" },
      { direction: "east", toRoomId: "WomensRoom" },
    ],
  },
  {
    id: "MensRoom",
    name: "Men's Room",
    description: `This is a small bathroom. There is a sink mounted on the north wall, with a mirror mounted in front of it. Against the southern wall there is a single enclosed stall which is closed, and next to that a porcelin, wall-mounted urinal.`,
    exits: [{ direction: "east", toRoomId: "BathroomEntrance" }],
  },
  {
    id: "WomensRoom",
    name: "Women's Room",
    description: `This is a small bathroom. There is a sink mounted on the north wall, with a mirror mounted in front of it. To the south, there is an enclosed stall. Lying in the middle of the floor is the body of a middle-aged woman with black hair. She looks like she was involved in a struggle.`,
    exits: [{ direction: "west", toRoomId: "BathroomEntrance" }],
  },
];

export const restaurantItems: Item[] = [
  ...chefSampleItems,
  ...restaurantEntranceItems,
  ...restaurantDiningRoomItems,
  ...restaurantKitchenItems,
  ...restaurantBathroomItems,
];
