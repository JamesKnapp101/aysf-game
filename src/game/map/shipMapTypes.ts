export type ShipMapLevelId =
  | "level-one"
  | "level-two"
  | "level-three"
  | "level-four"
  | "level-five"
  | "level-six"
  | "level-seven";

export type ShipMapLevel = {
  id: ShipMapLevelId;
  title: string;
};

export type ShipMapNode = {
  fontSize: number;
  height: number;
  label: string;
  levelId: ShipMapLevelId;
  nodeId: string;
  roomId: string;
  roomIds?: readonly string[];
  shape: "box" | "label";
  sourceLabel: string;
  width: number;
  x: number;
  y: number;
};

export type ShipMapConnector = {
  fromNodeId?: string;
  fromRoomId?: string;
  id: string;
  isDecorative?: boolean;
  isArrow: boolean;
  levelId: ShipMapLevelId;
  points: readonly { x: number; y: number }[];
  strokeStyle: "dashed" | "solid";
  toNodeId?: string;
  toRoomId?: string;
};

export type ShipMapEllipseShape = {
  height: number;
  id: string;
  levelId: ShipMapLevelId;
  type: "ellipse";
  roomIds?: readonly string[];
  width: number;
  x: number;
  y: number;
};

export type ShipMapPathShape = {
  closed?: boolean;
  height: number;
  id: string;
  levelId: ShipMapLevelId;
  points: readonly { x: number; y: number }[];
  roomIds?: readonly string[];
  type: "path";
  width: number;
  x: number;
  y: number;
};

export type ShipMapShape = ShipMapEllipseShape | ShipMapPathShape;

export type ShipMapUnmatchedLabel = {
  label: string;
  levelId: ShipMapLevelId;
};

export type ShipMapLayout = {
  connectors: readonly ShipMapConnector[];
  levels: readonly ShipMapLevel[];
  nodes: readonly ShipMapNode[];
  shapes: readonly ShipMapShape[];
  unmatchedLabels: readonly ShipMapUnmatchedLabel[];
};
