import { doExamine } from "@game/actions/examine/examine";
import { doListen } from "@game/actions/listen/listen";
import { doRead } from "@game/actions/read/read";
import { LogTab } from "@game/components/LogTab";
import { GOSSIP_NOTIFICATION_TEXT } from "@game/rules/notifications";
import type {
  GameState,
  GameNotificationDraft,
  JuicyTopic,
  PlayerLogEntry,
} from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { createTestState } from "./helpers/gameTestHelpers";

function addItemToCurrentRoom(state: GameState, item: Item): GameState {
  return {
    ...state,
    world: {
      ...state.world,
      items: [...state.world.items, item],
    },
    itemState: {
      ...state.itemState,
      itemRoomId: {
        ...state.itemState.itemRoomId,
        [item.id]: state.player.roomId,
      },
    },
  };
}

const gossipTopic: JuicyTopic = {
  id: "director-affair",
  title: "Director Affair",
  summary: "The director has been sneaking into the arboretum after curfew.",
  tags: ["management", "arboretum"],
  type: "gossip",
};

const secretTopic: JuicyTopic = {
  id: "coolant-coverup",
  title: "Coolant Cover-Up",
  summary: "Engineering falsified the coolant loss reports before the shutdown.",
  tags: ["engineering", "shutdown"],
  type: "secret",
};

describe("gossip system", () => {
  it("collects and dedupes gossip when the player reads a gossip-bearing item", () => {
    const state = addItemToCurrentRoom(createTestState(), {
      id: "TestGossipNote",
      name: "gossip note",
      description: "A folded note covered in hasty handwriting.",
      location: "HydroponicsPlatform",
      vocab: ["note", "gossip"],
      itemClass: "solid",
      itemCategory: "scenery",
      itemWeight: 1,
      itemSize: 1,
      isReadable: true,
      readableText: "Meet me after shift. I know what the director is hiding.",
      containsTea: [gossipTopic],
    });

    const command = {
      type: "action" as const,
      verb: "read",
      direct: "gossip note",
      raw: "read gossip note",
    };

    const firstRead = doRead(state, command);
    const secondRead = doRead(firstRead.state, command);
    const secondOverlay = secondRead.overlay as
      | { postCloseNotifications?: GameNotificationDraft[] }
      | undefined;

    expect(firstRead.state.player.spiltTea).toEqual([gossipTopic]);
    expect(firstRead.overlay).toMatchObject({
      postCloseNotifications: [{ kind: "gossip", text: GOSSIP_NOTIFICATION_TEXT }],
    });
    expect(secondRead.state.player.spiltTea).toEqual([gossipTopic]);
    expect(secondOverlay?.postCloseNotifications).toBeUndefined();
  });

  it("collects gossip when examine opens an item overlay", () => {
    const state = addItemToCurrentRoom(createTestState(), {
      id: "TestGossipPhone",
      name: "gossip phone",
      description: "A desk phone with a blinking message light.",
      location: "HydroponicsPlatform",
      vocab: ["phone", "desk phone"],
      itemClass: "solid",
      itemCategory: "scenery",
      itemWeight: 2,
      itemSize: 2,
      containsTea: [secretTopic],
      meta: {
        kind: "phone",
        messages: [],
      },
    });

    const result = doExamine(state, {
      type: "action",
      verb: "examine",
      direct: "gossip phone",
      raw: "examine gossip phone",
    });

    expect(result.overlay).toMatchObject({
      kind: "message-machine",
      postCloseNotifications: [{ kind: "gossip", text: GOSSIP_NOTIFICATION_TEXT }],
    });
    expect(result.state.player.spiltTea).toEqual([secretTopic]);
  });

  it("collects gossip when listening to an item with a listen response", () => {
    const state = addItemToCurrentRoom(createTestState(), {
      id: "TestGossipShell",
      name: "gossip shell",
      description: "A decorative shell with tiny speakers embedded inside.",
      location: "HydroponicsPlatform",
      vocab: ["shell"],
      itemClass: "solid",
      itemCategory: "scenery",
      itemWeight: 1,
      itemSize: 1,
      containsTea: [gossipTopic],
      overrides: {
        listen:
          "A hushed voice says the greenhouse blackout was not an accident.",
      },
    });

    const result = doListen(state, {
      type: "action",
      verb: "listen",
      direct: "gossip shell",
      raw: "listen to gossip shell",
    });

    expect(result.message).toMatch(/greenhouse blackout/i);
    expect(result.state.player.spiltTea).toEqual([gossipTopic]);
    expect(result.state.uiState.notifications).toContainEqual({
      id: 1,
      kind: "gossip",
      text: GOSSIP_NOTIFICATION_TEXT,
    });
  });

  it("splits log entries and gossip into separate subtabs", async () => {
    const user = userEvent.setup();
    const baseState = createTestState();
    const logEntry: PlayerLogEntry = {
      source: "Research Terminal",
      title: "Incident Memo",
      loggedAtTurn: 12,
      body: "Containment failed after the midnight shift turnover.",
    };
    const state = {
      ...baseState,
      player: {
        ...baseState.player,
        log: [logEntry],
        spiltTea: [gossipTopic],
      },
    };

    render(<LogTab gameState={state} />);

    expect(screen.getByRole("tab", { name: /log entries/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Incident Memo")).toBeInTheDocument();
    expect(screen.queryByText("Director Affair")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /^gossip/i }));

    expect(screen.getByRole("tab", { name: /^gossip/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Director Affair")).toBeInTheDocument();
    expect(
      screen.getByText(
        "The director has been sneaking into the arboretum after curfew.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Incident Memo")).not.toBeInTheDocument();
  });
});
