import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { resolve } from "node:path";
import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InventoryTree } from "../game/components/InventoryTree";
import { QuantumTotePanel } from "../game/components/QuantumTotePanel";
import { StatusTab } from "../game/components/StatusTab";
import * as gameInit from "../game/gameInit";
import * as engine from "../game/engine/handleCommand";
import { createHeadlessSession } from "../game/harness/session";
import { inventoryText, statusText } from "../game/harness/playerView";
import type { Observation, SessionController, TranscriptEntry } from "../game/harness/types";
import { GOSSIP_NOTIFICATION_TEXT } from "../game/rules/notifications";
import { useUIOverlayStore } from "../game/store/store";
import { buildHelpText } from "../game/text/help";
import type { GameState, StatusEffect } from "../game/types/gameTypes";
import type { Item } from "../game/types/itemTypes";
import { createTestState } from "./helpers/gameTestHelpers";

const controllers: SessionController[] = [];
const directories: string[] = [];
const text = (observation: Observation) => observation.text.join("\n\n");
const realExecute = engine.handleCommand;

async function session(fixture?: GameState) {
  if (fixture) vi.spyOn(gameInit, "createFreshGameState").mockResolvedValueOnce(fixture);
  const directory = resolve(".headless-transcripts", `information-test-${randomUUID()}`);
  directories.push(directory);
  const controller = createHeadlessSession({ transcriptDirectory: directory });
  controllers.push(controller);
  await controller.start();
  return controller;
}

function item(id: string, name: string, additions: Partial<Item> = {}): Item {
  return {
    id, name, description: "Unrevealed examination detail.", vocab: [name],
    location: "StairWellSeven", itemCategory: "collectable", itemClass: "solid",
    itemSize: 1, itemWeight: 1, ...additions,
  };
}

function fixture(items: Item[] = []): GameState {
  const state = createTestState({ roomId: "StairWellSeven", rng: () => 0.99 });
  return {
    ...state,
    world: { ...state.world, items: [...state.world.items, ...items] },
    itemState: {
      ...state.itemState,
      itemRoomId: { ...state.itemState.itemRoomId, ...Object.fromEntries(items.map(i => [i.id, i.location])) },
    },
  };
}

afterEach(async () => {
  for (const controller of controllers.splice(0)) await controller.dispose();
  for (const directory of directories.splice(0)) await fs.rm(directory, { recursive: true, force: true });
  cleanup();
  vi.restoreAllMocks();
});

