import { getLockerModels, LOCKER_COUNT, lockerFoundText, openLocker, type LockerType } from "../rules/lockers";
import { reactorTerminalRules } from "../registries/terminalRuleRegistry";
import { activatePowerSwitch, buildInitialSwitchStates, getBreadcrumbText, getListItems, getNodeStatus, isBackNode, isMenu, POWER_GRID_ROOT, statusText, stripParenNotes, synchronizePowerTerminal, type Breadcrumb } from "../rules/powerStationTerminal";
import type { SwitchStates } from "../types/itemTypes";
import { prepareTerminalTeleport, terminalDestinations, MARQUEE_MESSAGE } from "../rules/teleportationTerminal";
import { useUIEffectsStore } from "../store/store";
import { reconcileObjectives } from "../rules/objectives";
import type { GameState } from "../types/gameTypes";
import type { Overlay } from "../types/uiTypes";
import { closeHeadlessOverlay } from "./simpleOverlays";

export function supportsTerminalOverlay(kind: Overlay["kind"]): boolean {
  return kind === "mens-lockers" || kind === "womens-lockers" || kind === "reactor-control-terminal" || kind === "power-station-terminal" || kind === "teleportation-terminal";
}

/** Per-mount presentation state, cleared on reset/dispose and a different mount. */
export function createTerminalOverlayAdapter() {
  let mounted: Overlay | undefined;
  let foundItemIds: string[] = [];
  let reactorMessage = reactorTerminalRules.initialMessage;
  let powerPath: Breadcrumb[] = [{ node: POWER_GRID_ROOT, selectedIndex: 0 }];
  let powerSwitches: SwitchStates = {};

  function reset() {
    mounted = undefined; foundItemIds = []; reactorMessage = reactorTerminalRules.initialMessage;
    powerPath = [{ node: POWER_GRID_ROOT, selectedIndex: 0 }]; powerSwitches = {};
  }
  function open(state: GameState, overlay: Overlay): GameState {
    if (mounted === overlay) return state;
    reset(); mounted = overlay;
    if (overlay.kind === "power-station-terminal") {
      powerSwitches = buildInitialSwitchStates(state.worldState);
      return reconcileObjectives(state, synchronizePowerTerminal(state, powerSwitches));
    }
    return state;
  }
  function presentation(state: GameState, overlay: Overlay): string {
    state = open(state, overlay);
    if (overlay.kind === "teleportation-terminal") {
      return ["OMNI JAUNT", "POINT TO POINT TRANSIT", "TRANSLOCATION TERMINAL", "RING DESTINATION MATRIX", MARQUEE_MESSAGE,
        ...terminalDestinations(state).map((destination, index) => `${index + 1}. ${destination.ringLabel}: ${destination.online ? "ONLINE" : "OFFLINE"} — ${destination.label}`),
        "SELECT A DESTINATION ON ANY ONLINE RING.", "Use select <number> to select a displayed destination, or close.",
      ].join("\n");
    }
    if (overlay.kind === "power-station-terminal") {
      const current = powerPath[powerPath.length - 1];
      return [current.node.label, getBreadcrumbText(powerPath),
        ...getListItems(current.node, powerPath.length).map((item, index) => `${index + 1}. ${isBackNode(item) ? "BACK" : isMenu(item) ? item.label : `${stripParenNotes(item.label)}: ${statusText(getNodeStatus(item, powerSwitches))}`}`),
        "Use select <number> to open/toggle a displayed row; back or close.",
      ].join("\n");
    }
    if (overlay.kind === "reactor-control-terminal") {
      const view = reactorTerminalRules.view(state);
      return [
        "AENEAS REACTOR CONTROL", "CORE AUTHORITY // ETHICS DIVISION",
        ...(view.authenticated ? ["ETHICS CREDENTIAL: ACCEPTED", `ENGINE ROOM KEY: ${view.keyStatus}`, `REACTOR CORE: ${view.coreStatus}`]
          : ["PASSWORD", "Use authenticate <password> to AUTHENTICATE."]),
        ...view.controls.filter(control => control !== "authenticate").map(control => control === "insert" ? "Use insert: INSERT ENGINE ROOM KEY" : control === "turn" ? "Use turn: TURN AUTHORIZATION KEY" : "Use restart: RESTART REACTOR CORE"),
        ...(view.coreStatus === "ONLINE" ? ["REACTOR CORE ONLINE"] : []),
        reactorMessage, "Use close: EXIT TERMINAL",
      ].join("\n");
    }
    const type: LockerType = overlay.kind === "mens-lockers" ? "men" : "women";
    if (foundItemIds.length) return ["Locker contents", ...foundItemIds.map(id => lockerFoundText(state, id)), "Use ok to dismiss, or close."].join("\n");
    return [
      type === "men" ? "MEN'S LOCKERS" : "WOMEN'S LOCKERS",
      "Click a locker to try it.",
      ...getLockerModels(state, type).map(locker => `Locker ${locker.idx}: ${locker.opened ? "opened" : "closed"}`),
      `Use open <number> (1–${LOCKER_COUNT}) to try a locker, or close.`,
    ].join("\n");
  }
  async function command(state: GameState, overlay: Overlay, input: string) {
    state = open(state, overlay);
    const text = [`> ${input}`];
    if (/^close$/i.test(input.trim())) {
      const closed = closeHeadlessOverlay(state, overlay);
      reset();
      return { state: closed.state, text: [...text, "You close the interface.", ...closed.text] };
    }
    if (overlay.kind === "teleportation-terminal") {
      const selected = /^select (\d{1,2})$/i.exec(input.trim());
      const destination = selected ? terminalDestinations(state)[Number(selected[1]) - 1] : undefined;
      if (destination?.online) {
        const prepared = await prepareTerminalTeleport(state, destination.ringId, destination.roomId);
        const result = prepared.complete(state);
        let next = reconcileObjectives(state, result.state, { fromRoomId: state.player.roomId, toRoomId: result.state.player.roomId });
        text.push(...result.messages);
        if (result.teleported) {
          useUIEffectsStore.getState().triggerTeleportFlash();
          const closed = closeHeadlessOverlay(next, overlay);
          next = closed.state;
          text.push(...closed.text);
          reset();
          return { state: next, text };
        }
        return { state: next, text: [...text, presentation(next, overlay)] };
      }
      return { state, text: [...text, presentation(state, overlay)] };
    }
    if (overlay.kind === "power-station-terminal") {
      const current = powerPath[powerPath.length - 1];
      const rows = getListItems(current.node, powerPath.length);
      const selected = /^select (\d{1,2})$/i.exec(input.trim());
      const index = selected ? Number(selected[1]) - 1 : -1;
      const item = rows[index];
      if (/^back$/i.test(input.trim()) || (item && isBackNode(item))) {
        if (powerPath.length > 1) powerPath = powerPath.slice(0, -1);
      } else if (item && !isBackNode(item)) {
        powerPath = powerPath.map((crumb, i) => i === powerPath.length - 1 ? { ...crumb, selectedIndex: index } : crumb);
        if (isMenu(item)) powerPath = [...powerPath, { node: item, selectedIndex: 0 }];
        else powerSwitches = activatePowerSwitch(item, powerSwitches);
      }
      const next = reconcileObjectives(state, synchronizePowerTerminal(state, powerSwitches));
      return { state: next, text: [...text, presentation(next, overlay)] };
    }
    if (overlay.kind === "reactor-control-terminal") {
      const authentication = /^authenticate(?: (.*))?$/i.exec(input);
      const control = authentication ? "authenticate" : ["insert", "turn", "restart"].find(control => control === input.toLowerCase().trim()) as "insert" | "turn" | "restart" | undefined;
      if (control) {
        const result = reactorTerminalRules.operate(state, control, authentication?.[1] ?? "");
        if (result.message) reactorMessage = result.message;
        const next = reconcileObjectives(state, result.state);
        return { state: next, text: [...text, presentation(next, overlay)] };
      }
      return { state, text: [...text, presentation(state, overlay)] };
    }
    if (foundItemIds.length) {
      if (/^ok$/i.test(input)) foundItemIds = [];
      return { state, text: [...text, presentation(state, overlay)] };
    }
    const selected = /^open (\d{1,2})$/i.exec(input);
    if (selected && Number(selected[1]) >= 1 && Number(selected[1]) <= LOCKER_COUNT) {
      const result = openLocker(state, overlay.kind === "mens-lockers" ? "men" : "women", Number(selected[1]));
      foundItemIds = result.foundItemIds;
      const next = reconcileObjectives(state, result.state);
      return { state: next, text: [...text, ...(result.message ? [result.message] : []), presentation(next, overlay)] };
    }
    return { state, text: [...text, presentation(state, overlay)] };
  }
  return { open, presentation, command, reset };
}
