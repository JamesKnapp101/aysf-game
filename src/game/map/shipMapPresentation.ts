import type { GameState } from "../types/gameTypes";
import type { ShipMapLevelId, ShipMapNode, ShipMapShape } from "./shipMapTypes";
import { getShipMapBounds, getShipMapNodeCenter, getShipMapNodeStatus, shouldRevealShipMapNodeLabel, type ShipMapBounds, type ShipMapEdge, type ShipMapNodeStatus, type ShipMapTeleportDiskMarker } from "./shipMapModel";

export const MINI_MAP_DEFAULT_ZOOM_SCALE = 0.4;
export const MINI_MAP_MIN_ZOOM_SCALE = 0.16;
export const MINI_MAP_MIN_VIEWBOX_HEIGHT = 420;
export const MINI_MAP_MIN_VIEWBOX_WIDTH = 680;
export const MINI_MAP_BOUNDS_PADDING = 140;
export const MINI_MAP_TOP_HEADROOM_BY_LEVEL: Partial<Record<ShipMapLevelId, number>> = {
  "level-six": 520,
  "level-seven": 520,
};
const TELEPORT_DISK_MARKER_PADDING = 17;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function wrapMapLabelSegment(label: string, maxLineLength: number): string[] {
  const words = label.split(/\s+/).filter(Boolean);
  const lines: string[] = [];

  for (const word of words) {
    const current = lines[lines.length - 1];
    if (!current || `${current} ${word}`.length > maxLineLength) {
      lines.push(word);
      continue;
    }

    lines[lines.length - 1] = `${current} ${word}`;
  }

  return lines;
}

export function splitMapLabel(label: string, width: number): string[] {
  const maxLineLength = Math.max(8, Math.min(24, Math.floor(width / 11)));
  const lines = label
    .split(/\r?\n/)
    .flatMap((segment) => wrapMapLabelSegment(segment, maxLineLength));

  return lines.slice(0, 3);
}

export function scaleViewBox(
  viewBox: ShipMapBounds,
  scale: number,
  limits: {
    maxHeight?: number;
    maxWidth?: number;
    minHeight?: number;
    minWidth?: number;
  } = {},
): ShipMapBounds {
  const centerX = viewBox.minX + viewBox.width / 2;
  const centerY = viewBox.minY + viewBox.height / 2;
  const minWidth = limits.minWidth ?? 280;
  const minHeight = limits.minHeight ?? 180;
  const maxWidth = limits.maxWidth ?? Number.POSITIVE_INFINITY;
  const maxHeight = limits.maxHeight ?? Number.POSITIVE_INFINITY;
  const width = Math.min(maxWidth, Math.max(minWidth, viewBox.width * scale));
  const height = Math.min(maxHeight, Math.max(minHeight, viewBox.height * scale));

  return {
    height,
    maxX: centerX + width / 2,
    maxY: centerY + height / 2,
    minX: centerX - width / 2,
    minY: centerY - height / 2,
    width,
  };
}

export function getMiniMapBounds(
  levelId: ShipMapLevelId | undefined,
  nodes: readonly ShipMapNode[],
  shapes: readonly ShipMapShape[],
): ShipMapBounds | undefined {
  const bounds = getShipMapBounds(nodes, MINI_MAP_BOUNDS_PADDING, shapes);
  const topHeadroom = levelId
    ? MINI_MAP_TOP_HEADROOM_BY_LEVEL[levelId]
    : undefined;
  const extraTop = Math.max(0, (topHeadroom ?? 0) - MINI_MAP_BOUNDS_PADDING);

  if (!bounds || extraTop === 0) return bounds;

  return {
    ...bounds,
    height: bounds.height + extraTop,
    minY: bounds.minY - extraTop,
  };
}

export function getViewBoxAroundPoint(
  baseViewBox: ShipMapBounds,
  center: { x: number; y: number } | undefined,
  zoomScale: number,
): ShipMapBounds {
  const width = Math.min(
    baseViewBox.width,
    Math.max(MINI_MAP_MIN_VIEWBOX_WIDTH, baseViewBox.width * zoomScale),
  );
  const height = Math.min(
    baseViewBox.height,
    Math.max(MINI_MAP_MIN_VIEWBOX_HEIGHT, baseViewBox.height * zoomScale),
  );

  if (width >= baseViewBox.width && height >= baseViewBox.height) {
    return baseViewBox;
  }

  const focus = center ?? {
    x: baseViewBox.minX + baseViewBox.width / 2,
    y: baseViewBox.minY + baseViewBox.height / 2,
  };
  const minX =
    width >= baseViewBox.width
      ? baseViewBox.minX
      : clamp(
          focus.x - width / 2,
          baseViewBox.minX,
          baseViewBox.maxX - width,
        );
  const minY =
    height >= baseViewBox.height
      ? baseViewBox.minY
      : clamp(
          focus.y - height / 2,
          baseViewBox.minY,
          baseViewBox.maxY - height,
        );

  return {
    height,
    maxX: minX + width,
    maxY: minY + height,
    minX,
    minY,
    width,
  };
}

