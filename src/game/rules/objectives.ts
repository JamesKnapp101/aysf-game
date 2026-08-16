import { inventoryHas, inventoryHasAll } from "@game/rules/state";
import type {
  GamePreserveDifficulty,
  GameState,
  PlayerObjective,
} from "@game/types/gameTypes";

export type ObjectiveCommandContext = {
  attemptedDestinationRoomId?: string;
  commandDirect?: string;
  commandText?: string;
  commandType?: string;
  commandVerb?: string;
  direction?: string;
  fromRoomId?: string;
  message?: string;
  targetItemId?: string;
  toRoomId?: string;
};

type ObjectivePredicate = (
  previous: GameState,
  state: GameState,
  context: ObjectiveCommandContext,
) => boolean;

type ObjectiveDefinition = {
  activateWhen?: ObjectivePredicate;
  completeWhen: ObjectivePredicate;
  id: string;
  initial?: boolean;
  optional?: boolean;
  title: string;
};

const PRESERVE_DIFFICULTY_BY_ANIMAL = {
  badger: "very-easy",
  boar: "easy",
  bull: "moderate",
  bear: "hard",
  barry: "very-hard",
} as const satisfies Record<string, GamePreserveDifficulty>;

function hasVisited(state: GameState, roomId: string): boolean {
  return (
    state.player.roomId === roomId ||
    state.worldState.visitedRooms?.[roomId] === true
  );
}

function hasTrigger(state: GameState, triggerId: string): boolean {
  return state.worldState.conditionalTriggers?.[triggerId] === true;
}

function hasAnyTrigger(state: GameState, triggerIds: string[]): boolean {
  return triggerIds.some((triggerId) => hasTrigger(state, triggerId));
}

function hasItem(state: GameState, itemId: string): boolean {
  return inventoryHas(state.player.inventory, itemId);
}

function hasAllItems(state: GameState, itemIds: string[]): boolean {
  return inventoryHasAll(state.player.inventory, itemIds);
}

function readItem(context: ObjectiveCommandContext, itemId: string): boolean {
  return context.commandVerb === "read" && context.targetItemId === itemId;
}

function playerHasReadItem(state: GameState, itemName: string): boolean {
  return (state.player.log ?? []).some(
    (entry) => entry.source.toLowerCase() === itemName.toLowerCase(),
  );
}

function contextText(context: ObjectiveCommandContext): string {
  return [
    context.commandText,
    context.commandDirect,
    context.message,
  ]
    .filter(Boolean)
    .join("\n");
}

function transcriptHas(state: GameState, pattern: RegExp): boolean {
  return state.log.some((entry) => pattern.test(entry));
}

function playerLogHas(
  state: GameState,
  ...patterns: RegExp[]
): boolean {
  return (state.player.log ?? []).some((entry) => {
    const text = `${entry.title}\n${entry.body}\n${entry.source}`;
    return patterns.every((pattern) => pattern.test(text));
  });
}

function attemptedMove(
  context: ObjectiveCommandContext,
  fromRoomId: string,
  options: {
    destinationRoomId?: string;
    direction?: string;
    message?: RegExp;
  } = {},
): boolean {
  if (context.commandType !== "move") return false;
  if (context.fromRoomId !== fromRoomId) return false;
  if (options.direction && context.direction !== options.direction) return false;
  if (
    options.destinationRoomId &&
    context.attemptedDestinationRoomId !== options.destinationRoomId
  ) {
    return false;
  }
  if (options.message && !options.message.test(context.message ?? "")) {
    return false;
  }

  return true;
}

function triedBlockedMove(
  context: ObjectiveCommandContext,
  fromRoomId: string,
  options: {
    destinationRoomId?: string;
    direction?: string;
    message?: RegExp;
  } = {},
): boolean {
  if (!attemptedMove(context, fromRoomId, options)) return false;

  const stayedInPlace =
    context.toRoomId === undefined || context.toRoomId === context.fromRoomId;
  const hasBlockLanguage = /can't|cannot|blocked|jammed|refuses|need|sorry|vacuum|won't/i.test(
    context.message ?? "",
  );

  return stayedInPlace || hasBlockLanguage;
}

function reactorLobeIsReplaced(state: GameState): boolean {
  return (
    state.worldState.reactorConsensus?.lobes.some(
      (lobe) => lobe.id === "reactor-lobe-13" && lobe.status === "harmonic",
    ) === true
  );
}

