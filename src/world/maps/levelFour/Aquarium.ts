import type { GameState } from "@game/types/gameTypes";
import type { DescriptionContext } from "@game/types/itemTypes";
import { Room } from "@game/types/roomTypes";
import { getAquariumThreatDescription } from "src/world/Items/creatures/octopus";

function describeAquariumRoom(
  state: GameState,
  room: Room,
  ctx: DescriptionContext,
): string {
  const visitedRooms = state.worldState.visitedRooms ?? {};
  const useShortBase =
    ctx.kind === "roomBase" &&
    ctx.mode === "log" &&
    visitedRooms[room.id] === true &&
    room.descriptionShort;

  const base = (useShortBase ? room.descriptionShort : room.description)?.trim() ?? "";
  const threat = getAquariumThreatDescription(state, room.id);

  return threat ? `${base}\n\n${threat}` : base;
}

const aquariumRoomDefs: Room[] = [
  {
    id: "AqStart",
    name: "Aquarium: Transfer Lock",
    description:
      "You stand in a cramped transfer lock built into the side of the main aquarium habitat. The chamber itself is dry, its floor set with a glossy aqua disk large enough to stand on, while a thick viewing panel to the north looks into dark water beyond. The pumps on the far side make the bulkhead tremble in a slow, aquatic rhythm.",
    descriptionShort:
      "A dry transfer lock with an aqua disk. North leads back into the aquarium water.",
    exits: [{ direction: "north", toRoomId: "AqOpen1" }],
  },
  {
    id: "AqOpen1",
    name: "Aquarium: Flooded Threshold",
    description:
      "The transfer lock gives way to cold, dim water. The habitat opens into a narrow flooded shelf that runs along the glass wall, with the dry lock back to the south and darker water ahead. A break in the stone to the west promises more cover than the exposed route north.",
    descriptionShort:
      "A narrow underwater shelf. South returns to the dry lock; north and west lead deeper in.",
    exits: [
      { direction: "north", toRoomId: "AqOpen2" },
      { direction: "south", toRoomId: "AqStart" },
      { direction: "west", toRoomId: "AqRock1" },
    ],
  },
  {
    id: "AqOpen2",
    name: "Aquarium: Glass Run",
    description:
      "Here the habitat hugs the curved outer glass, leaving you horribly visible from almost every angle. Pale aquarium light ripples over the wall while loose strands of kelp sway above. The run continues north and back south.",
    descriptionShort:
      "An exposed stretch along the aquarium glass. North and south follow the run.",
    exits: [
      { direction: "north", toRoomId: "AqOpen3" },
      { direction: "south", toRoomId: "AqOpen1" },
    ],
  },
  {
    id: "AqOpen3",
    name: "Aquarium: Lampfall",
    description:
      "A fan of hard white light pours down from the ceiling lamps here, catching every drifting particle in the water and making the whole area feel staged for an audience. It is beautiful in the exact way an execution chamber might be. North continues into darker water; south returns along the lit shelf.",
    descriptionShort:
      "A bright, exposed pool beneath the lamps. North continues; south goes back.",
    exits: [
      { direction: "north", toRoomId: "AqOpen4" },
      { direction: "south", toRoomId: "AqOpen2" },
    ],
  },
  {
    id: "AqOpen4",
    name: "Aquarium: Outer Bend",
    description:
      "The glass wall bends sharply here and the open route narrows toward a darker knot of stone ahead. The water feels emptier in this stretch, as if the habitat itself expects something to come through first. South leads back toward the lamps, while west cuts into the central rock mass.",
    descriptionShort:
      "A bend in the outer route. West cuts into the rocks; south retreats along the glass.",
    exits: [
      { direction: "west", toRoomId: "AqCross" },
      { direction: "south", toRoomId: "AqOpen3" },
    ],
  },
  {
    id: "AqRock1",
    name: "Aquarium: Rock Gate",
    description:
      "A cluster of basalt outcrops forms a narrow gate in the habitat wall, breaking sightlines and swallowing much of the overhead light. It feels tighter here, more defensible, but also better suited to something with too many limbs. East returns to the threshold shelf and north slips deeper between the rocks.",
    descriptionShort:
      "Shadowing rocks offer cover here. East goes back to the shelf; north goes deeper.",
    exits: [
      { direction: "east", toRoomId: "AqOpen1" },
      { direction: "north", toRoomId: "AqRock2" },
    ],
  },
  {
    id: "AqRock2",
    name: "Aquarium: Kelp Shadows",
    description:
      "Curtains of kelp trail over the rock face and turn the water into a wavering green dusk. The stone here is broken into shelves and handholds that make progress easier, but the vegetation also gives the water too many places to hide movement. North and south continue along the sheltered route.",
    descriptionShort:
      "A dim, kelp-draped stretch of rock. North and south follow the sheltering route.",
    exits: [
      { direction: "north", toRoomId: "AqRock3" },
      { direction: "south", toRoomId: "AqRock1" },
    ],
  },
  {
    id: "AqRock3",
    name: "Aquarium: Split Stone",
    description:
      "The rocks pinch inward around a split slab, forcing you through a narrow throat in the habitat. The stone is close enough on both sides to steady yourself against, and the confinement makes every pulse of movement in the water feel uncomfortably intimate. North leads into the central crevice and south backs out toward the kelp.",
    descriptionShort:
      "A tight rocky throat. North reaches the central crevice; south returns to the kelp.",
    exits: [
      { direction: "north", toRoomId: "AqCross" },
      { direction: "south", toRoomId: "AqRock2" },
    ],
  },
  {
    id: "AqCross",
    name: "Aquarium: Crossover Crevice",
    description:
      "The aquarium's central rock mass splits here into a cramped crossroads gouged smooth by years of heavy movement. Every route in the habitat seems to touch this place: the outer glass run to the east, the sheltered rocks to the north, a darker ridge to the west, and a lower return channel dropping away to the south.",
    descriptionShort:
      "A tight central crossroads: north to shelter, east to open water, west to the ridge, south to the lower channel.",
    exits: [
      { direction: "east", toRoomId: "AqOpen4" },
      { direction: "north", toRoomId: "AqRock3" },
      { direction: "west", toRoomId: "AqRock4" },
      { direction: "south", toRoomId: "AqChannel1" },
    ],
  },
  {
    id: "AqRock4",
    name: "Aquarium: Ridge Mouth",
    description:
      "The western ridge begins as a jagged shelf broken by tooth-like fins of stone. The route narrows almost immediately, forcing anything moving through it to commit. East returns to the crevice, while north follows the ridge toward deeper water.",
    descriptionShort:
      "The ridge begins here. North follows it deeper; east returns to the central crevice.",
    exits: [
      { direction: "north", toRoomId: "AqRock5" },
      { direction: "east", toRoomId: "AqCross" },
    ],
  },
  {
    id: "AqRock5",
    name: "Aquarium: Overhang",
    description:
      "A heavy stone overhang blocks most of the ceiling lamps, leaving the ridge in a muted green twilight. The water feels colder here and the acoustics are strange, each distant thump arriving as if through a wall. North follows the ridge deeper into the basin, while south returns toward the crossover.",
    descriptionShort:
      "A dim shelf beneath a heavy overhang. North goes deeper; south goes back.",
    exits: [
      { direction: "north", toRoomId: "AqRock6" },
      { direction: "south", toRoomId: "AqRock4" },
    ],
  },
  {
    id: "AqRock6",
    name: "Aquarium: Broken Column",
    description:
      "A broken pillar of stone leans across part of the passage here, forcing you to thread around it. The geometry makes it good cover, but it would also make a fine place to die if something bigger than you decided to own the route. North continues toward a darker basin lip; south returns beneath the overhang.",
    descriptionShort:
      "A tight bend around a broken stone column. North reaches the basin lip; south retreats.",
    exits: [
      { direction: "north", toRoomId: "AqRock7" },
      { direction: "south", toRoomId: "AqRock5" },
    ],
  },
  {
    id: "AqRock7",
    name: "Aquarium: Basin Lip",
    description:
      "The ridge drops away here into a colder, darker basin where the rock shelves vanish beneath black water. Silt lifts from every foothold and hangs in the current like smoke. South is the only clear route back out.",
    descriptionShort:
      "The ridge ends at a dark basin lip. South heads back along the ridge.",
    exits: [{ direction: "south", toRoomId: "AqRock6" }],
  },
  {
    id: "AqGoal",
    name: "Aquarium: Grotto Vault",
    description:
      "A cramped vault opens here where the fissure widens into a hidden service pocket behind interlocked slabs of stone. In the middle stands a corroded maintenance pedestal fitted with a sealed control node that somehow survived everything else. It is the sort of thing someone died expecting to recover. North climbs back to the rock kink, while east opens into the rising return run toward the transfer lock.",
    descriptionShort:
      "A hidden grotto with a maintenance pedestal. North returns to the fissure; east opens into the return run.",
    exits: [
      { direction: "north", toRoomId: "AqChannel4b" },
      { direction: "east", toRoomId: "AqChannel5" },
    ],
  },
  {
    id: "AqChannel1",
    name: "Aquarium: Lower Channel Mouth",
    description:
      "The floor drops here into a lower drainage channel cut beneath the central rocks. The water grows denser and colder, and the pump-thrum becomes a pressure you feel in your sternum. North climbs back to the crevice; south descends deeper into the channel.",
    descriptionShort:
      "A lower channel under the rocks. North returns to the crevice; south goes deeper.",
    exits: [
      { direction: "north", toRoomId: "AqCross" },
      { direction: "south", toRoomId: "AqChannel2" },
    ],
  },
  {
    id: "AqChannel2",
    name: "Aquarium: Narrow Cut",
    description:
      "The channel tightens to a trench here, its walls close enough to brush with either hand. Suspended grit hangs in the water like smoke waiting for something to disturb it. North returns toward the crevice; south continues through the trench.",
    descriptionShort:
      "A narrow trench under the rocks. North back; south onward.",
    exits: [
      { direction: "north", toRoomId: "AqChannel1" },
      { direction: "south", toRoomId: "AqChannel3" },
    ],
  },
  {
    id: "AqChannel3",
    name: "Aquarium: Silt Drift",
    description:
      "Fine gray silt has settled thickly here and lifts in slow clouds around every kick or touch. The main channel continues north and south, while a darker side cut opens to the west around a wedged boulder.",
    descriptionShort:
      "A silt-choked stretch of the lower channel. West opens into a side cut.",
    exits: [
      { direction: "north", toRoomId: "AqChannel2" },
      { direction: "south", toRoomId: "AqChannel4" },
      { direction: "west", toRoomId: "AqChannel4b" },
    ],
  },
  {
    id: "AqChannel4b",
    name: "Aquarium: Rock Kink",
    description:
      "The side cut kinks around a house-sized boulder jammed into the trench. Silt packs thickly here, and in the murk beyond the stone the passage pinches again into a darker fissure descending south.",
    descriptionShort:
      "A cramped side cut around a wedged boulder. East returns to the trench; south slips into a darker fissure.",
    exits: [
      { direction: "east", toRoomId: "AqChannel3" },
      { direction: "south", toRoomId: "AqGoal" },
    ],
  },
  {
    id: "AqChannel4",
    name: "Aquarium: Pressure Bend",
    description:
      "The trench bends here and the circulation changes abruptly, pressing colder water across your body in slow surges. North returns toward the silt drift; west follows the final stretch of the lower route.",
    descriptionShort:
      "A colder bend in the lower trench. West continues; north goes back.",
    exits: [
      { direction: "north", toRoomId: "AqChannel3" },
      { direction: "west", toRoomId: "AqChannel5" },
    ],
  },
  {
    id: "AqChannel5",
    name: "Aquarium: Return Run",
    description:
      "The lower route widens and rises toward the transfer lock. Ahead, through the dark water, you can make out the dry chamber's glow beyond the threshold. East leads back into the trench, while north climbs out toward the lock.",
    descriptionShort:
      "The lower route rises toward the transfer lock. North reaches safety; east returns to the trench.",
    exits: [
      { direction: "east", toRoomId: "AqChannel4" },
      { direction: "north", toRoomId: "AqStart" },
    ],
  },
];

export const aquariumRooms: Room[] = aquariumRoomDefs.map((room) => ({
  ...room,
  describe: describeAquariumRoom,
}));
