import type { GameState } from "../types/gameTypes";
import {
  getAuthoredShipMapEdges, getCurrentShipMapLevelId, getPrimaryShipMapNodeForRoom,
  getShipMapLevels, getShipMapLevelTitle, getShipMapNodesForLevel, getShipMapShapesForLevel,
  getShipMapNodeStatus, getShipMapTeleportDiskMarkers, getShipMapNodeCenter, type ShipMapBounds,
} from "./shipMapModel";
import {
  getEdgeState, getShapeState, getShipMapLabelLines, getShipMapLabelAnchor,
  getMiniMapBounds, getViewBoxAroundPoint, MINI_MAP_DEFAULT_ZOOM_SCALE,
  getTeleportDiskMarkerCenter,
} from "./shipMapPresentation";
import type { ShipMapLevelId } from "./shipMapTypes";

export type MapInformationOptions = Readonly<{ detail?: "overview" | "nearby" | "full"; level?: number }>;

const LEVEL_IDS: ShipMapLevelId[] = ["level-one", "level-two", "level-three", "level-four", "level-five", "level-six", "level-seven"];
export const MAP_USAGE = "Use :map [overview|nearby|full] [level 2-7]. Omit the level for your current level. These are views of the drawing, not travel commands.";

export function isMapInformationOptions(value: unknown): value is MapInformationOptions {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const data = value as Record<string, unknown>;
  return Object.keys(data).every(key => key === "detail" || key === "level") &&
    (data.detail === undefined || ["overview", "nearby", "full"].includes(data.detail as string)) &&
    (data.level === undefined || (Number.isSafeInteger(data.level) &&
      getShipMapLevels().some(level => level.id === LEVEL_IDS[Number(data.level) - 1])));
}

export function mapInformationLabel(options: unknown): string {
  if (options === undefined) return ":map";
  if (!isMapInformationOptions(options)) return ":map [invalid selection]";
  return `:map${options.detail === undefined ? "" : ` ${options.detail}`}${options.level === undefined ? "" : ` ${options.level}`}`;
}

type Point = { x: number; y: number };
type Rect = Point & { width: number; height: number };

function intersects(rect: Rect, view: ShipMapBounds): boolean {
  return rect.x <= view.maxX && rect.x + rect.width >= view.minX &&
    rect.y <= view.maxY && rect.y + rect.height >= view.minY;
}

function inside(point: Point, view: ShipMapBounds): boolean {
  return point.x >= view.minX && point.x <= view.maxX && point.y >= view.minY && point.y <= view.maxY;
}

/** Segment clipping: a stroke crossing the crop is visible even with both ends outside. */
function clipSegment(a: Point, b: Point, view: ShipMapBounds): [Point, Point] | undefined {
  const dx = b.x - a.x, dy = b.y - a.y;
  let start = 0, end = 1;
  for (const [p, q] of [[-dx, a.x - view.minX], [dx, view.maxX - a.x], [-dy, a.y - view.minY], [dy, view.maxY - a.y]]) {
    if (p === 0) { if (q < 0) return undefined; continue; }
    const ratio = q / p;
    if (p < 0) start = Math.max(start, ratio);
    else end = Math.min(end, ratio);
    if (start > end) return undefined;
  }
  return [{ x: a.x + start * dx, y: a.y + start * dy }, { x: a.x + end * dx, y: a.y + end * dy }];
}

