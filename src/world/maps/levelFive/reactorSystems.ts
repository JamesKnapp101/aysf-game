import {
  movePlayerToRoom,
  triggerPlayerDeath,
} from "@game/helpers/gameHelpers";
import { updateItemLocation } from "@game/rules/items";
import { inventoryHas, removeFromAllBuckets } from "@game/rules/state";
import { setExternalRoomTemperatureF } from "@game/selectors/roomTemperatureSelectors";
import type { RuleResult } from "@game/rules/result";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { ItemCommandOverrideContext } from "@game/types/itemTypes";
import type { ConversationTarget } from "@game/types/npcTypes";
import {
  CORRUPTED_REACTOR_LOBE_ID,
  getReactorConsensusState,
  installReplacementReactorLobe,
} from "./reactorConsensus";

export const COOLANT_PANEL_ID = "ReactorCoolantPanel";
export const COOLANT_VALVE_ID = "ReactorCoolantValve";
export const COOLANT_GAUGE_ID = "ReactorCoolantGauge";
export const REACTOR_LOBE_ARRAY_ID = "ReactorLobeArray";
export const CORRUPTED_LOBE_ITEM_ID = "CorruptedArrayLobe13";
export const DAMAGED_REACTOR_LOBE_ITEM_ID = "DamagedPlatformReactorLobe";
export const REPLACEMENT_REACTOR_LOBE_ITEM_ID = "ReplacementReactorLobe";
export const REACTOR_SUPPLY_LOCKER_ID = "ReactorSupplyLocker";
export const REACTOR_TERMINAL_ID = "ReactorControlTerminal";
export const REACTOR_KEY_SLOT_ID = "ReactorTerminalKeySlot";
export const ENGINE_ROOM_KEY_ID = "EngineRoomKey";
export const VIRTUAL_GOGGLES_ID = "ReactorVirtualGoggles";
export const VIRTUAL_OFFICE_ROOM_ID = "LemsterVirtualOffice";
export const VIRTUAL_MANAGER_OFFICE_ROOM_ID = "VirtualManagerOffice";
export const VIRTUAL_MANAGER_ID = "VirtualManager";

export const REACTOR_TERMINAL_AUTH_TRIGGER =
  "ReactorTerminalAuthenticated";
export const REACTOR_KEY_TURNED_TRIGGER = "ReactorTerminalKeyTurned";
export const REACTOR_RESTARTED_TRIGGER = "ReactorCoreRestarted";
export const REACTOR_CORE_FATAL_BODY_TEMPERATURE_F = 106;

const REACTOR_CORE_HEAT_STROKE_CAUSE = "reactor core heat stroke";

export type CoolantValvePosition = -1 | 0 | 1;

export function getCoolantValvePosition(
  state: GameState,
): CoolantValvePosition {
  const settings = state.itemState.itemSettings[COOLANT_VALVE_ID];
  return settings?.kind === "reactor-coolant-valve"
    ? settings.position
    : 0;
}

export function setCoolantValvePosition(
  state: GameState,
  position: CoolantValvePosition,
): GameState {
  return {
    ...state,
    itemState: {
      ...state.itemState,
      itemSettings: {
        ...state.itemState.itemSettings,
        [COOLANT_VALVE_ID]: {
          kind: "reactor-coolant-valve",
          position,
        },
      },
    },
  };
}

export function getReactorCoreTemperatureF(state: GameState): 88 | 101 | 108 {
  const position = getCoolantValvePosition(state);
  if (position === -1) return 108;
  if (position === 1) return 88;
  return 101;
}

export function setCoolantValve(
  context: ItemCommandOverrideContext,
): RuleResult {
  const raw = context.cmd.raw.toLowerCase();
  const match = raw.match(/(?:to\s+)?(-1|0|1)\s*$/);
  if (!match) {
    return {
      state: context.state,
      message: "The coolant valve accepts only -1, 0, or 1.",
    };
  }

  const position = Number(match[1]) as CoolantValvePosition;
  const current = getCoolantValvePosition(context.state);
  if (position === current) {
    return {
      state: context.state,
      message: `The coolant valve is already set to ${position}.`,
    };
  }

  let state = setCoolantValvePosition(context.state, position);
  const temperature = getReactorCoreTemperatureF(state);
  state = setExternalRoomTemperatureF(state, "ReactorCore", temperature);
  const direction =
    position === -1
      ? "The blue side of the gauge falls as the red side climbs."
      : position === 1
        ? "The blue side of the gauge climbs as the red side retreats."
        : "The red and blue halves settle into balance.";

  return {
    state,
    message: `You set the coolant valve to ${position}. ${direction} The projected Reactor Core temperature stabilizes at ${temperature} degrees Fahrenheit.`,
  };
}

