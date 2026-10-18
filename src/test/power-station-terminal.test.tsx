import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { PowerStationTerminalModal } from "@game/components/PowerStationTerminalModal";
import type { GameState } from "@game/types/gameTypes";
import { describe, expect, it } from "vitest";
import { createTestState } from "./helpers/gameTestHelpers";

function PowerStationHarness({ initialState }: { initialState: GameState }) {
  const [state, setState] = useState(initialState);

  return (
    <>
      <PowerStationTerminalModal
        onClose={() => undefined}
        state={state}
        setGameState={setState}
      />
      <div data-testid="yellow-network">
        {String(state.worldState.powerRestoredSections["teleport-pads-yellow"])}
      </div>
      <div data-testid="lights-level-five">
        {String(state.worldState.powerRestoredSections["lights-level-five"])}
      </div>
      <div data-testid="elevator-power">
        {String(state.worldState.powerRestoredSections.elevators)}
      </div>
    </>
  );
}

describe("Power station terminal", () => {
  it("shows elevator power and toggles it on and off", async () => {
    render(<PowerStationHarness initialState={createTestState()} />);
    await userEvent.click(screen.getByRole("option", { name: /level one/i }));
    expect(screen.getByTestId("elevator-power")).toHaveTextContent("false");
    expect(screen.getByRole("option", { name: /elevators/i })).toHaveTextContent("OFF");
    await userEvent.click(screen.getByRole("option", { name: /elevators/i }));
    expect(screen.getByTestId("elevator-power")).toHaveTextContent("true");
    expect(screen.getByRole("option", { name: /elevators/i })).toHaveTextContent("ON");
    await userEvent.click(screen.getByRole("option", { name: /elevators/i }));
    expect(screen.getByTestId("elevator-power")).toHaveTextContent("false");
  });
  it("can navigate to the teleportation menu and toggle teleporter power", async () => {
    render(<PowerStationHarness initialState={createTestState()} />);

    await userEvent.click(screen.getByRole("option", { name: /teleportation/i }));

    expect(screen.getByText(/Main Power Distribution \/ TELEPORTATION/i)).toBeInTheDocument();
    expect(screen.getByTestId("yellow-network")).toHaveTextContent("false");

    await userEvent.click(screen.getByRole("option", { name: /yellow network/i }));

    expect(screen.getByTestId("yellow-network")).toHaveTextContent("true");
  });

  it("can turn a normal power section on and off through the menu", async () => {
    render(<PowerStationHarness initialState={createTestState()} />);

    await userEvent.click(screen.getByRole("option", { name: /level five/i }));
    await userEvent.click(screen.getByRole("option", { name: /level five lights/i }));

    expect(screen.getByTestId("lights-level-five")).toHaveTextContent("true");

    await userEvent.click(screen.getByRole("option", { name: /level five lights/i }));

    expect(screen.getByTestId("lights-level-five")).toHaveTextContent("false");
  });
});
