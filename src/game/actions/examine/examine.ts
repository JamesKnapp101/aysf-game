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

  let next = state;

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

  if (item.isReflective) {
    let reflectMsg: string = ``;
    if (!state.player.memoriesTriggered.own_image) {
      if (state.player.memoriesTriggered.seen_self) {
        reflectMsg += `You regard your reflection for a moment and are taken aback as you realize you've seen that face before. It's the same exact face you saw on one of the dead bodies you found, you're him, or he was you? How is this possible?`;
      } else {
        reflectMsg += `You regard your reflection for a moment, feeling a glimmer of recognition. Your skin is fresh and unblemished, your head smooth, and hairless. You don't even have eyebrows.`;
      }
      next = {
        ...state,
        player: {
          ...state.player,
          memoriesTriggered: {
            ...state.player.memoriesTriggered,
            own_image: true,
          },
        },
      };
    } else {
      return { state: next, message: `Still looking good!` };
    }
    return { state: next, message: reflectMsg };
  }

  if (item.id === "TelepadTerminal") {
    return {
      state,
      overlay: {
        kind: "teleportation-terminal",
      },
    };
  }

  if (item?.meta?.kind === "phone") {
    return {
      state,
      overlay: {
        kind: "message-machine",
        messages: item?.meta?.messages,
        messagesPlayedById: {},
      },
    };
  }

  if (item?.meta?.kind === "camera-gun-viewer") {
    return {
      state,
      overlay: {
        kind: "camera-gun-viewer",
        currentViewIndex: 0,
      },
    };
  }

  if (item?.meta?.kind === "plt-viewer") {
    return {
      state,
      overlay: {
        kind: "plt-viewer",
        isOn: (state.itemState.itemSettings["PLT"] as any)?.isOn,
        hasLink: (state.itemState.itemSettings["PLT"] as any)?.hasLink,
      },
    };
  }

  if (item.id === "PowerStationMonitor") {
    if (!state.worldState.powerRestoredSections["power-initialized"]) {
      return { state, message: item?.meta?.onNoPower ?? "The screen is dark." };
    }
    return {
      state,
      overlay: {
        kind: "power-station-terminal",
        isOn: true,
      },
    };
  }

  if (item.id === "MatterTransmitter") {
    return {
      state,
      overlay: {
        kind: "matter-transmitter",
        isOn: true,
      },
    };
  }

  if (item.id === "MensLockers") {
    return {
      state,
      overlay: {
        kind: "mens-lockers",
      },
    };
  }

  if (item.id === "WomensLockers") {
    return {
      state,
      overlay: {
        kind: "womens-lockers",
      },
    };
  }

  if (item.id === "FallenCorpse") {
    next = {
      ...state,
      player: {
        ...state.player,
        memoriesTriggered: {
          ...state.player.memoriesTriggered,
          seen_self: true,
        },
      },
    };
  }

  let itemDesc = item.describe
    ? item?.describe?.(next, item, {
        kind: "examine",
        roomId: item.id,
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
  } else if (item.isContainer && next.itemState.openItems[item.id]) {
    const containerContents = next.itemState.containerContents[item.id] ?? [];
    let containerItems: Item[] = [];
    for (const itemId of containerContents) {
      const containerItem = getItemById(next, itemId);
      if (containerItem) containerItems.push(containerItem);
    }
    const containerNames = containerItems.map((ci: Item) => ci.name).join(", ");
    itemDesc += ` Inside the ${item.name} you see ${containerNames}.`;
  }

  const ex = item.overrides?.examine;

  if (!ex) {
    return { state: next, message: itemDesc };
  }

  if (typeof ex === "string") {
    const msg = ex.trim() || itemDesc;
    return { state: next, message: msg };
  }
  const out = ex({ item, state: next });

  if (typeof out === "string") {
    const msg = out.trim() || itemDesc;
    return { state: next, message: msg };
  }

  if (item.id === "Cooler") {
    const coolerSetting = state.itemState.itemSettings["Cooler"];
    const mode =
      coolerSetting && coolerSetting.kind === "cooler"
        ? coolerSetting.mode
        : "off";

    return {
      state: next,
      overlay: { kind: "cooler", mode },
    };
  }
  return {
    state: out.state ?? next,
    message: (out.message ?? itemDesc).trim() || itemDesc,
  };
}
