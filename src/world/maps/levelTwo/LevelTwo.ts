import { medicalWingRooms } from "src/world/maps/levelTwo/MedicalWing";
import type { WorldChunk } from "../../../game/types/gameTypes";
import { levelTwoDoors } from "../../doors/levelTwoDoors";
import { abominationItems } from "../../Items/creatures/abomination";
import { levelTwoItems } from "../../Items/levelTwoMisc";

export const LEVEL_TWO: WorldChunk = {
  items: [...levelTwoItems, ...abominationItems],
  doors: [...levelTwoDoors],
  teleportPads: [],
  rooms: [
    ...medicalWingRooms,
    {
      id: "LevelTwoBurnedArea",
      name: "Burned Area",
      description:
        "Of all the places you've seen so far, this is easily the most devastated. You're standing in the north-south corridor of what must have been living quarters, like the floor below. Here, however, the damage is horrific; the way north, just like one floor down, is completely closed off due to some kind of collapse. The way south is open but this whole area, which is easily big enough to cover several of the living units, has been completely burned away. The floor is blackened and covered in an inch of greasy black soot and you can see a skeletal forearm and hand sticking up out of the debris. As you look to the south, charred bits of wall poke up from the ash and down from the burnt ceiling like stubby, rotten teeth. Here and there you see taller pieces; in one area two pieces still suggest a corner to one of the units. Off to the west you can see a blackened washlet still standing amongst the rubble, and the area extends in that direction.",
      exits: [
        { direction: "east", toRoomId: "LevelTwoStairAccess" },
        { direction: "west", toRoomId: "EdgeOfBurnedArea" },
        { direction: "south", toRoomId: "LevelTwoCorridorFive" },
        // north is blocked by collapse
      ],
    },
    {
      id: "EdgeOfBurnedArea",
      name: "Edge of Burned Area",
      description:
        "This is the westernmost portion of the large, burned-out area of the Level Two living quarters. No one who was here could possibly have survived. All around are the burned remains of what must have been furnishings, reduced to nothing but clusters of ash. Curled among the debris is what looks like the remains of a person. The way is clear back to the east, the way you came, and a clear path winds through the debris to the south.",
      exits: [
        { direction: "east", toRoomId: "LevelTwoBurnedArea" },
        { direction: "north", toRoomId: "CornerOfBurnedArea" },
      ],
    },
    {
      id: "CornerOfBurnedArea",
      name: "Corner of Burned Area",
      description:
        "This is a dead-end corner tucked away in the burned area that has been devastated. Everything here has been charred beyond all recognition; it's impossible to tell what used to stand here. Sitting propped up in the corner are the charred remains of a body which has been reduced to little more than a blackened skeleton. Its legs are splayed out in front of it, and its bony arms hang askew by its sides. The grinning skull seems to look up at you, polished smooth and black by the flames, its mouth hanging grotesquely open as if in a silent scream.",
      exits: [{ direction: "south", toRoomId: "EdgeOfBurnedArea" }],
    },
    {
      id: "LevelTwoCorridorFive",
      name: "Level Two Corridor Junction",
      description:
        "This is a junction in the main corridor for accessing the Level Two living quarters. The fire seems to have travelled down both corridors, leaving them both charred. To the east is a burnt door whose surface has been blasted smooth. Another corridor branches off to the west.",
      exits: [
        { direction: "north", toRoomId: "LevelTwoBurnedArea" },
        { direction: "south", toRoomId: "LevelTwoCorridorFour" },
        { direction: "east", toRoomId: "LevelTwoCorridorJunction" },
      ],
    },
    {
      id: "LevelTwoCorridorJunction",
      name: "Level Two Corridor Branch",
      description:
        "This is a small connecting corridor which joins the main corridor of the living quarters and another parallel hall to the west. The fire damage seems to have tapered out here; about half of the hallway shows signs of being burned while the other half has some smoke damage but seems otherwise okay.",
      exits: [
        { direction: "west", toRoomId: "LevelTwoCorridorFive" },
        { direction: "east", toRoomId: "LevelTwoSecondaryCorridorTwo" },
        { direction: "south", toRoomId: "TheLearnatorium" },
      ],
    },
    {
      id: "TheLearnatorium",
      name: "Learnatorium",
      description: "The Learnatorium.",
      exits: [{ direction: "north", toRoomId: "LevelTwoCorridorJunction" }],
    },
    {
      id: "LevelTwoCorridorFour",
      name: "Level Two Corridor Four",
      description:
        "This is the main corridor for accessing the Level Two living quarters, or what's left of them. The entire hallway is covered in black soot and there are no lights. To the east is a door that has been completely burned. You can make out the outline of where a plastic label once was mounted on its face. The door to the west is completely gone, leaving only a dark opening in the wall.",
      exits: [
        { direction: "north", toRoomId: "LevelTwoCorridorFive" },
        { direction: "south", toRoomId: "LevelTwoCorridorThree" },
        { direction: "west", toRoomId: "LevelTwoBurnedQuartersFour" },
      ],
    },
    {
      id: "LevelTwoCorridorThree",
      name: "Level Two Corridor Three",
      description:
        "This is the main corridor for accessing the Level Two living quarters, or what's left of them. The entire hallway is covered in black soot and there are no lights. To the east is a door that has been completely charred. You can see the remains of a plastic label on it, but it's been almost completely blasted away. The door to the west has been completely obliterated along with a portion of the doorframe.",
      exits: [
        { direction: "north", toRoomId: "LevelTwoCorridorFour" },
        { direction: "south", toRoomId: "LevelTwoCorridorTwo" },
        { direction: "west", toRoomId: "LevelTwoBurnedQuartersThree" },
      ],
    },
    {
      id: "LevelTwoCorridorTwo",
      name: "Level Two Corridor Two",
      description:
        "This is the main corridor for accessing the Level Two living quarters, or what's left of them. The entire hallway is covered in black soot and there are no lights. To the east and west are doors that have been completely charred. You can see the remains of plastic labels on them, but they've been almost completely blasted away.",
      exits: [
        { direction: "north", toRoomId: "LevelTwoCorridorThree" },
        { direction: "south", toRoomId: "LevelTwoCorridorOne" },
      ],
    },
    {
      id: "LevelTwoCorridorOne",
      name: "Level Two Corridor One",
      description:
        "This is the main corridor for accessing the Level Two living quarters, or what's left of them. The entire hallway is covered in black soot, although it's a little less sooty down at this end. There are still no lights, though, and the burned stench still pervades the place. To the west is a door that has been partially charred. You can see a plastic label on it where you can make out '2AW'. There is a door on the east wall as well, with a label indicating '2AE'.",
      exits: [
        { direction: "north", toRoomId: "LevelTwoCorridorTwo" },
        { direction: "east", toRoomId: "LevelTwoBurnedQuartersOne" },
        { direction: "west", toRoomId: "Storage" },
      ],
    },
    {
      id: "Storage",
      name: "Storage L2",
      description: `Welcome to the Storage Room.`,
      exits: [{ direction: "east", toRoomId: "LevelTwoCorridorOne" }],
    },

    {
      id: "LevelTwoBurnedQuartersFour",
      name: "Fick Residence: Living Room",
      description:
        "This room has been damaged extensively by the fire; little has been left behind except the gutted remains of what looks to have been a television set which rests face down in the middle of the floor, and a few burnt sticks of what must have once been a sofa. The doorway to the south is completely blocked by a ceiling collapse in the room beyond. There is a doorway to the west leading into the darkness.",
      exits: [
        { direction: "west", toRoomId: "LevelTwoBurnedBedFour" },
        { direction: "east", toRoomId: "LevelTwoCorridorFour" },
        { direction: "south", toRoomId: "LevelTwoBurnedQuartersThree" },
      ],
    },
    {
      id: "LevelTwoBurnedBedFour",
      name: "Fick Residence: Bedroom",
      description:
        "This was once a bedroom, but it's been thoroughly burned. As you cast your flashlight beam around the room, all you can see are charred remnants of the furnishings: a blackened portion of an armoire, a shattered mirror, and a king-sized bed which has been burned down to its frame. The southern wall has actually burned through, providing a dark opening into the room beyond. A doorway leads back to the east.",
      exits: [
        { direction: "east", toRoomId: "LevelTwoBurnedQuartersFour" },
        { direction: "south", toRoomId: "LevelTwoBurnedBedThree" },
      ],
    },
    {
      id: "LevelTwoBurnedQuartersThree",
      name: "Empty Residence: Living Area",
      description:
        "This looks like it was the main living area of one of the housing units, but there is literally nothing left in it; the entire room has been fire gutted. There is a blackened blob near one wall which might have been the television or entertainment center, but the rest, including the furniture, has been burned to ash. Most of the wall to the east has been burned away, with only a portion of the doorway frame still separating the main living area from the bedroom.",
      exits: [
        { direction: "north", toRoomId: "LevelTwoBurnedQuartersFour" },
        { direction: "east", toRoomId: "LevelTwoCorridorThree" },
        { direction: "west", toRoomId: "LevelTwoBurnedBedThree" },
        { direction: "south", toRoomId: "LevelTwoBurnedQuartersTwo" },
      ],
    },
    {
      id: "LevelTwoBurnedBedThree",
      name: "Empty Residence: Bedroom",
      description:
        "Like the adjoining living area, this bedroom has been completely gutted by the fire. The center of the room is dominated by the twisted remains of a bedframe, and the blackened, bedspring skeleton that has dropped beneath it.",
      exits: [
        { direction: "north", toRoomId: "LevelTwoBurnedBedFour" },
        { direction: "east", toRoomId: "LevelTwoBurnedQuartersThree" },
      ],
    },
    {
      id: "LevelTwoBurnedQuartersTwo",
      name: "Wimbly Residence: Den",
      description:
        "This room, like the others, has seen extreme fire damage, but the fire seems to have begun burning itself out at this point and at least structurally this room is mostly intact. The wall separating the main living area from the bedroom has been burned away resulting in one large area, but the other walls and ceiling look sound. The sofa and loveseat are even still in one piece, though they are thoroughly covered with soot and smoke stains. There is a television with a shattered screen lying on one side next to the burned remains of a wooden TV stand.",
      exits: [
        { direction: "north", toRoomId: "LevelTwoBurnedQuartersThree" },
        { direction: "east", toRoomId: "LevelTwoCorridorTwo" },
        // Western exit collapsed
      ],
    },
    {
      id: "LevelTwoBurnedQuartersOne",
      name: "Living Quarters One East",
      description:
        "These quarters have been only slightly burned, but don't appear to have been in use. The room is completely empty. Traced in the ash by what looks to have been a fingertip is the phrase 'Who am I?'. Bare footprints lead into the room from a doorway to the south, and out of the room to the west. There is also a doorway to the east, but it looks like the room beyond has caved in.",
      exits: [
        { direction: "west", toRoomId: "LevelTwoCorridorOne" },
        { direction: "south", toRoomId: "LevelTwoBurnedBathOne" },
        // east bedroom crushed
      ],
    },
    {
      id: "LevelTwoBurnedBathOne",
      name: "One East Bath",
      description:
        "This is a disused bathroom which seems to have suffered some smoke damage. The only fixtures are a washlet, sink, shower, and a mirror mounted over the sink. The floor is covered in a thin layer of ash, through which a series of bare footprints lead out of the room to the north.",
      exits: [{ direction: "north", toRoomId: "LevelTwoBurnedQuartersOne" }],
    },
    {
      id: "LevelTwoSecondaryCorridorOne",
      name: "Level Two Secondary Corridor One",
      description: "The hallway here ends at a dark doorway leading south.",
      exits: [
        { direction: "west", toRoomId: "LevelTwoSecondaryCorridorTwo" },
        { direction: "south", toRoomId: "MedicalEntrance" },
      ],
    },
    {
      id: "LevelTwoSecondaryCorridorTwo",
      name: "Level Two Secondary Corridor Two",
      description:
        "There is still a little residual smoke damage here, but the fire seems to have burned itself out in the connecting corridor. The hallway forms a T here, heading east back to the main living quarters corridor, as well as trailing into the darkness to both north and south. Far to the north, in the darkness, you can see a red light flashing at regular intervals. There is a set of double doors on the west wall over which is a soot-streaked sign stating 'OFFICER'S MESS'.",
      exits: [
        { direction: "east", toRoomId: "LevelTwoSecondaryCorridorOne" },
        { direction: "west", toRoomId: "LevelTwoCorridorJunction" },
        // { direction: "south", toRoomId: "LevelTwoSecondaryCorridorThree" },
      ],
    },
    // {
    //   id: "LevelTwoSecondaryCorridorThree",
    //   name: "Level Two Secondary Corridor Three",
    //   description:
    //     "The hallway ends here, where a large doorway leads west. Over the doorway is a sign reading 'ARMORY', and over the sign is a panel which is flashing red. Through the doorway, you can see into the storage area beyond where a heavy-set, naked male body lies sprawled face down on the floor. The way inside looks clear.",
    //   exits: [
    //     { direction: "north", toRoomId: "LevelTwoSecondaryCorridorTwo" },
    //     { direction: "east", toRoomId: "ARMORY" },
    //   ],
    // },
  ],
};
