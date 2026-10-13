import type { Message, MessageCreateParamsNonStreaming, ToolUseBlock } from "@anthropic-ai/sdk/resources/messages";
import { fireEvent, render, screen } from "@testing-library/react";
import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import { resolve, sep } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { ShipMapPanel } from "../game/components/ShipMap";
import * as engine from "../game/engine/handleCommand";
import * as gameInit from "../game/gameInit";
import { PLAYER_TOOLS, runHeadlessAgent } from "../game/harness/agent";
import { SHIP_MAP_LAYOUT } from "../game/map/generatedShipMapLayout";
import { getAuthoredShipMapEdges, getPrimaryShipMapNodeForRoom, getShipMapNodesForLevel, getShipMapShapesForLevel, getCurrentShipMapLevelId, getShipMapNodeStatus } from "../game/map/shipMapModel";
import { getShipMapLabelLines, getEdgeState, getShapeState, getMiniMapBounds, getViewBoxAroundPoint, MINI_MAP_DEFAULT_ZOOM_SCALE } from "../game/map/shipMapPresentation";
import { shipMapText } from "../game/map/shipMapText";
import { useUIOverlayStore } from "../game/store/store";
import { createTestState, runCommand } from "./helpers/gameTestHelpers";
import { overlayFixture, overlayHistory, overlaySession, observationText as text } from "./helpers/headlessOverlayHelpers";

function roomFixture(roomId: string, visitedRooms: string[] = [roomId]) {
  return createTestState({ roomId, visitedRooms, rng: () => 0.99 });
}

