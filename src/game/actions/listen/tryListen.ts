import { Moan } from "@game/engine/ticks/hydroponicsTick";
import { normalize } from "@game/rules/scope";
import "../../../styles/layout.css";
import { GameState } from "../../types/gameTypes";

const LISTENEE_ALIASES: Record<string, string[]> = {
  moan: ["sound", "weird sound", "eerie sound"],
};

export function resolveListenTopic(listenee: string) {
  const l = normalize(listenee);
  if (LISTENEE_ALIASES[l]) return l;
  for (const aliasKey of Object.keys(LISTENEE_ALIASES)) {
    if (LISTENEE_ALIASES[aliasKey].includes(l)) return aliasKey;
  }
  return l;
}

export function tryListen(
  state: GameState,
  listenee: string,
): { state: GameState; message: string } {
  const next: GameState = state;
  const playerLocation = state.player.roomId;
  let baseMsg = ``;

  if (resolveListenTopic(listenee) === "moan") {
    if (Object.keys(Moan).includes(playerLocation)) {
      if (state.worldState.hydroponicsSpider.isAlive) {
        if (state.worldState.hydroponicsSpider.turnsSinceLastBreath > 2) {
          baseMsg += `It's hard to identify what's causing it. It has a haunting, eerie quality, and sounds like some sort of wail or moan that echoes in an open space, but it could also be air passing through an opening, or many openings.`;
        } else {
          baseMsg += `You don't hear it right now.`;
        }
      } else {
        baseMsg += `You don't hear it anymore.`;
      }
    } else {
      baseMsg += `You can't hear it from where you are.`;
    }
  } else {
    baseMsg += `It doesn't make any sound.`;
  }

  return {
    state: next,
    message: baseMsg,
  };
}