function reactorWarningSeen(
  _previous: GameState,
  state: GameState,
  context: ObjectiveCommandContext,
): boolean {
  const contextHasWarning = /reactor[\s\S]{0,80}(overload|unstable|overheat|meltdown)|overload[\s\S]{0,80}reactor/i.test(
    contextText(context),
  );

  return (
    hasTrigger(state, "MysteriousNoteFound") ||
    hasTrigger(state, "radioFirstCall") ||
    contextHasWarning ||
    playerLogHas(state, /reactor/i, /overload|unstable|overheat|meltdown/i) ||
    transcriptHas(
      state,
      /reactor[\s\S]{0,80}(overload|unstable|overheat|meltdown)|overload[\s\S]{0,80}reactor/i,
    )
  );
}

function mysteriousNoteRead(
  _previous: GameState,
  state: GameState,
  context: ObjectiveCommandContext,
): boolean {
  return (
    hasTrigger(state, "MysteriousNoteFound") ||
    readItem(context, "MysteriousNote") ||
    playerHasReadItem(state, "mysterious note")
  );
}

function quartersEquipmentObtained(state: GameState): boolean {
  return hasAllItems(state, ["DNAReader", "MindGun", "MindCap"]);
}

function labReportRead(
  _previous: GameState,
  _state: GameState,
  context: ObjectiveCommandContext,
): boolean {
  return readItem(context, "LabReport");
}

function researchNotesRead(
  _previous: GameState,
  state: GameState,
  context: ObjectiveCommandContext,
): boolean {
  return (
    readItem(context, "ResearchNotes") ||
    playerHasReadItem(state, "research notes")
  );
}

function zoologistLogSeen(
  _previous: GameState,
  state: GameState,
  context: ObjectiveCommandContext,
): boolean {
  return (
    /zoology|zoologist/i.test(contextText(context)) &&
      /orange badge|orange plastic security badge/i.test(contextText(context)) ||
    playerLogHas(state, /zoology|zoologist/i, /orange badge|orange plastic/i)
  );
}

function threatSeen(
  _previous: GameState,
  state: GameState,
  context: ObjectiveCommandContext,
): boolean {
  const text = contextText(context);
  const examinedBody =
    context.commandVerb === "examine" &&
    /\b(body|corpse|dead|husk|remains)\b/i.test(text) &&
    /contagious|infection|infect|syndrome|pinhole|dissolv|absorbed|liquef|shrew nebula/i.test(
      text,
    );

  return (
    state.player.statusEffects.some((effect) => effect.id === "syndrome x") ||
    examinedBody ||
    /Shrew Nebula/i.test(text) ||
    transcriptHas(state, /Shrew Nebula/i) ||
    playerLogHas(state, /Shrew Nebula|syndrome x|contagious/i)
  );
}

function threatEradicated(state: GameState): boolean {
  return (
    state.worldState.scoresTriggered?.defeated_xl999 === true ||
    hasAnyTrigger(state, [
      "OzoneFloodedShip",
      "ShipOzoneFlooded",
      "WaterTreatmentOzoneRerouted",
      "OzoneReroutedToShip",
      "ThreatEradicated",
    ])
  );
}

type PreserveObjectiveAnimalId = keyof typeof PRESERVE_DIFFICULTY_BY_ANIMAL;

function preserveAnimalActive(
  state: GameState,
  animalId: PreserveObjectiveAnimalId,
): boolean {
  return (
    state.player.roomId === "GamePreserveEntrance" &&
    state.worldState.gamePreserve.run?.activeAnimalId === animalId
  );
}

function preserveAnimalCompleted(
  state: GameState,
  animalId: PreserveObjectiveAnimalId,
): boolean {
  const difficulty = PRESERVE_DIFFICULTY_BY_ANIMAL[animalId];
  return state.worldState.gamePreserve.completedDifficulties?.[difficulty] === true;
}

function createPreserveObjective(
  animalId: PreserveObjectiveAnimalId,
): ObjectiveDefinition {
  const title =
    animalId === "barry" ? "Preserve Barry" : `Preserve the ${animalId}`;

  return {
    id: `preserve_${animalId}`,
    title,
    optional: true,
    activateWhen: (_previous, state) => preserveAnimalActive(state, animalId),
    completeWhen: (_previous, state) => preserveAnimalCompleted(state, animalId),
  };
}

