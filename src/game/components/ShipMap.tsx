import type { GameState } from "@game/types/gameTypes";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SHIP_MAP_LAYOUT } from "../map/generatedShipMapLayout";
import {
  buildShipMapEdges,
  getCurrentShipMapLevelId,
  getPrimaryShipMapNodeForRoom,
  getShipMapBounds,
  getShipMapLevelTitle,
  getShipMapNodeCenter,
  getShipMapNodeStatus,
  getShipMapNodesForLevel,
  getShipMapShapesForLevel,
  getShipMapTeleportDiskMarkers,
  shouldRevealShipMapNodeLabel,
  type ShipMapBounds,
  type ShipMapEdge,
  type ShipMapNodeStatus,
  type ShipMapTeleportDiskMarker,
} from "../map/shipMapModel";
import type {
  ShipMapLevelId,
  ShipMapNode,
  ShipMapShape,
} from "../map/shipMapTypes";

type ShipMapPanelProps = {
  state: GameState;
};

type ShipMapSvgProps = {
  edges: readonly ShipMapEdge[];
  nodes: readonly ShipMapNode[];
  shapes: readonly ShipMapShape[];
  state: GameState;
  title: string;
  viewBox: ShipMapBounds;
};

type FullShipMapOverlayProps = {
  onClose: () => void;
  state: GameState;
};

type DragState = {
  startClientX: number;
  startClientY: number;
  startViewBox: ShipMapBounds;
};

const MINI_MAP_DEFAULT_ZOOM_SCALE = 0.4;
const MINI_MAP_MIN_ZOOM_SCALE = 0.16;
const MINI_MAP_MIN_VIEWBOX_HEIGHT = 420;
const MINI_MAP_MIN_VIEWBOX_WIDTH = 680;
const MINI_MAP_BOUNDS_PADDING = 140;
const MINI_MAP_TOP_HEADROOM_BY_LEVEL: Partial<Record<ShipMapLevelId, number>> = {
  "level-six": 520,
  "level-seven": 520,
};
const TELEPORT_DISK_MARKER_PADDING = 17;
const TELEPORT_DISK_MARKER_RADIUS = 12;

function toSvgViewBox(viewBox: ShipMapBounds): string {
  return `${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`;
}

function getShipMapOverlayHost(): HTMLElement {
  return document.querySelector<HTMLElement>(".game-root") ?? document.body;
}

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

function splitMapLabel(label: string, width: number): string[] {
  const maxLineLength = Math.max(8, Math.min(24, Math.floor(width / 11)));
  const lines = label
    .split(/\r?\n/)
    .flatMap((segment) => wrapMapLabelSegment(segment, maxLineLength));

  return lines.slice(0, 3);
}

