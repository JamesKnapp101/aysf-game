import type { ParsedCommand } from "../parse/parser";
import type {
  Direction,
  DoorDefinition,
  DoorState,
  GameState,
  Item,
  Room,
  StatusEffect,
  StatusId,
} from "../world/types";
import { appendLog } from "./engine";

// ---------------------------------------------
// Room selectors
// ---------------------------------------------

export function getCurrentRoom(state: GameState): Room {
  const room = state.world.rooms.find(
    (r: Room) => r.id === state.player.roomId
  );
  if (!room) {
    throw new Error(`Unknown room id: ${state.player.roomId}`);
  }
  return room;
}

export function getCurrentRoomExits(state: GameState): Direction[] {
  const room = getCurrentRoom(state);
  return room.exits?.map((exit) => exit.direction) ?? [];
}

// Generic: items in an arbitrary room
export function getItemsInRoom(state: GameState, roomId: string): Item[] {
  return state.world.items.filter((it) => it.location === roomId);
}

// Items in *current* room
export function getItemsInCurrentRoom(state: GameState): Item[] {
  const room = getCurrentRoom(state);
  return getItemsInRoom(state, room.id);
}

export function describeRoomWithItems(state: GameState): string {
  const room = getCurrentRoom(state);
  const itemsHere = getItemsInCurrentRoom(state);

  const itemNames = itemsHere.map((i) => i.name);
  const itemsText = itemNames.length
    ? `\n\nYou can see ${itemNames.join(", ")} here.`
    : "";

  return room.description + itemsText;
}

// ---------------------------------------------
// Door selectors
// ---------------------------------------------

export function getDoorById(
  state: GameState,
  id: string
): DoorDefinition | undefined {
  return state.world.doors.find((d) => d.id === id);
}

export function getDoorState(
  state: GameState,
  id: string
): DoorState | undefined {
  // worldState.doors is treated as a map: Record<string, DoorState>
  return state.worldState.doors[id];
}

/**
 * Resolve a door from a noun like "door" / "hatch" / "airlock"
 * scoped to the exits of the *current* room.
 */
export function resolveDoorByNoun(
  state: GameState,
  noun: string
): { def: DoorDefinition; state: DoorState } | null {
  const room = getCurrentRoom(state);
  const lower = noun.toLowerCase();

  // Doors attached to exits from THIS room
  const doorIds = room.exits
    .map((e) => e.doorId)
    .filter((id): id is string => Boolean(id));

  for (const doorId of doorIds) {
    const def = state.world.doors.find((d) => d.id === doorId);
    const doorState = state.worldState.doors[doorId];

    if (!def || !doorState) continue;

    const matches =
      def.name.toLowerCase() === lower ||
      (Array.isArray(def.vocab) &&
        def.vocab.some((v: string) => v.toLowerCase() === lower));

    if (matches) {
      return { def, state: doorState };
    }
  }

  return null;
}

// ---------------------------------------------
// Item selectors / helpers
// ---------------------------------------------

export function getItemById(state: GameState, id: string): Item | undefined {
  return state.world.items.find((it: Item) => it.id === id);
}

// Inventory derived from player.inventory
export function getItemsInInventory(state: GameState): Item[] {
  const invIds = new Set(state.player.inventory);
  return state.world.items.filter((it) => invIds.has(it.id));
}

// Legacy-style lookup using location === "INVENTORY" is *not*
// used anymore – rely on player.inventory instead.

/**
 * Normalization helpers for noun matching
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text).split(/\s+/).filter(Boolean);
}

/**
 * Resolve an item by noun, scoped to:
 *   - items in current room
 *   - items in inventory
 */
