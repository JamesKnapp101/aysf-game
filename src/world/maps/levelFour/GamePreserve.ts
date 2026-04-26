import type { Room } from "@game/types/roomTypes";

export const gamePreserveRooms: Room[] = [
  {
    id: "GamePreserveEntrance",
    name: "Game Preserve: Entry Bluff",
    description:
      "You stand on a raised bluff at the edge of a sealed hunting preserve, [[SCENERY]] From here there are two dirt paths through the grass, one angling down to the southwest, and the other to the southeast.",
    descriptionShort: "On the preserve entry bluff.",
    exits: [
      { direction: "southwest", toRoomId: "OpenSavanna" },
      { direction: "southeast", toRoomId: "RockyRidge" },
    ],
  },
  {
    id: "OpenSavanna",
    name: "Game Preserve: Open Savanna",
    description:
      "This broad stretch of tawny grass is marked here and there by the [[SCENERY]]",
    descriptionShort: "In the open savanna.",
    exits: [
      { direction: "northeast", toRoomId: "GamePreserveEntrance" },
      { direction: "east", toRoomId: "ObservationTower" },
      { direction: "south", toRoomId: "TallGrass" },
    ],
  },
  {
    id: "ObservationTower",
    name: "Game Preserve: Observation Tower",
    description:
      "This is an open clearing of gravel-covered, hard packed earth where [[SCENERY]]",
    exits: [
      { direction: "west", toRoomId: "OpenSavanna" },
      { direction: "east", toRoomId: "RockyRidge" },
      {
        direction: "up",
        toRoomId: "ObservationTowerTop",
        preserveRuleId: "observation-tower-ladder",
      },
    ],
  },
  {
    id: "ObservationTowerTop",
    name: "Game Preserve: Observation Tower Top",
    description:
      "The enclosed wooden parapet atop the tower has a three-hundred-sixty degree view of the preserve which sprawls out before you, below. [[SCENERY]]",
    exits: [
      {
        direction: "down",
        toRoomId: "ObservationTower",
        preserveRuleId: "observation-tower-ladder",
      },
    ],
  },
  {
    id: "RockyRidge",
    name: "Game Preserve: Rocky Ridge",
    description:
      "You're standing near the edge of a steep slope, where broken stone shelves and stubborn scrub climb into a narrow ridge line. [[SCENERY]] Other routes lead northwest back to the entrance, and west to an area of dense thicket.",
    descriptionShort: "On the rocky ridge.",
    exits: [
      { direction: "northwest", toRoomId: "GamePreserveEntrance" },
      { direction: "west", toRoomId: "ObservationTower" },
      {
        direction: "south",
        toRoomId: "Waterhole",
        preserveRuleId: "rocky-slope-descent",
      },
    ],
  },
  {
    id: "TallGrass",
    name: "Game Preserve: Tall Grass",
    description:
      "You're standing deep in a field [[SCENERY]] As long as you're in here and keep your head down, you'll be out of sight, at least. A few narrow trails lead a blind path through it, one heading north, one heading south, and one heading east.",
    exits: [
      { direction: "north", toRoomId: "OpenSavanna" },
      { direction: "east", toRoomId: "Thicket" },
      { direction: "south", toRoomId: "RuinedWall" },
    ],
  },
  {
    id: "Thicket",
    name: "Game Preserve: Thicket",
    description:
      "The preserve narrows into a dense tangle of brush and thorny growth that merges into [[SCENERY]] You see viable paths through the thicket to the west, the east, and the south.",
    exits: [
      { direction: "west", toRoomId: "TallGrass" },
      { direction: "east", toRoomId: "Waterhole" },
      { direction: "south", toRoomId: "UnusedPen" },
    ],
  },
  {
    id: "Waterhole",
    name: "Game Preserve: Waterhole",
    description:
      "You're wading chest-deep in the tepid water that fills a scooped basin of packed earth and reeds, unable to see the bottom through a mixture of sediment and algae. [[SCENERY]] To the north is the steep rocky slope that you doubt you'd be able to climb up, but there's a path west toward a thicket of thorny brush, and the edge of the water hole meets mud flats to the south.",
    exits: [
      { direction: "west", toRoomId: "Thicket" },
      { direction: "south", toRoomId: "Mudflats" },
    ],
  },
  {
    id: "UnusedPen",
    name: "Game Preserve: Unused Pen",
    description:
      "This is a clearing of packed dirt marred by animal tracks, in the center of which stands an old holding pen made of concrete with iron bars. It doesn't seem to be in use anymore, with the gate removed, leaving it open. There's an upright feed dispenser that stands next to the empty pen, with a power light that, while flickering, is still on. A trail heads east toward the mud flats, while to the north the clearing opens into a dense thicket. To the south is a wide archway, over which are engraved the words 'EXIT: WITH OR WITHOUT HONOR.' Beyond it is a large, ceremonial-looking room but at the moment there's just a single narrow spotlight shining down from somewhere above.",
    descriptionShort: "In the unused pen.",
    exits: [
      { direction: "north", toRoomId: "Thicket" },
      { direction: "east", toRoomId: "Mudflats" },
      { direction: "south", toRoomId: "TrophyRoom" },
    ],
  },
  {
    id: "Mudflats",
    name: "Game Preserve: Mudflats",
    description:
      "The ground here has collapsed into a wide stretch of wet silt and standing muck. Every step you take here leaves a deep, greasy print and drags up a cold mineral smell that might help to mask your scent, at least for a short time. Trails out of the flats lead north toward the waterhole, west, south, and southwest toward the remains of an old stone wall.",
    descriptionShort: "In the mudflats.",
    exits: [
      { direction: "north", toRoomId: "Waterhole" },
      { direction: "west", toRoomId: "UnusedPen" },
      { direction: "south", toRoomId: "DeadOak" },
      { direction: "southwest", toRoomId: "RuinedWall" },
    ],
  },
  {
    id: "RuinedWall",
    name: "Game Preserve: Ruined Wall",
    description:
      "A once-solid preserve wall has already taken a terrible hit and never been properly repaired. The remaining masonry is cracked, canted, and weak in one central span, with broken stone scattered underfoot. Tall grass lies north, the mudflats northeast, and you can see a drainage cut to the south.",
    descriptionShort: "By the ruined wall.",
    exits: [
      { direction: "north", toRoomId: "TallGrass" },
      { direction: "northeast", toRoomId: "Mudflats" },
      {
        direction: "south",
        toRoomId: "DrainagePipe",
        preserveRuleId: "ruined-wall-breach",
      },
    ],
  },
  {
    id: "DrainagePipe",
    name: "Game Preserve: Drainage Pipe",
    description:
      "You're crouched in a large drainage pipe that's been reinforced with old metal ribs. There's enough room to move, but it's a pretty tight fit and you don't think anything larger than you would be able to squeeze in. The pipe carries runoff east, where you can see light pouring in from the far end. The slope is steep enough in that direction though that you're not sure you'll be able to return the same way.",
    descriptionShort: "In the drainage pipe.",
    exits: [
      {
        direction: "east",
        toRoomId: "DeadOak",
        preserveRuleId: "drainage-pipe-crawl",
      },
    ],
  },
  {
    id: "DeadOak",
    name: "Game Preserve: Dead Oak",
    description:
      "The grass is partly uprooted here as a huge dead oak tree leans over at an angle, causing its massive roots to erupt from the ground in a gnarled crescent. The bark is split and the upper trunk is visibly rotted through. There are branches along the side of the trunk that could serve as footholds to reach the higher branches, and the tree, even in its current state, should be able to hold your weight. There is a path leading north, away from the tree.",
    descriptionShort: "At the dead oak.",
    exits: [
      { direction: "north", toRoomId: "Mudflats" },
      {
        direction: "up",
        toRoomId: "DeadOakPerch",
        preserveRuleId: "dead-oak-climb",
      },
    ],
  },
  {
    id: "DeadOakPerch",
    name: "Game Preserve: Dead Oak Perch",
    description:
      "Wedged into the crook of the dead oak, you have just enough room to crouch among dry splintering limbs. The wood creaks under the slightest shift, and the only route back is down the trunk.",
    descriptionShort: "Perched in the dead oak.",
    exits: [
      {
        direction: "down",
        toRoomId: "DeadOak",
        preserveRuleId: "dead-oak-climb",
      },
    ],
  },
  {
    id: "TrophyRoom",
    name: "Game Preserve: Trophy Room",
    description:
      "A sterile trophy chamber interrupts the preserve's rough simulation with polished stone, brass plaques, and a humming retrieval gate set into the far wall. The room was built to receive proof of a successful hunt, but even empty it serves as the only clean way back out. The pen lies north, while the return gate waits out.",
    descriptionShort: "In the trophy room.",
    exits: [
      { direction: "north", toRoomId: "UnusedPen" },
      { direction: "out", toRoomId: "GamePreservePortal" },
    ],
  },
  {
    id: "GamePreserveStaging",
    name: "Game Preserve: Staging",
    description:
      "A sealed maintenance staging pocket hides behind the preserve's public simulation, full of dormant transfer hardware and blank walls.",
    descriptionShort: "In a sealed preserve staging pocket.",
    exits: [],
  },
];
