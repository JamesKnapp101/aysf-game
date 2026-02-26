import { queueAfterRoomDescription } from "@game/helpers/gameHelpers";
import { moveItemToRoom } from "@game/helpers/itemHelpers";
import { ScriptedEvent } from "@game/types/eventTypes";

export const SCRIPTED_EVENTS: ScriptedEvent[] = [
  {
    id: "cat_meet",
    when: (state, ctx) =>
      ctx.kind === "onEnterRoom" && ctx.roomId === "LevelThreeCorridorSeven",
    run: (state, ctx) => {
      const roomId = ctx.roomId!;
      let next = state;

      next = queueAfterRoomDescription(
        next,
        "As you enter the room, you see a small, black and white short-haired cat come squirming out from the small opening to the north. It shakes its head rapidly, scatting dust, then looks up at you.",
      );

      next = moveItemToRoom(next, "cat", roomId);
      return next;
    },
  },
];
