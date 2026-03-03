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
  {
    id: "parkbot_meet",
    when: (state, ctx) =>
      ctx.kind === "onEnterRoom" && ctx.roomId === "ParkEntrance",
    run: (state, ctx) => {
      let next = state;

      next = queueAfterRoomDescription(
        next,
        `As you approach the entrance, a figure standing absolutely still in front of the doors suddenly moves. It's a humanoid robot, a little shorter than you, with a stocky chassis, and dressed in the uniform of a Park Ranger. The robot lifts its head, revealing only smooth glass where the face would be, then it flickers, and a man's face appears. The face smiles, and the robot raises one arm to give you a wave.\n\n"Hey, friend! Come to enjoy the park?" it asks. "No charge, you'll just need a valid park pass to enter."`,
      );
      return next;
    },
  },
  {
    id: "l3warehouse_visit",
    when: (state, ctx) =>
      ctx.kind === "onEnterRoom" && ctx.roomId === "L3Warehouse",
    run: (state, ctx) => {
      let next = state;

      next = queueAfterRoomDescription(
        next,
        `When you first step into the room you hear something stir off toward the east side of the warehouse, followed by a soft click, then silence again.`,
      );
      return next;
    },
  },
];
