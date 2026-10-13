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
  type ShipMapBounds,
  type ShipMapEdge,
  type ShipMapTeleportDiskMarker,
} from "../map/shipMapModel";
import type { ShipMapNode, ShipMapShape } from "../map/shipMapTypes";
import { getEdgeState, getShapeState, getShipMapLabelLines, getShipMapLabelAnchor, getMiniMapBounds, getViewBoxAroundPoint, scaleViewBox, MINI_MAP_DEFAULT_ZOOM_SCALE, MINI_MAP_MIN_ZOOM_SCALE, getTeleportDiskMarkerCenter } from "../map/shipMapPresentation";

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

const TELEPORT_DISK_MARKER_RADIUS = 12;

function toSvgViewBox(viewBox: ShipMapBounds): string {
  return `${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`;
}

function getShipMapOverlayHost(): HTMLElement {
  return document.querySelector<HTMLElement>(".game-root") ?? document.body;
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
          const labelLines = getShipMapLabelLines(state, node);
          const fontSize = Math.max(24, Math.min(node.fontSize, node.height / 2.5));
          const lineHeight = Math.max(22, Math.min(44, fontSize * 1.15));
          const { x: labelAnchorX, y: labelAnchorY } = getShipMapLabelAnchor(node, nodes, shapes);
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
      Math.min(1, Math.max(MINI_MAP_MIN_ZOOM_SCALE, current * (event.deltaY < 0 ? 0.82 : 1.18))),
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
