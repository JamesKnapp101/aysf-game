import { Room } from "@game/types/roomTypes";

export const medicalWingRooms: Room[] = [
  // MEDICAL AREA
  {
    id: "MedicalEntrance",
    name: "Medical Wing Entrance",
    description: `This is the entrance to some kind of medical facility, acting as a waiting area with many comfortable-looking chairs. There is a check in station to the south which is now abandonded, and a corridor leads past the check in station in that direction.`,
    exits: [
      { direction: "north", toRoomId: "LevelTwoSecondaryCorridorOne" },
      { direction: "south", toRoomId: "MainMedical" },
      { direction: "east", toRoomId: "VisionAndDental" },
    ],
  },
  {
    id: "VisionAndDental",
    name: "Vision and Dental",
    description: `Shared space for Vision and Dental.`,
    exits: [{ direction: "west", toRoomId: "MedicalEntrance" }],
  },
  {
    id: "MainMedical",
    name: "Main Medical",
    description: `This is the main park of the medical facility. There is a digital scale here, and a chair which sits next to a small medical station of some kind outfitted with a device that looks like it might measure blood pressure. The walls are painted white, and the floor is done in white tile, which only serves to accent the fact that something horrible has happened here; the floor is streaked with blood. Corridors branch off from this area to the south, and also to the west. The check in station leading back to the waiting area is to the north.`,
    exits: [
      { direction: "north", toRoomId: "MedicalEntrance" },
      { direction: "south", toRoomId: "MedicalCorridorThree" },
      { direction: "west", toRoomId: "MedicalCorridorTwo" },
      { direction: "east", toRoomId: "Pharmacy" },
    ],
  },
  {
    id: "Pharmacy",
    name: "Pharmacy",
    description: `The Pharmacy.`,
    exits: [{ direction: "west", toRoomId: "MainMedical" }],
  },
  {
    id: "MedicalCorridorOne",
    name: "Medical Corridor",
    description: `This is an antiseptic, white corridor with white floor tiling, or at least, it was at one point; the floor here is sticky with blood streaks and smears, the walls spattered with red splotches and splashes. The floor streaks turn to the south and go through a doorway on that wall. To the west is a door with no handle, and mounted next to that is a badge scanner of some kind with a blue strip across the top. Printed on the door is the word 'LAB'.`,
    exits: [
      { direction: "south", toRoomId: "LabDoors" },
      { direction: "east", toRoomId: "MedicalCorridorTwo" },
      // { direction: "west", doorId: "LabDoors" },
    ],
  },
  {
    id: "MedicalCorridorTwo",
    name: "Medical Corridor",
    description: `This is an antiseptic, white corridor with white floor tiling which has now been marred with what looks like a series of large blood streaks wiped across the floor. One main, wide streak originates from the west, crosses the floor here, and continues to the east. A doorway opens to the south here, partially blocked by a makeshift wall of stacked bedframes.`,
    exits: [
      { direction: "south", toRoomId: "PatientCareOne" },
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
    exits: [
      { direction: "north", doorId: "MedStorageDoor" },
      { direction: "down", doorId: "TissueVats" },
    ],
  },
  {
    id: "TissueVats",
    name: "Tissue Vats",
    description: `The Tissue Vats.`,
    exits: [{ direction: "up", toRoomId: "MedicalStorage" }],
  },
  {
    id: "PatientCareOne",
    name: "Patient Care One",
    description: `This is a large, open, patient-care area crowded with rows of beds. It looks as though the beds could at one time be closed off with curtains of plastic sheeting but most of the beds are out in the open now, in fact, it looks like there are many more beds arranged here than the room was originally designed to hold. Beds on rollers have been cramped together, leaving barely enough room to move in between them. Some are overturned and twisted; springs and rods jutting out at odd angles. The bedding has been violently tossed around, onto the floor. A good deal of the plastic sheeting has been torn at and shredded, and you can see significant blood stains here and there, spattered across the bedding, walls, and ribbons of hanging plastic. This area looks as if it once was filled with many people, but it is eerily empty now.`,
    exits: [{ direction: "north", toRoomId: "MedicalCorridorTwo" }],
  },
  // {
  //   id: "PatientCareTwo",
  //   name: "Patient Care Two",
  //   description: `This is a large, open, patient-care area designed to hold many beds. You can see tracks on the ceiling where plastic sheeting hangs, allowing the beds to be curtained off from one another, but they are all pulled aside now. The beds have been moved as well; you can see they were systematically stripped of their bedding, then the mattresses used as a barrier at the door which was then fortified with the metal bedframes to form a makeshift barracade. In a sort of gruesome last stand, a variety of corpses are still positioned there, their bodies leaning and pushing against the barracade as if to keep something out. You can see a young, blonde haired man and a young dark-haired man, both strong-looking taking up the lead positions, surrounded by an old man, a red-headed woman, a brown-haired woman, and horribly, a little red-haired girl. They all exhibit signs of red specking around the corners of their mouths and eyes.`,
  //   exits: [{ direction: "north", toRoomId: "MedicalCorridorTwo" }],
  // },
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
      { direction: "south", toRoomId: "XenobiologyLab" },
    ],
  },
  {
    id: "XenobiologyLab",
    name: "Xenobiology Lab",
    description: `This area is in the same state of disarray as the others; as you cast the flashlight beam across the room you can see the remains of lighting fixtures hanging from the ceiling, and a series of laboratory workbenches with equipment toppled and strewn about. A sign posted on one wall reads 'XENOBIOLOGY LAB' in block letters. The facility seems to be devoted to a section near the southern wall, which is dominated by three structures; a large, open plexiglass tank full of murky green water, a wire cage with thin silvery bars which extend floor to ceiling, and cube-shaped, transparent terrarium of some sort. Near the tank on the far side of the room a chair lies on its back, and lying next to it are what look like two bodies.`,
    exits: [{ direction: "north", toRoomId: "RemoteMedicalTwo" }],
  },
  {
    id: "Lab",
    name: "Medical Lab",
    description: `This is some kind of laboritory. There are rows of workstations here, scattered with test equipment, chemicals, test tubes, flasks, and the like. The computers are currently all dark. Taking center stage at the moment is a large glass cylinder filled with fluid which, strangely, seems to be lit inside with a blacklight. Inside the jar is a large chunk or organic tissue. Leaning up against the far wall from a sitting position is the body of an older man in a lab coat...there seems to be some sort of strange, electronic head-dress draped over his head, slightly askew. Positioned in one corner is a slightly raised blue disk, four feet in diameter.`,
    exits: [{ direction: "north", doorId: "LabDoors" }],
  },
];