describe("player-visible ship drawing", () => {
  it.each(["StairWellSeven", "LivingQuartersThreeEast", "LevelThreeCorridorSeven", "ParkCenter", "L3Warehouse", "HydroponicsPlatform", "InsideShuttle"])("matches actual SVG labels, strokes and outline states at %s", roomId => {
    const state = roomFixture(roomId);
    const levelId = getCurrentShipMapLevelId(state)!;
    const level = ["level-one", "level-two", "level-three", "level-four", "level-five", "level-six", "level-seven"].indexOf(levelId) + 1;
    const mapped = shipMapText(state, { detail: "full", level });
    const view = render(<ShipMapPanel state={state} />);
    fireEvent.click(screen.getByRole("button", { name: "Open ship map" }));
    const svg = screen.getByRole("dialog", { name: "Ship map" }).querySelector("svg")!;
    const groups = svg.querySelectorAll(".ship-map-node");
    for (const node of getShipMapNodesForLevel(levelId)) {
      const group = groups[SHIP_MAP_LAYOUT.nodes.indexOf(node as typeof SHIP_MAP_LAYOUT.nodes[number])];
      expect(group.getAttribute("data-status")).toBe(getShipMapNodeStatus(state, node));
      const renderedLabel = Array.from(group.querySelectorAll("tspan")).map(line => line.textContent).join(" ");
      expect(renderedLabel).toBe(getShipMapLabelLines(state, node).join(" "));
      if (renderedLabel) expect(mapped).toContain(renderedLabel);
      else {
        expect(group.querySelector("text")).toBeNull();
        expect(mapped.split("Mapped spaces:\n")[1].split("\n\n")[0]).not.toContain("] " + node.label + ":");
      }
      if (node.shape === "label" && getShipMapNodeStatus(state, node) === "unknown") expect(group.querySelector("rect")).toBeNull();
    }
    const shapes = getShipMapShapesForLevel(levelId);
    for (const shape of shapes) {
      const element = svg.querySelectorAll(".ship-map-shape")[SHIP_MAP_LAYOUT.shapes.indexOf(shape as typeof SHIP_MAP_LAYOUT.shapes[number])];
      expect(element.getAttribute("data-state")).toBe(getShapeState(state, shape, SHIP_MAP_LAYOUT.nodes));
    }
    const strokes = svg.querySelectorAll(".ship-map-edge");
    for (const edge of getAuthoredShipMapEdges(getShipMapNodesForLevel(levelId))) {
      const index = SHIP_MAP_LAYOUT.connectors.findIndex(connector => connector.id === edge.id);
      expect(strokes[index].getAttribute("data-state")).toBe(getEdgeState(state, edge, SHIP_MAP_LAYOUT.nodes, SHIP_MAP_LAYOUT.shapes));
      expect(strokes[index].getAttribute("data-stroke-style")).toBe(edge.strokeStyle);
    }
    expect(mapped).toContain("[YOU]");
    expect(mapped).not.toMatch(/fromRoomId|toRoomId|sourceLabel|nodeId|visitedRooms|powerRestoredSections/);
    view.unmount();
  });

  it("keeps secret identities unnamed until real discovery and visitation; drawn secret strokes are not routes", async () => {
    let state = roomFixture("ThreeEastBed");
    const before = shipMapText(state);
    expect(before).not.toMatch(/Secret Room|Level Three Duct|Cubby|SecretLab|'Secret' Lab/);
    expect(before).toContain("[unvisited]: rectangle");
    expect(before).toContain("dashed");
    state = await runCommand(state, "turn wall fixture");
    expect(state.worldState.conditionalTriggers.EeglerSecretLabOpen).toBe(true);
    // Opening the passage alone does not reveal an unvisited map label.
    expect(shipMapText(state)).toBe(before);
    state = await runCommand(state, "down");
    expect(state.player.roomId).toBe("SecretLab");
    const after = shipMapText(state);
    expect(after).toContain("[YOU] 'Secret' Lab");
    expect(after).toContain("[visited] Eegler: Bedroom");
    expect(after).not.toContain("SecretLab");
    expect(after.match(/rectangle/g)).toHaveLength(before.match(/rectangle/g)!.length);
    // The other anonymous secret area is physically blocked by the real door rule.
    const blocked = await runCommand(roomFixture("LevelThreeCorridorSeven"), "north");
    expect(blocked.player.roomId).toBe("LevelThreeCorridorSeven");
    expect(shipMapText(blocked)).not.toContain("Secret Room");
  });

  it("does not invent unknown theater quadrants from invisible label-only nodes", () => {
    const unknown = shipMapText(roomFixture("ParkCenter"));
    const discovered = shipMapText(roomFixture("MovieTheaterA"));
    const levelNodes = getShipMapNodesForLevel("level-three");
    const boxCount = levelNodes.filter(node => node.shape === "box").length;
    expect(unknown.split("Mapped spaces:\n")[1].split("\n\n")[0].split("\n")).toHaveLength(boxCount);
    expect(unknown).toContain("O1 oval");
    expect(unknown).not.toMatch(/Theater [ABCD]/);
    expect(discovered).toContain("[YOU] Theater A");
    expect(discovered).not.toMatch(/Theater [BCD]/);
    expect(discovered).toContain("(green)");
  });

  it("never consults the internal room/door graph, puzzle annotations, or source labels", () => {
    const state = roomFixture("LivingQuartersThreeEast");
    const expected = shipMapText(state, { detail: "full" });
    state.world = { ...state.world };
    for (const field of ["rooms", "doors"] as const) Object.defineProperty(state.world, field, { get: () => { throw new Error("Private graph read"); } });
    Object.defineProperty(state.worldState, "conditionalTriggers", { get: () => { throw new Error("Private puzzle flag read"); } });
    expect(shipMapText(state, { detail: "full" })).toBe(expected);
    expect(expected).not.toMatch(/LivingQuartersThreeEast|L3Warehouse|StairThree|level-three:|unmatchedLabels/);
  });

  it("does not infer links from adjacent geometry or doors, or add omitted internal rooms", () => {
    const state = roomFixture("L3Warehouse");
    const expected = shipMapText(state);
    state.world = { ...state.world, rooms: state.world.rooms.map(room => ({ ...room, exits: [] })), doors: [] };
    expect(shipMapText(state)).toBe(expected);
    expect(expected).toContain("[YOU] Storage L3");
    expect(expected).not.toContain("Robot Refuge");
    expect(expected).toContain("Lines are drawn strokes, not confirmed passages");
    expect(expected).not.toMatch(/P(\d+) -- P\1:/);
    const nodes = getShipMapNodesForLevel("level-three").filter(node => node.shape === "box").sort((a, b) => a.y - b.y || a.x - b.x);
    const edges = getAuthoredShipMapEdges(nodes);
    const pairs = nodes.flatMap((a, i) => nodes.slice(i + 1).map(b => ({ a, b, distance: Math.hypot(a.x - b.x, a.y - b.y) })))
      .filter(({ a, b }) => !edges.some(edge => [edge.fromNodeId, edge.toNodeId].includes(a.nodeId) && [edge.fromNodeId, edge.toNodeId].includes(b.nodeId)))
      .sort((a, b) => a.distance - b.distance);
    const pair = pairs[0];
    expect(pair.distance).toBeLessThan(400);
    const a = `P${nodes.indexOf(pair.a) + 1}`, b = `P${nodes.indexOf(pair.b) + 1}`;
    expect(expected).not.toContain(`${a} -- ${b}:`);
    expect(expected).not.toContain(`${b} -- ${a}:`);
    const virtual = shipMapText(roomFixture("LemsterVirtualOffice"), { level: 3 });
    expect(virtual).not.toMatch(/Lemster|Virtual Office/);
  });

  it("uses grouped labels and only the rendered teleport colors/glow, never destination lists", () => {
    const state = roomFixture("TPADTerminal");
    state.worldState.powerRestoredSections["teleport-pads-green"] = false;
    state.worldState.powerRestoredSections["teleport-pads-blue"] = true;
    const mapped = shipMapText(state);
    expect(mapped).toContain("[YOU] Teleportation Station");
    expect(mapped).toContain("green disk (dim)");
    expect(mapped).toContain("blue disk (glowing)");
    expect(mapped).not.toMatch(/RemoteMedical|Xenobiology|Authorization|badge/);
    expect(shipMapText(roomFixture("AqGoal"))).toContain("[YOU] Aquarium");
    expect(shipMapText(roomFixture("GridC3"))).not.toContain("GridC3");
  });

  it("shares nearby bounds with the browser and offers all drawn levels without discovery-based priorities", () => {
    const state = roomFixture("LivingQuartersThreeEast");
    const overview = shipMapText(state);
    const nearby = shipMapText(state, { detail: "nearby" });
    const full = shipMapText(state, { detail: "full" });
    const view = render(<ShipMapPanel state={state} />);
    const nodes = getShipMapNodesForLevel("level-three"), shapes = getShipMapShapesForLevel("level-three");
    const node = getPrimaryShipMapNodeForRoom(state.player.roomId)!;
    const bounds = getViewBoxAroundPoint(getMiniMapBounds("level-three", nodes, shapes)!, { x: node.x + node.width / 2, y: node.y + node.height / 2 }, MINI_MAP_DEFAULT_ZOOM_SCALE);
    expect(screen.getByRole("button", { name: "Open ship map" }).querySelector("svg")!.getAttribute("viewBox")).toBe(`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`);
    expect(nearby.length).toBeLessThan(overview.length);
    expect(full.length).toBeGreaterThan(overview.length);
    expect(nearby).toContain("This is a crop");
    for (let level = 2; level <= 7; level++) expect(shipMapText(state, { level })).toContain("Ship map - Level");
    expect(shipMapText(state, { level: 2 })).toContain("[YOU] is on Level Three, outside this view.");
    expect(shipMapText(roomFixture("Bridge"))).toContain("No map drawing");
    expect(shipMapText(roomFixture("Bridge"), { level: 3 })).toContain("Level Three");
    // The graphical sheet includes a long ship-wide stroke assigned to Level Four.
    // A level crop must mark its continuation rather than inventing endpoints.
    expect(shipMapText(state, { level: 4, detail: "full" })).toContain("continues outside view");
    view.unmount();
  });

  it.each([1, NaN, { level: 1 }, { level: 8 }, { level: "LevelThreeSecretRoom" }, { detail: "route" }, { detail: "full", roomId: "SecretLab" }])("rejects invalid map selection %j without arbitrary state queries", selection => {
    const state = roomFixture("StairWellSeven");
    const original = JSON.stringify(state);
    expect(shipMapText(state, selection)).toContain("Use :map");
    expect(shipMapText(state, selection)).not.toContain("Mapped spaces");
    expect(JSON.stringify(state)).toBe(original);
  });
});

