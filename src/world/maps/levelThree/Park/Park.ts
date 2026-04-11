import { Item } from "@game/types/itemTypes";
import { Room } from "@game/types/roomTypes";

export const parkRooms: Room[] = [
  {
    id: "ParkEast",
    name: "Park East",
    description: `This is a large, open, rectangular court where [[SCENERY]] `,
    exits: [
      { direction: "east", doorId: "ParkDoor" },
      { direction: "north", toRoomId: "GymEntrance" },
      { direction: "south", toRoomId: "BarEntrance" },
      { direction: "west", toRoomId: "ParkCenter" },
    ],
  },
  {
    id: "ParkSouth",
    name: "Park South",
    description: `This is the southernmost point of the Park, as you follow along the outer rim of the brick-paved walkway. To the north across the grass you can see the obelisk at the Park's center. The circular path continues to the east from here, where you can see the brick entrance to a structure in the distance, and also to the west where you can see what looks like it might be the entrance to a restaurant. There is a park bench here, facing inward to the Park's center.`,
    exits: [
      { direction: "east", toRoomId: "BarEntrance" },
      { direction: "west", toRoomId: "RestaurantEntrance" },
      { direction: "north", toRoomId: "ParkCenter" },
    ],
  },
  {
    id: "ParkWest",
    name: "Park West",
    description: `This is the westernmost point of the Park, as you follow along the outer ring of the brick-paved walkway. To the east, across the grass, you can see the obelisk at the Park's center. The circular path continues to the north from here, where you can see the entranceway that looks like it might be a movie theater; from where you're standing you can see a small marquee over the entranceway with the words 'THE TRIALS OF FRED' posted in block lettering. The path also continues to the south where you can see the entrance to what looks like a restaurant. There is a park bench here, facing inward to the Park's center. Sitting in the park bench is the body of a middle aged woman, dressed in a white blouse and tartan skirt.`,
    exits: [
      { direction: "southeast", toRoomId: "RestaurantEntrance" },
      { direction: "northeast", toRoomId: "MovieEntrance" },
      { direction: "east", toRoomId: "ParkMaintenance" },
      { direction: "west", toRoomId: "Spa" },
    ],
  },
  {
    id: "ParkNorth",
    name: "Park North",
    description: `This is the northernmost point of the Park, as you follow along the outer ring of the brick-paved walkway. To the south, down a gentle slope in the grass, you can see the obelisk at the Park's center. The circular path continues east from here, where you can see the entrance to some kind of facility, and also west where you can see the entrance to what looks like a movie theater. From where you're standing you can see part of a small marquee over the entranceway, where you can make out the words 'LS OF FRED' posted in block lettering. There is a park bench here, facing inward to the Park's center.`,
    exits: [
      { direction: "east", toRoomId: "GymEntrance" },
      { direction: "west", toRoomId: "MovieEntrance" },
      { direction: "south", toRoomId: "ParkCenter" },
    ],
  },
  {
    id: "ParkMaintenance",
    name: "Maintenance Depot",
    description: `You are standing near a tall, lanky tree that stands near the obelisk visible to the east. The tree has a long trunk, then sprouts a series of branches about twelve feet up. Whatever artificial sunlight is used in this place, it is positioned such that a nice patch of shade actually exists here, and the grass is plush. To the west you can see an area with a park bench where a woman appears to be sitting. To the north is the movie theatre entrance, and to the south you can see the entrance to a restaurant.`,
    exits: [
      { direction: "east", toRoomId: "ParkCenter" },
      { direction: "west", toRoomId: "ParkWest" },
      { direction: "north", toRoomId: "MovieEntrance" },
      { direction: "south", toRoomId: "RestaurantEntrance" },
      { direction: "in", toRoomId: "ParkMaintenanceInterior" },
    ],
  },
  {
    id: "ParkMaintenanceInterior",
    name: "Inside Maintenance Depot",
    description: `You are holding onto the branches of the tree, hanging above the grassy area about twenty feet below where the artificial gravity has been deactivated. From up here you can see this area is a wide circle with the obelisk at its center; paths radiate outward in all directions from the area surrounding the obelisk, where they all join with a continuous outer walkway which circles the whole field. Positioned at the northeast, northwest, southeast and southwestern points of the outer rim are building faces which include a gymnasium, a movie theatre, a library, and a restaurant.`,
    exits: [{ direction: "out", toRoomId: "ParkMaintenance" }],
  },
  {
    id: "ParkCenter",
    name: "Park Center",
    description: `This is the center of the Park. The brick-paved path which follows the outer rim of this place radiates in from the northeast, northwest, southeast, and southwest to connect with a large circular area paved in tan-colored brick, the center of which is dominated by a large brick dias. Mounted on the dias is a large, squat obelisk made of granite. The obelisk is approximately eight feet in height, and about four feet by four feet at its base. There is a plaque carved into it, upon which are chiseled the words: SEEK AND YE SHALL FIND. Just off the paved area is a four foot by four foot square stepping stone, upon which is a slightly raised green disk, four feet in diameter.`,
    exits: [
      { direction: "north", toRoomId: "ParkNorth" },
      { direction: "south", toRoomId: "ParkSouth" },
      { direction: "east", toRoomId: "ParkEast" },
      { direction: "west", toRoomId: "ParkMaintenance" },
      { direction: "northeast", toRoomId: "GymEntrance" },
      { direction: "southeast", toRoomId: "BarEntrance" },
      { direction: "southwest", toRoomId: "RestaurantEntrance" },
      { direction: "northwest", toRoomId: "MovieEntrance" },
    ],
  },
];

export const parkItems: Item[] = [
  {
    id: "ParkEastDomedCeiling",
    name: "domed ceiling",
    description: `It's impressive. The effect is very convincing.`,
    sceneryDescription: `a high domed ceiling does a pretty good approximation of making one feel as though they have just stepped outside.`,
    location: "ParkEast",
    vocab: ["ceiling", "dome", "domed", "sky"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 1,
    },
    itemWeight: 2,
    itemSize: 3,
  },
  {
    id: "ParkEastGrass",
    name: "park grass",
    description: `The grass is green, and lush.`,
    sceneryDescription: `The ground is covered in topsoil which is in turn covered with grass, and gentle slopes have been landscaped in giving it a convincing natural look.`,
    location: "ParkEast",
    vocab: ["grass", "ground", "dirt"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 2,
    },
    itemWeight: 2,
    itemSize: 3,
  },
  {
    id: "ParkEastDistantBuildings",
    name: "distant buildings",
    description: `It looks like it's open for business, but you'll need to get closer.`,
    sceneryDescription: `The park is home to several buildings which can be seen in the distance; to the north you can see a gymnasium, and to the south is what looks like a bar.`,
    location: "ParkEast",
    vocab: ["bar", "gym", "gymnasium", "building", "buildings"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 3,
    },
    itemWeight: 2,
    itemSize: 3,
  },
  {
    id: "ParkEastDistantObelisk",
    name: "distant obelisk",
    description: `Some kind of monument, maybe? It's hard to tell from this distance.`,
    sceneryDescription: `The park continues west, where a squat obelisk stands above a circle of hedges, and beyond that, several more buildings.`,
    location: "ParkEast",
    vocab: ["obelisk", "hedges", "circle"],
    itemClass: "solid",
    itemCategory: "scenery",
    meta: {
      sceneryDescriptionOrder: 4,
    },
    itemWeight: 2,
    itemSize: 3,
  },
];
