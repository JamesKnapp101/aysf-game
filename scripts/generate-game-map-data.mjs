import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const EXCALIDRAW_FILE = path.join(ROOT, "AYSF-In-Game-Map.excalidraw");
const WORLD_MAPS_DIR = path.join(ROOT, "src", "world", "maps");
const OUTPUT_FILE = path.join(
  ROOT,
  "src",
  "game",
  "map",
  "generatedShipMapLayout.ts",
);

const LEVEL_HEADINGS = [
  { id: "level-two", title: "Level Two", heading: "LEVEL TWO" },
  { id: "level-three", title: "Level Three", heading: "LEVEL THREE" },
  { id: "level-four", title: "Level Four", heading: "LEVEL FOUR" },
  { id: "level-five", title: "Level Five", heading: "LEVEL FIVE" },
  { id: "level-six", title: "Level Six", heading: "LEVEL SIX" },
  { id: "level-seven", title: "Level Seven", heading: "LEVEL SEVEN", maxYOffset: 3050 },
];

const IGNORED_LABELS = new Set([
  "The Siege of New WalMart",
  "The Ball and Heel Rebellion",
  "The Discovery of Dimension Z",
  "X",
  "up/down",
  "in/out",
  "30 X 30",
  "Virtual Employee Office",
  "Virtual Manager Office",
]);

const IGNORED_LABEL_PATTERNS = [/^[A-J][1-5]$/];

const IGNORED_CONNECTOR_IDS = new Set([
  "D2WVK5fCBZeT_35BAU7z-",
]);

const CUSTOM_SHAPES = [
  {
    closed: true,
    id: "level-five-shuttle-outline",
    levelId: "level-five",
    points: [
      { x: 1708, y: 8518 },
      { x: 1782, y: 8504 },
      { x: 1782, y: 8488 },
      { x: 1848, y: 8472 },
      { x: 1960, y: 8335 },
      { x: 2096, y: 8342 },
      { x: 2464, y: 8480 },
      { x: 2920, y: 8510 },
      { x: 3388, y: 8588 },
      { x: 3556, y: 8655 },
      { x: 3625, y: 8700 },
      { x: 3625, y: 8730 },
      { x: 3556, y: 8782 },
      { x: 3388, y: 8825 },
      { x: 2920, y: 8735 },
      { x: 2464, y: 8800 },
      { x: 2096, y: 8735 },
      { x: 1960, y: 8748 },
      { x: 1848, y: 8593 },
      { x: 1782, y: 8580 },
      { x: 1782, y: 8558 },
      { x: 1708, y: 8550 },
    ],
    roomIds: ["InsideShuttle", "ShuttleCockpit"],
  },
];

const CUSTOM_NODES = [];

const CUSTOM_CONNECTORS = [
  {
    fromNodeId: "level-seven:StairSeven",
    fromRoomId: "StairSeven",
    id: "level-seven-stairwell-bottom-connector",
    isArrow: false,
    isDecorative: false,
    levelId: "level-seven",
    strokeStyle: "dashed",
    toNodeId: "level-seven:StairWellSeven",
    toRoomId: "StairWellSeven",
  },
];

const GLOBAL_ALIASES = {
  Learnatorium: "TheLearnatorium",
  MensShowers: "MensShower",
  "Women'sShowers": "WomensShower",
  WomensShowers: "WomensShower",
  ProjectorRoom: "Projection",
  "MovieTheatre Lobby": "MovieTheaterLobby",
  MovieTheatreLobby: "MovieTheaterLobby",
  "Restauraunt Entrance": "RestaurantEntrance",
  TowerTop: "ObservationTowerTop",
  OakPerch: "DeadOakPerch",
  "Stairwell Bottom": "StairWellSeven",
};

