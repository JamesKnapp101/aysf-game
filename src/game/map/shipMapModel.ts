import type { GameState } from "@game/types/gameTypes";
import type {
  ShipMapConnector,
  ShipMapLevel,
  ShipMapLevelId,
  ShipMapNode,
  ShipMapShape,
} from "./shipMapTypes";
import { SHIP_MAP_LAYOUT } from "./generatedShipMapLayout";

export type ShipMapBounds = {
  height: number;
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
  width: number;
};

export type ShipMapEdge = {
  fromNodeId?: string;
  fromRoomId?: string;
  id: string;
  isDecorative?: boolean;
  isArrow?: boolean;
  points?: ShipMapConnector["points"];
  strokeStyle?: ShipMapConnector["strokeStyle"];
  toNodeId?: string;
  toRoomId?: string;
};

export type ShipMapNodeStatus = "current" | "unknown" | "visited";

export type ShipMapTeleportDiskColor =
  | "blue"
  | "green"
  | "maroon"
  | "orange"
  | "violet"
  | "white"
  | "yellow";

export type ShipMapTeleportDiskMarker = {
  color: string;
  colorName: ShipMapTeleportDiskColor;
  id: string;
  isActive: boolean;
  nodeId: string;
  placement: "corner" | "terminal-row";
  roomId: string;
  terminalIndex?: number;
  terminalTotal?: number;
};

const NODES = SHIP_MAP_LAYOUT.nodes as readonly ShipMapNode[];
const CONNECTORS = SHIP_MAP_LAYOUT.connectors as readonly ShipMapConnector[];
const SHAPES = SHIP_MAP_LAYOUT.shapes as readonly ShipMapShape[];

const TELEPORT_DISK_NETWORKS = [
  {
    color: "#24ff68",
    colorName: "green",
    rooms: ["TPADTerminal", "ParkCenter", "HydroponicsOne", "BotanicalOne"],
    section: "teleport-pads-green",
  },
  {
    color: "#38a7ff",
    colorName: "blue",
    rooms: ["TPADTerminal", "Lab", "RemoteMedicalOne"],
    section: "teleport-pads-blue",
  },
  {
    color: "#ff3d45",
    colorName: "maroon",
    rooms: ["TPADTerminal", "Bridge"],
    section: "teleport-pads-maroon",
  },
  {
    color: "#ffdf38",
    colorName: "yellow",
    rooms: ["TPADTerminal", "PowerGrid", "RemotePowerStation"],
    section: "teleport-pads-yellow",
  },
  {
    color: "#b15cff",
    colorName: "violet",
    rooms: ["TPADTerminal", "ReactorPlatform"],
    section: "teleport-pads-violet",
  },
  {
    color: "#ff982f",
    colorName: "orange",
    rooms: ["TPADTerminal", "VeterinaryCenter", "OuterRingSouth", "XenobiologyLab"],
    section: "teleport-pads-orange",
  },
  {
    color: "#f4f7ff",
    colorName: "white",
    rooms: ["TPADTerminal", "CryoLab", "GridC3"],
    section: "teleport-pads-white",
  },
] as const satisfies ReadonlyArray<{
  color: string;
  colorName: ShipMapTeleportDiskColor;
  rooms: readonly string[];
  section: string;
}>;

const TELEPORT_DISK_MAP_ROOM_ALIASES: Record<string, string> = {
  GridC3: "DeepStorageGrid",
  HydroponicsOne: "UnderWebOne",
};

const ROOM_NODES = NODES.reduce<
  Map<string, readonly ShipMapNode[]>
>((acc, node) => {
  const roomIds = node.roomIds ?? [node.roomId];

  for (const roomId of roomIds) {
    const current = acc.get(roomId) ?? [];
    acc.set(roomId, [...current, node]);
  }

  return acc;
}, new Map());

const LEVELS = new Map<ShipMapLevelId, ShipMapLevel>(
  SHIP_MAP_LAYOUT.levels.map((level) => [level.id, level]),
);

export function getShipMapLevelTitle(levelId: ShipMapLevelId): string {
  return LEVELS.get(levelId)?.title ?? "Map";
}

export function getShipMapLevels() {
  return SHIP_MAP_LAYOUT.levels;
}

