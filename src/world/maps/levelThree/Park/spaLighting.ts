import { getItemPlacementContext } from "@game/helpers/itemPlacement";
import { queueSpaLightsOffEncounter, SPA_ORGANISM_ID } from "./spaOrganism";
import { isSpaLightOn, setSpaLightOn } from "./spaLightState";
import { resolveItemByNoun } from "@game/rules/scope";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { Item, ItemCommandOverrideContext } from "@game/types/itemTypes";
import type { ParsedCommand } from "@game/types/parserTypes";

export { isSpaLightOn } from "./spaLightState";

/** Visibility from the doorway is derived; the creature's presence takes priority. */
export function isSaunaDimlyLit(state: GameState): boolean {
  const organismRoom = getItemPlacementContext(state, SPA_ORGANISM_ID).roomId ?? "Sauna";
  const cedarDoor = state.worldState.doors.CedarDoor;
  const open = cedarDoor?.isOpen ?? state.world.doors.find(door => door.id === "CedarDoor")?.initiallyOpen ?? false;
  return organismRoom !== "Sauna" && isSpaLightOn(state) && open;
}

export function getSpaAmbientLight(state: GameState, roomId: string) {
  if (roomId === "Spa" || roomId === "SteamRoom") {
    const on = isSpaLightOn(state);
    return { visible: on, physical: on };
  }
  // Faint spill permits exploration but is not immobilizing illumination.
  if (roomId === "Sauna") return { visible: isSaunaDimlyLit(state), physical: false };
  return undefined;
}

function switchSpaLights({ state, cmd }: ItemCommandOverrideContext): ActionResult {
  const wasOn = isSpaLightOn(state);
  const on = cmd.preposition === "on" ? true : cmd.preposition === "off" ? false : !wasOn;
  if (on === wasOn) return { state, message: `The light is already ${on ? "on" : "off"}.` };
  const next = setSpaLightOn(state, on);
  return {
    state: on ? next : queueSpaLightsOffEncounter(next),
    message: `You turn the Spa lights ${on ? "on" : "off"}.`,
  };
}

export const spaLightSwitch: Item = {
  id: "SpaLightSwitch", name: "light switch", location: "Spa",
  description: "A plain light switch is mounted on the east wall beside the exit to the park. Its rocker is in the ON position.",
  describe: state => `A plain light switch is mounted on the east wall beside the exit to the park. Its rocker is in the ${isSpaLightOn(state) ? "ON" : "OFF"} position.`,
  vocab: ["switch", "lightswitch", "light switch", "rocker"],
  itemClass: "solid", itemCategory: "scenery", itemWeight: 0, itemSize: 0,
  isSwitchable: true,
  overrides: { switch: switchSpaLights, turn: switchSpaLights },
};

function isSpaLightCommand(state: GameState, cmd: ParsedCommand): boolean {
  if (state.player.roomId !== "Spa" || cmd.type !== "action" ||
    !["flip", "switch", "turn"].includes(cmd.verb) || cmd.indirect ||
    (cmd.preposition && cmd.preposition !== "on" && cmd.preposition !== "off")) return false;
  const item = resolveItemByNoun(state, cmd.direct ?? "");
  return item?.id === "SpaLightSwitch" || item?.id === "SpaOverheadLight";
}

/** Only the Spa's fixtures acquire FLIP and light-name aliases. */
export function handleSpaLightCommand(state: GameState, cmd: ParsedCommand): ActionResult | undefined {
  if (cmd.type !== "action" || !isSpaLightCommand(state, cmd)) return undefined;
  return switchSpaLights({ state, item: spaLightSwitch, cmd });
}

export function getSpaDarkActionGuard(state: GameState, cmd: ParsedCommand) {
  if (state.player.roomId !== "Spa" || isSpaLightOn(state) || cmd.type !== "action" || isSpaLightCommand(state, cmd)) return undefined;
  // LOOK remains free, including rejected object inspections. Other rejected
  // in-world actions spend the ordinary unsuccessful-action turn.
  return { message: "It's too dark to do that. You can move or turn the Spa lights on.", consumesTurn: cmd.verb !== "look" };
}

/** Old snapshots may contain a standalone SteamRoom darkness flag. Its light
 * now follows the Spa through glass, so retain only the authoritative state. */
export function migrateSpaLightingSnapshot(state: GameState): GameState {
  if (!("SteamRoom" in state.worldState.darkRooms) && state.worldState.darkRooms.Sauna !== undefined) return state;
  const darkRooms: Record<string, boolean> = { ...state.worldState.darkRooms, Sauna: state.worldState.darkRooms.Sauna ?? true };
  delete darkRooms.SteamRoom;
  return { ...state, worldState: { ...state.worldState, darkRooms } };
}
