import { doGive } from "@game/actions/give/give";
import type { Item } from "@game/types/itemTypes";
import { parseCommand } from "../parse/parser";
import { describe, expect, it } from "vitest";
import {
  createTestState,
  expectInventoryToContain,
  runCommand,
  setInventory,
} from "./helpers/gameTestHelpers";

function createGiveState() {
  return setInventory(createTestState({ roomId: "ParkEntrance" }), ["ParkPass"]);
}

describe("give recipient overrides", () => {
  it("uses Ranger Rick's refusal when giving the robot a pass", async () => {
    const next = await runCommand(createGiveState(), "give pass to robot");

    expect(next.log.join("\n")).toContain("I'll scan your pass as you enter");
    expect(next.log.join("\n")).not.toContain("does not seem interested");
    expect(expectInventoryToContain(next, "ParkPass")).toBe(true);
  });

  it.each(["string", "result", "undefined"] as const)(
    "handles a function override returning %s",
    (returnType) => {
      let state = createGiveState();
      const updatedState = { ...state, rng: () => 0.5 };
      const override = ({ state: current, item }: { state: typeof state; item: Item }) => {
        expect(current).toBe(state);
        expect(item.id).toBe("RangerBot");
        if (returnType === "string") return "The robot declines.";
        if (returnType === "result") {
          return { state: updatedState, message: "The robot declines." };
        }
        return undefined;
      };
      state = {
        ...state,
        world: {
          ...state.world,
          items: state.world.items.map((item) =>
            item.id === "RangerBot"
              ? { ...item, overrides: { ...item.overrides, give: override } }
              : item,
          ),
        },
      };

      const result = doGive(state, parseCommand("give pass to robot"));

      expect(result.state).toBe(returnType === "result" ? updatedState : state);
      expect(result.message).toBe(
        returnType === "undefined"
          ? "Ranger Rick does not seem interested in the laminated pass."
          : "The robot declines.",
      );
    },
  );
});
