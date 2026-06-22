import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReactorBigBoard } from "../world/maps/levelFive/ReactorBigBoard";
import {
  getReactorConsensusState,
  getReactorContainmentIntegrity,
  getReactorLobeCounts,
  getReactorRadiationLevel,
  isReactorBigBoardVisible,
  REACTOR_BIG_BOARD_ROOM_IDS,
  setReactorLobeStatus,
  tickReactorConsensus,
} from "../world/maps/levelFive/reactorConsensus";
import { createTestState, runCommand } from "./helpers/gameTestHelpers";

describe("Level Five reactor big board", () => {
  it("renders the tracked 25-lobe consensus in the reactor platform zone", () => {
    const state = createTestState({ roomId: "HeatCoolantExchangePlatform" });
    const consensus = getReactorConsensusState(state);
    const counts = getReactorLobeCounts(consensus);
    const { container } = render(<ReactorBigBoard state={state} />);

    expect(screen.getByLabelText("Reactor lobe consensus display")).toBeVisible();
    expect(container.querySelectorAll("[data-lobe-status]")).toHaveLength(25);
    const rows = container.querySelectorAll(".reactor-board__lobe-row");
    const rowStatuses = (row: Element) =>
      Array.from(row.children).map((lobe) =>
        lobe.getAttribute("data-lobe-status"),
      );
    expect(rowStatuses(rows[0]!)).toEqual([
      ...Array(10).fill("harmonic"),
      ...Array(3).fill("dissonant"),
    ]);
    expect(rowStatuses(rows[1]!)).toEqual([
      ...Array(9).fill("harmonic"),
      "undecided",
      "dissonant",
      "dissonant",
    ]);
    expect(counts).toEqual({
      harmonic: 19,
      undecided: 1,
      dissonant: 5,
      missing: 0,
    });
    expect(getReactorContainmentIntegrity(consensus)).toBe(83);
  });

  it("makes the board visible from every upper and lower reactor platform", () => {
    for (const roomId of REACTOR_BIG_BOARD_ROOM_IDS) {
      expect(isReactorBigBoardVisible(roomId)).toBe(true);
    }

    expect(isReactorBigBoardVisible("EngCorridorTwo")).toBe(false);
    expect(isReactorBigBoardVisible("ReactorControlRoom")).toBe(false);
  });

  it("turns the undecided lobe dissonant and randomly selects one harmonic successor", () => {
    const state = createTestState({
      roomId: "ReactorPlatform",
      rng: () => 0,
    });
    const ready = {
      ...state,
      worldState: {
        ...state.worldState,
        reactorConsensus: {
          ...getReactorConsensusState(state),
          turnsUntilTransition: 1,
        },
      },
    };

    const result = tickReactorConsensus(ready);
    const consensus = getReactorConsensusState(result.state);

    expect(getReactorLobeCounts(consensus)).toEqual({
      harmonic: 18,
      undecided: 1,
      dissonant: 6,
      missing: 0,
    });
    expect(consensus.lobes[0]?.status).toBe("undecided");
    expect(consensus.lobes[19]?.status).toBe("dissonant");
    expect(result.state.player.statusEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "radiation",
          source: "reactor-lobes",
        }),
      ]),
    );
  });

  it("broadcasts each crossed ten-percent containment threshold shipwide", () => {
    const state = createTestState({ roomId: "EngCorridorOne", rng: () => 0 });
    let current = state;
    const messages: string[] = [];

    for (let transition = 0; transition < 4; transition += 1) {
      const ready = {
        ...current,
        worldState: {
          ...current.worldState,
          reactorConsensus: {
            ...getReactorConsensusState(current),
            turnsUntilTransition: 1,
          },
        },
      };
      const result = tickReactorConsensus(ready);
      current = result.state;
      messages.push(...result.messages);
    }

    expect(messages).toEqual([
      "Reactor containment integrity has degraded to 80%",
      "Reactor containment integrity has degraded to 70%",
    ]);
    expect(current.player.statusEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "radiation" })]),
    );
  });

  it("shows a removed lobe as an offline gray position", () => {
    const state = createTestState({ roomId: "LobeStoragePlatform" });
    const lobeId = getReactorConsensusState(state).lobes[4]?.id;
    expect(lobeId).toBeDefined();

    const withMissingLobe = setReactorLobeStatus(
      state,
      lobeId ?? "",
      "missing",
    );
    const { container } = render(<ReactorBigBoard state={withMissingLobe} />);

    expect(container.querySelectorAll('[data-lobe-status="missing"]')).toHaveLength(1);
    expect(getReactorLobeCounts(getReactorConsensusState(withMissingLobe)).missing).toBe(1);
  });

  it("caps radiation at a moderate level", () => {
    const state = createTestState({ roomId: "ReactorPlatform" });
    const consensus = getReactorConsensusState(state);
    const allDissonant = {
      ...consensus,
      lobes: consensus.lobes.map((lobe) => ({
        ...lobe,
        status: "dissonant" as const,
      })),
    };

    expect(getReactorRadiationLevel(allDissonant)).toBeLessThanOrEqual(35);
    expect(getReactorRadiationLevel(allDissonant)).toBeGreaterThan(0);
  });

  it("ends the game without invoking the normal respawn when the last lobe turns red", async () => {
    const state = createTestState({ roomId: "ReactorPlatform" });
    const consensus = getReactorConsensusState(state);
    const terminalState = {
      ...state,
      worldState: {
        ...state.worldState,
        reactorConsensus: {
          ...consensus,
          lobes: consensus.lobes.map((lobe, index) => ({
            ...lobe,
            status: index === 0 ? ("undecided" as const) : ("dissonant" as const),
          })),
          nextContainmentWarning: 0,
          turnsUntilTransition: 1,
        },
      },
    };

    const collapsed = tickReactorConsensus(terminalState);
    const afterCommand = await runCommand(collapsed.state, "look");

    expect(collapsed.state.worldState.gameOver?.cause).toBe(
      "reactor containment collapse",
    );
    expect(getReactorConsensusState(collapsed.state).hasExploded).toBe(true);
    expect(collapsed.state.player.vitals.health).toBe(0);
    expect(collapsed.messages.join("\n")).toContain("*** GAME OVER ***");
    expect(afterCommand.player.roomId).toBe("ReactorPlatform");
    expect(afterCommand.log.join("\n")).not.toContain("*** You have died ***");
    expect(afterCommand.log.at(-1)).toContain("The ship is gone");
  });
});
