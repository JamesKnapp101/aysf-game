import type { ParsedCommand } from "../parse/parser";
import {
  getContainerContentsIds,
  getContainerContentsItems,
  getCurrentRoom,
  getDoorById,
  getDoorState,
  getItemById,
  getItemsInCurrentRoom,
  getItemsInInventory,
  getItemsInRoom,
  handleInject,
  resolveDoorByNoun,
  resolveItemByNoun,
  tryPutItemInContainer,
} from "./selectors";
import type {
  DoorDefinition,
  DoorKind,
  DoorState,
  Exit,
  GameState,
  Item,
  ItemOverrideVerb,
  RoomExit,
  StatusEffect,
  TeleportPadDefinition,
} from "../world/types";

// --- Logging ---------------------------------------------------------------

export function appendLog(state: GameState, text: string): GameState {
  return { ...state, log: [...state.log, text] };
}

// --- Item helpers ----------------------------------------------------------

function describeActionResult(
  item: Item,
  verb: ItemOverrideVerb,
  fallback: string
): string {
  return item.overrides?.[verb] ?? fallback;
}

function isItemOpen(state: GameState, itemId: string): boolean {
  return !!state.itemState.openItems[itemId];
}

function setItemOpen(
  state: GameState,
  itemId: string,
  open: boolean
): GameState {
  return {
    ...state,
    itemState: {
      ...state.itemState,
      openItems: {
        ...state.itemState.openItems,
        [itemId]: open,
      },
    },
  };
}

function setItemClosed(
  state: GameState,
  itemId: string,
  open: boolean
): GameState {
  return {
    ...state,
    itemState: {
      ...state.itemState,
      openItems: {
        ...state.itemState.openItems,
        [itemId]: !open,
      },
    },
  };
}

// --- Items / inventory ------------------------------------------------------

function updateItemLocation(
  state: GameState,
  itemId: string,
  location: string
): GameState {
  return {
    ...state,
    world: {
      ...state.world,
      items: state.world.items.map((it) =>
        it.id === itemId ? { ...it, location } : it
      ),
    },
  };
}

function takeItem(state: GameState, noun: string): GameState {
  const lower = noun.toLowerCase();

  // --- 1) Try items on the room floor first --------------------------
  const itemsHere = getItemsInCurrentRoom(state);

  let item = itemsHere.find(
    (i) => i.vocab.includes(lower) || i.name.toLowerCase() === lower
  );

  if (item) {
    if (item.itemCategory === "scenery") {
      return appendLog(state, "You can’t take that.");
    }

    const withLocation = updateItemLocation(state, item.id, "INVENTORY");

    const next: GameState = {
      ...withLocation,
      player: {
        ...withLocation.player,
        inventory: withLocation.player.inventory.includes(item.id)
          ? withLocation.player.inventory
          : [...withLocation.player.inventory, item.id],
      },
    };

    return appendLog(next, "Taken.");
  }

  // --- 2) Not on floor: check open containers in the room ------------

  const room = getCurrentRoom(state);

  const containersHere = state.world.items.filter(
    (i) => i.isContainer && i.location === room.id
  );

  for (const container of containersHere) {
    // Only expose contents if container is open
    if (!isItemOpen(state, container.id)) continue;

    const contentsItems = getContainerContentsItems(state, container);

    const found = contentsItems.find(
      (i) => i.vocab.includes(lower) || i.name.toLowerCase() === lower
    );

    if (!found) continue;

    if (found.itemCategory === "scenery") {
      return appendLog(state, "You can’t take that.");
    }

    // Seed dynamic contents for this container, then remove the item
    const seededIds = getContainerContentsIds(state, container);
    const updatedContentsIds = seededIds.filter((id) => id !== found.id);

    const withLocation = updateItemLocation(state, found.id, "INVENTORY");

    const withInventory: GameState = {
      ...withLocation,
      player: {
        ...withLocation.player,
        inventory: withLocation.player.inventory.includes(found.id)
          ? withLocation.player.inventory
          : [...withLocation.player.inventory, found.id],
      },
    };

    const withContainerState: GameState = {
      ...withInventory,
      itemState: {
        ...withInventory.itemState,
        containerContents: {
          ...withInventory.itemState.containerContents,
          [container.id]: updatedContentsIds,
        },
      },
    };

    return appendLog(withContainerState, "Taken.");
  }

  // --- 3) Nowhere to be found ----------------------------------------
  return appendLog(state, "You don't see that here.");
}

