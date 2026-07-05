import { SidebarPanel } from "@game/components/SidebarPanel";
import {
  clearSidebarTabNotification,
  getSidebarTabSignatures,
  mergeSidebarTabNotifications,
} from "@game/helpers/sidebarTabNotifications";
import type { GameState } from "@game/types/gameTypes";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createTestState, setInventory } from "./helpers/gameTestHelpers";

function renderSidebar(
  state: GameState,
  options: {
    activeTab?: "inventory" | "status" | "objectives" | "log";
    notifications?: Parameters<typeof SidebarPanel>[0]["tabNotifications"];
  } = {},
) {
  return render(
    <SidebarPanel
      activeTab={options.activeTab ?? "status"}
      crtColor="#00ff00"
      setActiveTab={() => undefined}
      setCrtColor={() => undefined}
      state={state}
      tabNotifications={options.notifications}
    />,
  );
}

describe("sidebar tab notifications", () => {
  it("marks an inactive inventory tab when inventory changes", () => {
    const previousState = createTestState();
    const nextState = setInventory(previousState, ["ParkPass"]);

    const notifications = mergeSidebarTabNotifications({
      activeTab: "status",
      current: {},
      previousSignatures: getSidebarTabSignatures(previousState),
      nextSignatures: getSidebarTabSignatures(nextState),
    });

    expect(notifications.inventory).toBe(true);
  });

  it("does not mark the tab the player is currently viewing", () => {
    const previousState = createTestState();
    const nextState = setInventory(previousState, ["ParkPass"]);

    const notifications = mergeSidebarTabNotifications({
      activeTab: "inventory",
      current: {},
      previousSignatures: getSidebarTabSignatures(previousState),
      nextSignatures: getSidebarTabSignatures(nextState),
    });

    expect(notifications.inventory).toBeUndefined();
  });

  it("clears a notification when the player checks that tab", () => {
    const notifications = clearSidebarTabNotification(
      { inventory: true, log: true },
      "inventory",
    );

    expect(notifications.inventory).toBe(false);
    expect(notifications.log).toBe(true);
  });

  it("does not make status noisy for countdown-only status changes", () => {
    const baseState = createTestState();
    const previousState: GameState = {
      ...baseState,
      player: {
        ...baseState.player,
        statusEffects: [
          {
            id: "radiation",
            intensity: 12,
            remainingTurns: 6,
          },
        ],
      },
    };
    const nextState: GameState = {
      ...previousState,
      player: {
        ...previousState.player,
        statusEffects: [
          {
            id: "radiation",
            intensity: 12,
            remainingTurns: 5,
          },
        ],
      },
    };

    expect(getSidebarTabSignatures(nextState).status).toBe(
      getSidebarTabSignatures(previousState).status,
    );
  });

  it("marks status when a vital crosses a meaningful band", () => {
    const previousState = createTestState();
    const nextState: GameState = {
      ...previousState,
      player: {
        ...previousState.player,
        vitals: {
          ...previousState.player.vitals,
          health: 40,
        },
      },
    };

    const notifications = mergeSidebarTabNotifications({
      activeTab: "log",
      current: {},
      previousSignatures: getSidebarTabSignatures(previousState),
      nextSignatures: getSidebarTabSignatures(nextState),
    });

    expect(notifications.status).toBe(true);
  });

  it("renders inactive updated tabs with a CRT notification marker", () => {
    renderSidebar(createTestState(), {
      activeTab: "status",
      notifications: { inventory: true },
    });

    const inventoryTab = screen.getByRole("button", {
      name: /inventory updated/i,
    });

    expect(inventoryTab).toHaveAttribute("data-notification", "true");
    expect(inventoryTab).toHaveClass("game-tab-notified");
  });

  it("does not render the notification marker on the active tab", () => {
    renderSidebar(createTestState(), {
      activeTab: "inventory",
      notifications: { inventory: true },
    });

    const inventoryTab = screen.getByRole("button", { name: /^inventory$/i });

    expect(inventoryTab).not.toHaveAttribute("data-notification");
    expect(inventoryTab).not.toHaveClass("game-tab-notified");
  });
});
