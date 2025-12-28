import { resolveItemByNoun } from "../rules/scope";
import { getItemById } from "../selectors/itemSelectors";
import type { ActionResult } from "../types/actionsTypes";
import type { GameState } from "../types/gameTypes";
import type { Item } from "../types/itemTypes";
import type { ParsedCommand } from "../types/parserTypes";

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
    return { state, message: "You don't see that here." };
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

  let itemDesc = item.description?.trim() || "You see nothing special.";
  if (item.isContainer && state.itemState.containerFilled[item.id]) {
    const containerContents = state.itemState.containerFilled[item.id];
    itemDesc += ` The ${item.name} is filled with ${containerContents}`;
  } else if (item.isContainer && state.itemState.openItems[item.id]) {
    const containerContents = state.itemState.containerContents[item.id];
    let containerItems: Item[] = [];
    for (const itemId of containerContents) {
      const containerItem = getItemById(state, itemId);
      if (containerItem) containerItems.push(containerItem);
    }
    const containerNames = containerItems.map((ci: Item) => ci.name).join(", ");
    itemDesc += ` Inside the ${item.name} you see ${containerNames}.`;
  }

  const ex = item.overrides?.examine;

  if (!ex) {
    return { state, message: itemDesc };
  }

  // String override
  if (typeof ex === "string") {
    const msg = ex.trim() || itemDesc;
    return { state, message: msg };
  }

  // Function override: can return string OR ActionResult
  const out = ex({ item, state });

  if (typeof out === "string") {
    const msg = out.trim() || itemDesc;
    return { state, message: msg };
  }

  if (item.id === "Cooler") {
    const coolerSetting = state.itemState.itemSettings["Cooler"];
    const mode =
      coolerSetting && coolerSetting.kind === "cooler"
        ? coolerSetting.mode
        : "off";

    return {
      state,
      overlay: { kind: "cooler", mode },
    };
  }

  // ActionResult override
  return {
    state: out.state ?? state,
    message: (out.message ?? itemDesc).trim() || itemDesc,
  };
}