export const OBJECTIVE_DEFINITIONS: readonly ObjectiveDefinition[] = [
  {
    id: "restore_power",
    title: "Restore power",
    initial: true,
    completeWhen: (_previous, state) =>
      state.worldState.powerRestoredSections["power-initialized"] === true,
  },
  {
    id: "get_quarters_equipment",
    title: "Get equipment from your quarters",
    activateWhen: (previous, state, context) =>
      mysteriousNoteRead(previous, state, context) ||
      hasTrigger(state, "radioFirstCall"),
    completeWhen: (_previous, state) => quartersEquipmentObtained(state),
  },
  {
    id: "access_lab_for_threat_info",
    title: "Access lab to find more info on nature of threat",
    activateWhen: mysteriousNoteRead,
    completeWhen: labReportRead,
  },
  {
    id: "find_strange_holes_cause",
    title: 'Find out what caused the "strange holes"',
    activateWhen: mysteriousNoteRead,
    completeWhen: researchNotesRead,
  },
  {
    id: "access_vivarium_park",
    title: "Access Vivarium Park",
    activateWhen: (_previous, _state, context) =>
      triedBlockedMove(context, "ParkEntrance", {
        destinationRoomId: "ParkWest",
        direction: "west",
        message: /park pass|robot scans|stickler/i,
      }),
    completeWhen: (_previous, state) => hasVisited(state, "ParkWest"),
  },
  {
    id: "prevent_reactor_overheating",
    title: "Prevent the reactor from overheating",
    activateWhen: reactorWarningSeen,
    completeWhen: (_previous, state) => reactorLobeIsReplaced(state),
  },
  {
    id: "access_level_two",
    title: "Find a way to access Level 2",
    activateWhen: (_previous, state, context) =>
      (hasVisited(state, "StairTwo") && !hasVisited(state, "StorageL2")) ||
      triedBlockedMove(context, "StairTwo", {
        destinationRoomId: "StorageL2",
        direction: "west",
      }),
    completeWhen: (_previous, state) => hasVisited(state, "StorageL2"),
  },
  {
    id: "find_zoologist",
    title: "Find the Zoologist",
    activateWhen: zoologistLogSeen,
    completeWhen: (_previous, state) => hasItem(state, "orangebadge"),
  },
  {
    id: "access_hydroponics",
    title: "Access Hydroponics",
    activateWhen: (_previous, state, context) =>
      (hasVisited(state, "LevelSixCorridorEnd") &&
        !hasTrigger(state, "HydroponicsDoorUnblocked")) ||
      triedBlockedMove(context, "LevelSixCorridorEnd", {
        destinationRoomId: "HydroponicsPlatform",
        direction: "south",
      }),
    completeWhen: (_previous, state) => hasVisited(state, "HydroponicsPlatform"),
  },
  {
    id: "obtain_yellow_badge",
    title: "Obtain yellow badge",
    activateWhen: (_previous, _state, context) =>
      context.commandVerb === "take" &&
      /yellow\s+badge/i.test(contextText(context)) &&
      /weightlifter|trapped|pinned|move him/i.test(context.message ?? ""),
    completeWhen: (_previous, state) => hasItem(state, "yellowbadge"),
  },
  {
    id: "eradicate_threat",
    title: "Eradicate the threat",
    activateWhen: threatSeen,
    completeWhen: (_previous, state) => threatEradicated(state),
  },
  {
    id: "access_water_treatment",
    title: "Access Water Treatment",
    activateWhen: (_previous, state, context) =>
      (state.player.roomId === "EngCorridorTwo" &&
        !hasVisited(state, "WaterTreatment")) ||
      triedBlockedMove(context, "EngCorridorTwo", {
        destinationRoomId: "WaterTreatment",
        direction: "south",
      }),
    completeWhen: (_previous, state) => hasVisited(state, "WaterTreatment"),
  },
  {
    id: "find_replacement_lobe",
    title: "Find replacement lobe",
    activateWhen: (_previous, state) =>
      hasVisited(state, "ReactorControlRoom") && !reactorLobeIsReplaced(state),
    completeWhen: (_previous, state) => reactorLobeIsReplaced(state),
  },
  {
    id: "access_greenhouse",
    title: "Access Greenhouse",
    activateWhen: (_previous, state) =>
      hasVisited(state, "Greenhouse") &&
      !hasTrigger(state, "greenhouseBeesDeactivated") &&
      !hasVisited(state, "GreenhouseInterior"),
    completeWhen: (_previous, state) => hasVisited(state, "GreenhouseInterior"),
  },
  {
    id: "access_movie_theater",
    title: "Access Movie Theater",
    activateWhen: (_previous, _state, context) =>
      triedBlockedMove(context, "MovieTheaterLobby", {
        destinationRoomId: "MovieTheaterA",
        direction: "north",
        message: /usher|movie is already in progress/i,
      }),
    completeWhen: (_previous, state) => hasVisited(state, "MovieTheaterA"),
  },
  {
    id: "access_cargo_hold",
    title: "Safely access cargo hold",
    activateWhen: (_previous, _state, context) =>
      triedBlockedMove(context, "LevelSixCorridorBend", {
        destinationRoomId: "LevelSixCorridor",
        direction: "south",
        message: /hard vacuum|airlock empties|no air left/i,
      }),
    completeWhen: (_previous, state) => hasVisited(state, "StorageQuadOne"),
  },
  createPreserveObjective("badger"),
  createPreserveObjective("boar"),
  createPreserveObjective("bull"),
  createPreserveObjective("bear"),
  createPreserveObjective("barry"),
];

