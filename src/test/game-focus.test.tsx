import { Game } from "@game/Game";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

async function renderStartedGame() {
  const user = userEvent.setup();
  const rendered = render(<Game />);

  await user.click(await screen.findByRole("button", { name: /continue/i }));

  await waitFor(() => {
    expect(rendered.container.querySelector(".game-input")).toBeTruthy();
  });
  await waitFor(() => {
    expect(screen.getByLabelText("CHAT")).not.toBeDisabled();
  });

  return { ...rendered, user };
}

describe("prompt focus handling", () => {
  it("returns focus to the command line when the room description is clicked from Comet", async () => {
    const { container, user } = await renderStartedGame();
    const gameInput = container.querySelector(".game-input") as HTMLInputElement;
    const cometInput = screen.getByLabelText("CHAT");
    const roomPanel = container.querySelector(".game-room-panel");

    expect(roomPanel).toBeTruthy();

    (cometInput as HTMLInputElement).focus();
    fireEvent.focus(cometInput);
    expect(document.activeElement).toBe(cometInput);

    await user.click(roomPanel as HTMLElement);
    expect(document.activeElement).toBe(gameInput);
  });

  it("returns focus to the command line when the transcript is clicked from Comet", async () => {
    const { container, user } = await renderStartedGame();
    const gameInput = container.querySelector(".game-input") as HTMLInputElement;
    const cometInput = screen.getByLabelText("CHAT");
    const logPanel = container.querySelector(".game-log-panel");

    expect(logPanel).toBeTruthy();

    (cometInput as HTMLInputElement).focus();
    fireEvent.focus(cometInput);
    expect(document.activeElement).toBe(cometInput);

    await user.click(logPanel as HTMLElement);
    expect(document.activeElement).toBe(gameInput);
  });
});