export function dropItem(state: GameState, noun: string): GameState {
  const inv = getItemsInInventory(state);
  const lower = noun.toLowerCase();

  const item = inv.find(
    (i) => i.name.toLowerCase() === lower || i.vocab.includes(lower)
  );
  if (!item) return appendLog(state, "You aren't carrying that.");

  const withLocation = updateItemLocation(state, item.id, state.player.roomId);

  const next: GameState = {
    ...withLocation,
    player: {
      ...withLocation.player,
      inventory: withLocation.player.inventory.filter((id) => id !== item.id),
    },
  };

  return appendLog(next, "Dropped.");
}

function isItemOpenable(item: Item): boolean {
  // For now, treat containers as openable.
  // If you later add item.isOpenable, use that instead or in addition.
  return !!item.isContainer;
}

export function tryOpenItem(
  state: GameState,
  item: Item
): { state: GameState; message: string } {
  // 1. Validate openable
  if (!isItemOpenable(item)) {
    return { state, message: "You can't open that." };
  }

  // 2. Already open?
  if (isItemOpen(state, item.id)) {
    return { state, message: "It's already open." };
  }

  // 3. Open the container
  let next = setItemOpen(state, item.id, true);

  // 4. Determine contents *after* opening
  const contents = getContainerContentsItems(next, item); // <- uses selector you already have

  // 5. Build reveal message
  const baseMsg = item.overrides?.open ?? "You open the " + item.name;

  let revealMsg = "";
  if (contents.length > 0) {
    const names = contents.map((c) => c.name);
    const joined =
      names.length === 1
        ? names[0]
        : names.length === 2
        ? `${names[0]} and ${names[1]}`
        : `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;

    revealMsg = `, revealing ${joined}`;
  } else {
    revealMsg = ", but it's empty";
  }

  return {
    state: next,
    message: baseMsg + revealMsg + ".",
  };
}

export function tryCloseItem(
  state: GameState,
  item: Item
): { state: GameState; message: string } {
  // 1. Validate openable
  if (!isItemOpenable(item)) {
    return { state, message: "You can't close that." };
  }

  // 2. Already closed?
  if (!isItemOpen(state, item.id)) {
    return { state, message: "It's already closed." };
  }

  // 3. Close the container
  let next = setItemClosed(state, item.id, true);

  const msg = item.overrides?.open ?? "You close the " + item.name;

  return {
    state: next,
    message: msg + ".",
  };
}

// --- Doors ------------------------------------------------------------------

function getVisibleDoorsInRoom(
  state: GameState,
  roomId: string
): DoorDefinition[] {
  const room = state.world.rooms.find((r) => r.id === roomId);
  if (!room) return [];

  const doorIds = room.exits
    .map((e) => e.doorId)
    .filter((id): id is string => Boolean(id));

  const uniqueDoorIds = [...new Set(doorIds)];

  return uniqueDoorIds
    .map((id) => state.world.doors.find((d) => d.id === id))
    .filter((d): d is DoorDefinition => Boolean(d));
}

// Movement only needs to know “if I’m in A, what’s on the other side?”
function resolveDoorDestination(
  doorDef: DoorDefinition,
  fromRoomId: string
): string | undefined {
  const { roomAId, roomBId } = doorDef.connects;

  if (fromRoomId === roomAId) return roomBId;
  if (fromRoomId === roomBId) return roomAId;

  return undefined;
}

function canMoveThroughExit(
  state: GameState,
  exit: Exit,
  doorDef?: DoorDefinition,
  doorState?: DoorState,
  direction?: string
): { allowed: boolean; message?: string } {
  if (!doorDef) {
    // No door associated with this exit: free to move
    return { allowed: true };
  }

  const kind: DoorKind = doorDef.kind ?? "normal";

  // --- Badge-locked automatic doors ---
  if (kind === "badgeScanner") {
    const badgeId = doorDef.badgeItemId;

    if (!badgeId || doorDef.checkBadgeOnDir !== direction) {
      // Misconfigured door; fail open rather than soft-locking the game
      return { allowed: true };
    }
    const inventoryItems = getItemsInInventory(state);
    const hasBadge = inventoryItems.some((item: Item) => item.id === badgeId);

    if (!hasBadge) {
      return {
        allowed: false,
        message:
          "The door refuses to open as you approach it. The badge scanner emits a flat buzz and a red light on its surface flashes.",
      };
    }

    // Player has the badge: door silently opens and allows passage.
    // We ignore doorState.isOpen/isLocked for these.
    return {
      allowed: true,
      message:
        "The badge scanner flashes a barely visible laser that flickers over you. It seems to find what it was looking for and emits a satisfied chirp, then the door opens with a hydraulic sigh as you pass through.",
    };
  }

  // --- Normal doors and anything else fall through to existing logic ---

  if (!doorState) {
    // No state tracked, treat as open/passable
    return { allowed: true };
  }

  if (!doorState.isOpen) {
    if (!doorState.isLocked) {
      return { allowed: true, message: "You open the door and step through." };
    }
    return { allowed: false, message: "The door is closed." };
  }

  return { allowed: true };
}

function playerHasBadge(state: GameState, badgeId: string): boolean {
  return state.player.inventory.includes(badgeId);
}

function upsertDoorState(state: GameState, updated: DoorState): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      doors: {
        ...state.worldState.doors,
        [updated.id]: updated,
      },
    },
  };
}

// --- Advanced door logic (keyed / badges) -----------------------------------

export function tryOpenDoor(
  state: GameState,
  doorDef: DoorDefinition,
  doorState: DoorState
): { state: GameState; message: string } {
  // already open
  if (doorState.isOpen) {
    return { state, message: "The door is already open." };
  }

  if (doorDef.badgeItemId) {
    if (!playerHasBadge(state, doorDef.badgeItemId)) {
      return {
        state,
        message: "The doors are automatic, just walk in that direction.",
      };
    }
  }

  let nextDoorState: DoorState = { ...doorState };
  let nextState: GameState = state;

  if (nextDoorState.isLocked) {
    switch (doorDef.kind) {
      case "keyed": {
        if (!doorDef.keyItemId) {
          return { state, message: "It's locked." };
        }

        const hasKey = nextState.player.inventory.includes(doorDef.keyItemId);
        if (!hasKey) {
          return {
            state,
            message: "It's locked. You don't have the right key.",
          };
        }

        nextDoorState.isLocked = false;
        break;
      }

      case "badgeScanner": {
        if (!doorDef.badgeItemId) {
          return { state, message: "The scanner flashes red." };
        }

        const hasBadge = nextState.player.inventory.includes(
          doorDef.badgeItemId
        );
        if (!hasBadge) {
          return {
            state,
            message: "The scanner glows red. Nothing happens.",
          };
        }

        nextDoorState.isLocked = false;
        break;
      }

      case "airlock":
      case "scripted":
        return { state, message: "It's locked." };

      default:
        return { state, message: "It's locked." };
    }
  }

  // if we get here, it was unlocked or we just unlocked it
  nextDoorState.isOpen = true;
  nextState = upsertDoorState(nextState, nextDoorState);

  const openVerb = doorDef.openVerb ?? "opens";
  return {
    state: nextState,
    message: `The ${doorDef.name.toLowerCase()} ${openVerb}.`,
  };
}

export function tryCloseDoor(
  state: GameState,
  doorDef: DoorDefinition,
  doorState: DoorState
): { state: GameState; message: string } {
  if (!doorState.isOpen) {
    return { state, message: "It's already closed." };
  }

  const nextDoorState: DoorState = { ...doorState, isOpen: false };
  const nextState = upsertDoorState(state, nextDoorState);
  const closeVerb = doorDef.closeVerb ?? "closes";

  return {
    state: nextState,
    message: `The ${doorDef.name.toLowerCase()} ${closeVerb}.`,
  };
}

function getDoorDescriptionForRoom(
  doorDef: DoorDefinition,
  roomId: string
): string | undefined {
  const { connects } = doorDef;

  if (roomId === connects.roomAId) {
    return doorDef.descriptionFromA ?? doorDef.description;
  }

  if (roomId === connects.roomBId) {
    return doorDef.descriptionFromB ?? doorDef.description;
  }

  return doorDef.description;
}

function formatNameList(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

// --- Room description -------------------------------------------------------

export function buildRoomDescription(state: GameState, roomId: string): string {
  const room = state.world.rooms.find((room) => room.id === roomId);
  if (!room) return "You are nowhere. (Bug: room not found.)";

  // 0) Items in room, deduped by id
  const rawItemsHere = getItemsInRoom(state, roomId);
  const itemsHere = Array.from(
    new Map(rawItemsHere.map((it) => [it.id, it])).values()
  );

  const sceneryItems = itemsHere.filter(
    (item) => item.itemCategory === "scenery"
  );
  const nonSceneryItems = itemsHere.filter(
    (item) => item.itemCategory !== "scenery"
  );

  const doorsHere = getVisibleDoorsInRoom(state, roomId);

  const parts: string[] = [];

  // 1) Base room description
  parts.push(`${room.description.trim()}`);

  // 2) Scenery item descriptions
  if (sceneryItems.length > 0) {
    const sceneryText = sceneryItems
      .map((item) => item.sceneryDescription?.trim())
      .filter(Boolean)
      .join("\n\n");
    if (sceneryText) {
      parts.push(sceneryText);
    }
  }

  // 3) Door descriptions
  if (doorsHere.length > 0) {
    const doorText = doorsHere
      .map((door) => getDoorDescriptionForRoom(door, roomId))
      .filter((t): t is string => Boolean(t && t.trim()))
      .join("\n\n");

    if (doorText) {
      parts.push(doorText);
    }
  }

  // 4) Open containers + their contents (based on deduped itemsHere)
  const containersHere = itemsHere.filter((item) => item.isContainer);
  const containerLines: string[] = [];

  for (const container of containersHere) {
    if (!isItemOpen(state, container.id)) continue;

    const contents = getContainerContentsItems(state, container);
    if (contents.length === 0) continue;

    const names = contents.map((c) => c.name);
    const list = formatNameList(names);

    containerLines.push(
      `Inside the ${container.name.toLowerCase()} you can see ${list}.`
    );
  }

  if (containerLines.length > 0) {
    parts.push(containerLines.join(" "));
  }

  // 5) Non-scenery items list (stuff on the floor / not scenery)
  if (nonSceneryItems.length > 0) {
    const names = nonSceneryItems.map((item) => item.name).join(", ");
    parts.push(`You can also see ${names}.`);
  }

  return parts.join("\n\n");
}

// --- Teleport pads ----------------------------------------------------------

function getTeleportPadsInCurrentRoom(
  state: GameState
): TeleportPadDefinition[] {
  return state.world.teleportPads.filter(
    (pad) => pad.roomId === state.player.roomId
  );
}

function describeTeleportPads(state: GameState): string[] {
  const padsHere = getTeleportPadsInCurrentRoom(state);
  return padsHere.map((pad) => `A ${pad.label} glows faintly on the floor.`);
}

export function activateTeleportPad(
  state: GameState,
  pad: TeleportPadDefinition
): GameState {
  const ringPads = state.world.teleportPads
    .filter((p) => p.ringId === pad.ringId)
    .sort((a, b) => a.order - b.order);

  if (ringPads.length <= 1) {
    return appendLog(state, "Nothing happens.");
  }

  const index = ringPads.findIndex((p) => p.id === pad.id);
  const nextIndex = (index + 1) % ringPads.length;
  const dest = ringPads[nextIndex];

  const destRoom = state.world.rooms.find((r) => r.id === dest.roomId);
  const destName = destRoom?.name ?? "somewhere else";

  const newState: GameState = {
    ...state,
    player: {
      ...state.player,
      roomId: dest.roomId,
    },
  };

  return appendLog(
    newState,
    `You step onto the ${pad.label}. The world twists around you and you find yourself in ${destName}.`
  );
}

function resolveTeleportPadByNoun(
  state: GameState,
  noun: string | null
): TeleportPadDefinition | null {
  const padsHere = getTeleportPadsInCurrentRoom(state);
  if (!padsHere.length) return null;

  if (!noun) {
    // Allow bare "step" if there's only one pad here
    return padsHere.length === 1 ? padsHere[0] : null;
  }

  const lower = noun.toLowerCase();

  return (
    padsHere.find((p) => p.label.toLowerCase() === lower) ??
    padsHere.find((p) => p.label.toLowerCase().includes(lower)) ??
    null
  );
}

// --- Readable items ---------------------------------------------------------

function readReadable(state: GameState, noun: string): string {
  const item = resolveItemByNoun(state, noun);
  if (!item?.isReadable) {
    return "There's nothing to read.";
  }
  return `You read the ${item.name}...\n\n    "${item.readableText}"`;
}

// --- Turn handling ---------------------------------------------------------

function applyStatusEffectTick(
  state: GameState,
  effect: StatusEffect
): GameState {
  const vitals = state.player.vitals;
  let nextVitals = vitals;

  switch (effect.id) {
    case "trixophine": {
      let brainActivity = 4;
      if (effect.remainingTurns === 1) {
        brainActivity = 1;
      }
      nextVitals = {
        ...vitals,
        brainActivity: brainActivity,
      };
      const n = Math.floor(Math.random() * 1000) + 1;
      const nextState = {
        ...state,
        player: { ...state.player, vitals: nextVitals },
      };
      if (n === 1) {
        return appendLog(
          nextState,
          `A voice whispers in your ear: "Call me at 697442..."\n\nYou turn around, disoriented, but there's no one there.`
        );
      }
      if (n < 200) {
        return appendLog(nextState, "You giggle uncontrollably for a moment.");
      }
      if (n < 350) {
        return appendLog(
          nextState,
          "You feel a sudden wave of paranoia. Are you being watched..?"
        );
      }
      if (n < 500) {
        return appendLog(
          nextState,
          "Colors around you seem to shift and breathe in an unsettling way..."
        );
      }
      break;
    }
    case "bleeding": {
      const damage = effect.intensity; // 1–3, etc.
      nextVitals = {
        ...vitals,
        health: Math.max(0, vitals.health - damage),
      };
      break;
    }

    case "smokeInhalation": {
      nextVitals = {
        ...vitals,
        oxygen: Math.max(0, vitals.oxygen - effect.intensity),
      };
      break;
    }

    case "drunk": {
      nextVitals = {
        ...vitals,
        brainActivity: Math.min(5, vitals.brainActivity + 1),
      };
      break;
    }

    // add other statusIds as needed

    default:
      // Some statuses might just be flags, no per-turn change.
      break;
  }

  if (nextVitals === vitals) return state;

  return {
    ...state,
    player: {
      ...state.player,
      vitals: nextVitals,
    },
  };
}