export function getShipMapNodesForLevel(
  levelId: ShipMapLevelId,
): readonly ShipMapNode[] {
  return NODES.filter((node) => node.levelId === levelId);
}

export function getShipMapShapesForLevel(
  levelId: ShipMapLevelId,
): readonly ShipMapShape[] {
  return SHAPES.filter((shape) => shape.levelId === levelId);
}

export function getPrimaryShipMapNodeForRoom(
  roomId: string,
  preferredLevelId?: ShipMapLevelId,
): ShipMapNode | undefined {
  const nodes = ROOM_NODES.get(roomId);
  if (!nodes?.length) return undefined;

  return (
    (preferredLevelId
      ? nodes.find((node) => node.levelId === preferredLevelId)
      : undefined) ?? nodes[0]
  );
}

export function getShipMapLevelIdForRoom(
  roomId: string,
): ShipMapLevelId | undefined {
  const nodeLevelId = getPrimaryShipMapNodeForRoom(roomId)?.levelId;
  if (nodeLevelId) return nodeLevelId;

  if (/^StairOne$|^LevelOne|^Bridge|^Observation$/.test(roomId)) {
    return "level-one";
  }
  if (/^StairTwo$|^LevelTwo|^Medical|^RemoteMedical|^Xenobiology|^Lab$/.test(roomId)) {
    return "level-two";
  }
  if (/^StairThree$|^LevelThree|^Park|^Bar|^Gym|^Movie|^Restaurant|^Spa/.test(roomId)) {
    return "level-three";
  }
  if (/^StairFour$|^LevelFour|^Aq|^OuterRing|^InnerRing|^GamePreserve|^Zoo/.test(roomId)) {
    return "level-four";
  }
  if (/^StairFive$|^LevelFive|^Eng|^Reactor|^Water|^Shuttle|^Warehouse/.test(roomId)) {
    return "level-five";
  }
  if (/^StairSix$|^LevelSix|^StorageQuad|^Hydroponics|^UnderWeb/.test(roomId)) {
    return "level-six";
  }
  if (/^StairSeven$|^StairWellSeven$|^LevelSeven|^Cryo|^Stasis|^DeepStorage/.test(roomId)) {
    return "level-seven";
  }

  return undefined;
}

export function getCurrentShipMapLevelId(
  state: GameState,
): ShipMapLevelId | undefined {
  return getShipMapLevelIdForRoom(state.player.roomId);
}

export function getShipMapNodeStatus(
  state: GameState,
  node: ShipMapNode,
): ShipMapNodeStatus {
  const roomIds = node.roomIds ?? [node.roomId];

  if (roomIds.includes(state.player.roomId)) return "current";
  if (roomIds.some((roomId) => state.worldState.visitedRooms[roomId])) {
    return "visited";
  }

  return "unknown";
}

export function shouldRevealShipMapNodeLabel(
  state: GameState,
  node: ShipMapNode,
): boolean {
  return getShipMapNodeStatus(state, node) !== "unknown";
}

function getTeleportDiskMapNode(roomId: string): ShipMapNode | undefined {
  return getPrimaryShipMapNodeForRoom(
    TELEPORT_DISK_MAP_ROOM_ALIASES[roomId] ?? roomId,
  );
}

function isTeleportDiskNetworkActive(state: GameState, section: string): boolean {
  const sections = state.worldState.powerRestoredSections as Record<
    string,
    boolean
  >;
  return Boolean(sections[section]);
}

export function getShipMapTeleportDiskMarkers(
  state: GameState,
  nodes: readonly ShipMapNode[],
): ShipMapTeleportDiskMarker[] {
  const nodeIds = new Set(nodes.map((node) => node.nodeId));
  const terminalTotal = TELEPORT_DISK_NETWORKS.length;
  const markers: ShipMapTeleportDiskMarker[] = [];

  for (const [networkIndex, network] of TELEPORT_DISK_NETWORKS.entries()) {
    const isActive = isTeleportDiskNetworkActive(state, network.section);

    for (const roomId of network.rooms) {
      const node = getTeleportDiskMapNode(roomId);
      if (!node || !nodeIds.has(node.nodeId)) continue;
      if (getShipMapNodeStatus(state, node) === "unknown") continue;

      markers.push({
        color: network.color,
        colorName: network.colorName,
        id: `${network.colorName}-${roomId}`,
        isActive,
        nodeId: node.nodeId,
        placement: roomId === "TPADTerminal" ? "terminal-row" : "corner",
        roomId,
        terminalIndex: roomId === "TPADTerminal" ? networkIndex : undefined,
        terminalTotal: roomId === "TPADTerminal" ? terminalTotal : undefined,
      });
    }
  }

  return markers;
}