/** Only rendered primitives and styles enter this text. Never read rooms, doors or exits. */
export function shipMapText(state: GameState, selection?: unknown): string {
  if (selection !== undefined && !isMapInformationOptions(selection)) return MAP_USAGE;
  const options = (selection ?? {}) as MapInformationOptions;
  const detail = options.detail ?? "overview";
  const currentLevel = getCurrentShipMapLevelId(state);
  const levelId = options.level === undefined ? currentLevel : LEVEL_IDS[options.level - 1];
  const nodes = levelId ? getShipMapNodesForLevel(levelId) : [];
  const shapes = levelId ? getShipMapShapesForLevel(levelId) : [];
  const base = getMiniMapBounds(levelId, nodes, shapes);
  if (!levelId || !base) return `Ship map\nNo map drawing for the current location.\n${MAP_USAGE}`;
  const currentNode = getPrimaryShipMapNodeForRoom(state.player.roomId, levelId);
  const focus = currentNode?.levelId === levelId ? getShipMapNodeCenter(currentNode) : undefined;
  const view = detail === "nearby" ? getViewBoxAroundPoint(base, focus, MINI_MAP_DEFAULT_ZOOM_SCALE) : base;
  const columns = detail === "overview" ? 16 : 24;
  const rows = detail === "overview" ? 12 : 24;
  const cell = (point: Point) => {
    const x = Math.max(0, Math.min(columns - 1, Math.floor((point.x - view.minX) / view.width * columns)));
    const y = Math.max(0, Math.min(rows - 1, Math.floor((point.y - view.minY) / view.height * rows)));
    return `${String.fromCharCode(65 + x)}${y + 1}`;
  };
  const span = (rect: Rect) => `${cell(rect)}-${cell({ x: rect.x + rect.width, y: rect.y + rect.height })}`;
  const clipped = (rect: Rect) => rect.x < view.minX || rect.y < view.minY || rect.x + rect.width > view.maxX || rect.y + rect.height > view.maxY;

  // An unknown label-only node has no visible box: don't invent anonymous room subdivisions.
  const visibleNodes = nodes.filter(node => intersects(node, view) &&
    (node.shape === "box" || (getShipMapLabelLines(state, node).length > 0 && inside(getShipMapLabelAnchor(node, nodes, shapes), view))))
    .sort((a, b) => a.y - b.y || a.x - b.x);
  const refs = new Map(visibleNodes.map((node, index) => [node.nodeId, `P${index + 1}`]));
  const markers = getShipMapTeleportDiskMarkers(state, nodes);
  const spaces = visibleNodes.map(node => {
    const status = getShipMapNodeStatus(state, node);
    const anchor = getShipMapLabelAnchor(node, nodes, shapes);
    const label = inside(anchor, view) ? getShipMapLabelLines(state, node).join(" ") : "";
    const tag = status === "current" ? "[YOU]" : status === "visited" ? "[visited]" : "[unvisited]";
    const disks = markers.filter(marker => marker.nodeId === node.nodeId && inside(getTeleportDiskMarkerCenter(node, marker), view))
      .map(marker => `${marker.colorName} disk (${marker.isActive ? "glowing" : "dim"})`);
    return `${refs.get(node.nodeId)} ${tag}${label ? ` ${label}` : status === "unknown" ? "" : " (label outside crop)"}: ${node.shape === "box" ? `rectangle ${span(node)}` : `label at ${cell(anchor)}`}${clipped(node) ? " (cropped)" : ""}${disks.length ? `; ${disks.join(", ")}` : ""}`;
  });
  const outlines = shapes.filter(shape => intersects(shape, view)).map((shape, index) => {
    const status = getShapeState(state, shape, nodes);
    const color = status === "current" ? "green" : status === "visited" && shape.type === "ellipse" ? "pale" : "gray";
    const contour = detail === "full" && shape.type === "path" ? `; contour ${shape.points.map(cell).filter((point, index, all) => index === 0 || point !== all[index - 1]).join(" / ")}${shape.closed ? " / closed" : ""}` : "";
    return `O${index + 1} ${shape.type === "ellipse" ? "oval" : "outline"} ${span(shape)} (${color})${clipped(shape) ? " (cropped)" : ""}${contour}`;
  });
  const strokes = getAuthoredShipMapEdges(nodes).flatMap(edge => {
    const parts = (edge.points ?? []).slice(1).flatMap((point, index) => {
      const clipped = clipSegment(edge.points![index], point, view);
      return clipped ? [clipped] : [];
    });
    if (!parts.length) return [];
    const from = edge.fromNodeId && refs.get(edge.fromNodeId);
    const to = edge.toNodeId && refs.get(edge.toNodeId);
    const arrowVisible = edge.isArrow && inside(edge.points!.at(-1)!, view);
    // Decorative subdivisions carry no room-to-room meaning even when generator bindings exist.
    const ends = !edge.isDecorative && from && to && from !== to ? `${from} ${arrowVisible ? "->" : "--"} ${to}` : "drawing stroke";
    const stateOfEdge = getEdgeState(state, edge, nodes, shapes);
    const intensity = stateOfEdge === "known" ? "bright" : stateOfEdge === "frontier" ? "medium" : stateOfEdge === "unknown" ? "faint" : "gray";
    const positions = detail === "full" ? parts.map(part => part.map(cell).join("-")).join(" / ") : `${cell(parts[0][0])}-${cell(parts.at(-1)![1])}`;
    const continuation = edge.points!.some(point => !inside(point, view)) ? " (continues outside view)" : "";
    return [`${ends}: ${edge.strokeStyle ?? "solid"}${arrowVisible ? " arrow" : ""}, ${intensity}, ${positions}${continuation}`];
  });
  const here = spaces.find(line => line.includes("[YOU]"));
  const position = here ? `Current position: ${here.split(": rectangle")[0].split(": label")[0]}` :
    currentLevel && currentLevel !== levelId ? `[YOU] is on ${getShipMapLevelTitle(currentLevel)}, outside this view.` : "Current position has no visible footprint in this crop.";
  return [
    `Ship map - ${getShipMapLevelTitle(levelId)} (${detail})`, position,
    `Spatial grid: columns A-${String.fromCharCode(64 + columns)} left to right; rows 1-${rows} top to bottom. Cell spans approximate the drawing, not compass directions.`,
    "Legend: [YOU] green; [visited] pale and labeled; [unvisited] gray and unnamed. P references mark rectangles or visible labels; O references mark outlines. Lines are drawn strokes, not confirmed passages; adjacency and arrows do not guarantee access.",
    "Mapped spaces:\n" + (spaces.join("\n") || "No visible room footprints in this crop."),
    ...(outlines.length ? ["Drawn outlines:\n" + outlines.join("\n")] : []),
    "Drawn lines (no travel guarantee):\n" + (strokes.join("\n") || "No visible strokes in this crop."),
    ...(detail === "nearby" ? ["This is a crop. Use :map full for the complete level drawing."] : []),
    MAP_USAGE,
  ].join("\n\n");
}
