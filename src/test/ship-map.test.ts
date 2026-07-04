import {
  buildShipMapEdges,
  getPrimaryShipMapNodeForRoom,
  getShipMapNodeStatus,
  getShipMapNodesForLevel,
  shouldRevealShipMapNodeLabel,
} from "@game/map/shipMapModel";
import { SHIP_MAP_LAYOUT } from "@game/map/generatedShipMapLayout";
import type { ShipMapConnector } from "@game/map/shipMapTypes";
import { describe, expect, it } from "vitest";
import { createTestState } from "./helpers/gameTestHelpers";

describe("ship map layout", () => {
  it("generates map nodes for key authored rooms", () => {
    const roomIds = new Set(SHIP_MAP_LAYOUT.nodes.map((node) => node.roomId));

    expect(roomIds.has("ParkCenter")).toBe(true);
    expect(roomIds.has("HydroponicsPlatform")).toBe(true);
    expect(roomIds.has("DeepStorageGrid")).toBe(true);
    expect(roomIds.has("LevelSevenCorridorBend")).toBe(true);
    expect(roomIds.has("StairWellSeven")).toBe(true);
  });

  it("uses the authored circular movie theater layout", () => {
    const theaterRooms = [
      "MovieTheaterA",
      "MovieTheaterB",
      "MovieTheaterC",
      "MovieTheaterD",
    ];
    const theaterNodes = theaterRooms.map((roomId) =>
      SHIP_MAP_LAYOUT.nodes.find((node) => node.roomId === roomId),
    );

    expect(SHIP_MAP_LAYOUT.shapes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          height: 646,
          levelId: "level-three",
          type: "ellipse",
          width: 688,
          x: -945,
          y: 1576,
        }),
      ]),
    );
    expect(theaterNodes).toHaveLength(4);
    for (const node of theaterNodes) {
      expect(node).toEqual(
        expect.objectContaining({
          levelId: "level-three",
          shape: "label",
        }),
      );
    }
    expect(
      SHIP_MAP_LAYOUT.connectors.some(
        (connector) =>
          connector.levelId === "level-three" && connector.isDecorative,
      ),
    ).toBe(true);
  });

  it("omits virtual office rooms from the authored ship map", () => {
    const roomIds = new Set<string>(SHIP_MAP_LAYOUT.nodes.map((node) => node.roomId));
    const connectorRoomIds = new Set(
      (SHIP_MAP_LAYOUT.connectors as readonly ShipMapConnector[]).flatMap((connector) =>
        [connector.fromRoomId, connector.toRoomId].filter(Boolean),
      ),
    );

    expect(roomIds.has("LemsterVirtualOffice")).toBe(false);
    expect(roomIds.has("VirtualManagerOffice")).toBe(false);
    expect(connectorRoomIds.has("LemsterVirtualOffice")).toBe(false);
    expect(connectorRoomIds.has("VirtualManagerOffice")).toBe(false);
  });

  it("maps the level-three storage label to the warehouse room id", () => {
    const storageNode = SHIP_MAP_LAYOUT.nodes.find(
      (node) => node.nodeId === "level-three:L3Warehouse",
    );

    expect(storageNode).toEqual(
      expect.objectContaining({
        label: "Storage L3",
        levelId: "level-three",
        roomId: "L3Warehouse",
        sourceLabel: "Storage L3",
      }),
    );
    const oldStorageNodeId: string = "level-three:Storage:2";

    expect(
      SHIP_MAP_LAYOUT.nodes.some(
        (node) => node.nodeId === oldStorageNodeId,
      ),
    ).toBe(false);
  });

  it("preserves authored map-friendly room labels", () => {
    const labelsByRoom = new Map<string, string>(
      SHIP_MAP_LAYOUT.nodes.map((node) => [node.roomId, node.label]),
    );
    const expectedLabels: Array<[string, string]> = [
      ["LevelTwoCorridorFive", "L2 C5"],
      ["SpecimenOne", "Specimen\nOne"],
      ["SpecimenTwo", "Specimen\nTwo"],
      ["SpecimenThree", "Specimen\nThree"],
      ["SpecimenFour", "Specimen\nFour"],
      ["XenobiologyLab", "Xenobiology\nLab"],
      ["TPADTerminal", "Teleportation Station"],
      ["MovieTheaterLobby", "Lobby"],
      ["ParkEntrance", "Park\nGate"],
      ["Greenhouse", "GreenHouse"],
      ["3DPrintingFacility", "3D Printing"],
      ["HydroponicsPlatformAdmin", "Admin"],
      ["StairWellSeven", "Bottom of Stairwell"],
    ];

    for (const [roomId, label] of expectedLabels) {
      expect(labelsByRoom.get(roomId)).toBe(label);
    }
  });

  it("maps the aquarium region to the aquarium room group", () => {
    const state = createTestState({ roomId: "AqGoal" });
    const aquariumNode = getPrimaryShipMapNodeForRoom("AqGoal");

    expect(aquariumNode).toEqual(
      expect.objectContaining({
        label: "Aquarium",
        levelId: "level-four",
        roomId: "AqStart",
      }),
    );
    expect(aquariumNode?.roomIds).toContain("AqGoal");
    expect(getShipMapNodeStatus(state, aquariumNode!)).toBe("current");
  });

  it("adds a winged shuttle outline around the shuttle rooms", () => {
    const shuttleOutline = SHIP_MAP_LAYOUT.shapes.find(
      (shape) => shape.id === "level-five-shuttle-outline",
    );
    const insideShuttle = SHIP_MAP_LAYOUT.nodes.find(
      (node) => node.roomId === "InsideShuttle",
    );
    const shuttleCockpit = SHIP_MAP_LAYOUT.nodes.find(
      (node) => node.roomId === "ShuttleCockpit",
    );
    const shuttleBay = SHIP_MAP_LAYOUT.nodes.find(
      (node) => node.roomId === "ShuttleBay",
    );
    const engCorridorOne = SHIP_MAP_LAYOUT.nodes.find(
      (node) => node.roomId === "EngCorridorOne",
    );
    const levelFiveStairAccess = SHIP_MAP_LAYOUT.nodes.find(
      (node) => node.roomId === "LevelFiveStairAccess",
    );

    expect(shuttleOutline).toEqual(
      expect.objectContaining({
        closed: true,
        levelId: "level-five",
        roomIds: ["InsideShuttle", "ShuttleCockpit"],
        type: "path",
      }),
    );
    expect(insideShuttle).toBeDefined();
    expect(shuttleCockpit).toBeDefined();
    expect(shuttleBay).toBeDefined();
    expect(engCorridorOne).toBeDefined();
    expect(levelFiveStairAccess).toBeDefined();

    if (
      !shuttleOutline ||
      shuttleOutline.type !== "path" ||
      !insideShuttle ||
      !shuttleCockpit ||
      !shuttleBay ||
      !engCorridorOne ||
      !levelFiveStairAccess
    ) {
      throw new Error("Expected shuttle outline and rooms to be generated");
    }

    const pointXs = shuttleOutline.points.map((point) => point.x);
    const pointYs = shuttleOutline.points.map((point) => point.y);

    expect(shuttleOutline.points.length).toBeGreaterThan(10);
    expect(shuttleOutline.width).toBeGreaterThan(1800);
    expect(Math.min(...pointXs)).toBeGreaterThan(shuttleBay.x + shuttleBay.width);
    expect(Math.min(...pointXs)).toBeLessThan(insideShuttle.x);
    expect(Math.max(...pointXs)).toBeGreaterThan(shuttleCockpit.x + shuttleCockpit.width);
    expect(Math.max(...pointXs)).toBeGreaterThan(
      shuttleCockpit.x + shuttleCockpit.width + 900,
    );
    expect(Math.min(...pointYs)).toBeLessThan(insideShuttle.y - 100);
    expect(Math.max(...pointYs)).toBeGreaterThan(shuttleCockpit.y + shuttleCockpit.height + 100);
    expect(Math.max(...pointYs)).toBeLessThan(
      Math.min(engCorridorOne.y, levelFiveStairAccess.y) - 40,
    );
  });

  it("adds the bottom of the stairwell below level seven", () => {
    const stairSeven = SHIP_MAP_LAYOUT.nodes.find(
      (node) => node.roomId === "StairSeven",
    );
    const stairwellBottom = SHIP_MAP_LAYOUT.nodes.find(
      (node) => node.roomId === "StairWellSeven",
    );
    const connector = SHIP_MAP_LAYOUT.connectors.find(
      (entry) => entry.id === "level-seven-stairwell-bottom-connector",
    );

    expect(stairSeven).toBeDefined();
    expect(stairwellBottom).toEqual(
      expect.objectContaining({
        label: "Bottom of Stairwell",
        levelId: "level-seven",
        roomId: "StairWellSeven",
        sourceLabel: "Stairwell Bottom",
        x: 3690,
        y: 16026,
      }),
    );
    expect(stairwellBottom!.y).toBeGreaterThan(
      stairSeven!.y + stairSeven!.height + 1000,
    );
    expect(connector).toEqual(
      expect.objectContaining({
        fromRoomId: "StairSeven",
        levelId: "level-seven",
        strokeStyle: "dashed",
        toRoomId: "StairWellSeven",
      }),
    );
    expect(connector?.points).toEqual([
      {
        x: Math.round(stairSeven!.x + stairSeven!.width / 2),
        y: stairSeven!.y + stairSeven!.height,
      },
      {
        x: Math.round(stairwellBottom!.x + stairwellBottom!.width / 2),
        y: stairwellBottom!.y,
      },
    ]);
  });

  it("reveals only visited and current room labels", () => {
    const state = createTestState({
      roomId: "ParkCenter",
      visitedRooms: ["ParkCenter", "ParkNorth"],
    });
    const currentNode = getPrimaryShipMapNodeForRoom("ParkCenter");
    const visitedNode = getPrimaryShipMapNodeForRoom("ParkNorth");
    const unknownNode = getPrimaryShipMapNodeForRoom("GymEntrance");

    expect(currentNode).toBeDefined();
    expect(visitedNode).toBeDefined();
    expect(unknownNode).toBeDefined();

    expect(getShipMapNodeStatus(state, currentNode!)).toBe("current");
    expect(shouldRevealShipMapNodeLabel(state, currentNode!)).toBe(true);
    expect(getShipMapNodeStatus(state, visitedNode!)).toBe("visited");
    expect(shouldRevealShipMapNodeLabel(state, visitedNode!)).toBe(true);
    expect(getShipMapNodeStatus(state, unknownNode!)).toBe("unknown");
    expect(shouldRevealShipMapNodeLabel(state, unknownNode!)).toBe(false);
  });

  it("derives level map edges from authored room exits", () => {
    const state = createTestState({ roomId: "ParkCenter" });
    const levelThreeNodes = getShipMapNodesForLevel("level-three");
    const edges = buildShipMapEdges(state, levelThreeNodes);

    expect(
      edges.some(
        (edge) =>
          [edge.fromRoomId, edge.toRoomId].includes("ParkCenter") &&
          [edge.fromRoomId, edge.toRoomId].includes("ParkNorth"),
      ),
    ).toBe(true);
    expect(
      edges.some(
        (edge) =>
          [edge.fromRoomId, edge.toRoomId].includes("ParkCenter") &&
          [edge.fromRoomId, edge.toRoomId].includes("BarEntrance"),
      ),
    ).toBe(true);
  });
});