export function getShipMapBounds(
  nodes: readonly ShipMapNode[],
  padding = 160,
  shapes: readonly ShipMapShape[] = [],
): ShipMapBounds | undefined {
  if (nodes.length === 0 && shapes.length === 0) return undefined;

  const bounds = [...nodes, ...shapes];
  const minX = Math.min(...bounds.map((entry) => entry.x)) - padding;
  const minY = Math.min(...bounds.map((entry) => entry.y)) - padding;
  const maxX = Math.max(...bounds.map((entry) => entry.x + entry.width)) + padding;
  const maxY = Math.max(...bounds.map((entry) => entry.y + entry.height)) + padding;

  return {
    height: Math.max(1, maxY - minY),
    maxX,
    maxY,
    minX,
    minY,
    width: Math.max(1, maxX - minX),
  };
}

function resolveExitTargetRoomId(
  state: GameState,
  fromRoomId: string,
  exit: { doorId?: string; toRoomId?: string },
): string | undefined {
  if (exit.toRoomId) return exit.toRoomId;
  if (!exit.doorId) return undefined;

  const door = state.world.doors.find((candidate) => candidate.id === exit.doorId);
  if (!door) return undefined;

  if (door.connects.roomAId === fromRoomId) return door.connects.roomBId;
  if (door.connects.roomBId === fromRoomId) return door.connects.roomAId;

  return undefined;
}

export function buildShipMapEdges(
  state: GameState,
  nodes: readonly ShipMapNode[],
): ShipMapEdge[] {
  const levelIds = new Set(nodes.map((node) => node.levelId));
  const generatedEdges = CONNECTORS
    .filter((connector) => levelIds.has(connector.levelId))
    .map((connector) => ({
      fromNodeId: connector.fromNodeId,
      fromRoomId: connector.fromRoomId,
      id: connector.id,
      isDecorative: connector.isDecorative,
      isArrow: connector.isArrow,
      points: connector.points,
      strokeStyle: connector.strokeStyle,
      toNodeId: connector.toNodeId,
      toRoomId: connector.toRoomId,
    }));

  if (generatedEdges.length > 0) return generatedEdges;

  const nodesByRoomId = nodes.reduce<Map<string, ShipMapNode[]>>((acc, node) => {
    const current = acc.get(node.roomId) ?? [];
    current.push(node);
    acc.set(node.roomId, current);
    return acc;
  }, new Map());
  const edgeKeys = new Set<string>();
  const edges: ShipMapEdge[] = [];

  for (const room of state.world.rooms) {
    const fromNodes = nodesByRoomId.get(room.id);
    if (!fromNodes) continue;

    for (const exit of room.exits) {
      const toRoomId = resolveExitTargetRoomId(state, room.id, exit);
      if (!toRoomId) continue;

      const toNodes = nodesByRoomId.get(toRoomId);
      if (!toNodes) continue;

      for (const fromNode of fromNodes) {
        for (const toNode of toNodes) {
          const sortedNodeIds = [fromNode.nodeId, toNode.nodeId].sort();
          const key = `${sortedNodeIds[0]}|${sortedNodeIds[1]}`;
          if (edgeKeys.has(key)) continue;

          edgeKeys.add(key);
          edges.push({
            fromNodeId: fromNode.nodeId,
            fromRoomId: room.id,
            id: key,
            toNodeId: toNode.nodeId,
            toRoomId,
          });
        }
      }
    }
  }

  return edges;
}

export function getShipMapNodeCenter(node: ShipMapNode) {
  return {
    x: node.x + node.width / 2,
    y: node.y + node.height / 2,
  };
}