export function resolveItemByNoun(
  state: GameState,
  noun: string
): Item | undefined {
  const room = getCurrentRoom(state);
  const tokens = tokenize(noun);

  const itemsInScope = state.world.items.filter((it) => {
    return it.location === room.id || state.player.inventory.includes(it.id);
  });

  // 1) Exact id match
  const exactId = itemsInScope.find(
    (it) => normalize(it.id) === normalize(noun)
  );
  if (exactId) return exactId;

  // 2) Match by name: all tokens appear in item.name
  const byName = itemsInScope.find((it) => {
    const nameTokens = new Set(tokenize(it.name));
    return tokens.every((t) => nameTokens.has(t));
  });
  if (byName) return byName;

  // 3) Match by vocab: all tokens appear in item.vocab
  const byVocab = itemsInScope.find((it) => {
    if (!it.vocab?.length) return false;
    const vocabTokens = new Set(it.vocab.map((v) => normalize(v)));
    return tokens.every((t) => vocabTokens.has(t));
  });
  if (byVocab) return byVocab;

  return undefined;
}

/**
 * Simpler resolver used by inject logic, etc.
 * Scope: inventory + room surface items.
 */
export function resolveItemInScopeByNoun(
  state: GameState,
  noun: string
): Item | null {
  const lower = noun.toLowerCase();
  const room = getCurrentRoom(state);

  const invItems = state.world.items.filter((i) =>
    state.player.inventory.includes(i.id)
  );

  const roomItems = state.world.items.filter((i) => i.location === room.id);

  const candidates = [...invItems, ...roomItems];

  for (const item of candidates) {
    if (
      item.name.toLowerCase() === lower ||
      item.vocab.some((v) => v.toLowerCase() === lower)
    ) {
      return item;
    }
  }

  return null;
}

// ---------------------------------------------
// Containers / syringe
// ---------------------------------------------

export function isSerumCartridge(item: Item): boolean {
  return !item.isContainer && item.isSyringeCartridge === true;
}

export function tryPutItemInContainer(
  state: GameState,
  itemId: string,
  containerId: string
): GameState | string {
  const item = getItemById(state, itemId);
  const container = getItemById(state, containerId);

  if (!item || !container) {
    return "You don't see that here.";
  }

  if (!container.isContainer) {
    return "You can't put things in that.";
  }

  // --- special case: syringe -----------------------------------------
  if (container.id === "Syringe") {
    if (!isSerumCartridge(item)) {
      return "The syringe clamp is designed for standardized drug cartridges, not that.";
    }

    if (state.itemState.syringe.loadedCartridgeId) {
      return "The syringe is already loaded.";
    }

    const nextInventory = state.player.inventory.filter((id) => id !== item.id);

    return {
      ...state,
      player: {
        ...state.player,
        inventory: nextInventory,
      },
      itemState: {
        ...state.itemState,
        syringe: {
          ...state.itemState.syringe,
          loadedCartridgeId: item.id,
        },
      },
    };
  }

  // --- normal container path -----------------------------------------
  if (container.capacity != null) {
    const currentContents =
      state.itemState.containerContents[container.id] ??
      container.contains ??
      [];

    if (currentContents.length >= container.capacity) {
      return "There's no more room in that.";
    }

    const updatedContents = [...currentContents, item.id];

    return {
      ...state,
      player: {
        ...state.player,
        inventory: state.player.inventory.filter((id) => id !== item.id),
      },
      itemState: {
        ...state.itemState,
        containerContents: {
          ...state.itemState.containerContents,
          [container.id]: updatedContents,
        },
      },
    };
  }

  return "You can't seem to put that there.";
}

export function getContainerContentsIds(
  state: GameState,
  container: Item
): string[] {
  // 1) If we’ve already got dynamic contents, use that as source of truth
  const fromState = state.itemState.containerContents[container.id];
  if (fromState) {
    return fromState;
  }

  // 2) Otherwise, seed from:
  //    - items whose location === container.id
  //    - static container.contains (if you use it)
  const fromLocation = state.world.items
    .filter((it) => it.location === container.id)
    .map((it) => it.id);

  const fromStatic = container.contains ?? [];

  const merged = Array.from(new Set([...fromLocation, ...fromStatic]));

  return merged;
}

