import { Room } from "@game/types/roomTypes";

export const parkRooms: Room[] = [
  {
    id: "HubEast",
    name: "Hub East",
    description: `This is a large, open, circular area with a high domed ceiling, and does a pretty good approximation of making one feel as though they have just stepped outside; the ground is actually covered in topsoil which is in turn covered with real grass, and gentle slopes have actually been landscaped in. The center of the circular court is dominated by a circular dias of brick, upon which is mounted a large, squat obelisk of granite. The obelisk has a large plaque which is carved into part of its base. The area surrounding the dias and obelisk is paved in smooth, tan-colored brick, and four similarly paved footpaths radiate out from the center. To your east is a large, sturdy-looking wooden door engraved with a leaf and floral pattern. Mounted on the wall next to the door is a metal panel with a thin horizontal slot in it, and just below the slot is a flat metal tray. You notice a small surveillance camera mounted high on the wall, just before the dome of the ceiling begins, pointed at the entrance`,
    exits: [
      { direction: "east", doorId: "HubDoor" },
      { direction: "north", toRoomId: "GymEntrance" },
      { direction: "south", toRoomId: "BarEntrance" },
      { direction: "west", toRoomId: "HubCenter" },
    ],
  },
  {
    id: "HubSouth",
    name: "Hub South",
    description: `This is the southernmost point of the Hub, as you follow along the outer rim of the brick-paved walkway. To the north across the grass you can see the obelisk at the Hub's center. The circular path continues to the east from here, where you can see the brick entrance to a structure in the distance, and also to the west where you can see what looks like it might be the entrance to a restaurant. There is a park bench here, facing inward to the Hub's center.`,
    exits: [
      { direction: "east", toRoomId: "BarEntrance" },
      { direction: "west", toRoomId: "RestaurantEntrance" },
      { direction: "north", toRoomId: "HubCenter" },
    ],
  },
  {
    id: "HubWest",
    name: "Hub West",
    description: `This is the westernmost point of the Hub, as you follow along the outer ring of the brick-paved walkway. To the east, across the grass, you can see the obelisk at the Hub's center. The circular path continues to the north from here, where you can see the entranceway that looks like it might be a movie theater; from where you're standing you can see a small marquee over the entranceway with the words 'THE TRIALS OF FRED' posted in block lettering. The path also continues to the south where you can see the entrance to what looks like a restaurant. There is a park bench here, facing inward to the Hub's center. Sitting in the park bench is the body of a middle aged woman, dressed in a white blouse and tartan skirt.`,
    exits: [
      { direction: "southeast", toRoomId: "RestaurantEntrance" },
      { direction: "northeast", toRoomId: "MovieEntrance" },
      { direction: "east", toRoomId: "HubTree" },
    ],
  },
  {
    id: "HubNorth",
    name: "Hub North",
    description: `This is the northernmost point of the Hub, as you follow along the outer ring of the brick-paved walkway. To the south, down a gentle slope in the grass, you can see the obelisk at the Hub's center. The circular path continues east from here, where you can see the entrance to some kind of facility, and also west where you can see the entrance to what looks like a movie theater. From where you're standing you can see part of a small marquee over the entranceway, where you can make out the words 'LS OF FRED' posted in block lettering. There is a park bench here, facing inward to the Hub's center.`,
    exits: [
      { direction: "east", toRoomId: "GymEntrance" },
      { direction: "west", toRoomId: "MovieEntrance" },
      { direction: "south", toRoomId: "HubCenter" },
    ],
  },
  {
    id: "HubTree",
    name: "Near the Tree",
    description: `You are standing near a tall, lanky tree that stands near the obelisk visible to the east. The tree has a long trunk, then sprouts a series of branches about twelve feet up. Whatever artificial sunlight is used in this place, it is positioned such that a nice patch of shade actually exists here, and the grass is plush. To the west you can see an area with a park bench where a woman appears to be sitting. To the north is the movie theatre entrance, and to the south you can see the entrance to a restaurant.`,
    exits: [
      { direction: "east", toRoomId: "HubCenter" },
      { direction: "west", toRoomId: "HubWest" },
      { direction: "north", toRoomId: "MovieEntrance" },
      { direction: "south", toRoomId: "RestaurantEntrance" },
      { direction: "up", toRoomId: "UpHubTree" },
    ],
  },
  {
    id: "UpHubTree",
    name: "Up the Tree",
    description: `You are holding onto the branches of the tree, hanging above the grassy area about twenty feet below where the artificial gravity has been deactivated. From up here you can see this area is a wide circle with the obelisk at its center; paths radiate outward in all directions from the area surrounding the obelisk, where they all join with a continuous outer walkway which circles the whole field. Positioned at the northeast, northwest, southeast and southwestern points of the outer rim are building faces which include a gymnasium, a movie theatre, a library, and a restaurant.`,
    exits: [{ direction: "down", toRoomId: "HubTree" }],
  },
  {
    id: "HubCenter",
    name: "Hub Center",
    description: `This is the center of the Hub. The brick-paved path which follows the outer rim of this place radiates in from the northeast, northwest, southeast, and southwest to connect with a large circular area paved in tan-colored brick, the center of which is dominated by a large brick dias. Mounted on the dias is a large, squat obelisk made of granite. The obelisk is approximately eight feet in height, and about four feet by four feet at its base. There is a plaque carved into it, upon which are chiseled the words: SEEK AND YE SHALL FIND. Just off the paved area is a four foot by four foot square stepping stone, upon which is a slightly raised green disk, four feet in diameter.`,
    exits: [
      { direction: "north", toRoomId: "HubNorth" },
      { direction: "south", toRoomId: "HubSouth" },
      { direction: "east", toRoomId: "HubEast" },
      { direction: "west", toRoomId: "HubTree" },
      { direction: "northeast", toRoomId: "GymEntrance" },
      { direction: "southeast", toRoomId: "BarEntrance" },
      { direction: "southwest", toRoomId: "RestaurantEntrance" },
      { direction: "northwest", toRoomId: "MovieEntrance" },
    ],
  },
];