const LEVEL_ALIASES = {
  "level-two": {
    "Storage L2": "Storage",
  },
  "level-three": {
    Storage: "L3Warehouse",
    "Storage L3": "L3Warehouse",
  },
  "level-four": {
    Apiary: "Apiary",
    BotanicalOne: "BotanicalOne",
    GreenHouse: "Greenhouse",
    Maintenance: "AviaryMaintenance",
    Shack: "InsideTheShack",
    Shed: "InsideTheShed",
  },
  "level-five": {
    "Tilting Platform": "TiltedPlatformPerch",
  },
  "level-six": {
    Corridor: "LevelSixCorridor",
    CorridorBend: "LevelSixCorridorBend",
    CorridorEnd: "LevelSixCorridorEnd",
    HydroponicsOne: "UnderWebOne",
    HydroponicsTwo: "UnderWebTwo",
    HydroponicsThree: "UnderWebThree",
    HydroponicsFour: "UnderWebFour",
    "Hydroponics Admin": "HydroponicsPlatformAdmin",
  },
  "level-seven": {
    CorridorBend: "LevelSevenCorridorBend",
    "DEEP STORAGE": "DeepStorageGrid",
    StasisDock: "Stasis",
  },
};

const ROOM_GROUP_ALIASES = {
  "level-four": {
    Aquarium: [
      "AqStart",
      "AqOpen1",
      "AqOpen2",
      "AqOpen3",
      "AqOpen4",
      "AqRock1",
      "AqRock2",
      "AqRock3",
      "AqRock4",
      "AqRock5",
      "AqRock6",
      "AqRock7",
      "AqCross",
      "AqChannel1",
      "AqChannel2",
      "AqChannel3",
      "AqChannel4",
      "AqChannel4b",
      "AqChannel5",
      "AqGoal",
    ],
  },
};