describe("map information integration", () => {
  it("opens at game start without moves/state changes, automatically sending no map on ordinary actions", async () => {
    const controller = overlaySession(overlayFixture([]));
    const spy = vi.spyOn(engine, "handleCommand");
    const opening = text(await controller.start());
    expect(opening).not.toContain("Ship map");
    const overview = text(await controller.explorer.information("map"));
    expect(overview).toContain("Ship map - Level Seven (overview)");
    expect(overview).toContain("[YOU] Bottom of Stairwell");
    expect(overview).not.toMatch(/L7 C|Cryo Lab|Deep Storage|StairWellSeven/);
    for (const detail of ["overview", "nearby", "full"] as const) await controller.explorer.information("map", { detail });
    expect(spy).not.toHaveBeenCalled();
    await controller.explorer.command("inventory");
    expect(spy.mock.calls[0][0].moves).toBe(0);
    const before = await spy.mock.results[0].value;
    const serialized = JSON.stringify(before);
    await controller.explorer.information("map");
    await controller.explorer.command("inventory");
    expect(JSON.stringify(spy.mock.calls[1][0]) === serialized).toBe(true);
    expect(text(await controller.explorer.command("up"))).not.toContain("Ship map");
    expect((await overlayHistory(controller)).filter(entry => entry.kind === "information")[0]).toMatchObject({ input: ":map", observation: { text: [overview] } });
  });

  it("updates on movement/revisit, serializes behind commands and resets discovered labels", async () => {
    const controller = overlaySession(overlayFixture([]));
    await controller.start();
    const movement = controller.explorer.command("up");
    const mapped = controller.explorer.information("map");
    await movement;
    const landed = text(await mapped);
    expect(landed).toContain("[YOU] L7 Stairwell");
    expect(landed).toContain("[visited] Bottom of Stairwell");
    await controller.explorer.command("down");
    const returned = text(await controller.explorer.information("map"));
    expect(returned).toContain("[YOU] Bottom of Stairwell");
    expect(returned).toContain("[visited] L7 Stairwell");
    vi.mocked(gameInit.createFreshGameState).mockResolvedValueOnce(overlayFixture([]));
    await controller.reset();
    const fresh = text(await controller.explorer.information("map"));
    expect(fresh).not.toContain("L7 Stairwell");
    const records = await overlayHistory(controller);
    expect(records[2].kind).toBe("information");
    expect(records[2].observation.text).toEqual((await mapped).text);
    expect(records[2].episodeId).not.toBe(records.at(-1)!.episodeId);
    expect(records.map(entry => entry.sequence)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("retains read-only access during game over like the browser, and existing unsupported context gates", async () => {
    const initial = overlayFixture([]);
    initial.worldState.gameOver = { atMove: 0, cause: "fixture", message: "Game over." };
    const controller = overlaySession(initial);
    await controller.start();
    expect(text(await controller.explorer.information("map"))).toContain("Bottom of Stairwell");
    expect(text(await controller.explorer.information("room"))).toContain("unavailable while the game is over");
    useUIOverlayStore.getState().openOverlay({ kind: "3d-printer" });
    expect(text(await controller.explorer.information("map"))).toContain("needs a headless gameplay adapter");
  });

  it("keeps map tool requests, explanations, ordered JSONL and existing action/cache accounting", async () => {
    const controller = overlaySession(overlayFixture([]));
    const calls = [
      { view: "map" }, { view: "map", detail: "nearby" }, { view: "map", detail: "full", level: 3 },
    ];
    const requests: MessageCreateParamsNonStreaming[] = [];
    let index = 0;
    const client = { messages: {
      countTokens: vi.fn(async () => ({ input_tokens: 100 })),
      create: vi.fn(async (request: MessageCreateParamsNonStreaming) => {
        requests.push(request);
        const turn = index++;
        return { content: [
          { type: "text", text: `Map explanation ${turn}.`, citations: null },
          { type: "tool_use", id: `map_${turn}`, name: "game_information", input: calls[turn] } as ToolUseBlock,
        ], stop_reason: "tool_use", usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 } } as Message;
      }),
    } };
    const run = await runHeadlessAgent({ client, session: controller, options: { maxActions: 3 } });
    expect(run.reason).toBe("action_limit");
    expect(run.actions).toBe(3);
    expect(run.inputTokens).toBe(300);
    expect(run.outputTokens).toBe(60);
    expect(run.events.map(event => event.request)).toEqual([":map", ":map nearby", ":map full 3"]);
    expect(JSON.stringify(requests[2].messages)).toContain("Map explanation 1.");
    expect(requests[0]).toHaveProperty("cache_control");
    const history = await overlayHistory(controller);
    expect(history.filter(entry => entry.kind === "information").map(entry => entry.input)).toEqual(run.events.map(event => event.request));
    expect(history.filter(entry => entry.kind === "information").map(entry => entry.observation.text)).toEqual(run.events.map(event => event.text));
    expect(history.at(-1)!.kind).toBe("end");
    expect(PLAYER_TOOLS.find(tool => tool.name === "game_information")!.description).toContain("ship map");
  });

  it("rejects map-specific options on other views and numeric record/graph parameters on maps", async () => {
    const controller = overlaySession(overlayFixture([]));
    const invalid = [{ view: "room", detail: "full" }, { view: "map", record: 1 }, { view: "map", level: 1 }, { view: "map", roomId: "SecretLab" }, { view: "map", detail: "route" }];
    let turn = 0;
    const client = { messages: {
      countTokens: vi.fn(async () => ({ input_tokens: 100 })),
      create: vi.fn(async () => turn++ === 0 ? ({ content: invalid.map((input, index) => ({ type: "tool_use", id: `invalid_${index}`, name: "game_information", input })), stop_reason: "tool_use", usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 } } as Message) : ({ content: [{ type: "text", text: "Done.", citations: null }], stop_reason: "end_turn", usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 } } as Message)),
    } };
    const run = await runHeadlessAgent({ client, session: controller, options: { maxErrors: 10 } });
    expect(run.actions).toBe(0);
    expect(run.events.every(event => event.error)).toBe(true);
    expect((await overlayHistory(controller)).filter(entry => entry.kind === "information")).toHaveLength(0);
  });
});

it("requests all textual map views through the actual Node CLI without a DOM", async () => {
  const { stdout, stderr } = await new Promise<{ stdout: string; stderr: string }>((done, reject) => {
    const child = execFile(process.execPath, [resolve("scripts/play-headless.mjs")], { timeout: 20_000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => error ? reject(error) : done({ stdout, stderr }));
    child.stdin!.end(":map\n:map nearby\n:map full 3\n:map 2\n:map route\n:transcript\n:quit\n");
  });
  expect(stderr).toBe("");
  expect(stdout).toContain("Ship map - Level Seven (overview)");
  expect(stdout).toContain("Ship map - Level Seven (nearby)");
  expect(stdout).toContain("Ship map - Level Three (full)");
  expect(stdout).toContain("Ship map - Level Two (overview)");
  expect(stdout).not.toMatch(/LevelThreeSecretRoom|StairWellSeven|Secret Room|itemRoomId|Error:/);
  const metadata = JSON.parse(stdout.match(/\{\s*"path":[\s\S]*?"records":\s*\d+\s*\}/)![0]) as { path: string };
  expect(metadata.path.startsWith(resolve(".headless-transcripts") + sep)).toBe(true);
  await fs.rm(metadata.path);
}, 30_000);
