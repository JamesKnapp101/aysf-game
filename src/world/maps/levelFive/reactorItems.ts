import { updateItemLocation } from "@game/rules/items";
import { addToInventory } from "@game/rules/state";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import {
  getReactorContainmentIntegrity,
  getReactorConsensusState,
  getReactorHeatLevel,
  getReactorLobeCounts,
  getReactorRadiationLevel,
  RADIATION_SUIT_ITEM_ID,
  removeCorruptedReactorLobe,
  REACTOR_BIG_BOARD_ROOM_IDS,
} from "./reactorConsensus";
import {
  COOLANT_GAUGE_ID,
  COOLANT_PANEL_ID,
  COOLANT_VALVE_ID,
  CORRUPTED_LOBE_ITEM_ID,
  DAMAGED_REACTOR_LOBE_ITEM_ID,
  describeCoolantGauge,
  enterVirtualOffice,
  getCoolantValvePosition,
  leaveVirtualOffice,
  REACTOR_KEY_SLOT_ID,
  REACTOR_LOBE_ARRAY_ID,
  REACTOR_SUPPLY_LOCKER_ID,
  REACTOR_TERMINAL_ID,
  setCoolantValve,
  turnReactorTerminalKey,
  VIRTUAL_GOGGLES_ID,
  VIRTUAL_MANAGER_ID,
  VIRTUAL_MANAGER_OFFICE_ROOM_ID,
  VIRTUAL_OFFICE_ROOM_ID,
} from "./reactorSystems";

function takeCorruptedLobe({ state }: { state: GameState }) {
  const lobe13 = getReactorConsensusState(state).lobes.find(
    (lobe) => lobe.id === "reactor-lobe-13",
  );
  if (lobe13?.status === "missing") {
    return { state, message: "Socket 13 is already empty." };
  }
  if (lobe13?.status === "harmonic") {
    return {
      state,
      message: "The healthy replacement is locked firmly into socket 13.",
    };
  }

  let next = removeCorruptedReactorLobe(state);
  next = updateItemLocation(next, CORRUPTED_LOBE_ITEM_ID, "INVENTORY");
  next = addToInventory(next, CORRUPTED_LOBE_ITEM_ID);
  return {
    state: next,
    message:
      "You release the catches and pull corrupted lobe 13 from the array. Its bent connector crackles once in your hands, then dies. On the Big Board, hexagon 13 fades to gray.",
  };
}

function describeLobeArray(state: GameState): string {
  const consensus = getReactorConsensusState(state);
  const counts = getReactorLobeCounts(consensus);
  const lobe13 = consensus.lobes.find(
    (lobe) => lobe.id === "reactor-lobe-13",
  );
  const stateSummary = consensus.isStable
    ? "Every active housing now shines a calm green."
    : `Across the array, ${counts.harmonic} housings glow green, ${counts.dissonant} glow red, ${counts.undecided} glow yellow, and ${counts.missing} socket is dark.`;
  const corruptedDescription =
    lobe13?.status === "missing"
      ? "Socket 13 is conspicuously empty."
      : lobe13?.status === "harmonic"
        ? "A clean replacement housing occupies socket 13, glowing green."
        : "Lobe 13 stands out immediately: its spherical housing is cracked, and an irregular red light flickers through the fracture.";

  return `Twenty-five spherical AI housings fill the wall-mounted array, thirteen across the top row and twelve beneath it. ${stateSummary} ${corruptedDescription}`;
}

function describeBigBoard(state: GameState): string {
  const consensus = getReactorConsensusState(state);
  const counts = getReactorLobeCounts(consensus);
  const integrity = getReactorContainmentIntegrity(consensus);
  const heat = getReactorHeatLevel(consensus).toFixed(1);
  const radiation = getReactorRadiationLevel(consensus);

  return `The Big Board's heading reads REACTOR LOBE CONSENSUS. From here the display resolves as lit hexagons and summary stats rather than individual lobe details: ${counts.harmonic} green, ${counts.undecided} yellow, ${counts.dissonant} red, and ${counts.missing} dark. The status strip reports containment ${integrity}%, heat index ${heat}, and radiation ${radiation}.`;
}

