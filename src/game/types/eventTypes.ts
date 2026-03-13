import type { GameState } from "@game/types/gameTypes";

export type ScriptContext = {
  commandDirect?: string;
  commandText?: string;
  commandVerb?: string;
  fromRoomId?: string;
  kind: "onEnterRoom" | "onTurnEnd" | "onCommand";
  roomId?: string;
};

export type ScriptedEvent = {
  id: string;
  once?: boolean; // default true
  run: (state: GameState, ctx: ScriptContext) => GameState;
  when: (state: GameState, ctx: ScriptContext) => boolean;
};