export function getContainerContentsItems(
  state: GameState,
  container: Item
): Item[] {
  const ids = getContainerContentsIds(state, container);
  return ids
    .map((id) => getItemById(state, id))
    .filter((it): it is Item => Boolean(it));
}

// ---------------------------------------------
// Status / diagnostics
// ---------------------------------------------

export function getStatusEffectById(
  state: GameState,
  effectId: string
): StatusEffect[] {
  return state.player.statusEffects.filter(
    (status: StatusEffect) => status.id === effectId
  );
}

export function describeSicknessLevel(state: GameState): string {
  const s = state.player.vitals.theSickness ?? 0;

  if (s < 25) {
    return "You don't seem to have contracted anything.";
  }
  if (s < 50) {
    return "Something has you feeling just a little off, some kind of bug, maybe.";
  }
  if (s < 100) {
    return "You seem to have come down with a case of the sniffles.";
  }
  if (s < 150) {
    return "You seem to have come down with a cold or something.";
  }
  if (s < 300) {
    return "You seem to have come down with a bad cold or something.";
  }
  if (s < 500) {
    return "You seem to have come down with a severe cold or something.";
  }
  if (s < 700) {
    return "You've come down with some kind of illness that seems to be getting worse.";
  }
  if (s < 900) {
    return "You've come down with some kind of flu-like illness that is getting worse.";
  }
  if (s < 1200) {
    return "You've contracted some kind of flu-like illness. Your condition is getting serious.";
  }
  if (s < 1500) {
    return "You've contracted some kind of very serious illness. Your condition is getting critical.";
  }
  if (s < 1700) {
    return "You've contracted some kind of deadly illness. Without medical attention of some kind, you're going to die.";
  }
  if (s < 1900) {
    return "You've contracted a deadly illness and you are burning up with fever; without medication you won't have long to live.";
  }
  if (s < 1950) {
    return "You've contracted a deadly illness which is entering its final stages; your tongue is swelling and you've developed an itching at the corners of the mouth and eyes.";
  }
  return "You've contracted a deadly illness which is entering its final stages...";
}

export function describeRadiationLevel(state: GameState): string {
  const re =
    state.player.statusEffects.filter((status: StatusEffect) => {
      return status.id === "radiation";
    }) ?? [];

  if (re.length === 0) {
    return "You have no signs of radiation exposure.";
  }

  const r = re[0];

  if (r.intensity <= 0) {
    return "You have no signs of radiation exposure.";
  }
  if (r.intensity < 10) {
    return "Your face and neck feel a little burned.";
  }
  if (r.intensity < 20) {
    return "Your face and neck feel a little burned and you feel a little tired.";
  }
  if (r.intensity < 30) {
    return "Your face and neck feel burned and you're starting to feel queasy.";
  }
  if (r.intensity < 40) {
    return "Your skin is starting to feel burned and itchy. You feel sick to your stomach.";
  }
  if (r.intensity < 50) {
    return "Your skin is starting to develop red blotches. You're starting to feel really sick.";
  }
  if (r.intensity < 60) {
    return "Your skin is starting to develop blisters. You feel really sick.";
  }
  if (r.intensity < 70) {
    return "Your skin is getting red and developing blisters. You feel weak and very nauseous.";
  }
  if (r.intensity < 80) {
    return "Your skin is blotchy and blistered and you're covered in sweat. Your hair is starting to fall out and you're sick to your stomach.";
  }
  if (r.intensity < 90) {
    return "Your skin is blotchy and blistered and sweat is pouring off you. Your hair is coming loose in clumps and you can barely keep from vomiting.";
  }
  return "Your skin is blotchy and blistered and sweat is pouring off you. Your hair is coming loose in clumps and you can barely keep from vomiting…";
}