function tickStatusEffects(state: GameState): GameState {
  const effects = state.player.statusEffects;
  if (!effects || effects.length === 0) return state;

  let nextState = state;
  const nextEffects: StatusEffect[] = [];

  for (const effect of effects) {
    // 1) Apply the per-turn impact
    nextState = applyStatusEffectTick(nextState, effect);

    // 2) Decrement remainingTurns / decide whether to keep it
    if (effect.remainingTurns == null) {
      // indefinite duration
      nextEffects.push(effect);
      continue;
    }

    const newTurns = effect.remainingTurns - 1;
    if (newTurns > 0) {
      nextEffects.push({ ...effect, remainingTurns: newTurns });
    }
    // if <= 0, it expires and is dropped
  }

  return {
    ...nextState,
    player: {
      ...nextState.player,
      statusEffects: nextEffects,
    },
  };
}

function advanceTurn(state: GameState): GameState {
  let next = state;

  // 1) Tick status effects
  next = tickStatusEffects(next);

  // 2) Tick any threat timers / world countdowns
  // next = tickThreatTimers(next);  // when you implement those

  // 3) Increment move counter
  next = {
    ...next,
    moves: next.moves + 1,
  };

  return next;
}

// --- Command handling -------------------------------------------------------

export function handleCommand(state: GameState, cmd: ParsedCommand): GameState {
  const room = getCurrentRoom(state);

  // --- Free commands (no turn cost) -----------------------------------

  if (cmd.type === "look") {
    const desc = buildRoomDescription(state, state.player.roomId);
    return appendLog(state, desc);
  }

  if (cmd.type === "inventory") {
    if (state.player.inventory.length === 0) {
      return appendLog(state, "You are carrying nothing.");
    }

    const names = state.player.inventory
      .map(
        (id) => state.world.items.find((i) => i.id === id)?.name ?? "something"
      )
      .join(", ");

    return appendLog(state, "You are carrying: " + names);
  }

  // --- Turn-consuming commands ---------------------------------------

  let resultState: GameState = state;

  switch (cmd.type) {
    case "move": {
      const exit = room.exits.find((e) => e.direction === cmd.direction);
      let moveMessage = "";
      if (!exit) {
        resultState = appendLog(state, "You can't go that way.");
        break;
      }

      let destinationRoomId: string | undefined;

      if (exit.doorId) {
        const doorDef = getDoorById(state, exit.doorId);
        const doorState = getDoorState(state, exit.doorId);

        if (!doorDef) {
          resultState = appendLog(state, "You can't go that way.");
          break;
        }

        const { allowed, message } = canMoveThroughExit(
          state,
          exit as any,
          doorDef,
          doorState,
          exit.direction
        );

        if (!allowed) {
          resultState = appendLog(state, message ?? "You can't go that way.");
          break;
        }
        if (message) {
          moveMessage += message;
        }

        destinationRoomId = resolveDoorDestination(
          doorDef,
          state.player.roomId
        );
      } else if (exit.toRoomId) {
        destinationRoomId = exit.toRoomId;
      }

      if (!destinationRoomId) {
        resultState = appendLog(state, "You can't go that way.");
        break;
      }

      const movedState: GameState = {
        ...state,
        player: {
          ...state.player,
          roomId: destinationRoomId,
        },
      };
      moveMessage +=
        moveMessage === ""
          ? `You go ${cmd.direction}.`
          : `\nYou go ${cmd.direction}.`;

      resultState = appendLog(movedState, moveMessage);
      break;
    }

    case "action": {
      const verb = cmd.verb;
      const direct = cmd.direct?.trim();
      const indirect = cmd.indirect?.trim();

      switch (verb) {
        // EXAMINE / LOOK AT
        case "examine": {
          if (!direct) {
            resultState = appendLog(state, "Examine what?");
            break;
          }
          const item = resolveItemByNoun(state, direct);
          if (!item) {
            resultState = appendLog(state, "You don't see that here.");
            break;
          }
          const desc = item.description || "You see nothing special.";
          resultState = appendLog(state, desc);
          break;
        }

        // READ
        case "read": {
          if (!direct) {
            resultState = appendLog(state, "Read what?");
            break;
          }
          const readResult = readReadable(state, direct);
          resultState = appendLog(state, readResult);
          break;
        }

        // TAKE
        case "take": {
          if (!direct) {
            resultState = appendLog(state, "Take what?");
            break;
          }
          resultState = takeItem(state, direct);
          break;
        }

        // DROP
        case "drop": {
          if (!direct) {
            resultState = appendLog(state, "Drop what?");
            break;
          }
          resultState = dropItem(state, direct);
          break;
        }

        // OPEN
        case "open": {
          if (!direct) {
            resultState = appendLog(state, "Open what?");
            break;
          }

          // 1) Is this a door?
          const doorResult = resolveDoorByNoun(state, direct);

          if (doorResult) {
            const { def, state: doorState } = doorResult;

            const { state: withDoorUpdated, message } = tryOpenDoor(
              state,
              def,
              doorState
            );

            resultState = appendLog(withDoorUpdated, message);
            break;
          }

          // 2) Otherwise, try to open an item in scope
          const itemToOpen = resolveItemByNoun(state, direct);

          if (!itemToOpen) {
            resultState = appendLog(state, "You don't see that here.");
            break;
          }

          const { state: withItemUpdated, message } = tryOpenItem(
            state,
            itemToOpen
          );

          resultState = appendLog(withItemUpdated, message);
          break;
        }

        // CLOSE
        case "close": {
          if (!direct) {
            resultState = appendLog(state, "Close what?");
            break;
          }

          // 1) Is this a door?
          const doorResult = resolveDoorByNoun(state, direct);

          if (doorResult) {
            const { def, state: doorState } = doorResult;

            const { state: withDoorUpdated, message } = tryCloseDoor(
              state,
              def,
              doorState
            );

            resultState = appendLog(withDoorUpdated, message);
            break;
          }

          // 2) Otherwise, try to close an item in scope
          const itemToClose = resolveItemByNoun(state, direct);

          if (!itemToClose) {
            resultState = appendLog(state, "You don't see that here.");
            break;
          }

          const { state: withItemUpdated, message } = tryCloseItem(
            state,
            itemToClose
          );

          resultState = appendLog(withItemUpdated, message);
          break;
        }

        // INJECT
        case "inject": {
          resultState = handleInject(state, cmd);
          break;
        }

        // PUT
        case "put": {
          // "put" with no direct object
          if (!direct) {
            resultState = appendLog(state, "Put what?");
            break;
          }

          // We currently only support "put X in/into Y"
          if (cmd.preposition !== "in" && cmd.preposition !== "into") {
            resultState = appendLog(
              state,
              "You can only 'put' things *in* something right now."
            );
            break;
          }

          if (!indirect) {
            resultState = appendLog(state, "Put it where?");
            break;
          }

          // Resolve the item to put
          const item = resolveItemByNoun(state, direct);
          if (!item) {
            resultState = appendLog(state, "You don't see that here.");
            break;
          }

          // only allow putting things you’re carrying
          if (!state.player.inventory.includes(item.id)) {
            resultState = appendLog(state, "You aren't carrying that.");
            break;
          }

          // Resolve the container
          const container = resolveItemByNoun(state, indirect);
          if (!container) {
            resultState = appendLog(state, "You don't see that here.");
            break;
          }

          const opResult = tryPutItemInContainer(state, item.id, container.id);

          if (typeof opResult === "string") {
            resultState = appendLog(state, opResult);
          } else {
            resultState = appendLog(opResult, "Done.");
          }
          break;
        }

        default: {
          resultState = appendLog(state, "I don't understand that.");
          break;
        }
      }

      break;
    }

    case "unknown":
    default: {
      resultState = appendLog(state, "I don't understand that.");
      break;
    }
  }

  // One tick of time for any turn-consuming command
  return advanceTurn(resultState);
}
