import { ApiaryTerminalModal } from "@game/components/ApiaryTerminalModal";
import { RoomCompass } from "@game/components/Compass";
import { DNASampleTab } from "@game/components/DNASampleTab";
import { GamePreserveTerminalModal } from "@game/components/GamePreserveTerminalModal";
import { HydroponicsAdminTerminalModal } from "@game/components/HydroponicsAdminTerminalModal";
import { LogTab } from "@game/components/LogTab";
import { NotificationHost } from "@game/components/NotificationHost";
import { RadioFrequencyModal } from "@game/components/RadioFrequencyModal";
import { buildDamageNotification } from "@game/rules/notifications";
import { RoomStatusPanel } from "@game/components/RoomStatusPanel";
import { SidebarPanel } from "@game/components/SidebarPanel";
import { StatusTab } from "@game/components/StatusTab";
import { SyndromeXSignalOverlay } from "@game/components/SyndromeXSignalOverlay";
import { TeleportationTerminalModal } from "@game/components/TeleportationTerminalModal";
import { createInitialState } from "@game/gameInit";
import { useUIEffectsStore } from "@game/store/store";
import type { GameState } from "@game/types/gameTypes";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it } from "vitest";
import { INITIAL_WORLD } from "../world/World";
import {
  createTestState,
  runCommands,
  setInventory,
} from "./helpers/gameTestHelpers";
import {
  APIARY_TRAY_ITEM_ID,
} from "src/world/maps/levelFour/Apiary";
import { DEACTIVATED_BEE_ITEM_ID } from "src/world/maps/levelFour/Greenhouse";

function renderSidebarPanel(
  state: GameState,
  activeTab: "inventory" | "log" | "dna" | "status" = "inventory",
) {
  return render(
    <SidebarPanel
      state={state}
      crtColor="#00ff00"
      setCrtColor={() => undefined}
      activeTab={activeTab}
      setActiveTab={() => undefined}
    />,
  );
}

