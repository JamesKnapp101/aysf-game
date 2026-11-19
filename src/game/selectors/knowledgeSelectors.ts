import type { GameState, JuicyTopic, PlayerLogEntry, PlayerTrivia } from "../types/gameTypes";

export type Discovery =
  | { kind: "text"; record: PlayerLogEntry }
  | { kind: "gossip"; record: JuicyTopic }
  | { kind: "trivia"; record: PlayerTrivia };

/** Text, gossip, trivia; acquisition order within each bank. Gossip has no timestamp. */
export function getDiscoveries(state: GameState): Discovery[] {
  return [
    ...state.player.log.map(record => ({ kind: "text" as const, record })),
    ...state.player.spiltTea.map(record => ({ kind: "gossip" as const, record })),
    ...state.player.trivia.map(record => ({ kind: "trivia" as const, record })),
  ];
}