export function describeBodyTemperatureLevel(state: GameState): string {
  const t = state.player.vitals.temperature ?? 98.6;

  if (t <= 89) {
    return "Your body has lost critical heat. You’re slipping toward hypothermia-induced unconsciousness.";
  }
  if (t < 92) {
    return "You’re shivering uncontrollably, fingers numb and clumsy. Thinking becomes slow and muddled.";
  }
  if (t < 95) {
    return "You’re shaking and disoriented. Your muscles ache from cold, and breathing feels shallow.";
  }
  if (t < 97) {
    return "You feel chilled to the core, skin cold and pale. You can’t seem to get warm.";
  }
  if (t < 99.5) {
    return "Your temperature feels normal.";
  }
  if (t < 101.5) {
    return "You feel warm and slightly flushed, with a dull ache behind the eyes.";
  }
  if (t < 103) {
    return "Your skin is hot and sweaty. Your head throbs, and you feel nauseous.";
  }
  if (t < 105) {
    return "Your body is overheating. You feel dizzy and weak, struggling to stay focused.";
  }
  if (t < 107) {
    return "Your fever is dangerously high. Every movement sends a pulse of pain through your skull.";
  }
  if (t < 110) {
    return "You are burning up, vision flickering at the edges. Your body is shutting down.";
  }

  return "Your core temperature is catastrophically elevated. Systems are failing. Death is imminent.";
}

export function describeCurrentEffects(state: GameState): string {
  const statusEffects = state.player.statusEffects ?? [];

  let effectsMsg = "";
  for (const statusEffect of statusEffects) {
    const effectId = statusEffect.id;
    switch (effectId) {
      case "drunk":
        effectsMsg += "You are feeling a little tipsy from the alcohol.\n\n";
        break;
      case "trixophine":
        effectsMsg += "You are on trixophine.\n";
        break;
      case "vanitrax":
        effectsMsg += "You are on vanitrax.\n";
        break;
      case "seritroxin":
        effectsMsg += "You are on seritroxin.\n";
        break;
      case "pentatrosin":
        effectsMsg += "You are on pentatrosin.\n";
        break;
      case "xantophol":
        effectsMsg += "You are on xantophol.\n";
        break;
      default:
        break;
    }
  }
  return effectsMsg;
}

// ---------------------------------------------
// Injection effect hook
// ---------------------------------------------

export function applyInjectionEffect(
  state: GameState,
  target: Item,
  cartridgeId: string
): GameState {
  const effectId = target.injectionEffectId;

  if (!effectId) {
    return state;
  }

  // TODO: wire into your status effect system:
  // return addStatusEffect(state, effectId, target.id);

  return state;
}

export function applyStatusEffectToPlayer(
  state: GameState,
  effectId: StatusId,
  turns: number
): GameState {
  const newEffect: StatusEffect = {
    id: effectId,
    intensity: 1,
    remainingTurns: turns,
  };

  return {
    ...state,
    player: {
      ...state.player,
      statusEffects: [...state.player.statusEffects, newEffect],
    },
  };
}

