import { ROOM_NAME_TOKEN_END, ROOM_NAME_TOKEN_START } from "../constants";
import { appendLog } from "../engine/log";
import { movePlayerToRoom } from "../helpers/gameHelpers";
import { getRoomById } from "../helpers/itemHelpers";
import { prepareRoomForTravel } from "../helpers/roomChunkTravel";
import { buildTranscriptRoomDescription } from "../text/roomDescription";
import type { GameState } from "../types/gameTypes";

export type RingKey =
  | "teleport-pads-green"
  | "teleport-pads-blue"
  | "teleport-pads-maroon"
  | "teleport-pads-yellow"
  | "teleport-pads-violet"
  | "teleport-pads-white"
  | "teleport-pads-orange";

export type RingId =
  | "botanical"
  | "deepStorage"
  | "medical"
  | "operations"
  | "powerGrid"
  | "utilities"
  | "zoological";

export type RingConfig = {
  fallbackRequiredBadgeIds: string[];
  id: RingId;
  label: string;
  sectionKey: RingKey;
  ringColor: string;
  destinations: string[];
};

export const RINGS: RingConfig[] = [
  {
    fallbackRequiredBadgeIds: ["greenbadge", "maroonbadge", "ultravioletbadge"],
    id: "botanical",
    label: "BOTANICAL",
    sectionKey: "teleport-pads-green",
    ringColor: "#24ff68",
    destinations: ["ParkCenter", "UnderWebOne", "BotanicalOne"],
  },
  {
    fallbackRequiredBadgeIds: ["bluebadge", "maroonbadge", "ultravioletbadge"],
    id: "medical",
    label: "MEDICAL",
    sectionKey: "teleport-pads-blue",
    ringColor: "#38a7ff",
    destinations: ["Lab", "RemoteMedicalOne"],
  },
  {
    fallbackRequiredBadgeIds: ["maroonbadge", "ultravioletbadge"],
    id: "operations",
    label: "OPERATIONS",
    sectionKey: "teleport-pads-maroon",
    ringColor: "#ff3d45",
    destinations: ["Bridge"],
  },
  {
    fallbackRequiredBadgeIds: ["yellowbadge", "maroonbadge", "ultravioletbadge"],
    id: "powerGrid",
    label: "POWER GRID",
    sectionKey: "teleport-pads-yellow",
    ringColor: "#ffdf38",
    destinations: ["PowerGrid", "RemotePowerStation"],
  },
  {
    fallbackRequiredBadgeIds: ["violetbadge", "maroonbadge", "ultravioletbadge"],
    id: "utilities",
    label: "UTILITIES",
    sectionKey: "teleport-pads-violet",
    ringColor: "#b15cff",
    destinations: ["ReactorPlatform"],
  },
  {
    fallbackRequiredBadgeIds: ["orangebadge", "maroonbadge", "ultravioletbadge"],
    id: "zoological",
    label: "ZOOLOGICAL",
    sectionKey: "teleport-pads-orange",
    ringColor: "#ff982f",
    destinations: ["VeterinaryCenter", "OuterRingSouth", "XenobiologyLab"],
  },
  {
    fallbackRequiredBadgeIds: ["whitebadge", "maroonbadge", "ultravioletbadge"],
    id: "deepStorage",
    label: "DEEP STORAGE",
    sectionKey: "teleport-pads-white",
    ringColor: "#f4f7ff",
    destinations: ["CryoLab", "DeepStorageGrid"],
  },
];

export const destinationLabelMap = {
  ParkCenter: "Park Center",
  HydroponicsOne: "Hydroponics",
  BotanicalOne: "Botanical",
  Lab: "Medical Lab",
  RemoteMedicalOne: "Remote Medical Facility",
  Bridge: "Command Portal",
  PowerGrid: "Power Station",
  RemotePowerStation: "Remote Power Station",
  ReactorPlatform: "Reactor Platform",
  VeterinaryCenter: "Veterinary Center",
  OuterRingSouth: "Aviary",
  CryoLab: "Deep Lab",
  DeepStorageGrid: "Grid",
  GridC3: "Grid",
  UnderWebOne: "Hydroponics",
  XenobiologyLab: "Xenobiology Lab",
};

export const MARQUEE_MESSAGE =
  "PLEASE SELECT YOUR TRAVEL DESTINATION! SOME DESTINATIONS MAY REQUIRE AUTHORIZATION.";