function scaleViewBox(
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

function getMiniMapBounds(
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

function getViewBoxAroundPoint(
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

function getShapeState(
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

function getSingleLabelEllipseForNode(
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

function getEdgeState(
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

function pointsToPath(points: readonly { x: number; y: number }[] | undefined): string {
  if (!points?.length) return "";

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function pointsToShapePath(shape: ShipMapShape): string {
  if (shape.type !== "path") return "";

  const path = pointsToPath(shape.points);
  return shape.closed ? `${path} Z` : path;
}

function getArrowHeadPath(points: ShipMapEdge["points"]): string | undefined {
  if (!points || points.length < 2) return undefined;

  const end = points[points.length - 1];
  const previous = [...points]
    .reverse()
    .slice(1)
    .find((point) => point.x !== end.x || point.y !== end.y);
  if (!previous) return undefined;

  const angle = Math.atan2(end.y - previous.y, end.x - previous.x);
  const size = 32;
  const spread = Math.PI / 6;
  const left = {
    x: end.x - Math.cos(angle - spread) * size,
    y: end.y - Math.sin(angle - spread) * size,
  };
  const right = {
    x: end.x - Math.cos(angle + spread) * size,
    y: end.y - Math.sin(angle + spread) * size,
  };

  return `M ${left.x} ${left.y} L ${end.x} ${end.y} L ${right.x} ${right.y}`;
}

function groupTeleportDiskMarkersByNodeId(
  markers: readonly ShipMapTeleportDiskMarker[],
): Map<string, readonly ShipMapTeleportDiskMarker[]> {
  return markers.reduce<Map<string, ShipMapTeleportDiskMarker[]>>(
    (acc, marker) => {
      const current = acc.get(marker.nodeId) ?? [];
      current.push(marker);
      acc.set(marker.nodeId, current);
      return acc;
    },
    new Map(),
  );
}

function getTeleportDiskMarkerCenter(
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

const ShipMapSvg: React.FC<ShipMapSvgProps> = ({
  edges,
  nodes,
  shapes,
  state,
  title,
  viewBox,
}) => {
  const nodesById = useMemo(
    () => new Map(nodes.map((node) => [node.nodeId, node])),
    [nodes],
  );
  const teleportDiskMarkersByNodeId = useMemo(
    () =>
      groupTeleportDiskMarkersByNodeId(
        getShipMapTeleportDiskMarkers(state, nodes),
      ),
    [nodes, state],
  );

  return (
    <svg
      className="ship-map-svg"
      viewBox={toSvgViewBox(viewBox)}
      role="img"
      aria-label={title}
    >
      <g className="ship-map-grid" aria-hidden="true">
        <defs>
          <pattern
            id="ship-map-grid-major"
            width="260"
            height="260"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 260 0 L 0 0 0 260" />
          </pattern>
        </defs>
        <rect
          x={viewBox.minX}
          y={viewBox.minY}
          width={viewBox.width}
          height={viewBox.height}
          fill="url(#ship-map-grid-major)"
        />
      </g>

      <g className="ship-map-shapes" aria-hidden="true">
        {shapes.map((shape) => {
          const shapeState = getShapeState(state, shape, nodes);

          if (shape.type === "path") {
            return (
              <path
                key={shape.id}
                className="ship-map-shape"
                data-shape-type="path"
                data-state={shapeState}
                d={pointsToShapePath(shape)}
              />
            );
          }

          if (shape.type !== "ellipse") return null;

          return (
            <ellipse
              key={shape.id}
              className="ship-map-shape"
              data-shape-type="ellipse"
              data-state={shapeState}
              cx={shape.x + shape.width / 2}
              cy={shape.y + shape.height / 2}
              rx={shape.width / 2}
              ry={shape.height / 2}
            />
          );
        })}
      </g>

      <g className="ship-map-edges">
        {edges.map((edge) => {
          const edgeState = getEdgeState(state, edge, nodes, shapes);

          if (edge.points?.length) {
            const arrowHeadPath = edge.isArrow
              ? getArrowHeadPath(edge.points)
              : undefined;

            return (
              <React.Fragment key={edge.id}>
                <path
                  className="ship-map-edge"
                  data-state={edgeState}
                  data-stroke-style={edge.strokeStyle ?? "solid"}
                  d={pointsToPath(edge.points)}
                />
                {arrowHeadPath && (
                  <path
                    className="ship-map-edge-arrowhead"
                    data-state={edgeState}
                    d={arrowHeadPath}
                  />
                )}
              </React.Fragment>
            );
          }

          if (!edge.fromNodeId || !edge.toNodeId) return null;

          const fromNode = nodesById.get(edge.fromNodeId);
          const toNode = nodesById.get(edge.toNodeId);
          if (!fromNode || !toNode) return null;

          const from = getShipMapNodeCenter(fromNode);
          const to = getShipMapNodeCenter(toNode);

          return (
            <line
              key={edge.id}
              className="ship-map-edge"
              data-state={edgeState}
              data-stroke-style={edge.strokeStyle ?? "solid"}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
            />
          );
        })}
      </g>

      <g className="ship-map-nodes">
        {nodes.map((node) => {
          const status = getShipMapNodeStatus(state, node);
          const revealLabel = shouldRevealShipMapNodeLabel(state, node);
          const labelLines = revealLabel
            ? splitMapLabel(node.label, node.width)
            : [];
          const fontSize = Math.max(24, Math.min(node.fontSize, node.height / 2.5));
          const lineHeight = Math.max(22, Math.min(44, fontSize * 1.15));
          const labelEllipse = getSingleLabelEllipseForNode(
            node,
            nodes,
            shapes,
          );
          const labelAnchorX = labelEllipse
            ? labelEllipse.x + labelEllipse.width / 2
            : node.x + node.width / 2;
          const labelAnchorY = labelEllipse
            ? labelEllipse.y + labelEllipse.height / 2
            : node.y + node.height / 2;
          const labelStartY =
            labelAnchorY - ((labelLines.length - 1) * lineHeight) / 2;
          const teleportDiskMarkers =
            teleportDiskMarkersByNodeId.get(node.nodeId) ?? [];

          return (
            <g
              key={node.nodeId}
              className="ship-map-node"
              data-status={status}
            >
              {node.shape !== "label" && (
                <rect
                  className="ship-map-node-box"
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  rx="6"
                  ry="6"
                />
              )}
              {teleportDiskMarkers.map((marker) => {
                const markerCenter = getTeleportDiskMarkerCenter(node, marker);

                return (
                  <circle
                    key={marker.id}
                    className="ship-map-teleport-disk"
                    data-color={marker.colorName}
                    data-powered={marker.isActive ? "active" : "inactive"}
                    cx={markerCenter.x}
                    cy={markerCenter.y}
                    r={TELEPORT_DISK_MARKER_RADIUS}
                    style={
                      {
                        "--ship-map-teleport-disk-color": marker.color,
                      } as React.CSSProperties
                    }
                  />
                );
              })}
              {labelLines.length > 0 && (
                <text
                  className="ship-map-node-label"
                  x={labelAnchorX}
                  y={labelStartY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontSize }}
                >
                  {labelLines.map((line, index) => (
                    <tspan
                      key={`${node.nodeId}-${index}`}
                      x={labelAnchorX}
                      dy={index === 0 ? 0 : lineHeight}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

const FullShipMapOverlay: React.FC<FullShipMapOverlayProps> = ({
  onClose,
  state,
}) => {
  const nodes = SHIP_MAP_LAYOUT.nodes;
  const shapes = SHIP_MAP_LAYOUT.shapes;
  const edges = useMemo(() => buildShipMapEdges(state, nodes), [nodes, state]);
  const baseViewBox = useMemo(
    () => getShipMapBounds(nodes, 320, shapes),
    [nodes, shapes],
  );
  const [viewBox, setViewBox] = useState(baseViewBox);
  const svgWrapRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);

  useEffect(() => {
    setViewBox(baseViewBox);
  }, [baseViewBox]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!viewBox || !baseViewBox) return null;

  const zoom = (scale: number) => {
    setViewBox((current) => (current ? scaleViewBox(current, scale) : current));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    dragRef.current = {
      startClientX: event.clientX,
      startClientY: event.clientY,
      startViewBox: viewBox,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const rect = svgWrapRef.current?.getBoundingClientRect();
    if (!drag || !rect) return;

    const dx =
      ((event.clientX - drag.startClientX) / Math.max(1, rect.width)) *
      drag.startViewBox.width;
    const dy =
      ((event.clientY - drag.startClientY) / Math.max(1, rect.height)) *
      drag.startViewBox.height;

    setViewBox({
      ...drag.startViewBox,
      maxX: drag.startViewBox.maxX - dx,
      maxY: drag.startViewBox.maxY - dy,
      minX: drag.startViewBox.minX - dx,
      minY: drag.startViewBox.minY - dy,
    });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    zoom(event.deltaY < 0 ? 0.86 : 1.16);
  };

  return (
    <div
      className="ship-map-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Ship map"
      onClick={onClose}
    >
      <div
        className="ship-map-overlay-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ship-map-overlay-header">
          <div className="ship-map-overlay-title">SHIP MAP</div>
          <div className="ship-map-overlay-controls">
            <button type="button" onClick={() => zoom(0.78)} aria-label="Zoom in">
              +
            </button>
            <button type="button" onClick={() => zoom(1.28)} aria-label="Zoom out">
              -
            </button>
            <button
              type="button"
              onClick={() => setViewBox(baseViewBox)}
              aria-label="Fit map"
            >
              FIT
            </button>
            <button type="button" onClick={onClose} aria-label="Close map">
              X
            </button>
          </div>
        </div>

        <div
          ref={svgWrapRef}
          className="ship-map-overlay-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
        >
          <ShipMapSvg
            edges={edges}
            nodes={nodes}
            shapes={shapes}
            state={state}
            title="Full ship map"
            viewBox={viewBox}
          />
        </div>
      </div>
    </div>
  );
};

export const ShipMapPanel: React.FC<ShipMapPanelProps> = ({ state }) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [miniZoomScale, setMiniZoomScale] = useState(
    MINI_MAP_DEFAULT_ZOOM_SCALE,
  );
  const currentLevelId = getCurrentShipMapLevelId(state);
  const nodes = useMemo(
    () => (currentLevelId ? getShipMapNodesForLevel(currentLevelId) : []),
    [currentLevelId],
  );
  const shapes = useMemo(
    () => (currentLevelId ? getShipMapShapesForLevel(currentLevelId) : []),
    [currentLevelId],
  );
  const edges = useMemo(() => buildShipMapEdges(state, nodes), [nodes, state]);
  const baseMiniViewBox = useMemo(
    () => getMiniMapBounds(currentLevelId, nodes, shapes),
    [currentLevelId, nodes, shapes],
  );
  const currentMiniNode = currentLevelId
    ? getPrimaryShipMapNodeForRoom(state.player.roomId, currentLevelId)
    : undefined;
  const currentMiniCenter = currentMiniNode
    ? getShipMapNodeCenter(currentMiniNode)
    : undefined;
  const miniViewBox = useMemo(
    () =>
      baseMiniViewBox
        ? getViewBoxAroundPoint(
            baseMiniViewBox,
            currentMiniCenter,
            miniZoomScale,
          )
        : undefined,
    [baseMiniViewBox, currentMiniCenter, miniZoomScale],
  );
  const title = currentLevelId
    ? getShipMapLevelTitle(currentLevelId).toUpperCase()
    : "MAP";

  useEffect(() => {
    setMiniZoomScale(MINI_MAP_DEFAULT_ZOOM_SCALE);
  }, [currentLevelId]);

  const handleMiniWheel = (event: React.WheelEvent<HTMLButtonElement>) => {
    if (!baseMiniViewBox) return;

    event.preventDefault();
    event.stopPropagation();
    setMiniZoomScale((current) =>
      clamp(
        current * (event.deltaY < 0 ? 0.82 : 1.18),
        MINI_MAP_MIN_ZOOM_SCALE,
        1,
      ),
    );
  };

  return (
    <div className="ship-map-panel" onClick={(event) => event.stopPropagation()}>
      <button
        className="ship-map-mini"
        type="button"
        onClick={() => setIsOverlayOpen(true)}
        onWheel={handleMiniWheel}
        aria-label="Open ship map"
      >
        <div className="ship-map-mini-header">
          <span>{title}</span>
          <span aria-hidden="true">[]</span>
        </div>
        {miniViewBox && nodes.length > 0 ? (
          <ShipMapSvg
            edges={edges}
            nodes={nodes}
            shapes={shapes}
            state={state}
            title={`${title} map`}
            viewBox={miniViewBox}
          />
        ) : (
          <div className="ship-map-empty">NO MAP DATA</div>
        )}
      </button>

      {isOverlayOpen &&
        createPortal(
          <FullShipMapOverlay
            state={state}
            onClose={() => setIsOverlayOpen(false)}
          />,
          getShipMapOverlayHost(),
        )}
    </div>
  );
};