describe("headless player information", () => {
  it("projects starting inventory and aliases without granting items or spending turns", async () => {
    const controller = await session();
    const spy = vi.spyOn(engine, "handleCommand");
    for (const input of ["inventory", "inv", "i"]) {
      const response = text(await controller.explorer.command(input));
      expect(response).toContain("Inventory\nTotal: 1\nGeneral (1):");
      expect(response).toContain("Comet");
      expect(response).toContain("Badges (0):\n  None.\nKeys (0):\n  None.");
      expect(response).toContain("Moves: 0");
      expect(response.slice(response.indexOf("Inventory\n"))).not.toMatch(/timer|mysterious note|MindGun|ATUM/);
    }
    expect(spy.mock.calls.map(call => call[1].type)).toEqual(["inventory", "inventory", "inventory"]);
    expect((await spy.mock.results[2].value).player.inventory).toEqual(spy.mock.calls[0][0].player.inventory);
  });

  it("reflects real acquisition, removal, equipment and free panel turns", async () => {
    const controller = await session();
    await controller.explorer.command("examine dead man");
    const acquired = text(await controller.explorer.command("inventory"));
    expect(acquired).toContain("- a little timer");
    expect(acquired).toContain("Total: 2\nGeneral (2):");
    await controller.explorer.command("drop timer");
    const after = text(await controller.explorer.command("inventory"));
    expect(after.slice(after.indexOf("Inventory\n"))).not.toContain("little timer");
    expect(after).toContain("Moves: 2");
    expect(after).toContain("Total: 1\nGeneral (1):");

    await controller.reset();
    const band = item("PrivateBandId", "cloth headband", { isWearable: true, clothingSlot: "head" });
    await controller.dispose();
    const equipped = await session(fixture([band]));
    await equipped.explorer.command("take cloth headband");
    await equipped.explorer.command("wear cloth headband");
    expect(text(await equipped.explorer.command("inv"))).toContain("cloth headband (worn on your head)");
    await equipped.explorer.command("remove cloth headband");
    expect(text(await equipped.explorer.command("inv"))).not.toContain("worn on your head");
  });

  it("shares dynamic labels and open-container visibility with the browser inventory", () => {
    const caseItem = item("PrivateCaseId", "carrying case", { isContainer: true, isOpenable: true });
    const content = item("PrivateContentId", "folded card", { location: "IN:PrivateCaseId" });
    const gauge = item("PrivateGaugeId", "gauge", { named: state => `gauge showing ${state.moves}`, isSwitchable: true });
    const badge = item("PrivateBadgeId", "blue badge");
    const key = item("PrivateKeyId", "brass key");
    const state = fixture([caseItem, content, gauge, badge, key]);
    state.player.inventory = { general: [caseItem.id, gauge.id], badges: [badge.id], keys: [key.id] };
    state.itemState.containerContents[caseItem.id] = [content.id];
    state.itemState.itemSettings[gauge.id] = { kind: "goggles", isOn: true };
    const serialized = JSON.stringify(state);
    const closed = inventoryText(state);
    expect(closed).toContain("gauge showing 0 (which is on)");
    expect(closed).toContain("Total: 4\nGeneral (2):");
    expect(closed).toContain("Badges (1):\n- a blue badge\nKeys (1):\n- a brass key");
    expect(closed).not.toContain("folded card");
    expect(closed).not.toMatch(/Private|Unrevealed/);
    expect(JSON.stringify(state)).toBe(serialized);
    state.itemState.openItems[caseItem.id] = true;
    expect(inventoryText(state)).toContain("  - a folded card");
    expect(inventoryText(state)).toContain("Total: 4\nGeneral (2):");
    const { container } = render(<InventoryTree state={state} inventoryItems={[caseItem, gauge]} />);
    expect(container.textContent).toContain("a folded card");
    expect(container.textContent).toContain("a gauge showing 0 (which is on)");
    const tote = render(<QuantumTotePanel state={state} inventoryItems={[caseItem, gauge]} />);
    for (const label of ["General 2", "Badges 1", "Keys 1"]) {
      expect(tote.getByRole("tab", { name: label })).toBeDefined();
    }
    expect(tote.getByText("Total: 4")).toBeDefined();
  });

  it("keeps worn-only items and nested contents outside category totals, as the tote does", () => {
    const band = item("PrivateWornOnlyId", "cloth headband", { isWearable: true, clothingSlot: "head" });
    const state = fixture([band]);
    state.player.inventory = { general: [], badges: [], keys: [] };
    state.itemState.wornByPlayer.head = band.id;
    const response = inventoryText(state);
    expect(response).toContain("Total: 0\nGeneral (0):\n  None.\nBadges (0):\n  None.\nKeys (0):\n  None.");
    expect(response).toContain("Equipped:\n- a cloth headband (worn on your head)");
    const tote = render(<QuantumTotePanel state={state} inventoryItems={[]} />);
    expect(tote.getByText("Total: 0")).toBeDefined();
    state.player.inventory.general.push("PrivateMissingDefinition");
    expect(inventoryText(state)).toContain("Total: 1\nGeneral (1):");
    expect(inventoryText(state)).not.toContain("PrivateMissingDefinition");
  });

  it("uses existing command categorization when badges and keys are acquired or removed", async () => {
    const badge = item("PrivateBadgeId", "blue badge", { meta: { kind: "security-badge" } });
    const key = item("PrivateKeyId", "brass key", { meta: { kind: "key" } });
    const initial = fixture([badge, key]);
    initial.player.inventory = { general: [], badges: [], keys: [] };
    const controller = await session(initial);
    await controller.explorer.command("take blue badge");
    await controller.explorer.command("take brass key");
    const response = text(await controller.explorer.command("i"));
    expect(response).toContain("Total: 2\nGeneral (0):\n  None.\nBadges (1):\n- a blue badge\nKeys (1):\n- a brass key");
    await controller.explorer.command("drop blue badge");
    const after = text(await controller.explorer.command("inv"));
    expect(after).toContain("Total: 1\nGeneral (0):\n  None.\nBadges (0):\n  None.\nKeys (1):");
  });

  it("uses human liquid labels and never substitutes missing definitions with IDs", () => {
    const flask = item("PrivateFlaskId", "glass flask", { isContainer: true });
    const liquid = item("PrivateLiquidId", "spring water", { itemClass: "liquid", meta: { liquid: { frozenName: "clear ice" } } });
    const state = fixture([flask, liquid]);
    state.player.inventory.general = [flask.id, "PrivateMissingId"];
    state.itemState.containerFilled[flask.id] = [liquid.id];
    expect(inventoryText(state)).toContain("filled with spring water");
    state.itemState.frozenItems[liquid.id] = true;
    expect(inventoryText(state)).toContain("filled with clear ice");
    expect(inventoryText(state)).not.toMatch(/Private|Unrevealed/);
  });

  it("reports existing status readings and diagnostics without ticking hazards", async () => {
    const controller = await session();
    const spy = vi.spyOn(engine, "handleCommand");
    for (const input of ["status", "diagnose"]) {
      const response = text(await controller.explorer.command(input));
      expect(response).toContain("Health: 100%");
      expect(response).toContain("Oxygen: 100%");
      expect(response).toContain("Temperature: 98.6°F");
      expect(response).toContain("Brain waves: Normal");
      expect(response).toContain("Effects: None.");
      expect(response).toContain("Moves: 0");
    }
    expect((await spy.mock.results[1].value).player.vitals).toEqual(spy.mock.calls[0][0].player.vitals);
    await controller.explorer.command("wait");
    const after = text(await controller.explorer.command("status"));
    expect(after).toContain("Moves: 1");
    expect(spy.mock.calls[3][0].moves).toBe(spy.mock.calls[2][0].moves + 1);
  });

  it("projects changed vitals using diagnostic thresholds without exposing hidden progression", () => {
    const state = fixture();
    state.player.vitals = { ...state.player.vitals, health: 72.4, oxygen: 43.2, temperature: 94, brainActivity: 3, theSickness: 1600 };
    state.player.statusEffects.push({ id: "syndrome x", intensity: 1 }, { id: "radiation", intensity: 25 }, { id: "PrivateUnknownEffect" as StatusEffect["id"], intensity: 678, remainingTurns: 987 });
    const before = JSON.stringify(state);
    const response = statusText(state);
    expect(response).toContain("Health: 72%");
    expect(response).toContain("Oxygen: 43%");
    expect(response).toContain("Temperature: 94.0°F");
    expect(response).toContain("Radiation: 25 mSv");
    expect(response).toContain("Syndrome X: Mild photopsia");
    expect(response).toContain("Unidentified effect: No detailed diagnostic");
    expect(response).not.toMatch(/theSickness|1600|remainingTurns|987|678|PrivateUnknownEffect/);
    expect(JSON.stringify(state)).toBe(before);
  });

  it("preserves the browser's unrevealed diagnosis and updates it only after an engine turn", async () => {
    const initial = fixture();
    initial.player.vitals.theSickness = 1701;
    initial.player.statusEffects = [{ id: "syndrome x", intensity: 1 }];
    const before = statusText(initial);
    expect(before).toContain("Syndrome X: ???");
    const { container } = render(<StatusTab gameState={initial} />);
    expect(container.textContent).toContain("Syndrome X???");
    const controller = await session(initial);
    const spy = vi.spyOn(engine, "handleCommand");
    for (const input of ["status", "inventory", "help"]) {
      await controller.explorer.command(input);
    }
    expect((await spy.mock.results[2].value).player.vitals.theSickness).toBe(1701);
    await controller.explorer.command("wait");
    const after = text(await controller.explorer.command("diagnose"));
    expect(after).toContain("Syndrome X: Mild photopsia");
    expect(after).toContain("Moves: 1");
    expect(after).not.toMatch(/1700|1701|theSickness|remainingTurns/);
  });

  it("reads the full authorized starting note, logs and discards it exactly once", async () => {
    const controller = await session();
    const spy = vi.spyOn(engine, "handleCommand");
    await controller.explorer.command("take paper");
    const response = text(await controller.explorer.command("read paper"));
    const definition = spy.mock.calls[1][0].world.items.find(i => i.id === "MysteriousNote")!;
    expect(response).toContain(`mysterious note\n\n${definition.readableText as string}`);
    expect(response).toContain("You log the message for future reference, then discard the original.");
    expect(response).toContain("Moves: 2");
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    const again = text(await controller.explorer.command("read paper"));
    expect(again).toContain("There's nothing to read.");
    expect(again).not.toContain("You log the message");
    const next = spy.mock.calls[2][0];
    expect(next.player.log).toHaveLength(1);
    expect(next.itemState.itemRoomId.MysteriousNote).toBe("unknown");
    expect(next.player.inventory.general).not.toContain("MysteriousNote");
    expect(next.uiState.notifications.filter(n => n.kind === "log")).toHaveLength(0);
    expect(response.indexOf("> read paper")).toBeLessThan(response.indexOf("Notes:"));
    expect(response.indexOf("Notes:")).toBeLessThan(response.indexOf("You log the message"));
  });

  it("does not reveal remote or closed-container documents and preserves attempted read costs", async () => {
    const locked = item("PrivateClosedCaseId", "sealed case", { isContainer: true, isOpenable: true });
    const note = item("PrivateUnreadNoteId", "hidden card", { isReadable: true, readableText: "Private inaccessible solution", location: "PrivateClosedCaseId" });
    const remote = item("PrivateRemoteNoteId", "remote card", { isReadable: true, readableText: "Private remote solution", location: "HydroponicsPlatform" });
    const initial = fixture([locked, note, remote]);
    initial.player.inventory.general.push(locked.id);
    initial.itemState.containerContents[locked.id] = [note.id];
    const controller = await session(initial);
    for (const input of ["read remote card", "read hidden card"]) {
      const response = text(await controller.explorer.command(input));
      expect(response).toContain("There's nothing to read.");
      expect(response).not.toMatch(/Private|solution/);
    }
    expect(text(await controller.explorer.command("status"))).toContain("Moves: 2");
    await controller.explorer.command("open sealed case");
    expect(text(await controller.explorer.command("i"))).toContain("hidden card");
    expect(text(await controller.explorer.command("read hidden card"))).toContain("Private inaccessible solution");
  });

  it("completes one-time gossip effects after reading and permits repeat nonconsuming reads", async () => {
    const note = item("PrivateGossipNoteId", "bulletin", {
      itemCategory: "scenery", isReadable: true, readableText: "Meet after shift.",
      containsTea: [{ id: "PrivateTeaId", title: "Meeting", summary: "A secret meeting.", tags: [], type: "gossip" }],
    });
    const controller = await session(fixture([note]));
    const spy = vi.spyOn(engine, "handleCommand");
    expect(text(await controller.explorer.command("scan bulletin"))).toContain(GOSSIP_NOTIFICATION_TEXT);
    const again = text(await controller.explorer.command("read bulletin"));
    expect(again).toContain("Meet after shift.");
    expect(again).not.toContain(GOSSIP_NOTIFICATION_TEXT);
    await controller.explorer.command("wait");
    const next = spy.mock.calls[2][0];
    expect(next.player.spiltTea).toHaveLength(1);
    expect(next.uiState.notifications.filter(n => n.kind === "gossip")).toHaveLength(0);
    expect(again).not.toMatch(/PrivateTeaId|PrivateGossipNoteId|containsTea|sourceItemId/);
  });

  it("preserves optional reader narration once without creating graphical notification state", async () => {
    const expectedMessage = "You put the page down.";
    const spy = vi.spyOn(engine, "handleCommand").mockImplementationOnce(async (...args) => {
      const next = await realExecute(...args);
      const overlay = useUIOverlayStore.getState().overlay;
      if (overlay.kind !== "reader") throw new Error("Expected reader");
      useUIOverlayStore.getState().openOverlay({ ...overlay, postCloseMessage: expectedMessage });
      return next;
    });
    const controller = await session();
    const response = text(await controller.explorer.command("read paper"));
    expect(response.match(/You put the page down\./g)).toHaveLength(1);
    const engineState = await spy.mock.results[0].value;
    expect(response.match(/You log the message for future reference/g)).toHaveLength(1);
    await controller.explorer.command("look");
    const actual = spy.mock.calls[1][0];
    expect(actual.log).toEqual([...engineState.log, expectedMessage]);
    expect(actual.player).toEqual(engineState.player);
    expect(actual.uiState).toEqual(engineState.uiState);
    expect(text(await controller.explorer.command("look"))).not.toContain(expectedMessage);
  });

  it("returns authored help without debugging instructions and continues ordinary gameplay", async () => {
    const controller = await session();
    const response = text(await controller.explorer.command("help"));
    expect(response).toContain(buildHelpText("authored"));
    expect(response).toContain("Sibyl");
    expect(response).toContain("read: Read the contents of notes");
    expect(response).toContain("ask robot why it's missing a limb");
    expect(response).toContain("Moves: 0");
    expect(response).not.toMatch(/iljio|developerMode|debugging|Test items granted/i);
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
    expect(text(await controller.explorer.command("wait"))).toContain("Moves: 1");
  });

  it.each(["inventory", "status", "help", "read paper"])("honors engine death restrictions for %s", async input => {
    const initial = fixture();
    initial.worldState.gameOver = { atMove: 0, cause: "test", message: "You are dead." };
    const controller = await session(initial);
    const response = text(await controller.explorer.command(input));
    expect(response).not.toMatch(/Inventory\n|Health:|WELCOME!|Notes:|You log the message/);
    expect(response).toContain("Moves: 0");
    expect(useUIOverlayStore.getState().overlay.kind).toBe("none");
  });

  it("keeps information in ordered JSONL observations across reset/restart without leaking payloads", async () => {
    const controller = await session();
    const inputs = ["i", "status", "read paper", "help", "ILJIO"];
    const responses = [];
    for (const input of inputs) responses.push(await controller.explorer.command(input));
    await controller.reset();
    expect(text(await controller.explorer.command("read paper"))).toContain("Notes:");
    await controller.explorer.command("restart");
    expect(text(await controller.explorer.command("i"))).not.toContain("worn on");
    await controller.dispose();
    const records: TranscriptEntry[] = (await fs.readFile(controller.transcript().path, "utf8")).trim().split("\n").map(line => JSON.parse(line));
    expect(records.slice(1, 6).map(record => record.input)).toEqual(inputs);
    expect(records.slice(1, 6).map(record => record.observation)).toEqual(responses);
    expect(records.map(record => record.sequence)).toEqual(records.map((_, index) => index + 1));
    expect(records.at(-1)?.kind).toBe("end");
    expect(JSON.stringify(records)).not.toMatch(/MysteriousNote|StairWellSeven|sourceItemId|postCloseNotifications|itemState|theSickness|remainingTurns|developerMode/);
  });
});

it("demonstrates all four information commands through the real Node CLI", async () => {
  const { stdout, stderr } = await new Promise<{ stdout: string; stderr: string }>((resolveOutput, reject) => {
    const child = execFile(process.execPath, [resolve("scripts/play-headless.mjs")], { timeout: 20_000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolveOutput({ stdout, stderr });
    });
    child.stdin!.end("inventory\nexamine dead man\ninv\nstatus\nread paper\nhelp\nwait\n:transcript\n:quit\n");
  });
  expect(stderr).toBe("");
  expect(stdout).toContain("Inventory\nTotal: 1\nGeneral (1):");
  expect(stdout).toContain("- a little timer");
  expect(stdout).toContain("Health: 100%");
  expect(stdout).toContain("Notes:");
  expect(stdout).toContain("WELCOME!");
  expect(stdout).toContain("Moves: 3");
  expect(stdout).not.toMatch(/MysteriousNote|StairWellSeven|sourceItemId|Error:/);
}, 30_000);
