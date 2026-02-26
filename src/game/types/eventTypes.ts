import { GameState } from "@game/types/gameTypes";

export type ScriptContext = {
  kind: "onEnterRoom" | "onTurnEnd" | "onCommand";
  roomId?: string;
  fromRoomId?: string;
  commandText?: string;
};

export type ScriptedEvent = {
  id: string;
  once?: boolean; // default true
  when: (state: GameState, ctx: ScriptContext) => boolean;
  run: (state: GameState, ctx: ScriptContext) => GameState;
};