// Map-friendly room labels captured from generated layout edits. These are
// keyed by resolved room id so Excalidraw text wrapping changes do not drop
// the authored display names on the next rebuild.
const DISPLAY_LABELS = {
  "CornerOfBurnedArea": "Burned Corner",
  "LevelTwoBurnedArea": "L2 Burned Area",
  "EdgeOfBurnedArea": "Burned Edge",
  "LevelTwoStairAccess": "L2 Stair Access",
  "StairTwo": "L2 Stairwell",
  "LevelTwoCorridorFive": "L2 C5",
  "LevelTwoSecondaryCorridorTwo": "L2 Secondary C2",
  "LevelTwoSecondaryCorridorOne": "L2 Secondary C1",
  "LevelTwoCorridorJunction": "L2 Corridor Junction",
  "VisionAndDental": "Vision & Dental",
  "LevelTwoCorridorFour": "L2 C4",
  "LevelTwoBurnedBedFour": "L2 Bed Four",
  "TheLearnatorium": "The Learnatorium",
  "LevelTwoBurnedQuartersFour": "L2 Burned Quarters Four",
  "LevelTwoCorridorThree": "L2 C3",
  "LevelTwoBurnedQuartersThree": "L2 Burned Quarters Three",
  "LevelTwoBurnedBedThree": "L2 Bed Three",
  "Lab": "Medical Lab",
  "LevelTwoCorridorTwo": "L2 C2",
  "LevelTwoBurnedQuartersTwo": "L2 Burned Quarters Two",
  "PatientCareOne": "Patient Care",
  "LevelTwoCorridorOne": "L2 C1",
  "LevelTwoBurnedQuartersOne": "L2 Burned Quarters One",
  "LevelTwoBurnedBathOne": "L2 Bath One",
  "Storage": "Storage L2",
  "LevelThreeSecretRoom": "Secret Room",
  "GymWeightRoom": "Weight Room",
  "TPADTerminal": "Teleportation Station",
  "MovieTheaterB": "Theater B",
  "MovieTheaterC": "Theater C",
  "MensShower": "Men's Showers",
  "LevelThreeCubby": "Cubby",
  "MovieTheaterD": "Theater D",
  "MovieTheaterA": "Theater A",
  "LevelThreeCorridorSeven": "L3 C7",
  "LevelThreeStairAccess": "L3 Stair Access",
  "StairThree": "L3 Stairwell",
  "MovieTheaterBathroom": "Bathroom",
  "LevelThreeCorridorSix": "L3 C6",
  "FiveWestBath": "Umboltz: Toilet",
  "LivingQuartersSixEast": "Onche: Living Room",
  "SixEastBed": "Onche: Boudoir",
  "MovieTheaterLobby": "Lobby",
  "LevelThreeCorridorFive": "L3 C5",
  "SixEastBath": "Onche: Powder",
  "LivingQuartersFiveWest": "Umboltz: Den",
  "FiveWestBed": "Umboltz: Bunk",
  "LevelThreeCorridorFour": "L3 C4",
  "L3Warehouse": "Storage L3",
  "LevelThreeCorridorBranch": "L3 Corridor Branch",
  "ParkEntrance": "Park\nGate",
  "LevelThreeCorridorThree": "L3 C3",
  "LivingQuartersThreeWest": "Sanyi: Dorm",
  "ThreeWestBed": "Sanyi: Bunk",
  "ThreeEastBed": "Eegler: Bedroom",
  "LivingQuartersThreeEast": "Eegler: Living Area",
  "LevelThreeCorridorTwo": "L3 C2",
  "ThreeWestBath": "Sanyi: Latrine",
  "ThreeEastBath": "Eegler: Can",
  "SecretLab": "'Secret' Lab",
  "RestaurantEntrance": "Front Entrance",
  "LevelThreeCorridorOne": "L3 C1",
  "BarBathroom": "Bathroom",
  "BarLounge": "Lounge",
  "WomensRoom": "Women's Room",
  "MensRoom": "Men's Room",
  "ObservationTower": "Tower",
  "Greenhouse": "GreenHouse",
  "LevelFourCorridorOne": "L4 Corridor One",
  "LevelFourCorridorTwo": "L4 Corridor Two",
  "LevelFourStairAccess": "L4 Stair Access",
  "StairFour": "L4 Stairwell",
  "MaintenancePlatform": "Maintenance",
  "SupplyPlatform": "Supplies",
  "LevelFiveStairAccess": "L5 Stair Access",
  "StairFive": "L5 Stairwell",
  "ObservationPlatform": "Observation",
  "WasteProcessingPlatform": "Waste Processing",
  "LobeStoragePlatform": "Lobe Storage",
  "HeatCoolantExchangePlatform": "Heat Exchange",
  "ReadingsPlatform": "Readings",
  "ReactorControlRoom": "Control Room",
  "OzoneGeneratorRoom": "Ozone Generator",
  "StairSix": "L6 Stairwell",
  "LevelSixStairAccess": "L6 Stair Access",
  "StorageQuadTwoTop": "Cargo 2 Top",
  "StorageQuadOneTop": "Cargo 1 Top",
  "HydroponicsPlatformAdmin": "Admin",
  "StorageQuadThreeTop": "Cargo 3 Top",
  "StorageQuadFourTop": "Cargo 4 Top",
  "StorageQuadTwoMid": "Cargo 2 Mid",
  "StorageQuadOneMid": "Cargo 1 Mid",
  "3DPrintingFacility": "3D Printing",
  "StorageQuadThreeMid": "Cargo 3 Mid",
  "StorageQuadFourMid": "Cargo 4 Mid",
  "StorageQuadTwo": "Cargo 2",
  "StorageQuadOne": "Cargo 1",
  "StorageQuadThree": "Cargo 3",
  "StorageQuadFour": "Cargo 4",
  "StairSeven": "L7 Stairwell",
  "LevelSevenStairAccess": "L7 Stair Access",
  "StairWellSeven": "Bottom of Stairwell",
};

const EXTRA_ROOM_IDS = new Set([
  "Apiary",
  "BotanicalOne",
  "DeepStorageGrid",
  "Greenhouse",
  "ShuttleCockpit",
  "StairWellSeven",
  "TiltedPlatformPerch",
]);

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function escapeString(value) {
  return JSON.stringify(value);
}

function walk(dir) {
  const out = [];

  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);

    if (ent.isDirectory()) {
      out.push(...walk(full));
      continue;
    }

    if (/\.(ts|tsx)$/.test(ent.name)) out.push(full);
  }

  return out;
}