export const UNAUTHORIZED_MESSAGE =
  `The terminal flashes a destination preview, then a harsh buzzer snaps across the platform.\n\n"Unauthorized."`;

export function isRingOnline(state: GameState, key: RingKey): boolean {
  return Boolean((state.worldState.powerRestoredSections as Partial<Record<RingKey, boolean>>)?.[key]);
}

function getInventoryItemIds(state: GameState): string[] {
  return [
    ...state.player.inventory.general,
    ...state.player.inventory.badges,
    ...state.player.inventory.keys,
  ];
}

export function getRequiredBadgeIds(state: GameState, ring: RingConfig): string[] {
  const terminalPad = state.world.items.find(
    (item) =>
      item.location === "TPADTerminal" &&
      item.meta?.teleport?.section === ring.sectionKey &&
      item.meta?.teleport?.order === 1,
  );
  const requires = terminalPad?.meta?.teleport?.requires;

  return Array.isArray(requires)
    ? requires.map((badgeId) => String(badgeId))
    : ring.fallbackRequiredBadgeIds;
}

export function hasRingAuthorization(state: GameState, ring: RingConfig): boolean {
  const requiredBadgeIds = getRequiredBadgeIds(state, ring);
  if (requiredBadgeIds.length === 0) return true;

  const inventoryItemIds = new Set(getInventoryItemIds(state));
  return requiredBadgeIds.some((badgeId) => inventoryItemIds.has(badgeId));
}

export type TerminalTeleportResult = { state: GameState; messages: string[]; teleported: boolean };

export function terminalDestinations(state: GameState) {
  return RINGS.flatMap(ring => ring.destinations.map(roomId => ({
    ringId: ring.id, ringLabel: ring.label, roomId,
    label: destinationLabelMap[roomId as keyof typeof destinationLabelMap],
    online: isRingOnline(state, ring.sectionKey),
  })));
}

/** Two phases let React and the serialized harness recheck the latest state. */
export async function prepareTerminalTeleport(state: GameState, ringId: RingId, roomId: string) {
  const ring = RINGS.find(ring => ring.id === ringId);
  const unchanged = (latest: GameState): TerminalTeleportResult => ({ state: latest, messages: [], teleported: false });
  const failure = (latest: GameState, message: string): TerminalTeleportResult => ({
    state: appendLog(latest, `${message}\n`), messages: [message], teleported: false,
  });
  if (!ring || !ring.destinations.includes(roomId) || !isRingOnline(state, ring.sectionKey)) return { complete: unchanged };
  if (!hasRingAuthorization(state, ring)) return { complete: (latest: GameState) => failure(latest, UNAUTHORIZED_MESSAGE) };
  let destination: Awaited<ReturnType<typeof prepareRoomForTravel>>;
  try {
    destination = await prepareRoomForTravel(state, roomId);
  } catch {
    // No transition occurred. Like an unavailable browser preparation, retain
    // the interface without revealing errors or attempting alternate travel.
    return { complete: unchanged };
  }
  return {
    complete(latest: GameState): TerminalTeleportResult {
      if (latest.player.roomId !== state.player.roomId || !isRingOnline(latest, ring.sectionKey)) return unchanged(latest);
      const workingState = destination.applyTo(latest);
      if (!hasRingAuthorization(workingState, ring)) return failure(workingState, UNAUTHORIZED_MESSAGE);
      if (!isRingOnline(workingState, ring.sectionKey)) return unchanged(workingState);
      const room = getRoomById(workingState, destination.roomId);
      if (!room) return failure(workingState, "The terminal chirps, then clears its destination readout. That endpoint is not responding.");
      const wasVisited = Boolean(workingState.worldState.visitedRooms[destination.roomId]);
      let next = movePlayerToRoom(workingState, destination.roomId);
      next = { ...next, worldState: { ...next.worldState, visitedRooms: { ...next.worldState.visitedRooms, [destination.roomId]: true } } };
      const arrival = "You feel a tingling in your belly a beat before the world warps around you, blurring together and then snapping back into focus an instant later to reveal someplace entirely different.\n";
      const description = buildTranscriptRoomDescription(next, destination.roomId, { isFirstVisit: !wasVisited });
      const roomText = [`${ROOM_NAME_TOKEN_START}${room.name}${ROOM_NAME_TOKEN_END}`, description].filter(Boolean).join("\n");
      next = appendLog(appendLog(next, arrival), roomText);
      return { state: next, messages: [arrival, roomText], teleported: true };
    },
  };
}

