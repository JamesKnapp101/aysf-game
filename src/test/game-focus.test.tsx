import { Game } from "@game/Game";
import { fireEvent, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

async function renderStartedGame() {
  const user = userEvent.setup();
  const rendered = render(<Game />);
  const view = within(rendered.container);

  await user.click(await view.findByRole("button", { name: /continue/i }));

  await waitFor(() => {
    expect(rendered.container.querySelector(".game-input")).toBeTruthy();
  });
  await waitFor(() => {
    expect(view.getByLabelText("CHAT")).not.toBeDisabled();
  });

  return { ...rendered, user };
}

describe("prompt focus handling", () => {
  it("renders map outside the room description with a compass overlay", async () => {
    const { container } = await renderStartedGame();
    const roomPanel = container.querySelector(".game-room-panel");
    const telemetryPanel = container.querySelector(".game-telemetry-panel");

    expect(container.querySelector(".game-quadrant-grid")).toBeTruthy();
    expect(roomPanel).toBeTruthy();
    expect(telemetryPanel).toBeTruthy();
    expect(roomPanel?.querySelector(".ship-map-panel")).toBeNull();
    expect(roomPanel?.querySelector(".room-compass")).toBeNull();
    expect(telemetryPanel?.querySelector(".ship-map-panel")).toBeTruthy();
    expect(telemetryPanel?.querySelector(".game-map-compassOverlay")).toBeTruthy();
    expect(telemetryPanel?.querySelector(".room-compass")).toBeTruthy();
    expect(container.querySelector(".room-diagnostics")).toBeNull();
    expect(
      container.querySelector(".game-sidebar .room-compass-float"),
    ).toBeNull();
  });

  it("returns focus to the command line when the room description is clicked from Comet", async () => {
    const { container } = await renderStartedGame();
    const gameInput = container.querySelector(".game-input") as HTMLInputElement;
    const cometInput = within(container).getByLabelText("CHAT");
    const roomPanel = container.querySelector(".game-room-panel");

    expect(roomPanel).toBeTruthy();

    (cometInput as HTMLInputElement).focus();
    fireEvent.focus(cometInput);
    expect(document.activeElement).toBe(cometInput);

    fireEvent.click(roomPanel as HTMLElement);
    expect(document.activeElement).toBe(gameInput);
  });

  it("returns focus to the command line when the transcript is clicked from Comet", async () => {
    const { container } = await renderStartedGame();
    const gameInput = container.querySelector(".game-input") as HTMLInputElement;
    const cometInput = within(container).getByLabelText("CHAT");
    const logPanel = container.querySelector(".game-log-panel");

    expect(logPanel).toBeTruthy();

    (cometInput as HTMLInputElement).focus();
    fireEvent.focus(cometInput);
    expect(document.activeElement).toBe(cometInput);

    fireEvent.click(logPanel as HTMLElement);
    expect(document.activeElement).toBe(gameInput);
  });
});