export function describeCoolantGauge(state: GameState): string {
  const position = getCoolantValvePosition(state);
  const temperature = getReactorCoreTemperatureF(state);
  if (position === -1) {
    return `The split pressure gauge leans hard into its red half. Coolant flow is reduced, and the Reactor Core projection reads ${temperature} degrees Fahrenheit.`;
  }
  if (position === 1) {
    return `The split pressure gauge leans into its blue half. Coolant flow is elevated, and the Reactor Core projection reads ${temperature} degrees Fahrenheit.`;
  }
  return `The red and blue halves of the pressure gauge are balanced. The Reactor Core projection reads ${temperature} degrees Fahrenheit.`;
}

export function isCorruptedLobeRemoved(state: GameState): boolean {
  return (
    getReactorConsensusState(state).lobes.find(
      (lobe) => lobe.id === CORRUPTED_REACTOR_LOBE_ID,
    )?.status === "missing"
  );
}

export function isReplacementLobeInstalled(state: GameState): boolean {
  const status = getReactorConsensusState(state).lobes.find(
    (lobe) => lobe.id === CORRUPTED_REACTOR_LOBE_ID,
  )?.status;
  return status === "harmonic";
}

export function installReplacementLobe(state: GameState): RuleResult {
  if (!isCorruptedLobeRemoved(state)) {
    return {
      state,
      message:
        "Lobe 13 still occupies the socket. The replacement cannot be seated until the corrupted module is removed.",
    };
  }

  let next = installReplacementReactorLobe(state);
  next = updateItemLocation(
    next,
    REPLACEMENT_REACTOR_LOBE_ITEM_ID,
    REACTOR_LOBE_ARRAY_ID,
  );
  next = {
    ...next,
    player: {
      ...next.player,
      inventory: removeFromAllBuckets(
        next.player.inventory,
        REPLACEMENT_REACTOR_LOBE_ITEM_ID,
      ),
    },
    itemState: {
      ...next.itemState,
      containerContents: {
        ...next.itemState.containerContents,
        [REACTOR_LOBE_ARRAY_ID]: [REPLACEMENT_REACTOR_LOBE_ITEM_ID],
      },
    },
  };

  return {
    state: next,
    message:
      "The replacement lobe slides into socket 13 and its gold pins engage with a satisfying mechanical snap. Hexagon 13 turns green; every red lobe on the Big Board shifts to yellow as the array begins reconsidering the corrupted consensus.",
  };
}

export function resolveReactorCoreAccess(
  state: GameState,
  context: {
    destinationRoomId: string;
    fromRoomId: string;
  },
): { kind: "block"; message: string; state: GameState } | undefined {
  if (
    context.fromRoomId !== "ReactorControlRoom" ||
    context.destinationRoomId !== "ReactorCore" ||
    isReplacementLobeInstalled(state)
  ) {
    return undefined;
  }

  return {
    kind: "block",
    state,
    message:
      "The little core elevator refuses to descend. Its display reads: LOBE ARRAY FAULT — REPLACE CORRUPTED MODULE 13.",
  };
}

export function authenticateReactorTerminal(
  state: GameState,
  password: string,
): RuleResult {
  if (password !== "3thiC4L") {
    return { state, message: "ACCESS DENIED — INVALID ETHICS CREDENTIAL." };
  }

  return {
    state: {
      ...state,
      worldState: {
        ...state.worldState,
        conditionalTriggers: {
          ...state.worldState.conditionalTriggers,
          [REACTOR_TERMINAL_AUTH_TRIGGER]: true,
        },
      },
    },
    message: "ACCESS GRANTED — REACTOR CONTROL MENU UNLOCKED.",
  };
}

export function isReactorTerminalAuthenticated(state: GameState): boolean {
  return Boolean(
    state.worldState.conditionalTriggers[REACTOR_TERMINAL_AUTH_TRIGGER],
  );
}

