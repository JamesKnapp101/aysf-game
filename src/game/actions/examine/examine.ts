import {
  appendGossipNotice,
  collectTeaFromItemResult,
} from "@game/rules/gossip";
import { isItemOpen } from "@game/rules/containers";
import { resolveDoorByNoun, resolveItemByNoun } from "../../rules/scope";
import { getItemById } from "../../selectors/itemSelectors";
import type { ActionResult } from "../../types/actionsTypes";
import type { GameState } from "../../types/gameTypes";
import type { Item } from "../../types/itemTypes";
import type { ParsedCommand } from "../../types/parserTypes";

export function doExamine(state: GameState, cmd: ParsedCommand): ActionResult {
  if (cmd.type !== "action" || cmd.verb !== "examine") {
    return { state, message: "You can't do that." };
  }

  const direct = cmd.direct?.trim();
  if (!direct) {
    return { state, message: "Examine what?" };
  }

  const item =
    direct !== "water"
      ? resolveItemByNoun(state, direct)
      : getItemById(state, "water");

  if (!item) {
    const door = resolveDoorByNoun(state, direct);
    if (door) {
      return {
        state,
        message:
          door.def.describe?.(state, {
            kind: "door",
            doorId: door.def.id,
            roomId: state.player.roomId,
          }) ?? door.def.description,
      };
    }
    return { state, message: "You don't see that here." };
  }

  const teaResult = collectTeaFromItemResult(state, item);
  let next = teaResult.state;
  const gossipNotice = appendGossipNotice(undefined, teaResult.obtainedNewTea);

  if (item.isReflective) {
    let reflectMsg: string = ``;
    if (!next.player.memoriesTriggered.own_image) {
      if (next.player.memoriesTriggered.seen_self) {
        reflectMsg += `You regard your reflection for a moment and are taken aback as you realize you've seen that face before. It's the same exact face you saw on one of the dead bodies you found, you're him, or he was you? How is this possible?`;
      } else {
        reflectMsg += `You regard your reflection for a moment, feeling a glimmer of recognition. Your skin is fresh and unblemished, your head smooth, and hairless. You don't even have eyebrows.`;
      }
      next = {
        ...next,
        player: {
          ...next.player,
          memoriesTriggered: {
            ...next.player.memoriesTriggered,
            own_image: true,
          },
        },
      };
    } else {
      return {
        state: next,
        message: appendGossipNotice(
          "Still looking good!",
          teaResult.obtainedNewTea,
        ),
      };
    }
    return {
      state: next,
      message: appendGossipNotice(reflectMsg, teaResult.obtainedNewTea),
    };
  }

  if (item.id === "TelepadTerminal") {
    return {
      state: next,
      overlay: {
        kind: "teleportation-terminal",
        postCloseMessage: gossipNotice,
      },
    };
  }

  if (item?.meta?.kind === "phone") {
    return {
      state: next,
      overlay: {
        kind: "message-machine",
        messages: item?.meta?.messages,
        messagesPlayedById: {},
        postCloseMessage: gossipNotice,
      },
    };
  }

  if (item?.meta?.kind === "camera-gun-viewer") {
    return {
      state: next,
      overlay: {
        kind: "camera-gun-viewer",
        currentViewIndex: 0,
        postCloseMessage: gossipNotice,
      },
    };
  }

  if (item?.meta?.kind === "hydroponics-admin-terminal") {
    return {
      state: next,
      overlay: {
        kind: "hydroponics-admin-terminal",
        postCloseMessage: gossipNotice,
      },
    };
  }

  if (item?.meta?.kind === "plt-viewer") {
    return {
      state: next,
      overlay: {
        kind: "plt-viewer",
        isOn: (next.itemState.itemSettings["PLT"] as any)?.isOn,
        hasLink: (next.itemState.itemSettings["PLT"] as any)?.hasLink,
        postCloseMessage: gossipNotice,
      },
    };
  }

  if (item.id === "PowerStationMonitor") {
    if (!next.worldState.powerRestoredSections["power-initialized"]) {
      return {
        state: next,
        message: appendGossipNotice(
          item?.meta?.onNoPower ?? "The screen is dark.",
          teaResult.obtainedNewTea,
        ),
      };
    }
    return {
      state: next,
      overlay: {
        kind: "power-station-terminal",
        isOn: true,
        postCloseMessage: gossipNotice,
      },
    };
  }

  if (item.id === "MatterTransmitter") {
    return {
      state: next,
      overlay: {
        kind: "matter-transmitter",
        isOn: true,
        postCloseMessage: gossipNotice,
      },
    };
  }

  if (item.id === "MensLockers") {
    return {
      state: next,
      overlay: {
        kind: "mens-lockers",
        postCloseMessage: gossipNotice,
      },
    };
  }

  if (item.id === "WomensLockers") {
    return {
      state: next,
      overlay: {
        kind: "womens-lockers",
        postCloseMessage: gossipNotice,
      },
    };
  }

  if (item.id === "FallenCorpse") {
    next = {
      ...next,
      player: {
        ...next.player,
        memoriesTriggered: {
          ...next.player.memoriesTriggered,
          seen_self: true,
        },
      },
    };
  }

  let itemDesc = item.describe
    ? item?.describe?.(next, item, {
        kind: "examine",
        roomId: next.player.roomId,
      })
    : item.meta?.conditionalDescription &&
        (next.worldState.conditionalTriggers?.[`searched-${item.id}`] ===
          false ||
          next.worldState.conditionalTriggers?.[`searched-${item.id}`] ===
            undefined)
      ? item.meta.conditionalDescription
      : item.description?.trim() || "You see nothing special.";

  if (item.isContainer && next.itemState.containerFilled[item.id]) {
    const containerContents = next.itemState.containerFilled[item.id];
    itemDesc += ` The ${item.name} is filled with ${containerContents}`;
  } else if (item.isContainer && isItemOpen(next, item.id)) {
    const containerContents = next.itemState.containerContents[item.id] ?? [];
    const containerItems: Item[] = [];
    for (const itemId of containerContents) {
      const containerItem = getItemById(next, itemId);
      if (containerItem) containerItems.push(containerItem);
    }
    const containerNames = containerItems.map((ci: Item) => ci.name).join(", ");
    itemDesc += ` Inside the ${item.name} you see ${containerNames}.`;
  }

  const ex = item.overrides?.examine;

  if (!ex) {
    return {
      state: next,
      message: appendGossipNotice(itemDesc, teaResult.obtainedNewTea),
    };
  }

  if (typeof ex === "string") {
    const msg = ex.trim() || itemDesc;
    return {
      state: next,
      message: appendGossipNotice(msg, teaResult.obtainedNewTea),
    };
  }
  const out = ex({ item, state: next });

  if (typeof out === "string") {
    const msg = out.trim() || itemDesc;
    return {
      state: next,
      message: appendGossipNotice(msg, teaResult.obtainedNewTea),
    };
  }

  if (item.id === "Cooler") {
    const coolerSetting = next.itemState.itemSettings["Cooler"];
    const mode =
      coolerSetting && coolerSetting.kind === "cooler"
        ? coolerSetting.mode
        : "off";

    return {
      state: next,
      overlay: {
        kind: "cooler",
        mode,
        postCloseMessage: gossipNotice,
      },
    };
  }
  return {
    state: out.state ?? next,
    message: appendGossipNotice(
      (out.message ?? itemDesc).trim() || itemDesc,
      teaResult.obtainedNewTea,
    ),
  };
}