function collectKnownIds() {
  const ids = new Set(EXTRA_ROOM_IDS);
  const idPattern = /\bid:\s*"([^"]+)"/g;

  for (const file of walk(WORLD_MAPS_DIR)) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(idPattern)) {
      ids.add(match[1]);
    }
  }

  return ids;
}

function buildNormalizedIdIndex(knownIds) {
  const index = new Map();

  for (const id of knownIds) {
    const key = normalize(id);
    const current = index.get(key) ?? [];
    current.push(id);
    index.set(key, current);
  }

  return index;
}

function readExcalidrawElements() {
  const data = JSON.parse(fs.readFileSync(EXCALIDRAW_FILE, "utf8"));
  return data.elements.filter((element) => !element.isDeleted);
}

function findHeadingElements(elements) {
  const textElements = elements.filter((element) => element.type === "text");

  const headings = LEVEL_HEADINGS.map((level) => {
    const element = textElements.find(
      (candidate) => getText(candidate) === level.heading,
    );

    if (!element) {
      throw new Error(`Missing map heading "${level.heading}"`);
    }

    return { ...level, y: element.y };
  }).sort((a, b) => a.y - b.y);

  return headings.map((heading, index) => {
    const nextY = headings[index + 1]?.y;
    const offsetMaxY = heading.maxYOffset
      ? heading.y + heading.maxYOffset
      : undefined;
    const maxY =
      nextY && offsetMaxY ? Math.min(nextY, offsetMaxY) : nextY ?? offsetMaxY;

    return { ...heading, maxY };
  });
}

function getText(element) {
  return String(element.rawText ?? element.text ?? "").replace(/\s+/g, " ").trim();
}

function getElementBounds(element) {
  const x2 = element.x + element.width;
  const y2 = element.y + element.height;

  return {
    height: Math.abs(element.height),
    maxX: Math.max(element.x, x2),
    maxY: Math.max(element.y, y2),
    minX: Math.min(element.x, x2),
    minY: Math.min(element.y, y2),
    width: Math.abs(element.width),
  };
}

function getTextCenter(element) {
  const bounds = getElementBounds(element);

  return {
    x: bounds.minX + bounds.width / 2,
    y: bounds.minY + bounds.height / 2,
  };
}

function findLevelIdForY(y, headingElements) {
  let levelId = "";

  for (const heading of headingElements) {
    if (y >= heading.y && (heading.maxY === undefined || y < heading.maxY)) {
      levelId = heading.id;
    }
  }

  return levelId;
}

function resolveRoomId(label, levelId, normalizedIdIndex) {
  const levelAlias = LEVEL_ALIASES[levelId]?.[label];
  if (levelAlias) return levelAlias;

  const globalAlias = GLOBAL_ALIASES[label];
  if (globalAlias) return globalAlias;

  const normalized = normalize(label);
  const matches = normalizedIdIndex.get(normalized) ?? [];

  return matches.length === 1 ? matches[0] : undefined;
}

function resolveRoomMatch(label, levelId, normalizedIdIndex) {
  const roomIds = ROOM_GROUP_ALIASES[levelId]?.[label];
  if (roomIds?.length) {
    return { roomId: roomIds[0], roomIds };
  }

  const roomId = resolveRoomId(label, levelId, normalizedIdIndex);
  return roomId ? { roomId } : undefined;
}