const reactorBigBoardViewItems: Item[] = [...REACTOR_BIG_BOARD_ROOM_IDS].map(
  (roomId) => ({
    id: `ReactorBigBoardView_${roomId}`,
    name: "Reactor Lobe Consensus Big Board",
    description:
      "A huge remote status board summarizes the Reactor Lobe Consensus.",
    describe: (state) => describeBigBoard(state),
    sceneryDescription: "",
    location: roomId,
    vocab: [
      "board",
      "big board",
      "consensus board",
      "display",
      "status display",
      "consensus display",
      "reactor board",
      "reactor consensus board",
      "reactor lobe consensus",
      "reactor lobe consensus board",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 900,
    itemSize: 10,
  }),
);

export const reactorAdditionItems: Item[] = [
  ...reactorBigBoardViewItems,
  {
    id: DAMAGED_REACTOR_LOBE_ITEM_ID,
    name: "defunct reactor lobe",
    description:
      "The lobe is a heavy spherical AI housing. An explosion split its shell almost in half, and the broad connector on its back is a ruin of bent gold pins. Whatever mind once occupied it is gone.",
    initialDescription:
      "A defunct Reactor Lobe lies amid the machinery, its spherical housing cracked open and its gold connector pins bent flat.",
    location: "ReactorPlatform",
    vocab: ["defunct lobe", "damaged lobe", "reactor lobe", "lobe"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 8,
    itemSize: 3,
  },
  {
    id: REACTOR_SUPPLY_LOCKER_ID,
    name: "radiation equipment locker",
    description:
      "A tall yellow locker bears a faded radiation trefoil and a stenciled instruction to inspect seals before entering the core.",
    sceneryDescription:
      "A yellow radiation equipment locker is bolted beside the supply cabinets.",
    location: "SupplyPlatform",
    vocab: ["locker", "storage locker", "equipment locker", "radiation locker"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 6,
    isContainer: true,
    isOpenable: true,
    capacity: 4,
    meta: { contentsAccessibleWhenClosed: false },
  },
  {
    id: RADIATION_SUIT_ITEM_ID,
    name: "radiation suit",
    description:
      "A silver full-body radiation suit with a flexible hood, layered shielding, and sealed gloves and boots. Its warning label is blunt: RADIATION BARRIER — NOT THERMAL PROTECTION.",
    location: REACTOR_SUPPLY_LOCKER_ID,
    vocab: ["radiation suit", "rad suit", "suit", "protective suit"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 9,
    itemSize: 5,
    isWearable: true,
    clothingSlot: "body",
    meta: {
      clothing: {
        wearMessage:
          "You step into the radiation suit and seal it from boots to hood. The shielding is reassuring; the complete absence of cooling is not.",
        removeMessage: "You break the seals and peel off the radiation suit.",
      },
      protection: { radiation: true, heat: false },
    },
  },
  {
    id: "DestroyedLobeStorageChamber",
    name: "destroyed backup lobe chamber",
    description:
      "The metal chamber once held rows of backup Reactor Lobes. It has burst outward from a catastrophic internal explosion. Most housings are shattered beyond recognition; the few intact shells are blackened and visibly corrupted. Impact scars trace two clean trajectories—one toward the Reactor Platform and another up toward the rafters over the Observation Platform.",
    sceneryDescription:
      "A ruptured metal storage chamber dominates the platform, surrounded by the destroyed remains of backup Reactor Lobes.",
    location: "LobeStoragePlatform",
    vocab: ["chamber", "storage chamber", "backup lobes", "trajectory", "wreckage"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1000,
    itemSize: 10,
  },
  {
    id: COOLANT_PANEL_ID,
    name: "coolant control panel",
    description:
      "A rectangular service panel is labeled REACTOR CORE COOLANT BIAS. Its recessed handle is marked with red and blue stripes.",
    sceneryDescription:
      "A red-and-blue striped coolant control panel is mounted among the insulated pipes.",
    location: "HeatCoolantExchangePlatform",
    vocab: ["panel", "coolant panel", "control panel", "service panel"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 3,
    isContainer: true,
    isOpenable: true,
    capacity: 4,
    meta: { contentsAccessibleWhenClosed: false },
  },
  {
    id: COOLANT_VALVE_ID,
    name: "three-position coolant valve",
    description:
      "The short industrial valve moves through three detents labeled -1, 0, and 1. Negative reduces coolant flow; positive increases it.",
    describe: (state) =>
      `The coolant valve is set to ${getCoolantValvePosition(state)}. Its three detents are labeled -1, 0, and 1.`,
    location: COOLANT_PANEL_ID,
    vocab: ["valve", "coolant valve", "three position valve"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 2,
    isSettable: true,
    overrides: { set: setCoolantValve },
  },
  {
    id: COOLANT_GAUGE_ID,
    name: "red-and-blue pressure gauge",
    description:
      "A wide pressure gauge is divided into a red heat side and a blue coolant side.",
    describe: (state) => describeCoolantGauge(state),
    location: COOLANT_PANEL_ID,
    vocab: ["gauge", "pressure gauge", "red gauge", "blue gauge"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 3,
    itemSize: 2,
  },
  {
    id: REACTOR_LOBE_ARRAY_ID,
    name: "reactor lobe array",
    description:
      "Twenty-five spherical AI housings are mounted in two precise rows.",
    describe: (state) => describeLobeArray(state),
    sceneryDescription:
      "A wall-sized array holds twenty-five spherical Reactor Lobes in two rows: thirteen above and twelve below.",
    location: "ReactorControlRoom",
    vocab: ["array", "lobe array", "reactor array", "lobes", "reactor lobes"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 900,
    itemSize: 10,
    isContainer: true,
    isOpenable: false,
    capacity: 1,
    allowedContentsIds: ["ReplacementReactorLobe"],
  },
  {
    id: CORRUPTED_LOBE_ITEM_ID,
    name: "corrupted reactor lobe 13",
    description:
      "Lobe 13 has a cracked spherical housing. Red light spasms behind the fracture, and several gold pins in its rear connector are heat-discolored.",
    location: "ReactorControlRoom",
    vocab: ["lobe 13", "13", "corrupted lobe", "cracked lobe", "reactor lobe 13"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 8,
    itemSize: 3,
    overrides: { take: takeCorruptedLobe },
  },
  {
    id: REACTOR_TERMINAL_ID,
    name: "reactor control terminal",
    description:
      "A hardened terminal faces the core machinery. Its login prompt requests an ethics credential before exposing reactor restart controls.",
    sceneryDescription:
      "A hardened reactor control terminal glows beside the core observation hardware.",
    location: "ReactorCore",
    vocab: ["terminal", "reactor terminal", "control terminal", "computer"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 90,
    itemSize: 5,
    meta: { kind: "reactor-control-terminal" },
  },
  {
    id: REACTOR_KEY_SLOT_ID,
    name: "Engine Room Key receptacle",
    description:
      "A heavy orange-and-black key receptacle is wired directly into the reactor terminal. Its collar turns from O to I.",
    sceneryDescription:
      "An industrial key receptacle marked O/I sits beside the reactor terminal.",
    location: "ReactorCore",
    vocab: ["key", "key receptacle", "keyhole", "slot", "engine room key receptacle"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 2,
    isContainer: true,
    isOpenable: false,
    capacity: 1,
    allowedContentsIds: ["EngineRoomKey"],
    meta: {
      onInsertKey: "You insert the orange-and-black Engine Room Key into the reactor receptacle.",
      onWrongKey: "That key does not fit the reactor receptacle.",
    },
    isTurnable: true,
    overrides: { turn: ({ state }: { state: GameState }) => turnReactorTerminalKey(state) },
  },
  {
    id: VIRTUAL_GOGGLES_ID,
    name: "wired virtual-reality goggles",
    description:
      "Bulky virtual-reality goggles hang from a thick data cable running into the reactor wall. They cannot be taken away, but the padded visor can be worn here.",
    sceneryDescription:
      "A set of virtual-reality goggles hangs from the wall on a thick, non-removable cable.",
    location: "ReactorCore",
    vocab: ["goggles", "virtual goggles", "vr goggles", "visor"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 2,
    itemSize: 2,
    isWearable: true,
    clothingSlot: "face",
    overrides: {
      take: "The goggles are permanently wired into the wall.",
      wear: ({ state }: { state: GameState }) => ({
        state: enterVirtualOffice(state),
        message:
          "You lower the visor. The reactor dissolves into white pixels, replaced by fluorescent lights and the anxious clatter of a virtual office.",
      }),
      remove: ({ state }: { state: GameState }) => ({
        state: leaveVirtualOffice(state),
        message:
          "You pull off the visor. The virtual office collapses, and the hot Reactor Core slams back into focus.",
      }),
    },
  },
  {
    id: "Corey",
    name: "Corey",
    description:
      "Corey is a heat-shielded engineering robot with a rounded white chassis browned around the edges by years beside the core. CORE OPERATIONS is printed across its chest.",
    initialDescription:
      "A heat-shielded engineering robot named Corey stands watch beside the reactor terminal.",
    location: "ReactorCore",
    vocab: ["corey", "core", "robot", "engineering robot"],
    itemClass: "solid",
    itemCategory: "animate",
    itemWeight: 180,
    itemSize: 4,
    idleActions: [
      "Corey studies a column of reactor telemetry and makes a minute adjustment with one metal fingertip.",
      "Corey's cooling fans rise briefly above the core's steady thrum, then subside.",
    ],
  },
  {
    id: "LemsterKrolmborg",
    name: "Lemster Krolmborg",
    description:
      "Lemster Krolmborg, Virtual Employee 12,847,395,061, is hunched over a desk nearly buried beneath impossible towers of work. His eyes flick between screens while both hands type without pause.",
    initialDescription:
      "Lemster Krolmborg is buried under a mountain of virtual work, typing with the desperation of a man trying not to be here until midnight.",
    location: VIRTUAL_OFFICE_ROOM_ID,
    vocab: ["lemster", "krolmborg", "employee", "man"],
    itemClass: "solid",
    itemCategory: "animate",
    itemWeight: 80,
    itemSize: 3,
    idleActions: [
      "Lemster mutters, ‘No, no, no, if I clear forty-seven more before lunch I can still make up the morning deficit.’",
      "A new stack of virtual forms materializes. Lemster makes a tiny wounded sound and keeps typing.",
      "Lemster glances at the clock, pales, and attacks his keyboard with renewed desperation.",
    ],
  },
  {
    id: VIRTUAL_MANAGER_ID,
    name: "robot manager",
    description:
      "The robot manager is a severe chrome office unit with a motivational slogan scrolling where its mouth should be: EVERYBODY IS FEELING THE PAIN.",
    initialDescription:
      "A robot manager sits behind its desk, glaring through the open doorway at Lemster.",
    location: VIRTUAL_MANAGER_OFFICE_ROOM_ID,
    vocab: ["manager", "robot manager", "robot", "boss"],
    itemClass: "solid",
    itemCategory: "animate",
    itemWeight: 140,
    itemSize: 3,
    idleActions: [
      "The robot manager calls through the doorway, ‘We are a team, Lemster! Teams convert pain into deliverables!’",
      "The manager taps a metal finger against its desk and says, ‘Drive, drive, drive.’",
    ],
  },
];
