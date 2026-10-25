import { abortActiveExperience, startExperience, tickActiveExperience } from "@game/experiences/experienceRegistry";
import type { GameState } from "@game/types/gameTypes";
import { createTestState, addInventoryItems } from "./gameTestHelpers";

/** Acquire the three actual authored topics through their existing collection hooks. */
export function nailBotFixture(): GameState {
  let state = createTestState({ roomId: "NailSalon" });
  const journal = state.world.items.find(item => item.id === "GimThreeJournal")!;
  state = { ...state, player: { ...state.player, spiltTea: journal.containsTea! } };
  state = startExperience(state, "halved_corpse_memory").state;
  state = tickActiveExperience({ ...state, moves: state.moves + 1 }).state;
  state = abortActiveExperience(state).state;
  state = startExperience(state, "steam_room_guy_memory").state;
  state = tickActiveExperience({ ...state, moves: state.moves + 1 }).state;
  state = tickActiveExperience({ ...state, moves: state.moves + 1 }).state;
  state = abortActiveExperience(state).state;
  state = { ...state, player: { ...state.player, roomId: "NailSalon" }, world: { ...state.world, meta: { loadedChunkIds: ["level-three", "level-six", "stairwell"] } } };
  return addInventoryItems(state, ["ManiPediVoucher"]);
}
