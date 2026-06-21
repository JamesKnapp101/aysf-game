import { queueAfterRoomDescription } from "@game/helpers/gameHelpers";
import type { ScriptedEvent } from "@game/types/eventTypes";

export const ENGINEERING_CORRIDOR_FIRST_ENTRY_EVENT_ID =
  "level_five_engineering_corridor_first_entry";

export const ENGINEERING_CORRIDOR_FIRST_ENTRY_MESSAGE =
  "As you move into the weak wash of stairwell light, you sense something shifting in the deeper darkness both north and south. The sounds stop almost as soon as you notice them.";

export const levelFiveScriptedEvents: ScriptedEvent[] = [
  {
    id: ENGINEERING_CORRIDOR_FIRST_ENTRY_EVENT_ID,
    when: (state, ctx) =>
      ctx.kind === "onEnterRoom" &&
      ctx.roomId === "EngCorridorOne" &&
      !state.worldState.visitedRooms.EngCorridorOne &&
      !state.worldState.powerRestoredSections["lights-level-five"],
    run: (state) =>
      queueAfterRoomDescription(
        state,
        ENGINEERING_CORRIDOR_FIRST_ENTRY_MESSAGE,
      ),
  },
];