export function applyInjectionEffectToPlayer(
  state: GameState,
  cartridgeEffectId: StatusId,
  turns: number
): GameState {
  // Hook into your status effect system here:
  // e.g. return addStatusEffect(state, effectId, target.id);
  const withEffect = applyStatusEffectToPlayer(state, cartridgeEffectId, turns);

  let injectionMessage =
    "You grit your teeth and plunge the needle into your arm, slowly depressing the plunger.  As the serum floods through your bloodstream, ";
  switch (cartridgeEffectId) {
    case "trixophine":
      injectionMessage +=
        "you feel an almost immediate giddiness in your stomach which floods out to the rest of your body...";
      break;
    case "vanitrax":
      injectionMessage +=
        "you feel a bitter taste fill your mouth...a second later, a wave of fatigue slams into you.  Your legs buckle, and your vision gets a little blurry.  You take a step forward, but your body feels like it's turned to rubber; you take a few shambling steps forward and just manage to lower yourself face down onto the floor before you fall fast asleep...";
      break;
    case "seritroxin":
      if (state.player.statusEffects.some((se) => se.id === "radiation")) {
        injectionMessage +=
          "you feel a pervading giddy warmth, and a moment later the nausea begins to leave you. You take a deep breath...the symptoms of radiation sickness are subsiding.";
      } else {
        injectionMessage +=
          "you feel a pervading giddy warmth, but nothing more.";
      }
      injectionMessage +=
        "you feel a calming sensation spreading through your body.";
      break;
    case "pentatrosin":
      injectionMessage +=
        "you feel a dull heat permeate your body, causing a crippling wave of intense nausea..!";
      break;
    case "xantophol":
      injectionMessage +=
        "you feel a slight fuzziness which passes in a few seconds.  Otherwise, you don't feel any effects at all.";
      break;
    case "innoculant":
      injectionMessage +=
        "you feel a warmth which quickly turns to an uncomfortable heat pervading your body. You feel a surge of nausea and for a moment you think you might vomit, but then it begins to pass. The heat subsides into a warm feeling, then disappears, leaving you feeling tired, but otherwise okay.";
      break;
    default:
      injectionMessage += "you don't really feel any different.";
      break;
  }

  return appendLog(withEffect, injectionMessage);
}

export function handleInject(state: GameState, cmd: ParsedCommand): GameState {
  // We only support this for parsed action commands
  if (cmd.type !== "action" || cmd.verb !== "inject") {
    return appendLog(state, "You can't do that.");
  }

  // Require syringe in inventory
  const hasSyringe = state.player.inventory.includes("Syringe");
  if (!hasSyringe) {
    return appendLog(state, "You aren't carrying the syringe.");
  }

  if (!state.itemState.syringe.loadedCartridgeId) {
    return appendLog(state, "The syringe is empty.");
  }

  // Prefer "indirect" as the target if present ("inject syringe into bar"),
  // otherwise use "direct" ("inject me", "inject bar").
  const rawTarget =
    (cmd.indirect && cmd.indirect.trim()) ||
    (cmd.direct && cmd.direct.trim()) ||
    "";

  const targetNoun = rawTarget.toLowerCase();

  if (!targetNoun) {
    return appendLog(state, "Inject what?");
  }

  // Special case: inject self
  if (["me", "self", "myself"].includes(targetNoun)) {
    const doseItem = getItemById(
      state,
      state.itemState.syringe.loadedCartridgeId
    );
    const injectionEffectId = doseItem?.injectionEffectId ?? "none";
    let turns = 0;
    switch (injectionEffectId) {
      case "trixophine":
        turns = 25;
        break;
      case "vanitrax":
        turns = 20;
        break;
      case "seritroxin":
        turns = 15;
        break;
      case "pentatrosin":
        turns = 10;
        break;
      case "xantophol":
        turns = 5;
        break;
      default:
        turns = 0;
        break;
    }

    const next = applyInjectionEffectToPlayer(state, injectionEffectId, turns);

    return {
      ...next,
      itemState: {
        ...next.itemState,
        syringe: {
          ...next.itemState.syringe,
          loadedCartridgeId: undefined, // cartridge spent
        },
      },
    };
  }

  const targetItem = resolveItemInScopeByNoun(state, targetNoun);
  if (!targetItem) {
    return appendLog(state, "You don't see that here.");
  }

  if (!targetItem.isInjectable) {
    return appendLog(
      state,
      "That doesn't seem like a good candidate for an injection."
    );
  }

  const afterEffect = applyInjectionEffect(
    state,
    targetItem,
    state.itemState.syringe.loadedCartridgeId!
  );

  return {
    ...afterEffect,
    itemState: {
      ...afterEffect.itemState,
      syringe: {
        ...afterEffect.itemState.syringe,
        loadedCartridgeId: undefined,
      },
    },
  };
}