function isPointInsideShape(
  point: { x: number; y: number },
  shape: ShipMapShape,
  tolerance = 0,
): boolean {
  if (shape.type !== "ellipse") return false;

  const radiusX = shape.width / 2 + tolerance;
  const radiusY = shape.height / 2 + tolerance;
  if (radiusX <= 0 || radiusY <= 0) return false;

  const centerX = shape.x + shape.width / 2;
  const centerY = shape.y + shape.height / 2;
  const normalizedX = (point.x - centerX) / radiusX;
  const normalizedY = (point.y - centerY) / radiusY;

  return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
}

export function getShapeState(
  state: GameState,
  shape: ShipMapShape,
  nodes: readonly ShipMapNode[],
): ShipMapNodeStatus {
  if (shape.roomIds?.length) {
    if (shape.roomIds.includes(state.player.roomId)) return "current";
    if (shape.roomIds.some((roomId) => state.worldState.visitedRooms[roomId])) {
      return "visited";
    }

    return "unknown";
  }

  const shapeNodes = nodes.filter((node) =>
    isPointInsideShape(getShipMapNodeCenter(node), shape, 1),
  );

  if (shapeNodes.some((node) => getShipMapNodeStatus(state, node) === "current")) {
    return "current";
  }
  if (shapeNodes.some((node) => getShipMapNodeStatus(state, node) === "visited")) {
    return "visited";
  }

  return "unknown";
}

export function getSingleLabelEllipseForNode(
  node: ShipMapNode,
  nodes: readonly ShipMapNode[],
  shapes: readonly ShipMapShape[],
): ShipMapShape | undefined {
  if (node.shape !== "label") return undefined;

  const nodeCenter = getShipMapNodeCenter(node);

  return shapes.find((shape) => {
    if (shape.levelId !== node.levelId || shape.type !== "ellipse") {
      return false;
    }

    if (!isPointInsideShape(nodeCenter, shape, 1)) return false;

    const labelNodesInShape = nodes.filter(
      (candidate) =>
        candidate.levelId === node.levelId &&
        candidate.shape === "label" &&
        isPointInsideShape(getShipMapNodeCenter(candidate), shape, 1),
    );

    return labelNodesInShape.length === 1;
  });
}

function getEdgeShapeState(
  state: GameState,
  edge: ShipMapEdge,
  nodes: readonly ShipMapNode[],
  shapes: readonly ShipMapShape[],
): ShipMapNodeStatus | undefined {
  if (!edge.points?.length) return undefined;

  const containingShape = shapes.find((shape) =>
    edge.points?.every((point) => isPointInsideShape(point, shape, 10)),
  );

  return containingShape ? getShapeState(state, containingShape, nodes) : undefined;
}

export function getEdgeState(
  state: GameState,
  edge: ShipMapEdge,
  nodes: readonly ShipMapNode[],
  shapes: readonly ShipMapShape[],
) {
  const edgeShapeState = getEdgeShapeState(state, edge, nodes, shapes);
  if (edge.isDecorative || edgeShapeState) return edgeShapeState ?? "unknown";

  const roomIds = [edge.fromRoomId, edge.toRoomId].filter(
    (roomId): roomId is string => Boolean(roomId),
  );
  const knownEndpointCount = roomIds.filter(
    (roomId) =>
      state.player.roomId === roomId || state.worldState.visitedRooms[roomId],
  ).length;

  if (roomIds.length > 1 && knownEndpointCount === roomIds.length) return "known";
  if (knownEndpointCount > 0) return "frontier";
  return "unknown";
}

export function getShipMapLabelLines(state: GameState, node: ShipMapNode): string[] {
  return shouldRevealShipMapNodeLabel(state, node) ? splitMapLabel(node.label, node.width) : [];
}

export function getShipMapLabelAnchor(node: ShipMapNode, nodes: readonly ShipMapNode[], shapes: readonly ShipMapShape[]) {
  const ellipse = getSingleLabelEllipseForNode(node, nodes, shapes);
  return ellipse ? { x: ellipse.x + ellipse.width / 2, y: ellipse.y + ellipse.height / 2 } : getShipMapNodeCenter(node);
}

export function getTeleportDiskMarkerCenter(
  node: ShipMapNode,
  marker: ShipMapTeleportDiskMarker,
): { x: number; y: number } {
  if (marker.placement === "terminal-row") {
    const total = marker.terminalTotal ?? 1;
    const index = marker.terminalIndex ?? 0;
    return {
      x: node.x + (node.width * (index + 1)) / (total + 1),
      y: node.y + TELEPORT_DISK_MARKER_PADDING,
    };
  }

  return {
    x: node.x + TELEPORT_DISK_MARKER_PADDING,
    y: node.y + TELEPORT_DISK_MARKER_PADDING,
  };
}

