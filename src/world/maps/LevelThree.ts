import { drugItems } from "../objects/drugs";
import { levelThreeItems } from "../objects/levelThreeMisc";
import { syringe } from "../objects/syringe";
import type { WorldChunk } from "../types";

export const LEVEL_THREE: WorldChunk = {
  rooms: [
    {
      id: "LevelThreeCorridorOne",
      name: "Level Three Corridor One",
      description: `The corridor ends here, stretching off into darkness to the north. To the east and west are doors affixed with neat black plastic labels indicating '3AE' and '3AW' respectively. A strip of yellow and black tape has been stretched across the eastern door.`,
      exits: [
        { direction: "north", toRoomId: "LevelThreeCorridorTwo" },
        { direction: "east", doorId: "DOOR3AE" },
        { direction: "west", doorId: "DOOR3AW" },
      ],
    },
    {
      id: "LevelThreeCorridorTwo",
      name: "Level Three Corridor Two",
      description: `The corridor continues south for a short ways here, and off into the darkness to the north. There seems to be some kind of substance splashed across the floor and part of the western wall here. To the west is a door affixed with neat black plastic label indicating '3BW'. There is a door to the east which is currently hanging open, with the tattered remains of a strip of yellow and black warning tape at either side of the gap. Peering through the doorway you see that there doesn't seem to be any light coming from within.`,
      exits: [
        { direction: "north", toRoomId: "LevelThreeCorridorThree" },
        { direction: "south", toRoomId: "LevelThreeCorridorOne" },
        { direction: "east", doorId: "DOOR3BE" },
        { direction: "west", doorId: "DOOR3BW" },
      ],
    },
    {
      id: "LevelThreeCorridorThree",
      name: "Level Three Corridor Three",
      description: `The corridor stretches into the darkness to the north and south here. To the east and west are doors affixed with neat black plastic labels indicating '3CE' and '3CW' respectively.`,
      exits: [
        { direction: "north", toRoomId: "LevelThreeCorridorFour" },
        { direction: "south", toRoomId: "LevelThreeCorridorTwo" },
        { direction: "east", doorId: "DOOR3CE" },
        { direction: "west", doorId: "DOOR3CW" },
      ],
    },
    {
      id: "LevelThreeCorridorFour",
      name: "Level Three Corridor Junction",
      description: `This is a junction in the main corridor for accessing the Level Three Living Quarters. To the east is a door affixed with a neat black plastic label indicating '3DE'. Another corridor branches off to the west.`,
      exits: [
        { direction: "north", toRoomId: "LevelThreeCorridorFive" },
        { direction: "south", toRoomId: "LevelThreeCorridorThree" },
        { direction: "east", doorId: "DOOR3DE" },
        { direction: "west", toRoomId: "LevelThreeCorridorBranch" },
      ],
    },
    {
      id: "LevelThreeCorridorFive",
      name: "Level Three Corridor Five",
      description: `This is a dimly lit corridor stretching off to the north and south. To the east and west are doors affixed with neat black plastic labels reading '3EE' and '3EW' respectively. Hanging on either side of the eastern door are the ends of a broken strip of yellow and black warning tape.`,
      exits: [
        { direction: "north", toRoomId: "LevelThreeCorridorSix" },
        { direction: "south", toRoomId: "LevelThreeCorridorFour" },
        { direction: "east", doorId: "DOOR3EE" },
        { direction: "west", doorId: "DOOR3EW" },
      ],
    },
    {
      id: "LevelThreeCorridorSix",
      name: "Level Three Corridor Six",
      description: `This is the main corridor for accessing the Level Three Living Quarters. To the east and west are doors affixed with neat black plastic labels indicating '3FE' and '3FW' respectively.`,
      exits: [
        { direction: "north", toRoomId: "LevelThreeCorridorSeven" },
        { direction: "south", toRoomId: "LevelThreeCorridorFive" },
        { direction: "east", doorId: "DOOR3FE" },
        { direction: "west", doorId: "DOOR3FW" },
      ],
    },
    {
      id: "LevelThreeCorridorSeven",
      name: "Ruined Corridor",
      description: `This is the main corridor for accessing the Level Three Living Quarters. Only one of the lights remains on here, providing just a flickering, weak electric strobe. The way north has been cut off by a violent buckle in the deck which has caused the huge metal floor plating to wrinkle, actually piercing the ceiling above it in spots. A huge amount of debris has settled in the upheaval. A small gap near the ceiling is the only way through, but it's much too small to fit through. To the west is a door affixed with neat black plastic labels reading '3GW' and a strip of yellow and black warning tape stretched across it. There is no door to the east; instead the corridor bends and heads off in that direction.`,
      exits: [
        { direction: "south", toRoomId: "LevelThreeCorridorSix" },
        { direction: "west", doorId: "DOOR3GW" },
        { direction: "north", toRoomId: "LevelThreeCubby" },
        { direction: "east", toRoomId: "LevelThreeStairAccess" },
      ],
    },
    {
      id: "LevelThreeCubby",
      name: "Cubby",
      description: `This is a small cubby in the midst of tons of rubble and debris; you can pick out broken furnishings, ceiling panels...even clothing. To the west the wall has ruptured, exposing some kind of air duct.^^A child's doll lies crumpled in one corner, missing an arm and covered in soot.`,
      exits: [
        { direction: "south", toRoomId: "LevelThreeCorridorSeven" },
        { direction: "west", toRoomId: "LevelThreeDuct" },
      ],
    },
    {
      id: "LevelThreeDuct",
      name: "Level Three Duct",
      description: `This is a narrow duct of some kind, about twice as wide and tall as the cat. It looks like part of the floor above has caved in on the duct, creating a tear which looks like it leads north through the floor into a room beyond.`,
      exits: [
        { direction: "east", toRoomId: "LevelThreeCubby" },
        { direction: "north", toRoomId: "LevelThreeSecretRoom" },
      ],
    },
    {
      id: "LevelThreeSecretRoom",
      name: "Level Three Secret Room",
      description: `This appears to have been a living room, but it is now devestated; you can see a sofa split into two pieces and lying on its back amongst the rubble and debris, including a broken end table, a shattered lamp, an overturned plant, and various electronics which may be sound equipment scattered all over the floor. You can just make out part of what looks to have been the front door to the quarters, which now lies askew on the floor with the other debris. The plate on the door reads '3HW'. Lying nearby is a woman's body, face down, long, tangled hair covering her face. Judging by her twisted position she has to be dead...lying on the floor near her body is a cylinder of red serum. You can just make out the label, which reads 'SERITROXIN'.`,
      exits: [{ direction: "south", toRoomId: "LevelThreeDuct" }],
    },
    {
      id: "LevelThreeCorridorBranch",
      name: "Level Three Corridor Branch",
      description: `This is a branch off the main corridor for accessing the Level Three Living Quarters. The hall continues to the west.`,
      exits: [
        { direction: "east", toRoomId: "LevelThreeCorridorFour" },
        { direction: "west", toRoomId: "LevelThreeSecondCorridorTwo" },
      ],
    },

    // LIVING QUARTERS ONE EAST
    {
      id: "LivingQuartersOneEast",
      name: "Living Quarters One East",
      description: `This is a tasteful but disorderly living room, consisting mainly of a sofa and loveseat combination facing a television set and videogame console. A small, shag area rug covers a stain near the entryway with moderate success. There is a print on one wall depicting a pop idol. There is a door to the south and also to the west, and a doorway leading into what looks like a bedroom area to the east.`,
      exits: [
        { direction: "west", doorId: "DOOR3AE" },
        { direction: "south", doorId: "OneEastBDoor" },
        { direction: "east", toRoomId: "OneEastBed" },
      ],
    },
    {
      id: "OneEastBath",
      name: "One East Bathroom",
      description: `This is a small bathroom, equipped with a stand-alone shower, a sink, and a washlet. Mounted on the wall above the sink is a mirror which is spattered here and there with toothpaste. The bathroom looks like it hasn't been cleaned in a while; the washlet has a ring of scum around the water-line and the sink looks as though it hasn't been scrubbed in months. A door leads back out to the north.`,
      exits: [{ direction: "north", doorId: "OneEastBDoor" }],
    },
    {
      id: "OneEastBed",
      name: "One East Bedroom",
      description: `This room has an off-smell to it. There is a twin bed situated against the south wall, to your right, with an endtable next to it. The endtable has a ceramic lamp resting on it. The floor is littered with old laundry, and the whole place looks like it hasn't been cleaned in ages. Mounted over the bed is another print of what must be a musician of some kind.^^The bed covers are twisted around what looks like a human figure which is lying in the bed. Resting on the end table is a flat, compact messaging system with an integrated headset. A doorway leads back out to the west into the Living Area.`,
      exits: [{ direction: "west", toRoomId: "LivingQuartersOneEast" }],
    },

    // LIVING QUARTERS TWO EAST
    {
      id: "LivingQuartersTwoEast",
      name: "Living Quarters Two East",
      description: `This set of living quarters is a complete wreck...as you cast the flashlight beam around to room you see a grey sofa which has been overturned, stuffing spilling from one side, a loveseat in similar condition lying on its side near the north wall, what looks like the splintered remains of a desk, and strewn all around are the smashed remnants of a television and what might have been a stereo...it looks as though someone or something deliberately trashed the place, and there is shattered glass, plastic, and small electronic components scattered everywhere. There are tears on the surface of the furniture, and what look like deep claw marks gouging the walls. You can see the shattered remains of the lighting near the ceiling. A door to the south has been pulverized, leaving only an empty doorway, and another doorway leads east.`,
      exits: [
        { direction: "west", toRoomId: "LevelThreeCorridorTwo" },
        { direction: "south", doorId: "TwoEastBDoor" },
        { direction: "east", toRoomId: "TwoEastBed" },
      ],
    },
    {
      id: "TwoEastBath",
      name: "Two East Bathroom",
      description: `This is a small bathroom which looks to have been ransacked; the flashlight beam reveals a toilet with a chunk missing from one side, a sink which has been smashed off the wall and is currently resting on the floor next to the toilet, a shattered mirror mounted above where the sink used to be, and a shredded shower curtain hanging in ribbons in front of a small shower unit. Above you, you can see the remains of the lighting fixtures which have also been destroyed. A doorway leads back out to the north.`,
      exits: [{ direction: "north", toRoomId: "LivingQuartersTwoEast" }],
    },
    {
      id: "TwoEastBed",
      name: "Two East Bedroom",
      description: `These sleeping quarters have likewise been violently torn apart; your flashlight finds the remains of a double bed which dominates the room, the bedding torn apart and strewn everywhere. The headboard is splintered on the left side and deeply gouged with what appear to be claw marks. The mattress has been split open and tossed to one side, and the boxspring has been ripped open. An endtable and dresser have been overturned, scattering sundries across the floor to mingle with the rest of the debris. Lying on the floor is a somewhat battered message box with an integrated headset. A doorway leads back out to the west.`,
      exits: [{ direction: "west", toRoomId: "LivingQuartersTwoEast" }],
    },

    // LIVING QUARTERS TWO WEST
    {
      id: "LivingQuartersTwoWest",
      name: "Living Quarters Two West",
      description: `This is a spartan set of living quarters, furniture-wise; there's an entertainment center complete with stereo near the north wall, with a comfortable-looking sofa and loveseat facing that general direction, and that's about it. What it lacks in furnitings, however, it makes up for in plants; there are a number of plants in pots on the floor, on an end table, and hanging from several plant hangers positioned around the room. The overall effect is rather nice; a little like being outside almost. A door leads to the south and a doorway leads west into the bedroom area. A door leads back out to the east.`,
      exits: [
        { direction: "east", toRoomId: "LevelThreeCorridorTwo" },
        { direction: "south", doorId: "TwoWestBDoor" },
        { direction: "west", toRoomId: "TwoWestBed" },
      ],
    },
    {
      id: "TwoWestBath",
      name: "Two West Bathroom",
      description: `This is a moderately clean bathroom with a sink, toilet and half-shower. An oval mirror is mounted over the sink. A door leads back out to the north.`,
      exits: [{ direction: "north", doorId: "TwoWestBDoor" }],
    },
    {
      id: "TwoWestBed",
      name: "Two West Bedroom",
      description: `The bedroom to these quarters is decorated in the same motif as the living area; there is a double bed dominating the center of the room, and a dresser against the southern wall with a lamp sitting on it. The rest of the room seems devoted to a variety of different plant specimens, including flowers, small potted shrubs, hanging plants and more of the ivy running along one wall. Resting on the end table is a flat, compact messaging system with an integrated headset. A doorway leads back to the Living Area to the east.`,
      exits: [{ direction: "east", toRoomId: "LivingQuartersTwoWest" }],
    },

    // LIVING QUARTERS FOUR EAST
    {
      id: "LivingQuartersFourEast",
      name: "Living Quarters Four East",
      description: `This is a modest but tasteful living room, with a sofa and loveseat combination situated around an entertainment center. There is an endtable next to the sofa. There is a doorway leading east, a door to the south, and another doorway to the west which leads back out into the corridor. The room gives the general impression that perhaps someone, or a group of people, were in here moving things around...maybe searching for something. The room is more or less in order, but looks to be in slight disarray. You notice there seems to be a good deal of cat hair on the carpet and furniture here. A door leads south, and a doorway leads into the bedroom area to the east.`,
      exits: [
        { direction: "west", toRoomId: "LevelThreeCorridorFour" },
        { direction: "south", doorId: "FourEastBDoor" },
        { direction: "east", toRoomId: "FourEastBed" },
      ],
    },
    {
      id: "FourEastBath",
      name: "Four East Bathroom",
      description: `Like the main living area, the bathroom looks like perhaps it was searched, then hastilly straightened up. There is a sink, toilet, and half-shower, with a mirror mounted over the sink. A door leads back out to the north.`,
      exits: [{ direction: "north", doorId: "FourEastBDoor" }],
    },
    {
      id: "FourEastBed",
      name: "Four East Bedroom",
      description: `This bedroom is dominated by a huge king-sized bed, piled with a comforter and a ton of pillows. There is a spot in the middle of the bed where a lot of cat hair has accumulated. Flanking the bed on one side is a dresser, and there is an end table with a brass lamp on the other side. Resting on the end table is a flat, compact messaging system with an integrated headset.`,
      exits: [{ direction: "west", toRoomId: "LivingQuartersFourEast" }],
    },

    // LIVING QUARTERS FIVE EAST
    {
      id: "LivingQuartersFiveEast",
      name: "Living Room",
      description: `This is a modest but tasteful living room, with a sofa and loveseat combination situated around an entertainment center. There is an endtable next to the loveseat wich supports a lamp designed to look like a Japanese paper lantern. The room is dimly lit, with eerie shadows playing across the walls and ceiling. The carpet is a light cream color, and there seem to be footprints covering it here and there. There is a doorway leading east, a wooden door to the south, and another, heavier looking door to the west.`,
      exits: [
        { direction: "west", toRoomId: "LevelThreeCorridorFive" },
        { direction: "south", doorId: "FiveEastBDoor" },
        { direction: "east", toRoomId: "FiveEastBed" },
      ],
    },
    {
      id: "FiveEastBath",
      name: "Bathroom",
      description: `This is a small bathroom, equipped with a stand-alone shower, a sink, and a washlet. Mounted on the wall above the sink is a mirror. The bathroom looks spotless and functional. A door leads back out to the north.`,
      exits: [{ direction: "north", doorId: "FiveEastBDoor" }],
    },
    {
      id: "FiveEastBed",
      name: "Bedroom",
      description: `This is a bedroom where a double bed dominates the room. The bed is made and has not been disturbed. Next to the bed is an end table with another Japanese style lamp. Against the south wall is a dresser, and to the north is a closet door. Resting on the end table is a flat, compact messaging system with an integrated headset. A doorway leads back into the Living Area to the west.`,
      exits: [{ direction: "west", toRoomId: "LivingQuartersFiveEast" }],
    },

    // LIVING QUARTERS SIX WEST
    {
      id: "LivingQuartersSixWest",
      name: "Living Quarters Six West",
      description: `This set of quarters are clean and rather elegant; There is a slick-looking entertainment center with a pristine white sofa and loveseat positioned near it. A wooden end-table rests near the sofa. A door leads south, and a doorway leads into the bedroom area to the west.`,
      exits: [
        { direction: "east", toRoomId: "LevelThreeCorridorSix" },
        { direction: "south", doorId: "SixWestBDoor" },
        { direction: "west", toRoomId: "SixWestBed" },
      ],
    },
    {
      id: "SixWestBath",
      name: "Six West Bathroom",
      description: `This is a well-kept bathroom, with a sparkling porcelin sink, toilet and shower. Mounted over the sink is a rectangular mirror with beveled edges. There are three bright red drops of what look like blood in the sink. A door leads back out to the north.`,
      exits: [{ direction: "north", doorId: "SixWestBDoor" }],
    },
    {
      id: "SixWestBed",
      name: "Six West Bedroom",
      description: `This room is immaculately kept; the double bed is fastidiously made and everything is arranged with an almost mathematical precision. Flanking the bed is a dresser and an end table which are both perfectly arranged with no sign of dust. Over the bed hangs a large print, maybe five feet by four feet, of a grim, black, faceless marionnete puppet carrying a lit matchstick being made to set fire to a large, cringing spider. Above the scene is the stylized name 'Report To Skinny' and below it the single-word title 'Nature'. To the north is a closet door and east is a doorway leading back to the main living quarters. Resting on the end table is a flat, compact messaging system with an integrated headset. A doorway leads east, back out to the Living Area.`,
      exits: [{ direction: "east", toRoomId: "LivingQuartersSixWest" }],
    },

    // LIVING QUARTERS SEVEN WEST
    {
      id: "LivingQuartersSevenWest",
      name: "Living Quarters Seven West",
      description: `These quarters have felt the impact of whatever it was that destroyed the corridor to the east; the entire northern wall has been caved in and the floor is bucked upward in that direction. A sofa was resting against that wall, and is now pinned under the sheared metal plating and debris. You can see a pair of women's legs protruding from the wreckage, still in the sitting position on the sofa. There is a loveseat here which is pitched over on its side next to a partially-crushed end table, and both they and the sofa appear to have been positioned around what's left of an entertainment center. Through the center of the room is a trail of dried blood spots and spatters which zig-zag past a door to the south and through a doorway to the west. About half of the lights are out in this room, but the other half are still functioning.`,
      exits: [
        { direction: "east", toRoomId: "LevelThreeCorridorSeven" },
        { direction: "south", doorId: "SevenWestBDoor" },
        { direction: "west", toRoomId: "SevenWestBed" },
      ],
    },
    {
      id: "SevenWestBath",
      name: "Seven West Bathroom",
      description: `This is a small bathroom, equipped with a stand-alone shower, a sink, and a washlet. Mounted on the wall above the sink is a mirror. The bathroom looks spotless and functional. A door leads back out to the north.`,
      exits: [{ direction: "north", doorId: "SevenWestBDoor" }],
    },
    {
      id: "SevenWestBed",
      name: "Seven West Bedroom",
      description: `This is a small bedroom which has also been severely damaged; the north wall is almost completely caved in and the bed, which was fortunately empty at the time, has been impaled by the corner of a heavy piece of metal plating that was forced down through the ceiling. A trail of dried blood spots stops here. Resting on the end table is a flat, compact messaging system with an integrated headset. A doorway leads east back into the Living Area.`,
      exits: [{ direction: "east", toRoomId: "LivingQuartersSevenWest" }],
    },

    // SECONDARY CORRIDOR BRANCH
    {
      id: "LevelThreeSecondCorridorTwo",
      name: "Level Three Secondary Corridor",
      description: `This is another T in the corridor, where the corridor branch connects with a secondary corridor. The secondary corridor extends north and south from here. There is also a large, sturdy-looking wooden door to the west, engraved with a leaf and floral pattern. Mounted on the wall next to the door is a metal panel with a thin horizontal slot in it. Just below the slot is a flat metal tray. Mounted over the door is a bronze plaque. The bronze plaque is engraved with the words 'THE HUB'`,
      exits: [
        { direction: "north", toRoomId: "LevelThreeSecondCorridorThree" },
        { direction: "south", toRoomId: "LevelThreeSecondCorridorOne" },
        { direction: "west", doorId: "HubDoor" },
        { direction: "east", toRoomId: "LevelThreeCorridorBranch" },
      ],
    },
    {
      id: "LevelThreeSecondCorridorThree",
      name: "Level Three Secondary Corridor",
      description: `The secondary corridor ends here. There is a large glass door with an aluminum frame to the west.`,
      exits: [
        { direction: "south", toRoomId: "LevelThreeSecondCorridorTwo" },
        { direction: "west", doorId: "LevelThreeSecondCorrThreeDoor" },
      ],
    },
    {
      id: "LevelThreeSecondCorridorOne",
      name: "Level Three Secondary Corridor",
      description: `The secondary corridor ends here. There is a set of double doors to the south with a plastic sign mounted overhead. The sign is white with black block lettering which reads 'DeM Main Medical Facility'`,
      exits: [
        { direction: "north", toRoomId: "LevelThreeSecondCorridorTwo" },
        { direction: "south", toRoomId: "MedicalEntrance" },
      ],
    },

    // SPA / SAUNA / STEAM / MASSAGE
    {
      id: "Spa",
      name: "Spa",
      description: `This appears to be some kind of recreational spa. It is a wide, open area with pristine white ceramic tiling covering the floor and walls. The center of the spa is predominated by a what looks like a very large jaquzzi which has a sort of 'four leaf clover' shape, effectively providing four separate areas to congregate. The jets in the tub are currently inactive, and the glow of the overhead light twinkles off the jaquzzi's tiles. There is a check in station to the right which is unoccupied, and racks with towels and facecloths are located just to the left of that. The room is large with a high ceiling, and the wide open space gives the whole room excellent acoustics, causing even your footsteps to echo slightly. There is a wooden door on the opposite wall to the west with a check-in board next to it. To the north is another wooden door which appears to be made of cedar, with a small glass porthole in it at about head's height. The the south is a white metal door with an aluminum handle.^^A light switch is visible on the east wall next to the exit.`,
      exits: [
        { direction: "east", doorId: "LevelThreeSecondCorrThreeDoor" },
        { direction: "north", doorId: "CedarDoor" },
        { direction: "south", doorId: "SteamRoomDoor" },
        { direction: "west", doorId: "MassageDoor" },
      ],
    },
    {
      id: "Sauna",
      name: "Sauna",
      description: `It's difficult to see in here; the light has been smashed and the only light to see by is what trickles in from the main Spa. You can see the interior of the sauna has taken heavy damage, with deep claw marks gouging every surface visible in the gloom. The entire chamber smells of body odor, with a faint smell of eucalyptus.`,
      exits: [{ direction: "south", doorId: "CedarDoor" }],
    },
    {
      id: "SteamRoom",
      name: "Steam Room",
      description: `It's hard to see in here; the interior light doesn't seem to be working and the only light is what seeps in from the main Spa. It appears to be a large, rectangular room with a high ceiling disappearing into the gloom. Every surface seems to be covered in small, white ceramic tile.`,
      exits: [{ direction: "north", doorId: "SteamRoomDoor" }],
    },
    {
      id: "Massage",
      name: "Massage Parlor",
      description: `This is a cozy, clean little room dominated by a comfortable-looking padded massage table. The room smells faintly of a pleasant mixture of scented oils.`,
      exits: [{ direction: "east", doorId: "MassageDoor" }],
    },

    // HUB
    {
      id: "HubEast",
      name: "Hub East",
      description: `This is a large, open, circular area with a high domed ceiling, and does a pretty good approximation of making one feel as though they have just stepped outside; the ground is actually covered in topsoil which is in turn covered with real grass, and gentle slopes have actually been landscaped in. The center of the circular court is dominated by a circular dias of brick, upon which is mounted a large, squat obelisk of granite. The obelisk has a large plaque which is carved into part of its base. The area surrounding the dias and obelisk is paved in smooth, tan-colored brick, and four similarly paved footpaths radiate out from the center. To your east is a large, sturdy-looking wooden door engraved with a leaf and floral pattern. Mounted on the wall next to the door is a metal panel with a thin horizontal slot in it, and just below the slot is a flat metal tray. You notice a small surveillance camera mounted high on the wall, just before the dome of the ceiling begins, pointed at the entrance`,
      exits: [
        { direction: "east", doorId: "HubDoor" },
        { direction: "north", toRoomId: "GymEntrance" },
        { direction: "south", toRoomId: "LibraryEntrance" },
        { direction: "west", toRoomId: "HubCenter" },
      ],
    },
    {
      id: "HubSouth",
      name: "Hub South",
      description: `This is the southernmost point of the Hub, as you follow along the outer rim of the brick-paved walkway. To the north across the grass you can see the obelisk at the Hub's center. The circular path continues to the east from here, where you can see the brick entrance to a structure in the distance, and also to the west where you can see what looks like it might be the entrance to a restaurant. There is a park bench here, facing inward to the Hub's center.`,
      exits: [
        { direction: "east", toRoomId: "LibraryEntrance" },
        { direction: "west", toRoomId: "RestaurantEntrance" },
        { direction: "north", toRoomId: "HubCenter" },
      ],
    },
    {
      id: "HubWest",
      name: "Hub West",
      description: `This is the westernmost point of the Hub, as you follow along the outer ring of the brick-paved walkway. To the east, across the grass, you can see the obelisk at the Hub's center. The circular path continues to the north from here, where you can see the entranceway that looks like it might be a movie theater; from where you're standing you can see a small marquee over the entranceway with the words 'THE TRIALS OF FRED' posted in block lettering. The path also continues to the south where you can see the entrance to what looks like a restaurant. There is a park bench here, facing inward to the Hub's center. Sitting in the park bench is the body of a middle aged woman, dressed in a white blouse and tartan skirt.`,
      exits: [
        { direction: "south", toRoomId: "RestaurantEntrance" },
        { direction: "north", toRoomId: "MovieEntrance" },
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
        { direction: "southeast", toRoomId: "LibraryEntrance" },
        { direction: "southwest", toRoomId: "RestaurantEntrance" },
        { direction: "northwest", toRoomId: "MovieEntrance" },
      ],
    },

    // MOVIE THEATRE
    {
      id: "MovieEntrance",
      name: "Movie Theatre Entrance",
      description: `This is the entrance to a small movie theater; glass doors lead into the theater to the northwest, hanging over which is a small marquee with the words 'THE TRIALS OF FRED' spelled out in block lettering. There is a narrow, green metal doorway located to the west, and a bent, green door lying in the grass nearby with the words DO NOT ENTER stenciled on its surface in small white lettering. A tan colored brick-paved path leads southwest into the Hub's center.`,
      exits: [
        { direction: "southeast", toRoomId: "HubCenter" },
        { direction: "northwest", toRoomId: "MovieTheatreOne" },
        { direction: "west", toRoomId: "Projection" },
        { direction: "east", toRoomId: "HubNorth" },
        { direction: "south", toRoomId: "HubWest" },
        { direction: "up", toRoomId: "Projection" },
      ],
    },
    {
      id: "Projection",
      name: "Projector Room",
      description: `This is the movie theater's projection room, a small, cozy area which looks to have been torn to shreds; The remains of what looks like a wooden chair lies in pieces and the walls and floor have been gouged with what look like deep claw marks. A trail of dried blood heads in the direction of the door then peters out. There is a small window which overlooks the movie theater below, and the projector, looking a bit battered, stares out through this window, the lens dark.`,
      exits: [
        { direction: "east", toRoomId: "MovieEntrance" },
        { direction: "down", toRoomId: "MovieEntrance" },
      ],
    },
    {
      id: "MovieTheatreOne",
      name: "Movie Theatre",
      description: `This is a small lobby where tickets are purchased and dispensed...it looks like kind of a no-frills affair; there's no candy counter or anything, just a glass partition where a ticket seller might stand. A doorway leads southeast out of the theatre, and wide doorway opens up into the main theatre to the north.`,
      exits: [
        { direction: "southeast", toRoomId: "MovieEntrance" },
        { direction: "north", toRoomId: "MovieTheatreTwo" },
      ],
    },
    {
      id: "MovieTheatreTwo",
      name: "Movie Theatre",
      description: `You are standing at the back of two rows of movie theatre seats which are separated by a center aisle. The movie screen, now lit up with a flat, white light, looms before you to the north.`,
      exits: [{ direction: "south", toRoomId: "MovieTheatreOne" }],
    },

    // RESTAURANT AREA
    {
      id: "RestaurantEntrance",
      name: "Restaurant Entrance",
      description: `This is the entrance to a restaurant with a small outdoor-cafe area. There are several round tables, each surrounded by several chairs, situated on a level area covered in red, white, and green colored tile. Mounted over the door leading in is a large, rustic-looking painted sign which reads 'ALBERTOS'. A paved brick path leads northeast through a grassy area toward a large, stone obelisk. The path around the hub's perimeter also leads north and east. A glass door leads southwest into the establishment.`,
      exits: [
        { direction: "northeast", toRoomId: "HubCenter" },
        { direction: "southwest", toRoomId: "Restaurant" },
        { direction: "north", toRoomId: "HubWest" },
        { direction: "east", toRoomId: "HubSouth" },
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
        { direction: "northwest", toRoomId: "Kitchen" },
        { direction: "northeast", toRoomId: "RestaurantEntrance" },
      ],
    },
    {
      id: "Kitchen",
      name: "Kitchen",
      description: `This is the kitchen area for the restaurant. It appears to have been hastilly abandoned, and you see signs of things having been cleaned up quickly, then perhaps abandoned before the clean-up was quite complete. Most of the food has been put away, with only some scattered flour, bread crumbs, and a few pieces of stray pasta to betray the fact that this was a once busy kitchen. One wall is dominated by a large steel door which must belong to a walk-in refridgerator which is padlocked.`,
      exits: [{ direction: "southeast", toRoomId: "Restaurant" }],
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

    // GYM
    {
      id: "GymEntrance",
      name: "Gymnasium Entrance",
      description: `This is the entrance to a gymnasium of some sort. There are aluminum and plexiglass double-doors leading northeast into the gym, and mounted over the entrance is a sign reading 'PLANET FITNESS' and sporting a logo of a comically muscled man with a mean-looking grin holding a ringed planet with a distressed face in a headlock.`,
      exits: [
        { direction: "southwest", toRoomId: "HubCenter" },
        { direction: "northeast", toRoomId: "Gym" },
        { direction: "south", toRoomId: "HubEast" },
        { direction: "west", toRoomId: "HubNorth" },
      ],
    },
    {
      id: "Gym",
      name: "Gymnasium",
      description: `This is a large gymnasium broken down into several parts; there are numerous weight machines present on the main floor, and next to that an open area with a few benches where racks of free-weights rest against the wall. Another portion of the main floor is set aside for stationary bicycles, stair machines, and treadmills. There is a track for running which forms a rectangle around the room's perimeter. To the northwest is a doorway, mounted over which is a small sign reading 'MEN'S SHOWERS', and to the northeast is another doorway with a small sign reading 'WOMEN'S SHOWERS'. The gym's exit is to the southwest.`,
      exits: [
        { direction: "northeast", toRoomId: "WomensShower" },
        { direction: "northwest", toRoomId: "MensShower" },
        { direction: "southwest", toRoomId: "GymEntrance" },
      ],
    },
    {
      id: "MensShower",
      name: "Men's Locker Room",
      description: `This is the men's locker room. There are a series of thin, worn wooden benches running alongside rows of lockers. To the south is a doorway leading into the showers, and to the north is a doorway which leads back out to the gymnasium.`,
      exits: [
        { direction: "south", toRoomId: "MShower" },
        { direction: "southeast", toRoomId: "Gym" },
      ],
    },
    {
      id: "MShower",
      name: "Men's Shower",
      description: `This is a large, open shower area with three showerheads available on each of the east, west, and south walls. The entire room, floor, walls, and ceiling, is tiled with small, shiny white tiles.`,
      exits: [{ direction: "north", toRoomId: "MensShower" }],
    },
    {
      id: "WomensShower",
      name: "Women's Locker Room",
      description: `This is the women's locker room. There are a series of thin, worn wooden benches running alongside rows of lockers. To the south is a doorway leading into the showers, and to the north is a doorway which leads back out to the gymnasium.`,
      exits: [
        { direction: "southwest", toRoomId: "Gym" },
        { direction: "south", toRoomId: "WShower" },
      ],
    },
    {
      id: "WShower",
      name: "Women's Shower",
      description: `This is a large, open shower area with three showerheads available on each of the east, west, and south walls. The entire room, floor, walls, and ceiling, is tiled with small, shiny white tiles.`,
      exits: [{ direction: "north", toRoomId: "WomensShower" }],
    },

    // LIBRARY
    {
      id: "LibraryEntrance",
      name: "Library Entrance",
      description: `This is the stately entrance to what a large, engraved stone sign embedded in the structure's brick-face indicates is the LIBRARY. It is entirely done in red brick, with steps leading up to the main entranceway to the southeast. A tan brick-paved path also leads northwest through a grassy area, toward a large stone obelisk which can be seen extending above a gentle hill in that direction. The path around the perimeter of the Hub also continues north, as well as to the west.`,
      exits: [
        { direction: "northwest", toRoomId: "HubCenter" },
        { direction: "southeast", toRoomId: "Library" },
        { direction: "north", toRoomId: "HubEast" },
        { direction: "west", toRoomId: "HubSouth" },
      ],
    },
    {
      id: "Library",
      name: "Library",
      description: `In contrast to the old-fashioned brick-and-mortar look chosen for the outside face of the library, the interior is entirely modern; there are no shelves lined with books, nor tables for sitting and studying found here. Instead, the center of the library is a wide, open area with a polished marble floor beneath a high, vaulted cathedral ceiling. It seems everything is done via computer; signs on the north, south, and eastern walls indicate there are library terminals available for use.`,
      exits: [
        { direction: "northwest", toRoomId: "LibraryEntrance" },
        { direction: "east", toRoomId: "LibraryTerminal" },
        { direction: "north", toRoomId: "LibraryTerminalNorth" },
        { direction: "south", toRoomId: "LibraryTerminalSouth" },
      ],
    },
    {
      id: "LibraryTerminal",
      name: "Library Terminal East",
      description: `This is a large room covered wall to wall with a thin but soft mahogany carpet. The room is softly lit from somewhere up above, and the lighting is focused on the center of the room, fading out toward the corners. The center area looks worn and well-used, as if it has hosted many visitors over the years.`,
      exits: [{ direction: "west", toRoomId: "Library" }],
    },
    {
      id: "LibraryTerminalNorth",
      name: "Library Terminal North",
      description: `This is a large room covered wall to wall with a thin but soft mahogany carpet. The room is softly lit from somewhere up above, and the lighting is focused on the center of the room, fading out toward the corners. The center area looks worn and well-used, as if it has hosted many visitors over the years.`,
      exits: [{ direction: "south", toRoomId: "Library" }],
    },
    {
      id: "LibraryTerminalSouth",
      name: "Library Terminal South",
      description: `This is a large room covered wall to wall with a thin but soft mahogany carpet. The room is softly lit from somewhere up above, and the lighting is focused on the center of the room, fading out toward the corners. The center area looks worn and well-used, as if it has hosted many visitors over the years.`,
      exits: [{ direction: "north", toRoomId: "Library" }],
    },

    // MEDICAL AREA
    {
      id: "MedicalEntrance",
      name: "Medical Wing Entrance",
      description: `This is the entrance to some kind of medical facility, acting as a waiting area with many comfortable-looking chairs. There is a check in station to the south which is now abandonded, and a corridor leads past the check in station in that direction.`,
      exits: [
        { direction: "north", toRoomId: "LevelThreeSecondCorridorOne" },
        { direction: "south", doorId: "MainMedicalDoor" },
      ],
    },
    {
      id: "MainMedical",
      name: "Main Medical",
      description: `This is the main hub of the medical facility. There is a digital scale here, and a chair which sits next to a small medical station of some kind outfitted with a device that looks like it might measure blood pressure. The walls are painted white, and the floor is done in white tile, which only serves to accent the fact that something horrible has happened here; the floor is streaked with blood. Corridors branch off from this area to the south, and also to the west. The check in station leading back to the waiting area is to the north.`,
      exits: [
        { direction: "north", toRoomId: "MedicalEntrance" },
        { direction: "south", toRoomId: "MedicalCorridorThree" },
        { direction: "west", toRoomId: "MedicalCorridorTwo" },
      ],
    },
    {
      id: "MedicalCorridorOne",
      name: "Medical Corridor",
      description: `This is an antiseptic, white corridor with white floor tiling, or at least, it was at one point; the floor here is sticky with blood streaks and smears, the walls spattered with red splotches and splashes. The floor streaks turn to the south and go through a doorway on that wall. To the west is a door with no handle, and mounted next to that is a badge scanner of some kind with a blue strip across the top. Printed on the door is the word 'LAB'.`,
      exits: [
        { direction: "south", toRoomId: "PatientCareOne" },
        { direction: "east", toRoomId: "MedicalCorridorTwo" },
        { direction: "west", doorId: "LabDoors" },
      ],
    },
    {
      id: "MedicalCorridorTwo",
      name: "Medical Corridor",
      description: `This is an antiseptic, white corridor with white floor tiling which has now been marred with what looks like a series of large blood streaks wiped across the floor. One main, wide streak originates from the west, crosses the floor here, and continues to the east. A doorway opens to the south here, partially blocked by a makeshift wall of stacked bedframes.`,
      exits: [
        { direction: "south", toRoomId: "PatientCareTwo" },
        { direction: "west", toRoomId: "MedicalCorridorOne" },
        { direction: "east", toRoomId: "MainMedical" },
      ],
    },
    {
      id: "MedicalCorridorThree",
      name: "Medical Corridor",
      description: `This is an anitseptic, white corridor which continues to the north. There is a sturdy-looking door to the south with a plastic plaque on it reading 'MEDICAL SUPPLY STORAGE', and a pair of swinging double-doors leading east.`,
      exits: [
        { direction: "north", toRoomId: "MainMedical" },
        { direction: "south", doorId: "MedStorageDoor" },
        { direction: "east", toRoomId: "OR" },
      ],
    },
    {
      id: "MedicalStorage",
      name: "Medical Storage",
      description: `This is a walk-in supply closet filled with shelving and boxes. It looks like it was recently ransacked; everything is in disaray, and it looks like it has been pretty much cleaned out. On one wall you can see a large white-board which acts as a sign-out sheet, and you can see the writing grow more and more frantic the further down the list you read until it stops altogether.`,
      exits: [{ direction: "north", doorId: "MedStorageDoor" }],
    },
    {
      id: "PatientCareOne",
      name: "Patient Care One",
      description: `This is a large, open, patient-care area crowded with rows of beds. It looks as though the beds could at one time be closed off with curtains of plastic sheeting but most of the beds are out in the open now, in fact, it looks like there are many more beds arranged here than the room was originally designed to hold. Beds on rollers have been cramped together, leaving barely enough room to move in between them. Some are overturned and twisted; springs and rods jutting out at odd angles. The bedding has been violently tossed around, onto the floor. A good deal of the plastic sheeting has been torn at and shredded, and you can see significant blood stains here and there, spattered across the bedding, walls, and ribbons of hanging plastic. This area looks as if it once was filled with many people, but it is eerily empty now.`,
      exits: [{ direction: "north", toRoomId: "MedicalCorridorOne" }],
    },
    {
      id: "PatientCareTwo",
      name: "Patient Care Two",
      description: `This is a large, open, patient-care area designed to hold many beds. You can see tracks on the ceiling where plastic sheeting hangs, allowing the beds to be curtained off from one another, but they are all pulled aside now. The beds have been moved as well; you can see they were systematically stripped of their bedding, then the mattresses used as a barrier at the door which was then fortified with the metal bedframes to form a makeshift barracade. In a sort of gruesome last stand, a variety of corpses are still positioned there, their bodies leaning and pushing against the barracade as if to keep something out. You can see a young, blonde haired man and a young dark-haired man, both strong-looking taking up the lead positions, surrounded by an old man, a red-headed woman, a brown-haired woman, and horribly, a little red-haired girl. They all exhibit signs of red specking around the corners of their mouths and eyes.`,
      exits: [{ direction: "north", toRoomId: "MedicalCorridorTwo" }],
    },
    {
      id: "OR",
      name: "OR",
      description: `This is an operating room which currently seems to be doing duty as a morgue. The room is dominated by an operating table, upon which is lying a man's corpse which was obviously in the midst of an autopsy when it was abandoned; the chest cavity has been cut open and the ribcage cleaved down the center and spread apart to reveal the organs within. The neck, as well, has been cut down the center, and one side has been peeled away to reveal the musculature underneath. Next to the operating table is a tripod connected to a silver tray.`,
      exits: [{ direction: "west", toRoomId: "MedicalCorridorThree" }],
    },

    // REMOTE MEDICAL / LAB
    {
      id: "RemoteMedicalOne",
      name: "Emergency Medical Facility",
      description: `This is the Emergency Medical Facility. There is an exit to the east.`,
      exits: [{ direction: "east", toRoomId: "RemoteMedicalTwo" }],
    },
    {
      id: "RemoteMedicalTwo",
      name: "Emergency Medical Facility",
      description: `This is the Emergency Medical Facility. There are exits to the west and a cool looking one to the south.`,
      exits: [
        { direction: "west", toRoomId: "RemoteMedicalOne" },
        { direction: "south", toRoomId: "RemoteMedicalThree" },
      ],
    },
    {
      id: "RemoteMedicalThree",
      name: "Xenobiology Lab",
      description: `This area is in the same state of disarray as the others; as you cast the flashlight beam across the room you can see the remains of lighting fixtures hanging from the ceiling, and a series of laboratory workbenches with equipment toppled and strewn about. A sign posted on one wall reads 'XENOBIOLOGY LAB' in block letters. The facility seems to be devoted to a section near the southern wall, which is dominated by three structures; a large, open plexiglass tank full of murky green water, a wire cage with thin silvery bars which extend floor to ceiling, and cube-shaped, transparent terrarium of some sort. Near the tank on the far side of the room a chair lies on its back, and lying next to it are what look like two bodies.`,
      exits: [{ direction: "north", toRoomId: "RemoteMedicalTwo" }],
    },
    {
      id: "Lab",
      name: "Medical Lab",
      description: `This is some kind of laboritory. There are rows of workstations here, scattered with test equipment, chemicals, test tubes, flasks, and the like. The computers are currently all dark. Taking center stage at the moment is a large glass cylinder filled with fluid which, strangely, seems to be lit inside with a blacklight. Inside the jar is a large chunk or organic tissue. Leaning up against the far wall from a sitting position is the body of an older man in a lab coat...there seems to be some sort of strange, electronic head-dress draped over his head, slightly askew. Positioned in one corner is a slightly raised blue disk, four feet in diameter.`,
      exits: [{ direction: "east", toRoomId: "LabDoors" }],
    },
  ],
  items: [...syringe, ...drugItems, ...levelThreeItems],
  doors: [
    // LQ 3A
    {
      id: "DOOR3AE",
      name: "living quarters door 3AE",
      descriptionFromA:
        "To the east is a door affixed with a neat black plastic label indicating '3AE'. A strip of yellow and black tape has been stretched across the eastern door.",
      descriptionFromB: "To the west is the unit's front door.",
      kind: "standard",
      vocab: ["east door", "door 3ae"],
      connects: {
        roomAId: "LevelThreeCorridorOne",
        roomBId: "LivingQuartersOneEast",
      },
      directions: { fromA: "east", fromB: "west" },
      initiallyOpen: false,
      initiallyLocked: false,
    },
    {
      id: "DOOR3AW",
      name: "living quarters door 3AW",
      descriptionFromA:
        "To the west is a door affixed with a neat black plastic label indicating '3AW'. A strip of yellow and black tape has been stretched across the western door.",
      kind: "standard",
      vocab: ["west door", "door 3aw"],
      connects: {
        roomAId: "LevelThreeCorridorOne",
        roomBId: "LevelThreeCorridorOne",
      },
      directions: { fromA: "west", fromB: "east" },
      initiallyOpen: false,
      initiallyLocked: true,
    },
    {
      id: "OneEastBDoor",
      name: "bathroom door",
      descriptionFromA: "To the south is a wooden door.",
      descriptionFromB: "The bathroom door is to the north.",
      kind: "standard",
      vocab: ["bathroom door", "door 3ae"],
      connects: {
        roomAId: "LivingQuartersOneEast",
        roomBId: "OneEastBath",
      },
      directions: { fromA: "south", fromB: "north" },
      initiallyOpen: false,
      initiallyLocked: false,
    },
    // LQ 3B
    {
      id: "DOOR3BE",
      name: "living quarters door 3BE",
      descriptionFromA:
        "To the east is a door affixed with a neat black plastic label indicating '3BE'. A strip of yellow and black tape has been stretched across the eastern door.",
      descriptionFromB: "To the west is the unit's front door.",
      kind: "standard",
      vocab: ["east door", "door 3be"],
      connects: {
        roomAId: "LevelThreeCorridorTwo",
        roomBId: "LivingQuartersTwoEast",
      },
      directions: { fromA: "east", fromB: "west" },
      initiallyOpen: false,
      initiallyLocked: false,
    },
    {
      id: "DOOR3BW",
      name: "living quarters door 3AW",
      descriptionFromA:
        "To the west is a door affixed with a neat black plastic label indicating '3BW'. A strip of yellow and black tape has been stretched across the western door.",
      kind: "standard",
      vocab: ["west door", "door 3bw"],
      connects: {
        roomAId: "LevelThreeCorridorTwo",
        roomBId: "LivingQuartersTwoWest",
      },
      directions: { fromA: "west", fromB: "east" },
      initiallyOpen: false,
      initiallyLocked: false,
    },
    {
      id: "TwoEastBDoor",
      name: "bathroom door",
      descriptionFromA: "To the south is a wooden door.",
      descriptionFromB: "The bathroom door is to the north.",
      kind: "standard",
      vocab: ["bathroom door"],
      connects: {
        roomAId: "LivingQuartersTwoEast",
        roomBId: "TwoEastBath",
      },
      directions: { fromA: "south", fromB: "north" },
      initiallyOpen: false,
      initiallyLocked: false,
    },
    {
      id: "TwoWestBDoor",
      name: "bathroom door",
      descriptionFromA: "To the south is a wooden door.",
      descriptionFromB: "The bathroom door is to the north.",
      kind: "standard",
      vocab: ["bathroom door"],
      connects: {
        roomAId: "LivingQuartersTwoWest",
        roomBId: "TwoWestBath",
      },
      directions: { fromA: "south", fromB: "north" },
      initiallyOpen: false,
      initiallyLocked: false,
    },
    // LQ 3C
    {
      id: "DOOR3CE",
      name: "living quarters door 3CE",
      descriptionFromA:
        "To the east is a door affixed with a neat black plastic label indicating '3CE'. A strip of yellow and black tape has been stretched across the eastern door.",
      descriptionFromB: "To the west is the unit's front door.",
      kind: "standard",
      vocab: ["east door", "door 3ce"],
      connects: {
        roomAId: "LevelThreeCorridorThree",
        roomBId: "LevelThreeCorridorThree",
      },
      directions: { fromA: "east", fromB: "west" },
      initiallyOpen: false,
      initiallyLocked: true,
    },
    {
      id: "DOOR3CW",
      name: "living quarters door 3CW",
      descriptionFromA:
        "To the west is a door affixed with a neat black plastic label indicating '3CW'. A strip of yellow and black tape has been stretched across the western door.",
      kind: "standard",
      vocab: ["west door", "door 3cw"],
      connects: {
        roomAId: "LevelThreeCorridorThree",
        roomBId: "LevelThreeCorridorThree",
      },
      directions: { fromA: "west", fromB: "east" },
      initiallyOpen: false,
      initiallyLocked: true,
    },
    // LQ 3D
    {
      id: "DOOR3DE",
      name: "living quarters door 3DE",
      descriptionFromA:
        "To the east is a door affixed with a neat black plastic label indicating '3CE'. A strip of yellow and black tape has been stretched across the eastern door.",
      descriptionFromB: "To the west is the unit's front door.",
      kind: "standard",
      vocab: ["east door", "door 3de"],
      connects: {
        roomAId: "LevelThreeCorridorFour",
        roomBId: "LivingQuartersFourEast",
      },
      directions: { fromA: "east", fromB: "west" },
      initiallyOpen: false,
      initiallyLocked: true,
    },
    {
      id: "FourEastBDoor",
      name: "bathroom door",
      descriptionFromA: "To the south is a wooden door.",
      descriptionFromB: "The bathroom door is to the north.",
      kind: "standard",
      vocab: ["bathroom door"],
      connects: {
        roomAId: "LivingQuartersFourEast",
        roomBId: "FourEastBath",
      },
      directions: { fromA: "south", fromB: "north" },
      initiallyOpen: false,
      initiallyLocked: false,
    },
    // LQ 3E
    {
      id: "DOOR3EE",
      name: "living quarters door 3CE",
      descriptionFromA:
        "To the east is a door affixed with a neat black plastic label indicating '3EE'. A strip of yellow and black tape has been stretched across the eastern door.",
      descriptionFromB: "To the west is the unit's front door.",
      kind: "standard",
      vocab: ["east door", "door 3ee"],
      connects: {
        roomAId: "LevelThreeCorridorFive",
        roomBId: "LivingQuartersFiveEast",
      },
      directions: { fromA: "east", fromB: "west" },
      initiallyOpen: false,
      initiallyLocked: false,
    },
    {
      id: "DOOR3EW",
      name: "living quarters door 3EW",
      descriptionFromA:
        "To the west is a door affixed with a neat black plastic label indicating '3EW'. A strip of yellow and black tape has been stretched across the western door.",
      kind: "standard",
      vocab: ["west door", "door 3ew"],
      connects: {
        roomAId: "LevelThreeCorridorFive",
        roomBId: "LevelThreeCorridorFive",
      },
      directions: { fromA: "west", fromB: "east" },
      initiallyOpen: false,
      initiallyLocked: true,
    },
    {
      id: "FiveEastBDoor",
      name: "bathroom door",
      descriptionFromA: "To the south is a wooden door.",
      descriptionFromB: "The bathroom door is to the north.",
      kind: "standard",
      vocab: ["bathroom door"],
      connects: {
        roomAId: "LivingQuartersFiveEast",
        roomBId: "FiveEastBath",
      },
      directions: { fromA: "south", fromB: "north" },
      initiallyOpen: false,
      initiallyLocked: false,
    },
    // LQ 3F
    {
      id: "DOOR3FE",
      name: "living quarters door 3FE",
      descriptionFromA:
        "To the east is a door affixed with a neat black plastic label indicating '3FE'. A strip of yellow and black tape has been stretched across the eastern door.",
      descriptionFromB: "To the west is the unit's front door.",
      kind: "standard",
      vocab: ["east door", "door 3fe"],
      connects: {
        roomAId: "LevelThreeCorridorSix",
        roomBId: "LevelThreeCorridorSix",
      },
      directions: { fromA: "east", fromB: "west" },
      initiallyOpen: false,
      initiallyLocked: true,
    },
    {
      id: "SixWestBDoor",
      name: "bathroom door",
      descriptionFromA: "To the south is a wooden door.",
      descriptionFromB: "The bathroom door is to the north.",
      kind: "standard",
      vocab: ["bathroom door"],
      connects: {
        roomAId: "LivingQuartersSixWest",
        roomBId: "SixWestBath",
      },
      directions: { fromA: "south", fromB: "north" },
      initiallyOpen: true,
      initiallyLocked: false,
    },
    {
      id: "DOOR3FW",
      name: "living quarters door 3FW",
      descriptionFromA:
        "To the west is a door affixed with a neat black plastic label indicating '3FW'. A strip of yellow and black tape has been stretched across the western door.",
      kind: "standard",
      vocab: ["west door", "door 3fw"],
      connects: {
        roomAId: "LevelThreeCorridorSix",
        roomBId: "LevelThreeCorridorSix",
      },
      directions: { fromA: "west", fromB: "east" },
      initiallyOpen: false,
      initiallyLocked: true,
    },
    // LQ 3G
    {
      id: "DOOR3FE",
      name: "living quarters door 3GW",
      descriptionFromA:
        "To the west is a door affixed with a neat black plastic label indicating '3GW'. A strip of yellow and black tape has been stretched across the western door.",
      descriptionFromB: "To the east is the unit's front door.",
      kind: "standard",
      vocab: ["east door", "door 3fe"],
      connects: {
        roomAId: "LevelThreeCorridorSeven",
        roomBId: "LivingQuartersSevenWest",
      },
      directions: { fromA: "east", fromB: "west" },
      initiallyOpen: false,
      initiallyLocked: true,
    },
    {
      id: "SevenWestBDoor",
      name: "bathroom door",
      descriptionFromA: "To the south is a wooden door.",
      descriptionFromB: "The bathroom door is to the north.",
      kind: "standard",
      vocab: ["bathroom door"],
      connects: {
        roomAId: "LivingQuartersSevenWest",
        roomBId: "SevenWestBath",
      },
      directions: { fromA: "south", fromB: "north" },
      initiallyOpen: true,
      initiallyLocked: false,
    },
    // THE HUB
    {
      id: "HubDoor",
      name: "engraved wooden door",
      descriptionFromA:
        "To the west is a large, heavy-looking wooden door, engraved with a leaf and floral pattern.",
      descriptionFromB:
        "To the east is a large, heavy wooden door that exits The Hub.",
      kind: "keyed",
      vocab: ["wooden door", "engraved door", "engraved wooden door"],
      connects: {
        roomAId: "LevelThreeSecondCorridorTwo",
        roomBId: "HubEast",
      },
      directions: { fromA: "west", fromB: "east" },
      initiallyOpen: true,
      initiallyLocked: false,
    },
    // Second Corridor
    {
      id: "LevelThreeSecondCorrThreeDoor",
      name: "aluminum and glass door",
      descriptionFromA:
        "To the west is a large glass door with an aluminum frame.",
      descriptionFromB:
        "To the east is a large glass door with an aluminum frame.",
      kind: "keyed",
      vocab: ["door", "aluminum door", "glass door", "aluminum and glass door"],
      connects: {
        roomAId: "LevelThreeSecondCorridorThree",
        roomBId: "Spa",
      },
      directions: { fromA: "west", fromB: "east" },
      initiallyOpen: false,
      initiallyLocked: false,
    },
    // SPA
    {
      id: "CedarDoor",
      name: "cedar door",
      descriptionFromA:
        "To the north is a door made of cedar, with a simple handle, also made of cedar.",
      descriptionFromB: "The sauna's exit is to the south.",
      kind: "standard",
      vocab: ["cedar door", "sauna door"],
      connects: {
        roomAId: "Spa",
        roomBId: "Sauna",
      },
      directions: { fromA: "north", fromB: "south" },
      initiallyOpen: false,
      initiallyLocked: false,
    },
    {
      id: "SteamRoomDoor",
      name: "heavy glass door",
      descriptionFromA:
        "To the south is a heavy glass door that looks into a tiled steam room.",
      descriptionFromB:
        "To the north, a heavy glass door looks out into the main Spa.",
      kind: "standard",
      vocab: [
        "glass door",
        "heavy glass door",
        "steam door",
        "steam room door",
      ],
      connects: {
        roomAId: "Spa",
        roomBId: "SteamRoom",
      },
      directions: { fromA: "south", fromB: "north" },
      initiallyOpen: false,
      initiallyLocked: false,
    },
    {
      id: "MassageDoor",
      name: "varnished wooden door",
      descriptionFromA:
        "To the west is a varnished wooden door with a little sign on it reading 'Massage'.",
      descriptionFromB:
        "To the east is a varnished wooden door leading back to the Spa.",
      kind: "standard",
      vocab: [
        "wooden door",
        "varnished door",
        "varnished wooden door",
        "massage door",
      ],
      connects: {
        roomAId: "Spa",
        roomBId: "Massage",
      },
      directions: { fromA: "west", fromB: "east" },
      initiallyOpen: false,
      initiallyLocked: false,
    },
    // Medical
    {
      id: "MainMedicalDoor",
      name: "a security door",
      descriptionFromA:
        "To the south is an open entryway, a sign over which reads 'Main Medical'.",
      descriptionFromB:
        "To the north is an open doorway leading back to the Medical Entrance.",
      kind: "keyed",
      vocab: ["doorway", "entryway"],
      connects: {
        roomAId: "MedicalEntrance",
        roomBId: "MainMedical",
      },
      directions: { fromA: "south", fromB: "north" },
      initiallyOpen: true,
      initiallyLocked: false,
    },
    {
      id: "LabDoors",
      name: "a security door",
      descriptionFromA:
        "To the west is a security door, mounted next to which is a badge scanner of some kind with a blue strip across the top. A sign over the door reads 'Lab'.",
      descriptionFromB:
        "To the east is a security door leading back to Medical.",
      kind: "badgeScanner",
      vocab: ["door", "lab door", "security door"],
      connects: {
        roomAId: "MedicalCorridorOne",
        roomBId: "Lab",
      },
      directions: { fromA: "west", fromB: "east" },
      initiallyOpen: false,
      initiallyLocked: true,
      badgeItemId: "BlueBadge",
    },
    {
      id: "MedStorageDoor",
      name: "a sturdy-looking wooden door",
      descriptionFromA:
        "To the south is a sturdy wooden door, with a plastic plaque on it that says 'MEDICAL SUPPLY STORAGE' in block letters.",
      descriptionFromB: "To the north is a door leading back to Medical.",
      kind: "keyed",
      vocab: ["door", "wooden door", "sturdy door", "storage door"],
      connects: {
        roomAId: "MedicalCorridorThree",
        roomBId: "MedicalStorage",
      },
      directions: { fromA: "south", fromB: "north" },
      initiallyOpen: false,
      initiallyLocked: true,
    },
  ],
  teleportPads: [],
};