describe("UI panels", () => {
  it("shows picked-up items in the Inventory tab", async () => {
    const state = await runCommandInInventoryRoom();

    renderSidebarPanel(state);

    expect(screen.getByText(/^a research notes$/i)).toBeInTheDocument();
  });

  it("groups inventory items by general, badges, and keys", async () => {
    const user = userEvent.setup();
    const state = setInventory(createTestState(), [
      "ParkPass",
      "bluebadge",
      "ShedCellarKey",
    ]);

    renderSidebarPanel(state);

    expect(screen.getByText("a laminated pass")).toBeInTheDocument();
    expect(screen.queryByText("a blue plastic badge")).not.toBeInTheDocument();
    expect(screen.queryByText("a rusted metal key")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /badges/i }));
    expect(screen.getByText("a blue plastic badge")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /keys/i }));
    expect(screen.getByText("a rusted metal key")).toBeInTheDocument();
  });

  it("renders stored log entries in the Log tab", async () => {
    const state = await runCommands(
      setInventory(createTestState({ roomId: "ThreeWestBed" }), []),
      ["take research notes", "read research notes"],
    );

    render(<LogTab gameState={state} />);

    expect(
      screen.getByText("Research Notes Found in Sanyi Clone Quarters"),
    ).toBeInTheDocument();
    expect(screen.getByText(/LOG SOURCE:/i)).toBeInTheDocument();
  });

  it("logs Hydroponics employee records only on first view", async () => {
    const user = userEvent.setup();
    const { container } = renderHydroponicsTerminal(createTestState());

    expect(screen.getByTestId("hydro-log-count")).toHaveTextContent("0");

    await user.click(screen.getByText("Employee Records"));

    const employeeMenuItem = Array.from(
      container.querySelectorAll(".hints-menu-item"),
    ).find((element) => element.textContent?.trim() !== "BACK");

    expect(employeeMenuItem).toBeTruthy();

    const employeeName = employeeMenuItem?.textContent?.trim() ?? "Unknown";

    await user.click(employeeMenuItem as HTMLElement);

    expect(screen.getByTestId("hydro-log-count")).toHaveTextContent("1");
    expect(
      screen.getByText(`Employee Record: ${employeeName}`),
    ).toBeInTheDocument();

    const sameEmployeeMenuItem = Array.from(
      container.querySelectorAll(".hints-menu-item"),
    ).find((element) => element.textContent?.trim() === employeeName);

    expect(sameEmployeeMenuItem).toBeTruthy();

    await user.click(sameEmployeeMenuItem as HTMLElement);

    expect(screen.getByTestId("hydro-log-count")).toHaveTextContent("1");
    expect(
      screen.getAllByText(`Employee Record: ${employeeName}`),
    ).toHaveLength(1);
  });

  it("renders banked DNA samples in the DNA tab", async () => {
    const state = await runCommands(
      setInventory(createTestState({ roomId: "StairSix" }), ["DNAReader"]),
      ["touch dead soldier with dna sampler"],
    );

    render(<DNASampleTab gameState={state} />);

    expect(screen.getByText("Joelson Dend")).toBeInTheDocument();
    expect(
      screen.getByText(/Severe liquefactive necrosis/i),
    ).toBeInTheDocument();
  });

  it("reflects health, oxygen, temperature, radiation, and EEG state in the status tab", async () => {
    const baseState = createTestState();
    const statusEffects: GameState["player"]["statusEffects"] = [
      {
        id: "radiation",
        intensity: 25,
        remainingTurns: 5,
      },
      {
        id: "drunk",
        intensity: 10,
        remainingTurns: 2,
      },
    ];
    const state = {
      ...baseState,
      player: {
        ...baseState.player,
        vitals: {
          ...baseState.player.vitals,
          health: 73,
          oxygen: 42,
          temperature: 101.4,
          brainActivity: 5,
        },
        statusEffects,
      },
    };

    render(<StatusTab gameState={state} />);

    expect(screen.getByText("73%")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(screen.getByText(/101\.4/)).toBeInTheDocument();
    expect(screen.getByText(/25.*mSv/i)).toBeInTheDocument();
    expect(screen.getByText("???")).toBeInTheDocument();
    expect(screen.getByText("Radiation")).toBeInTheDocument();
    expect(screen.getByText(/face and neck feel burned/i)).toBeInTheDocument();
    expect(screen.getByText("Drunk")).toBeInTheDocument();
    expect(screen.getByText(/been drinking alcohol/i)).toBeInTheDocument();
    expect(screen.queryByText(/^Radiation:$/)).not.toBeInTheDocument();
  });

  it("shows active status effects even when custom diagnostic copy is missing", async () => {
    const baseState = createTestState();
    const state: GameState = {
      ...baseState,
      player: {
        ...baseState.player,
        statusEffects: [
          {
            id: "nanites",
            intensity: 1,
            remainingTurns: 10,
          },
          {
            id: "possessed",
            intensity: 1,
            remainingTurns: 10,
          },
        ],
      },
    };

    render(<StatusTab gameState={state} />);

    expect(screen.getByText("Nanites")).toBeInTheDocument();
    expect(screen.getByText("Possessed")).toBeInTheDocument();
    expect(
      screen.getAllByText(/No detailed diagnostic is available/i),
    ).toHaveLength(2);
  });

  it("renders the syndrome x signal overlay text", () => {
    useUIEffectsStore.getState().playSyndromeXSignal({
      id: "test-signal",
      text: "FFVGG TWSMSUWG",
    });

    render(<SyndromeXSignalOverlay visualEffectsMode="full" />);

    expect(screen.getByText("FFVGG TWSMSUWG")).toBeInTheDocument();
  });

  it("dims completed game preserve difficulties in the terminal", async () => {
    const baseState = createTestState({ roomId: "GamePreservePortal" });
    const state: GameState = {
      ...baseState,
      worldState: {
        ...baseState.worldState,
        gamePreserve: {
          ...baseState.worldState.gamePreserve,
          completedDifficulties: {
            moderate: true,
          },
          selectedDifficulty: "moderate",
        },
      },
    };

    render(
      <GamePreserveTerminalModal
        state={state}
        setGameState={() => undefined}
        onClose={() => undefined}
      />,
    );

    expect(screen.getByText(/completed/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /moderate/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /begin/i })).toBeDisabled();
  });

  it("loads destination chunks before terminal teleport arrival text", async () => {
    const user = userEvent.setup();
    const initialState = createInitialState(INITIAL_WORLD);
    let state: GameState = {
      ...initialState,
      player: {
        ...initialState.player,
        roomId: "TPADTerminal",
      },
    };
    const setGameState: React.Dispatch<React.SetStateAction<GameState>> = (
      updater,
    ) => {
      state = typeof updater === "function" ? updater(state) : updater;
    };

    expect(state.world.rooms.some((room) => room.id === "Lab")).toBe(false);

    render(
      <TeleportationTerminalModal
        state={state}
        setGameState={setGameState}
        onClose={() => undefined}
      />,
    );

    await user.click(screen.getByRole("button", { name: /medical lab/i }));

    await waitFor(() => {
      expect(state.player.roomId).toBe("Lab");
    });

    const transcript = state.log.join("\n");
    expect(state.world.rooms.some((room) => room.id === "Lab")).toBe(true);
    expect(transcript).toContain("Lab");
    expect(transcript).not.toContain("undefined");
    expect(transcript).not.toContain("You are nowhere");
  });

  it("lights the compass needles and labels for every available exit", async () => {
    const { container } = render(
      <RoomCompass
        exits={[
          "north",
          "south",
          "east",
          "west",
          "northwest",
          "northeast",
          "southwest",
          "southeast",
          "up",
          "down",
          "in",
          "out",
        ]}
      />,
    );

    expect(container.querySelectorAll(".compass-arm--active")).toHaveLength(8);
    expect(container.querySelectorAll(".compass-label--active")).toHaveLength(
      4,
    );
  });

  it("renders an external temperature reading in room diagnostics", () => {
    render(
      <RoomStatusPanel
        audioLevel={0}
        exits={["north"]}
        externalTemperatureF={88}
        flashlightStatus={{
          hasFlashlight: false,
          isActive: false,
        }}
      />,
    );

    expect(
      screen.getByLabelText(
        "External temperature reading: 88 degrees Fahrenheit",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("TEMP")).toBeInTheDocument();
    expect(screen.getByText("88°F")).toBeInTheDocument();
  });

  it("renders queued notifications without touching the transcript", async () => {
    const baseState = createTestState();
    const damageNotification = buildDamageNotification(5);
    const state = {
      ...baseState,
      uiState: {
        ...baseState.uiState,
        notifications: [
          {
            id: 1,
            kind: "gossip" as const,
            text: "You obtained some salacious gossip!",
          },
          {
            id: 2,
            ...damageNotification,
          },
        ],
      },
    };

    render(<NotificationHost state={state} setGameState={() => undefined} />);

    expect(
      screen.getByText("You obtained some salacious gossip!"),
    ).toBeInTheDocument();
    expect(screen.getByText(damageNotification.text)).toHaveClass(
      "game-notification--damage",
    );
    expect(state.log).toHaveLength(0);
  });

  it("updates the radio frequency from the slider overlay", () => {
    function Harness() {
      const [state, setState] = React.useState(
        setInventory(createTestState({ roomId: "StairSix" }), ["Radio"]),
      );

      return (
        <>
          <RadioFrequencyModal
            onClose={() => undefined}
            state={state}
            setGameState={setState}
          />
          <div data-testid="radio-frequency">
            {state.radio?.currentFrequency ?? "unset"}
          </div>
        </>
      );
    }

    render(<Harness />);

    const panel = screen.getByRole("group", {
      name: /radio frequency controls/i,
    });

    fireEvent.change(screen.getByRole("slider", { name: /radio frequency/i }), {
      target: { value: "150" },
    });

    expect(screen.getByText("150.000 MHz")).toBeInTheDocument();
    expect(screen.getByTestId("radio-frequency")).toHaveTextContent("150");

    fireEvent.wheel(screen.getByText("150.000 MHz"), { deltaY: -100 });

    expect(screen.getByText("150.005 MHz")).toBeInTheDocument();
    expect(screen.getByTestId("radio-frequency")).toHaveTextContent("150.005");

    fireEvent.wheel(screen.getByText("150.005 MHz"), {
      deltaY: 100,
      shiftKey: true,
    });

    expect(screen.getByText("149.955 MHz")).toBeInTheDocument();
    expect(screen.getByTestId("radio-frequency")).toHaveTextContent("149.955");

    const slider = screen.getByRole("slider", { name: /radio frequency/i });

    fireEvent.keyDown(slider, { key: "ArrowRight" });

    expect(screen.getByText("149.960 MHz")).toBeInTheDocument();
    expect(screen.getByTestId("radio-frequency")).toHaveTextContent("149.96");

    fireEvent.keyDown(slider, { key: "ArrowLeft", shiftKey: true });

    expect(screen.getByText("149.910 MHz")).toBeInTheDocument();
    expect(screen.getByTestId("radio-frequency")).toHaveTextContent("149.91");

    fireEvent.keyDown(panel, { key: "ArrowRight" });

    expect(screen.getByText("149.915 MHz")).toBeInTheDocument();
    expect(screen.getByTestId("radio-frequency")).toHaveTextContent("149.915");

    fireEvent.click(
      screen.getByRole("button", { name: /tune up 0\.005 mhz/i }),
    );

    expect(screen.getByText("149.920 MHz")).toBeInTheDocument();
    expect(screen.getByTestId("radio-frequency")).toHaveTextContent("149.92");

    fireEvent.click(
      screen.getByRole("button", { name: /tune down 0\.050 mhz/i }),
    );

    expect(screen.getByText("149.870 MHz")).toBeInTheDocument();
    expect(screen.getByTestId("radio-frequency")).toHaveTextContent("149.87");
  });

  it("renders the apiary terminal prompt and bee diagnostics", () => {
    const emptyState = createTestState({ roomId: "Apiary" });
    const empty = render(
      <ApiaryTerminalModal onClose={() => undefined} state={emptyState} />,
    );

    expect(
      screen.getByRole("dialog", { name: "OMNI-Bee" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Place Unit on Tray")).toBeInTheDocument();

    empty.unmount();

    const withBee = {
      ...emptyState,
      itemState: {
        ...emptyState.itemState,
        surfaceContents: {
          ...emptyState.itemState.surfaceContents,
          [APIARY_TRAY_ITEM_ID]: [DEACTIVATED_BEE_ITEM_ID],
        },
      },
    };

    render(<ApiaryTerminalModal onClose={() => undefined} state={withBee} />);

    expect(screen.getByLabelText("Bee diagnostics")).toBeInTheDocument();
    expect(screen.getByText("Model:")).toBeInTheDocument();
    expect(screen.getByText("POL-ES991")).toBeInTheDocument();
    expect(screen.getByText("Shutdown freq:")).toBeInTheDocument();
    expect(screen.getByText("168.8800MHz")).toBeInTheDocument();
    expect(screen.getByText("Status:")).toBeInTheDocument();
    expect(screen.getByText("Idle")).toBeInTheDocument();
  });
});

async function runCommandInInventoryRoom() {
  return await runCommands(
    setInventory(createTestState({ roomId: "ThreeWestBed" }), []),
    ["take research notes"],
  );
}

function renderHydroponicsTerminal(initialState: GameState) {
  function Harness() {
    const [state, setState] = React.useState(initialState);

    return (
      <>
        <HydroponicsAdminTerminalModal
          onClose={() => undefined}
          state={state}
          setGameState={setState}
        />
        <div data-testid="hydro-log-count">{state.player.log.length}</div>
        <LogTab gameState={state} />
      </>
    );
  }

  return render(<Harness />);
}
