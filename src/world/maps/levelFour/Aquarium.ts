import { Room } from "@game/types/roomTypes";

export const aquariumRooms: Room[] = [
  // START / TELEPORT-IN
  {
    id: "AqStart",
    name: "Aquarium: Arrival Ledge",
    description: `You materialize on a narrow maintenance ledge bolted to the inside wall of a massive aquarium habitat. Beyond the railing, dark water stretches in every direction, lit by wavering shafts from overhead lamps. The glass wall curves away into shadow, and the water carries the faint, rhythmic thrum of pumps. A slick access walkway leads north into the habitat.`,
    descriptionShort: `You stand on the aquarium's arrival ledge beside dark open water. A walkway continues north.`,
    exits: [{ direction: "north", toRoomId: "AqOpen1" }],
  },

  // RIGHT LOOP (shorter, riskier): O1..O4
  {
    id: "AqOpen1",
    name: "Aquarium: Open Water Shelf",
    description: `The ledge widens into a shallow shelf of stone and concrete. Kelp fronds drift lazily from anchored lines overhead, but there is nowhere to hide here—just glass, water, and open space. A path continues north along the tank wall. To the west, a break in the stonework leads into a darker, rockier passage.`,
    descriptionShort: `An exposed shelf along the tank wall. North continues; west leads into rocks.`,
    exits: [
      { direction: "north", toRoomId: "AqOpen2" },
      { direction: "south", toRoomId: "AqStart" },
      { direction: "west", toRoomId: "AqRock1" },
    ],
  },
  {
    id: "AqOpen2",
    name: "Aquarium: Glass Run",
    description: `You follow the curvature of the aquarium’s glass. The tank lamps shimmer overhead, turning drifting particles into glitter. The open water here feels watched. The route continues north and south.`,
    descriptionShort: `A bright, exposed run along the aquarium glass.`,
    exits: [
      { direction: "north", toRoomId: "AqOpen3" },
      { direction: "south", toRoomId: "AqOpen1" },
    ],
  },
  {
    id: "AqOpen3",
    name: "Aquarium: Lampfall",
    description: `A strong shaft of light pours down from above, illuminating a patch of pale sand and scattered stones. It’s beautiful—and completely exposed. The shelf continues north and back south.`,
    descriptionShort: `A lit patch of sand beneath the lamps. North/south along the shelf.`,
    exits: [
      { direction: "north", toRoomId: "AqOpen4" },
      { direction: "south", toRoomId: "AqOpen2" },
    ],
  },
  {
    id: "AqOpen4",
    name: "Aquarium: Wall Bend",
    description: `The tank wall bends here, forming a shallow corner. The water darkens ahead. To the west, a narrow cut between boulders looks like it connects to a more sheltered route. South returns along the glass run.`,
    descriptionShort: `A bend in the tank wall. West into a narrow cut; south back along the glass.`,
    exits: [
      { direction: "west", toRoomId: "AqCross" },
      { direction: "south", toRoomId: "AqOpen3" },
    ],
  },

  // CROSSOVER: X
  {
    id: "AqCross",
    name: "Aquarium: Crossover Crevice",
    description: `A tight crevice splits the habitat’s central rock mass. The stone here is scored and polished as if something heavy has repeatedly dragged itself through. East returns to open water; west leads deeper into the rocky ridge; south drops into a lower channel that loops back toward the arrival ledge.`,
    descriptionShort: `A narrow crevice: east to open water, west to rocks, south to a lower channel.`,
    exits: [
      { direction: "east", toRoomId: "AqOpen4" },
      { direction: "west", toRoomId: "AqRock4" },
      { direction: "south", toRoomId: "AqChannel1" },
    ],
  },

  // LEFT LOOP (longer, safer): R1..R7 to G
  {
    id: "AqRock1",
    name: "Aquarium: Rock Gate",
    description: `A clustered ridge of basalt boulders rises from the shelf, forming a shadowy gate. The open-water shelf lies to the east, but the rocks here create pockets of darkness and broken sightlines. A stony path climbs north.`,
    descriptionShort: `Sheltering rocks and shadow. East to open shelf; north deeper into the ridge.`,
    exits: [
      { direction: "east", toRoomId: "AqOpen1" },
      { direction: "north", toRoomId: "AqRock2" },
    ],
  },
  {
    id: "AqRock2",
    name: "Aquarium: Kelp Shadows",
    description: `Kelp drapes over the rocks in heavy curtains. The water is dim and close, the kind of place where movement could vanish for a moment and reappear somewhere else. The ridge continues north and back south.`,
    descriptionShort: `Dim rocks veiled in kelp. North/south along the ridge.`,
    exits: [
      { direction: "north", toRoomId: "AqRock3" },
      { direction: "south", toRoomId: "AqRock1" },
    ],
  },
  {
    id: "AqRock3",
    name: "Aquarium: Split Stone",
    description: `The ridge pinches around a split boulder, forcing you into a narrow passage. The confinement is unsettling, but it’s also cover. The way continues north and south.`,
    descriptionShort: `A narrow passage through split stone.`,
    exits: [
      { direction: "north", toRoomId: "AqRock4" },
      { direction: "south", toRoomId: "AqRock2" },
    ],
  },
  {
    id: "AqRock4",
    name: "Aquarium: Ridge Junction",
    description: `The rocky ridge opens into a small shelf with multiple options. To the east, the crossover crevice leads back toward open water. North continues up the ridge; south returns to darker rocks.`,
    descriptionShort: `A junction in the rock ridge. East to crossover; north onward; south back.`,
    exits: [
      { direction: "east", toRoomId: "AqCross" },
      { direction: "north", toRoomId: "AqRock5" },
      { direction: "south", toRoomId: "AqRock3" },
    ],
  },
  {
    id: "AqRock5",
    name: "Aquarium: Overhang",
    description: `A heavy overhang looms above, forming a sheltered pocket where sound feels dampened and distant. Barnacle-like growths cling to the stone. The ridge runs north and south.`,
    descriptionShort: `A sheltered overhang along the ridge.`,
    exits: [
      { direction: "north", toRoomId: "AqRock6" },
      { direction: "south", toRoomId: "AqRock4" },
    ],
  },
  {
    id: "AqRock6",
    name: "Aquarium: Broken Column",
    description: `A broken, pillar-like formation rises here, cracked as if by stress or impact. The space around it is tight and irregular—good cover, but easy to get cornered if something claims the passage. North continues; south returns under the overhang.`,
    descriptionShort: `A tight area around a broken stone column.`,
    exits: [
      { direction: "north", toRoomId: "AqRock7" },
      { direction: "south", toRoomId: "AqRock5" },
    ],
  },
  {
    id: "AqRock7",
    name: "Aquarium: Near the Deep",
    description: `The rocks drop away toward a darker basin. The water ahead looks deeper—colder—and the stone is slick with algae. A chamber lies north. South retreats along the ridge.`,
    descriptionShort: `Rocks fall toward a darker basin. North to a chamber; south back.`,
    exits: [
      { direction: "north", toRoomId: "AqGoal" },
      { direction: "south", toRoomId: "AqRock6" },
    ],
  },

  // GOAL: G
  {
    id: "AqGoal",
    name: "Aquarium: Grotto Vault",
    description: `A secluded grotto opens here, protected by towering stone slabs that create a natural vault. In the center stands a corroded maintenance pedestal with an embedded control node—this is what you came for. The only clear way out is back south into the rocks.`,
    descriptionShort: `A protected grotto with a maintenance control node. South leads back.`,
    exits: [{ direction: "south", toRoomId: "AqRock7" }],
  },

  // LOWER LOOP (return pressure): C1..C5 back to Start
  {
    id: "AqChannel1",
    name: "Aquarium: Lower Channel Mouth",
    description: `A sloping channel drops beneath the central rocks. The water feels heavier here, and the sound of the pumps turns into a low, pressing pulse. North returns to the crossover crevice; south continues deeper into the channel.`,
    descriptionShort: `A lower channel beneath the rocks. North to crossover; south deeper.`,
    exits: [
      { direction: "north", toRoomId: "AqCross" },
      { direction: "south", toRoomId: "AqChannel2" },
    ],
  },
  {
    id: "AqChannel2",
    name: "Aquarium: Narrow Cut",
    description: `The channel narrows to a stone trench. The walls are close enough that you could brace a hand against either side. South continues; north climbs back toward the crevice.`,
    descriptionShort: `A narrow stone trench. North back; south onward.`,
    exits: [
      { direction: "north", toRoomId: "AqChannel1" },
      { direction: "south", toRoomId: "AqChannel3" },
    ],
  },
  {
    id: "AqChannel3",
    name: "Aquarium: Silt Drift",
    description: `Fine silt has collected here, drifting in lazy spirals at the slightest disturbance. The channel continues north and south, and a darker passage opens west.`,
    descriptionShort: `Silt drifts in the lower channel. West to a darker passage.`,
    exits: [
      { direction: "north", toRoomId: "AqChannel2" },
      { direction: "south", toRoomId: "AqChannel4" },
      { direction: "west", toRoomId: "AqChannel4b" },
    ],
  },

  // A tiny “side kink” to make the lower loop less linear, still deterministic.
  {
    id: "AqChannel4b",
    name: "Aquarium: Rock Kink",
    description: `The channel kinks around a boulder that has wedged itself into the trench like a cork. The only way forward is back east.`,
    descriptionShort: `A kinked dead-end around a wedged boulder. East back.`,
    exits: [{ direction: "east", toRoomId: "AqChannel3" }],
  },

  {
    id: "AqChannel4",
    name: "Aquarium: Pressure Bend",
    description: `The channel bends here, and the water pressure feels subtly different—as if the habitat’s circulation concentrates in this pocket. East leads back toward silt; west continues along the trench.`,
    descriptionShort: `A bend in the lower channel. West continues; east returns.`,
    exits: [
      { direction: "north", toRoomId: "AqChannel3" },
      { direction: "west", toRoomId: "AqChannel5" },
    ],
  },
  {
    id: "AqChannel5",
    name: "Aquarium: Return Run",
    description: `The trench widens and rises slightly. Ahead, you can see the faint glow that marks the arrival ledge area. East returns along the channel; north climbs back to the ledge.`,
    descriptionShort: `The lower run leads back toward the arrival ledge. North returns; east back into the channel.`,
    exits: [
      { direction: "east", toRoomId: "AqChannel4" },
      { direction: "north", toRoomId: "AqStart" },
    ],
  },
];