const OBJECTIVE_DEFINITION_BY_ID = new Map(
  OBJECTIVE_DEFINITIONS.map((definition) => [definition.id, definition]),
);

function createObjective(
  definition: ObjectiveDefinition,
  state: GameState,
  status: PlayerObjective["status"] = "active",
): PlayerObjective {
  return {
    activatedAtTurn: state.moves ?? 0,
    completedAtTurn: status === "completed" ? state.moves ?? 0 : undefined,
    id: definition.id,
    optional: definition.optional,
    status,
    title: definition.title,
  };
}

function syncObjectiveDefinition(objective: PlayerObjective): PlayerObjective {
  const definition = OBJECTIVE_DEFINITION_BY_ID.get(objective.id);
  if (!definition) return objective;

  return {
    ...objective,
    optional: definition.optional,
    title: definition.title,
  };
}

function setObjectives(
  state: GameState,
  objectives: PlayerObjective[],
): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      objectives,
    },
  };
}

export function ensureObjectiveState(state: GameState): GameState {
  let objectives = (state.player.objectives ?? []).map(syncObjectiveDefinition);
  let didChange =
    state.player.objectives === undefined ||
    objectives.some(
      (objective, index) => objective !== state.player.objectives?.[index],
    );

  for (const definition of OBJECTIVE_DEFINITIONS) {
    if (!definition.initial) continue;
    if (objectives.some((objective) => objective.id === definition.id)) {
      continue;
    }

    objectives = [...objectives, createObjective(definition, state)];
    didChange = true;
  }

  return didChange ? setObjectives(state, objectives) : state;
}

export function reconcileObjectives(
  previous: GameState,
  state: GameState,
  context: ObjectiveCommandContext = {},
): GameState {
  const next = ensureObjectiveState(state);
  let objectives = [...(next.player.objectives ?? [])];
  let didChange = next !== state;

  for (const definition of OBJECTIVE_DEFINITIONS) {
    const existing = objectives.find(
      (objective) => objective.id === definition.id,
    );
    const completed = definition.completeWhen(previous, next, context);
    const shouldActivate =
      definition.initial ||
      definition.activateWhen?.(previous, next, context) === true ||
      completed;

    if (!existing && shouldActivate) {
      objectives = [
        ...objectives,
        createObjective(definition, next, completed ? "completed" : "active"),
      ];
      didChange = true;
      continue;
    }

    if (!existing || existing.status === "completed" || !completed) {
      continue;
    }

    objectives = objectives.map((objective) =>
      objective.id === definition.id
        ? {
            ...objective,
            completedAtTurn: next.moves ?? 0,
            status: "completed",
          }
        : objective,
    );
    didChange = true;
  }

  return didChange ? setObjectives(next, objectives) : next;
}

export function getVisibleObjectives(state: GameState): PlayerObjective[] {
  const normalized = ensureObjectiveState(state);
  return normalized.player.objectives ?? [];
}