function formatDisplayLabel(label) {
  return label
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Za-z])(\d)/g, "$1 $2")
    .replace(/(\d)([A-Za-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

function getDisplayLabel(sourceLabel, roomId) {
  const override = DISPLAY_LABELS[sourceLabel] ?? DISPLAY_LABELS[roomId];
  if (override) return override;

  const label =
    sourceLabel.includes(" ") && normalize(sourceLabel) === normalize(roomId)
      ? roomId
      : sourceLabel;

  return formatDisplayLabel(label);
}

function makeNodeId(roomId, levelId, duplicateIndex) {
  return duplicateIndex === 0
    ? `${levelId}:${roomId}`
    : `${levelId}:${roomId}:${duplicateIndex + 1}`;
}

function getNodeSize(element, label) {
  const textWidth = Number.isFinite(element.width) ? element.width : label.length * 9;
  const textHeight = Number.isFinite(element.height) ? element.height : 24;

  return {
    height: Math.max(28, Math.round(textHeight + 16)),
    width: Math.max(72, Math.round(textWidth + 24)),
  };
}

function findContainingRectangle(textElement, rectangles) {
  const center = getTextCenter(textElement);

  return rectangles
    .map((rectangle) => ({
      bounds: getElementBounds(rectangle),
      rectangle,
    }))
    .filter(
      ({ bounds }) =>
        center.x >= bounds.minX &&
        center.x <= bounds.maxX &&
        center.y >= bounds.minY &&
        center.y <= bounds.maxY,
    )
    .sort(
      (a, b) =>
        a.bounds.width * a.bounds.height - b.bounds.width * b.bounds.height,
    )[0]?.rectangle;
}

function isPointInsideEllipse(point, ellipseBounds, tolerance = 0) {
  const minX = ellipseBounds.minX ?? ellipseBounds.x;
  const minY = ellipseBounds.minY ?? ellipseBounds.y;
  const radiusX = ellipseBounds.width / 2 + tolerance;
  const radiusY = ellipseBounds.height / 2 + tolerance;
  if (radiusX <= 0 || radiusY <= 0) return false;

  const centerX = minX + ellipseBounds.width / 2;
  const centerY = minY + ellipseBounds.height / 2;
  const normalizedX = (point.x - centerX) / radiusX;
  const normalizedY = (point.y - centerY) / radiusY;

  return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
}

function findContainingEllipse(textElement, ellipses) {
  const center = getTextCenter(textElement);

  return ellipses
    .map((ellipse) => ({
      bounds: getElementBounds(ellipse),
      ellipse,
    }))
    .filter(({ bounds }) => isPointInsideEllipse(center, bounds))
    .sort(
      (a, b) =>
        a.bounds.width * a.bounds.height - b.bounds.width * b.bounds.height,
    )[0]?.ellipse;
}

function getEllipseSectorGeometry(textElement, ellipse) {
  const center = getTextCenter(textElement);
  const bounds = getElementBounds(ellipse);
  const centerX = bounds.minX + bounds.width / 2;
  const centerY = bounds.minY + bounds.height / 2;
  const left = center.x < centerX;
  const top = center.y < centerY;

  return {
    height: Math.round(bounds.height / 2),
    shape: "label",
    sourceEllipseId: ellipse.id,
    sourceRectangleId: undefined,
    width: Math.round(bounds.width / 2),
    x: Math.round(left ? bounds.minX : centerX),
    y: Math.round(top ? bounds.minY : centerY),
  };
}

function getNodeGeometry(element, label, rectangles, ellipses) {
  const rectangle = findContainingRectangle(element, rectangles);

  if (rectangle) {
    const bounds = getElementBounds(rectangle);

    return {
      height: Math.round(bounds.height),
      shape: "box",
      sourceEllipseId: undefined,
      sourceRectangleId: rectangle.id,
      width: Math.round(bounds.width),
      x: Math.round(bounds.minX),
      y: Math.round(bounds.minY),
    };
  }

  const ellipse = findContainingEllipse(element, ellipses);
  if (ellipse) return getEllipseSectorGeometry(element, ellipse);

  const size = getNodeSize(element, label);

  return {
    height: size.height,
    shape: "box",
    sourceEllipseId: undefined,
    sourceRectangleId: undefined,
    width: size.width,
    x: Math.round(element.x),
    y: Math.round(element.y),
  };
}

function buildNodes(elements, headingElements, knownIds, normalizedIdIndex) {
  const nodes = [];
  const roomIdCounts = new Map();
  const unmatched = [];
  const rectangles = elements.filter((element) => element.type === "rectangle");
  const ellipses = elements.filter((element) => element.type === "ellipse");

  const textElements = elements
    .filter((element) => element.type === "text")
    .sort((a, b) => a.y - b.y || a.x - b.x);

  for (const element of textElements) {
    const sourceLabel = getText(element);
    if (!sourceLabel || IGNORED_LABELS.has(sourceLabel)) continue;
    if (IGNORED_LABEL_PATTERNS.some((pattern) => pattern.test(sourceLabel))) {
      continue;
    }
    if (LEVEL_HEADINGS.some((level) => level.heading === sourceLabel)) continue;

    const levelId = findLevelIdForY(element.y, headingElements);
    if (!levelId) continue;

    const roomMatch = resolveRoomMatch(sourceLabel, levelId, normalizedIdIndex);
    const roomId = roomMatch?.roomId;
    const missingRoomId = roomMatch?.roomIds?.find((id) => !knownIds.has(id));
    if (!roomId || !knownIds.has(roomId) || missingRoomId) {
      unmatched.push({ label: sourceLabel, levelId });
      continue;
    }

    const duplicateIndex = roomIdCounts.get(roomId) ?? 0;
    roomIdCounts.set(roomId, duplicateIndex + 1);
    const geometry = getNodeGeometry(element, sourceLabel, rectangles, ellipses);

    nodes.push({
      fontSize: Math.round(element.fontSize ?? 36),
      height: geometry.height,
      label: getDisplayLabel(sourceLabel, roomId),
      levelId,
      nodeId: makeNodeId(roomId, levelId, duplicateIndex),
      roomId,
      roomIds: roomMatch.roomIds,
      shape: geometry.shape,
      sourceElementId: element.id,
      sourceEllipseId: geometry.sourceEllipseId,
      sourceLabel,
      sourceRectangleId: geometry.sourceRectangleId,
      width: geometry.width,
      x: geometry.x,
      y: geometry.y,
    });
  }

  return { nodes, unmatched };
}

function buildCustomNodes(knownIds) {
  for (const node of CUSTOM_NODES) {
    if (!knownIds.has(node.roomId)) {
      throw new Error(`Unknown custom map room id "${node.roomId}"`);
    }
  }

  return CUSTOM_NODES;
}

function toAbsolutePoints(element) {
  return (element.points ?? []).map(([x, y]) => ({
    x: Math.round(element.x + x),
    y: Math.round(element.y + y),
  }));
}

function getPointDistanceToNode(point, node) {
  const closestX = Math.max(node.x, Math.min(point.x, node.x + node.width));
  const closestY = Math.max(node.y, Math.min(point.y, node.y + node.height));

  return Math.hypot(point.x - closestX, point.y - closestY);
}

function findEndpointNode(point, nodes, levelId) {
  return nodes
    .filter((node) => node.levelId === levelId)
    .map((node) => ({
      distance: getPointDistanceToNode(point, node),
      node,
    }))
    .filter(({ distance }) => distance <= 90)
    .sort((a, b) => a.distance - b.distance)[0]?.node;
}

function findBoundNode(binding, nodes, levelId) {
  if (!binding?.elementId) return undefined;

  return nodes.find(
    (node) =>
      node.levelId === levelId &&
      (node.sourceElementId === binding.elementId ||
        node.sourceRectangleId === binding.elementId),
  );
}

function makeConnectorEndpoint(element, nodes, levelId, binding, point) {
  const boundNode = findBoundNode(binding, nodes, levelId);
  const node = boundNode ?? findEndpointNode(point, nodes, levelId);

  return node
    ? {
        nodeId: node.nodeId,
        roomId: node.roomId,
      }
    : undefined;
}

function isConnectorInsideShape(points, shapes, levelId) {
  return shapes.some((shape) => {
    if (shape.levelId !== levelId || shape.type !== "ellipse") return false;

    return points.every((point) => isPointInsideEllipse(point, shape, 10));
  });
}

function buildShapes(elements, headingElements) {
  const drawnShapes = elements
    .filter((element) => element.type === "ellipse")
    .map((element) => {
      const bounds = getElementBounds(element);
      const levelId = findLevelIdForY(bounds.minY + bounds.height / 2, headingElements);
      if (!levelId) return undefined;

      return {
        height: Math.round(bounds.height),
        id: element.id,
        levelId,
        type: "ellipse",
        width: Math.round(bounds.width),
        x: Math.round(bounds.minX),
        y: Math.round(bounds.minY),
      };
    })
    .filter(Boolean);

  return [...drawnShapes, ...CUSTOM_SHAPES.map(buildCustomShape)];
}

function getPointBounds(points) {
  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxX = Math.max(...points.map((point) => point.x));
  const maxY = Math.max(...points.map((point) => point.y));

  return {
    height: maxY - minY,
    width: maxX - minX,
    x: minX,
    y: minY,
  };
}

function buildCustomShape(shape) {
  if (shape.type === "ellipse") return shape;

  const bounds = getPointBounds(shape.points);

  return {
    ...shape,
    ...bounds,
    type: "path",
  };
}

function buildConnectors(elements, headingElements, nodes, shapes) {
  const drawnConnectors = elements
    .filter((element) => element.type === "line" || element.type === "arrow")
    .filter((element) => !IGNORED_CONNECTOR_IDS.has(element.id))
    .map((element) => {
      const points = toAbsolutePoints(element);
      if (points.length < 2) return undefined;

      const midpointY =
        points.reduce((sum, point) => sum + point.y, 0) / points.length;
      const levelId = findLevelIdForY(midpointY, headingElements);
      if (!levelId) return undefined;

      const from = makeConnectorEndpoint(
        element,
        nodes,
        levelId,
        element.startBinding,
        points[0],
      );
      const to = makeConnectorEndpoint(
        element,
        nodes,
        levelId,
        element.endBinding,
        points[points.length - 1],
      );

      return {
        fromNodeId: from?.nodeId,
        fromRoomId: from?.roomId,
        id: element.id,
        isDecorative: isConnectorInsideShape(points, shapes, levelId),
        isArrow: element.type === "arrow" || Boolean(element.endArrowhead),
        levelId,
        points,
        strokeStyle: element.strokeStyle === "dashed" ? "dashed" : "solid",
        toNodeId: to?.nodeId,
        toRoomId: to?.roomId,
      };
    })
    .filter(Boolean);

  return [...drawnConnectors, ...buildCustomConnectors(nodes)];
}

function buildCustomConnectors(nodes) {
  return CUSTOM_CONNECTORS.map((connector) => {
    const fromNode = nodes.find((node) => node.nodeId === connector.fromNodeId);
    const toNode = nodes.find((node) => node.nodeId === connector.toNodeId);

    if (!fromNode || !toNode) {
      throw new Error(`Missing custom connector endpoint for "${connector.id}"`);
    }

    return {
      ...connector,
      points: [
        {
          x: Math.round(fromNode.x + fromNode.width / 2),
          y: Math.round(fromNode.y + fromNode.height),
        },
        {
          x: Math.round(toNode.x + toNode.width / 2),
          y: Math.round(toNode.y),
        },
      ],
    };
  });
}

function serializeLayout(levels, nodes, shapes, connectors, unmatched) {
  const levelText = levels
    .map(
      (level) =>
        `    { id: ${escapeString(level.id)}, title: ${escapeString(level.title)} }`,
    )
    .join(",\n");

  const nodeText = nodes
    .map((node) => {
      const lines = [
        "    {",
        `      nodeId: ${escapeString(node.nodeId)},`,
        `      roomId: ${escapeString(node.roomId)},`,
      ];

      if (node.roomIds?.length) {
        lines.push(
          `      roomIds: [${node.roomIds.map(escapeString).join(", ")}],`,
        );
      }

      lines.push(
        `      levelId: ${escapeString(node.levelId)},`,
        `      label: ${escapeString(node.label)},`,
        `      sourceLabel: ${escapeString(node.sourceLabel)},`,
        `      shape: ${escapeString(node.shape)},`,
        `      fontSize: ${node.fontSize},`,
        `      x: ${node.x},`,
        `      y: ${node.y},`,
        `      width: ${node.width},`,
        `      height: ${node.height},`,
        "    }",
      );

      return lines.join("\n");
    })
    .join(",\n");

  const shapeText = shapes
    .map((shape) => {
      const lines = [
        "    {",
        `      id: ${escapeString(shape.id)},`,
        `      levelId: ${escapeString(shape.levelId)},`,
        `      type: ${escapeString(shape.type)},`,
        `      x: ${shape.x},`,
        `      y: ${shape.y},`,
        `      width: ${shape.width},`,
        `      height: ${shape.height},`,
      ];

      if (shape.type === "path") {
        const pointText = shape.points
          .map((point) => `{ x: ${point.x}, y: ${point.y} }`)
          .join(", ");
        lines.push(`      points: [${pointText}],`);
        if (shape.closed) lines.push("      closed: true,");
      }

      if (shape.roomIds?.length) {
        lines.push(
          `      roomIds: [${shape.roomIds.map(escapeString).join(", ")}],`,
        );
      }

      lines.push("    }");
      return lines.join("\n");
    })
    .join(",\n");

  const connectorText = connectors
    .map((connector) => {
      const pointText = connector.points
        .map((point) => `{ x: ${point.x}, y: ${point.y} }`)
        .join(", ");
      const lines = [
        "    {",
        `      id: ${escapeString(connector.id)},`,
        `      levelId: ${escapeString(connector.levelId)},`,
        `      points: [${pointText}],`,
        `      strokeStyle: ${escapeString(connector.strokeStyle)},`,
        `      isDecorative: ${connector.isDecorative ? "true" : "false"},`,
        `      isArrow: ${connector.isArrow ? "true" : "false"},`,
      ];

      if (connector.fromNodeId) {
        lines.push(`      fromNodeId: ${escapeString(connector.fromNodeId)},`);
      }
      if (connector.fromRoomId) {
        lines.push(`      fromRoomId: ${escapeString(connector.fromRoomId)},`);
      }
      if (connector.toNodeId) {
        lines.push(`      toNodeId: ${escapeString(connector.toNodeId)},`);
      }
      if (connector.toRoomId) {
        lines.push(`      toRoomId: ${escapeString(connector.toRoomId)},`);
      }

      lines.push("    }");
      return lines.join("\n");
    })
    .join(",\n");

  const unmatchedText = unmatched
    .map(
      (entry) =>
        `    { levelId: ${escapeString(entry.levelId)}, label: ${escapeString(entry.label)} }`,
    )
    .join(",\n");

  return `// Generated by scripts/generate-game-map-data.mjs from AYSF-In-Game-Map.excalidraw.
// Do not edit by hand; update the Excalidraw map or generator aliases instead.

import type { ShipMapLayout } from "./shipMapTypes";

export const SHIP_MAP_LAYOUT = {
  levels: [
${levelText}
  ],
  nodes: [
${nodeText}
  ],
  shapes: [
${shapeText}
  ],
  connectors: [
${connectorText}
  ],
  unmatchedLabels: [
${unmatchedText}
  ],
} as const satisfies ShipMapLayout;
`;
}

const elements = readExcalidrawElements();
const headingElements = findHeadingElements(elements);
const knownIds = collectKnownIds();
const normalizedIdIndex = buildNormalizedIdIndex(knownIds);
const { nodes: drawnNodes, unmatched } = buildNodes(
  elements,
  headingElements,
  knownIds,
  normalizedIdIndex,
);
const nodes = [...drawnNodes, ...buildCustomNodes(knownIds)];
const shapes = buildShapes(elements, headingElements);
const connectors = buildConnectors(elements, headingElements, nodes, shapes);

fs.writeFileSync(
  OUTPUT_FILE,
  serializeLayout(
    headingElements.map(({ id, title }) => ({ id, title })),
    nodes,
    shapes,
    connectors,
    unmatched,
  ),
);

console.log(
  `Generated ${path.relative(ROOT, OUTPUT_FILE)} with ${nodes.length} map nodes, ${shapes.length} shapes, ${connectors.length} connectors, and ${unmatched.length} unmatched labels.`,
);
