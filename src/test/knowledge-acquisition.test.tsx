import { dispatchAction } from "@game/actions/dispatchAction";
import { doExamine } from "@game/actions/examine/examine";
import { readItem } from "@game/actions/read/read";
import {
  MessageMachineModal,
  type PhoneMessage,
} from "@game/components/MessageMachineModal";
import {
  startExperience,
  tickActiveExperience,
} from "@game/experiences/experienceRegistry";
import { createMessageMachineAdapter } from "@game/harness/messageMachine";
import { collectDiscoveries } from "@game/rules/discoveries";
import { collectContacts } from "@game/rules/knowledge";
import { setMessageListened } from "@game/rules/message-machine";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createTestState } from "./helpers/gameTestHelpers";

describe("explicit knowledge discovery", () => {
  it("collects authored contacts on examination and reading without parsing narrative or duplicating awards", () => {
    const state = createTestState({ roomId: "Toilettes" });
    const examined = doExamine(state, {
      type: "action",
      verb: "examine",
      raw: "examine",
      direct: "plaque",
    });
    expect(
      examined.state.player.contacts.map((contact) => contact.extension),
    ).toEqual(["9111", "0000", "8111"]);
    expect(examined.state.player.log).toEqual([]);
    const repeated = doExamine(examined.state, {
      type: "action",
      verb: "examine",
      raw: "examine",
      direct: "plaque",
    });
    expect(repeated.state.player.contacts).toBe(examined.state.player.contacts);
    const plaque = state.world.items.find(
      (item) => item.id === "PHONENUMBERS",
    )!;
    const read = readItem(repeated.state, plaque);
    expect(read.state.player.contacts).toHaveLength(3);
    expect(read.state.player.log).toHaveLength(1);
    const unannotated = readItem(state, {
      ...plaque,
      containsContacts: undefined,
    });
    expect(unannotated.state.player.contacts).toEqual([]);
    const slip = state.world.items.find((item) => item.id === "PhoneNumber")!;
    const unknown = readItem(read.state, slip).state.player.contacts.at(-1)!;
    expect(unknown).toMatchObject({ extension: "X7239", name: undefined });
  });

  it("uses the same award hook for trivia and contact updates, with notifications only for actual changes", () => {
    const awards = {
      containsTrivia: [
        {
          id: "fixture-fact",
          title: "Fact",
          answer: "Answer",
          body: "Details",
        },
      ],
      containsContacts: [{ extension: "X002", name: "Known caller" }],
    };
    const first = collectDiscoveries(createTestState(), awards);
    expect(first.notifications).toHaveLength(2);
    expect(collectDiscoveries(first.state, awards).notifications).toEqual([]);
    const state = collectContacts(createTestState(), [
      { extension: "X002" },
    ]).state;
    const identified = collectDiscoveries(state, awards);
    expect(identified.state.player.contacts).toHaveLength(1);
    expect(
      identified.notifications.map((notification) => notification.text),
    ).toContain("You updated a telephone contact.");
    const plaque = state.world.items.find(
      (item) => item.id === "PHONENUMBERS",
    )!;
    expect(
      readItem(state, { ...plaque, ...awards }).state.player.trivia[0].id,
    ).toBe("fixture-fact");
    const scene = { ...plaque, ...awards, id: "fixture-scene", name: "scene" };
    const placed = {
      ...state,
      world: { ...state.world, items: [...state.world.items, scene] },
      itemState: {
        ...state.itemState,
        itemRoomId: {
          ...state.itemState.itemRoomId,
          [scene.id]: state.player.roomId,
        },
      },
    };
    expect(
      doExamine(placed, {
        type: "action",
        verb: "examine",
        raw: "examine",
        direct: "scene",
      }).state.player.trivia[0].id,
    ).toBe("fixture-fact");
  });

  it("reveals the existing Swinth extension only when the scripted memory reaches its spoken clue", () => {
    let state = startExperience(
      createTestState({ roomId: "ParkEast" }),
      "old_woman_park_memory",
    ).state;
    expect(state.player.contacts).toEqual([]);
    for (let turn = 1; turn <= 3; turn++) {
      const tick = tickActiveExperience({ ...state, moves: turn });
      state = tick.state;
      if (turn < 2) expect(state.player.contacts).toEqual([]);
      else if (turn === 2)
        expect(tick.message).toContain("Our unit extension is 20720");
    }
    expect(state.player.contacts).toMatchObject([
      { extension: "20720", name: "Swinth residence" },
    ]);
    state = startExperience(state, "old_woman_park_memory").state;
    for (let turn = 4; turn <= 6; turn++)
      state = tickActiveExperience({ ...state, moves: turn }).state;
    expect(state.player.contacts).toHaveLength(1);
  });

  it("awards only a played message's declared contact and identifies an existing extension once", async () => {
    let state = createTestState({ roomId: "ThreeEastBed" });
    const messages: PhoneMessage[] = [
      {
        id: "fixture-message-1",
        title: "Caller",
        transcript: "My extension is X009.",
        containsContacts: [{ extension: "X009", name: "Recorded caller" }],
      },
      {
        id: "fixture-message-2",
        title: "Other",
        transcript: "Call X999. 00123.",
      },
    ];
    state = {
      ...state,
      world: {
        ...state.world,
        items: state.world.items.map((item) =>
          item.id === "EeglerPhone"
            ? { ...item, meta: { ...item.meta, messages } }
            : item,
        ),
      },
    };
    const opened = doExamine(state, {
      type: "action",
      verb: "examine",
      raw: "examine",
      direct: "phone",
    });
    expect(opened.state.player.contacts).toEqual([]);
    state = collectContacts(opened.state, [{ extension: "X009" }]).state;
    const original = state.player.contacts[0];
    const played = (
      await dispatchAction(state, {
        verb: "markMessagePlayed",
        payload: { messageId: messages[0].id },
      })
    ).state;
    expect(played.player.contacts).toEqual([
      { ...original, name: "Recorded caller" },
    ]);
    expect(setMessageListened(played, messages[0].id)).toBe(played);
    expect(setMessageListened(played, messages[1].id).player.contacts).toEqual(
      played.player.contacts,
    );
    expect(played.moves).toBe(state.moves);

    const onMarkPlayed = vi.fn();
    render(
      <MessageMachineModal
        messages={messages}
        messagesPlayedById={{}}
        onMarkPlayed={onMarkPlayed}
        onClose={() => {}}
      />,
    );
    expect(onMarkPlayed).not.toHaveBeenCalled();
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: /play/i }));
    expect(onMarkPlayed).toHaveBeenCalledWith(messages[0].id);

    expect(opened.overlay?.kind).toBe("message-machine");
    if (opened.overlay?.kind !== "message-machine")
      throw new Error("Missing phone overlay");
    const headless = await createMessageMachineAdapter().command(
      opened.state,
      opened.overlay,
      "play",
    );
    expect(headless.state.player.contacts[0]).toMatchObject({
      extension: "X009",
      name: "Recorded caller",
    });
    expect(headless.state.moves).toBe(opened.state.moves);
  });
});