export function turnReactorTerminalKey(state: GameState): RuleResult {
  if (
    !state.itemState.containerContents[REACTOR_KEY_SLOT_ID]?.includes(
      ENGINE_ROOM_KEY_ID,
    )
  ) {
    return {
      state,
      message: "The key receptacle is empty.",
    };
  }

  return {
    state: {
      ...state,
      worldState: {
        ...state.worldState,
        conditionalTriggers: {
          ...state.worldState.conditionalTriggers,
          [REACTOR_KEY_TURNED_TRIGGER]: true,
        },
      },
    },
    message:
      "You turn the Engine Room Key. Heavy contacts close behind the panel and the reactor terminal changes from amber to green.",
  };
}

export function insertReactorTerminalKey(state: GameState): RuleResult {
  if (
    state.itemState.containerContents[REACTOR_KEY_SLOT_ID]?.includes(
      ENGINE_ROOM_KEY_ID,
    )
  ) {
    return { state, message: "The Engine Room Key is already inserted." };
  }
  if (!inventoryHas(state.player.inventory, ENGINE_ROOM_KEY_ID)) {
    return { state, message: "You do not have the Engine Room Key." };
  }

  let next = updateItemLocation(state, ENGINE_ROOM_KEY_ID, REACTOR_KEY_SLOT_ID);
  next = {
    ...next,
    player: {
      ...next.player,
      inventory: removeFromAllBuckets(next.player.inventory, ENGINE_ROOM_KEY_ID),
    },
    itemState: {
      ...next.itemState,
      containerContents: {
        ...next.itemState.containerContents,
        [REACTOR_KEY_SLOT_ID]: [ENGINE_ROOM_KEY_ID],
      },
    },
  };
  return {
    state: next,
    message: "The Engine Room Key seats firmly in the reactor receptacle.",
  };
}

export function restartReactorCore(state: GameState): RuleResult {
  if (!isReactorTerminalAuthenticated(state)) {
    return { state, message: "The reactor terminal is still locked." };
  }
  if (!state.worldState.conditionalTriggers[REACTOR_KEY_TURNED_TRIGGER]) {
    return {
      state,
      message: "The terminal requests the Engine Room Key authorization.",
    };
  }
  if (!isReplacementLobeInstalled(state)) {
    return {
      state,
      message: "RESTART BLOCKED — LOBE ARRAY FAULT 13 REMAINS ACTIVE.",
    };
  }

  return {
    state: {
      ...state,
      worldState: {
        ...state.worldState,
        conditionalTriggers: {
          ...state.worldState.conditionalTriggers,
          [REACTOR_RESTARTED_TRIGGER]: true,
        },
        powerRestoredSections: {
          ...state.worldState.powerRestoredSections,
          ["engine-room-power-lock"]: true,
        },
        roomAudioLevel: {
          ...state.worldState.roomAudioLevel,
          ReactorCore: 6,
        },
      },
    },
    message:
      "REACTOR RESTART ACCEPTED. The core answers with a deep metallic concussion, then settles into a powerful, even thrum.",
  };
}

export function enterVirtualOffice(state: GameState): GameState {
  const next = movePlayerToRoom(state, VIRTUAL_OFFICE_ROOM_ID, {
    fromRoomId: state.player.roomId,
    via: "virtual goggles",
  });
  return {
    ...next,
    itemState: {
      ...next.itemState,
      wornByPlayer: {
        ...next.itemState.wornByPlayer,
        face: VIRTUAL_GOGGLES_ID,
      },
    },
  };
}

export function leaveVirtualOffice(state: GameState): GameState {
  const next = movePlayerToRoom(state, "ReactorCore", {
    fromRoomId: state.player.roomId,
    via: "remove virtual goggles",
  });
  return {
    ...next,
    itemState: {
      ...next.itemState,
      wornByPlayer: {
        ...next.itemState.wornByPlayer,
        face: undefined,
      },
    },
  };
}

export function abortVirtualOffice(state: GameState): ActionResult | undefined {
  if (
    state.player.roomId !== VIRTUAL_OFFICE_ROOM_ID &&
    state.player.roomId !== VIRTUAL_MANAGER_OFFICE_ROOM_ID
  ) {
    return undefined;
  }

  return {
    state: leaveVirtualOffice(state),
    message:
      "You hit the virtual office abort. The fluorescent ceiling tears into white pixels, and the hot Reactor Core slams back into focus.",
    consumesTurn: false,
  };
}

