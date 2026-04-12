import { Game } from "@game/Game";
import { createFreshGameState } from "@game/gameInit";
import { saveResumeSnapshot } from "@game/persistence/resumeStorage";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

describe("game startup splash", () => {
  it("shows the opening splash for a fresh session", async () => {
    render(<Game />);

    expect(await screen.findByText(/you dream of falling\./i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
  });

  it("skips the opening splash when resuming a saved session", async () => {
    const resumedState = await createFreshGameState();
    const roomName =
      resumedState.world.rooms.find((room) => room.id === resumedState.player.roomId)
        ?.name ?? "Unknown Location";

    saveResumeSnapshot(resumedState);

    render(<Game />);

    expect(
      await screen.findByText(roomName, { selector: ".game-header-location" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/you dream of falling\./i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /continue/i })).not.toBeInTheDocument();
  });

  it("shows the opening splash again after restart", async () => {
    const user = userEvent.setup();
    const { container } = render(<Game />);

    await user.click(await screen.findByRole("button", { name: /continue/i }));

    const input = container.querySelector(".game-input");

    expect(input).not.toBeNull();

    await user.type(input as HTMLInputElement, "restart{enter}");

    expect(await screen.findByText(/you dream of falling\./i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
  });
});