function tickVirtualManager(state: GameState): {
  message?: string;
  state: GameState;
} {
  if (
    state.player.roomId !== VIRTUAL_OFFICE_ROOM_ID &&
    state.player.roomId !== VIRTUAL_MANAGER_OFFICE_ROOM_ID
  ) {
    return { state };
  }
  if (state.moves % 4 !== 3) return { state };
  const currentRoom =
    state.itemState.itemRoomId[VIRTUAL_MANAGER_ID] ??
    VIRTUAL_MANAGER_OFFICE_ROOM_ID;
  const destination =
    currentRoom === VIRTUAL_MANAGER_OFFICE_ROOM_ID
      ? VIRTUAL_OFFICE_ROOM_ID
      : VIRTUAL_MANAGER_OFFICE_ROOM_ID;
  const next = updateItemLocation(state, VIRTUAL_MANAGER_ID, destination);

  if (
    destination === VIRTUAL_OFFICE_ROOM_ID &&
    state.player.roomId === VIRTUAL_OFFICE_ROOM_ID
  ) {
    return {
      state: next,
      message:
        "The robot manager storms through the doorway. ‘Lemster, everybody is feeling the pain. It’s do-or-die time, and yes, it’s going to suck—but we are a team, so drive, drive, drive!’ Lemster types faster without looking up.",
    };
  }

  return { state: next };
}

function describeReactorCoreHeatIncrease(temperature: number): string {
  const reading = temperature.toFixed(1);

  if (temperature < 100) {
    return `The Reactor Core's heat settles deeper into your skin. Your body temperature rises to ${reading} F.`;
  }
  if (temperature < 102) {
    return `Sweat beads across your skin as the Reactor Core keeps heating you. Your body temperature climbs to ${reading} F.`;
  }
  if (temperature < 104) {
    return `The Reactor Core's heat is becoming dangerous. Your head throbs as your body temperature climbs to ${reading} F.`;
  }
  if (temperature < REACTOR_CORE_FATAL_BODY_TEMPERATURE_F) {
    return `Your body is losing its fight against the Reactor Core's heat. Dizzy and weak, you feel your temperature climb to ${reading} F.`;
  }

  return `Your body temperature reaches ${reading} F. The Reactor Core's heat overwhelms you; dizziness becomes confusion, your legs buckle, and heat stroke shuts your body down.`;
}

export function tickReactorSystems(state: GameState): {
  messages?: string[];
  state: GameState;
} {
  let next = state;
  const messages: string[] = [];

  if (next.player.roomId === "ReactorCore") {
    const roomTemperature = getReactorCoreTemperatureF(next);
    const increase = roomTemperature === 108 ? 0.45 : roomTemperature >= 100 ? 0.18 : 0.06;
    const temperature = Math.min(
      110,
      next.player.vitals.temperature + increase,
    );
    next = {
      ...next,
      player: {
        ...next.player,
        vitals: {
          ...next.player.vitals,
          temperature,
        },
      },
    };

    if (temperature >= REACTOR_CORE_FATAL_BODY_TEMPERATURE_F) {
      next = triggerPlayerDeath(
        next,
        describeReactorCoreHeatIncrease(temperature),
        REACTOR_CORE_HEAT_STROKE_CAUSE,
      );
    } else {
      messages.push(describeReactorCoreHeatIncrease(temperature));
    }
  }

  const manager = tickVirtualManager(next);
  next = manager.state;
  if (manager.message) messages.push(manager.message);

  return { state: next, messages };
}

export function handleVirtualManagerConversation(
  state: GameState,
  target: ConversationTarget,
): ActionResult | undefined {
  if (
    target.kind !== "npc" ||
    target.npc.id !== VIRTUAL_MANAGER_ID ||
    state.player.roomId !== VIRTUAL_OFFICE_ROOM_ID
  ) {
    return undefined;
  }

  return {
    state,
    message:
      "The robot manager does not acknowledge you. It keeps its glare fixed on Lemster and launches into another speech about shared pain and team velocity.",
  };
}
