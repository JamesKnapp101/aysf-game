import { getItemPlacementContext, removeItemFromPlacementLists } from "../helpers/itemPlacement";
import { updateItemLocation } from "../rules/items";
import { bucketForItem, inventoryHas, removeFromAllBuckets } from "../rules/state";
import type { GameState } from "../types/gameTypes";

/** Trusted development setup only. Never expose definitions or checks as player tools. */
export type GoalCheck = Readonly<{ type: string; [parameter: string]: unknown }>;
export type Scenario = Readonly<{
  id: string;
  objective: string;
  startRoom?: string;
  inventory?: readonly string[];
  exploredRooms?: readonly string[];
  maxDeaths?: number;
  success?: readonly GoalCheck[];
  prerequisites?: readonly Readonly<{ description: string; apply: (state: GameState) => GameState }>[];
  allowSetupTurns?: boolean;
  budgets?: Readonly<{ maxActions?: number; maxTurns?: number; maxGameTurns?: number }>;
}>;
export type GoalResult = { condition: GoalCheck; description: string; met: boolean };
export type GoalEvaluation = { verified: boolean; reason: string; checks: GoalResult[] };
export type ScenarioMetadata = {
  id: string;
  objective: string;
  startRoom: string;
  inventory: string[];
  exploredRooms?: string[];
  maxDeaths?: number;
  success: GoalCheck[];
  prerequisites: string[];
  budgets: Scenario["budgets"];
};
export type StateSummary = {
  roomId: string;
  alive: boolean;
  moves: number;
  inventory: GameState["player"]["inventory"];
  vitals: GameState["player"]["vitals"];
  statusEffects: GameState["player"]["statusEffects"];
};
export type HostStatus = {
  conversationMode: GameState["uiState"]["conversationMode"];
  scenario?: ScenarioMetadata;
  initial: StateSummary;
  final: StateSummary;
  gameTurns: number;
  deaths: number;
  deathEvents?: DeathEvent[];
  recoveryAttempts?: number;
  evaluation?: GoalEvaluation;
  /** Mutable runtime data, excluding authored definitions, callbacks and RNG. */
  finalGameState?: Pick<GameState, "player" | "itemState" | "worldState" | "moves" | "score" | "rating">;
};
export type DeathEvent = {
  sequence: number;
  move: number;
  count: number;
  totalDeaths: number;
  deathRoomIds: string[];
  roomId: string;
  regenerated: boolean;
};
export class ScenarioError extends Error {
  constructor(message: string) { super(`Scenario configuration: ${message}`); }
}
type GoalPredicate = {
  validate: (check: GoalCheck, state: GameState) => void;
  test: (check: GoalCheck, state: GameState) => boolean;
  describe: (check: GoalCheck) => string;
};
const predicates = new Map<string, GoalPredicate>();
export function registerGoalPredicate(type: string, predicate: GoalPredicate): void {
  if (!type.trim() || predicates.has(type)) throw new ScenarioError(`Duplicate or empty predicate: ${type}`);
  predicates.set(type, predicate);
}
function requireId(state: GameState, kind: "rooms" | "items" | "doors", id: unknown): asserts id is string {
  if (typeof id !== "string" || !state.world[kind].some(entry => entry.id === id))
    throw new ScenarioError(`Unknown ${kind} ID: ${String(id)}`);
}
function worldValue(state: GameState, path: unknown): unknown {
  if (!Array.isArray(path) || !path.length || !path.every(key => typeof key === "string" && key && !["__proto__", "prototype", "constructor"].includes(key)))
    throw new ScenarioError("world-state requires a nonempty path of property names.");
  let value: unknown = state.worldState;
  for (const key of path) {
    if (!value || typeof value !== "object" || !Object.hasOwn(value, key))
      throw new ScenarioError(`Unknown world-state path: ${path.join(".")}`);
    value = (value as Record<string, unknown>)[key];
  }
  return value;
}
export const playerIsAlive = (state: GameState) => !state.worldState.gameOver &&
  state.player.vitals.health > 0 && !state.player.statusEffects.some(effect => effect.id === "death");

registerGoalPredicate("player-room", {
  validate: (check, state) => requireId(state, "rooms", check.roomId),
  test: (check, state) => state.player.roomId === check.roomId,
  describe: check => `Player occupies ${check.roomId}`,
});
registerGoalPredicate("alive", {
  validate: () => {}, test: (_check, state) => playerIsAlive(state), describe: () => "Player is alive after turn processing",
});
registerGoalPredicate("item-location", {
  validate: (check, state) => {
    requireId(state, "items", check.itemId);
    if (check.roomId !== undefined && check.containerId === undefined) requireId(state, "rooms", check.roomId);
    else if (check.containerId !== undefined && check.roomId === undefined) {
      requireId(state, "items", check.containerId);
      if (!state.world.items.find(item => item.id === check.containerId)?.isContainer)
        throw new ScenarioError(`Not a container: ${check.containerId}`);
    } else throw new ScenarioError("item-location requires exactly one roomId or containerId.");
  },
  test: (check, state) => check.roomId !== undefined
    ? getItemPlacementContext(state, check.itemId as string).roomId === check.roomId
    : (state.itemState.containerContents[check.containerId as string] ?? []).includes(check.itemId as string),
  describe: check => `${check.itemId} is in ${check.roomId ?? check.containerId}`,
});
registerGoalPredicate("inventory", {
  validate: (check, state) => requireId(state, "items", check.itemId),
  test: (check, state) => inventoryHas(state.player.inventory, check.itemId as string),
  describe: check => `${check.itemId} is in the player's inventory`,
});
registerGoalPredicate("door", {
  validate: (check, state) => {
    requireId(state, "doors", check.doorId);
    if (typeof check.open !== "boolean") throw new ScenarioError("door requires a boolean open value.");
  },
  test: (check, state) => (state.worldState.doors[check.doorId as string]?.isOpen ??
    state.world.doors.find(door => door.id === check.doorId)?.initiallyOpen ?? false) === check.open,
  describe: check => `${check.doorId} is ${check.open ? "open" : "closed"}`,
});
registerGoalPredicate("world-state", {
  validate: (check, state) => {
    worldValue(state, check.path);
    if (check.equals !== null && !["string", "number", "boolean"].includes(typeof check.equals))
      throw new ScenarioError("world-state equals must be a JSON scalar.");
    if (typeof check.equals === "number" && !Number.isFinite(check.equals)) throw new ScenarioError("Invalid world-state number.");
  },
  test: (check, state) => Object.is(worldValue(state, check.path), check.equals),
  describe: check => `worldState.${(check.path as string[]).join(".")} equals ${JSON.stringify(check.equals)}`,
});

export function validateScenario(scenario: Scenario): void {
  if (!scenario || typeof scenario !== "object" || typeof scenario.id !== "string" || !/^[\w-]+$/.test(scenario.id))
    throw new ScenarioError("A nonempty scenario ID is required.");
  if (typeof scenario.objective !== "string" || !scenario.objective.trim()) throw new ScenarioError("A nonempty objective is required.");
  if (scenario.startRoom !== undefined && (typeof scenario.startRoom !== "string" || !scenario.startRoom.trim())) throw new ScenarioError("Invalid starting room.");
  if (scenario.inventory !== undefined && (!Array.isArray(scenario.inventory) || scenario.inventory.some(id => typeof id !== "string" || !id.trim()) || new Set(scenario.inventory).size !== scenario.inventory.length))
    throw new ScenarioError("Inventory must contain unique item IDs.");
  if (scenario.exploredRooms !== undefined && (!Array.isArray(scenario.exploredRooms) || scenario.exploredRooms.some(id => typeof id !== "string" || !id.trim()) || new Set(scenario.exploredRooms).size !== scenario.exploredRooms.length))
    throw new ScenarioError("Explored rooms must contain unique room IDs.");
  if (scenario.maxDeaths !== undefined && (!Number.isSafeInteger(scenario.maxDeaths) || scenario.maxDeaths < 1))
    throw new ScenarioError("Invalid maxDeaths.");
  if (scenario.success !== undefined && (!Array.isArray(scenario.success) || scenario.success.some(check => !check || typeof check !== "object" || !predicates.has(check.type))))
    throw new ScenarioError("Unknown or malformed success predicate.");
  if (scenario.prerequisites !== undefined && (!Array.isArray(scenario.prerequisites) || scenario.prerequisites.some(step => !step || typeof step.description !== "string" || !step.description.trim() || typeof step.apply !== "function")))
    throw new ScenarioError("Prerequisites require a description and apply function.");
  if (scenario.allowSetupTurns !== undefined && typeof scenario.allowSetupTurns !== "boolean") throw new ScenarioError("Invalid allowSetupTurns.");
  if (scenario.budgets !== undefined && (!scenario.budgets || typeof scenario.budgets !== "object" || Array.isArray(scenario.budgets))) throw new ScenarioError("Invalid budgets.");
  for (const [key, value] of Object.entries(scenario.budgets ?? {})) {
    if (!["maxActions", "maxTurns", "maxGameTurns"].includes(key) || !Number.isSafeInteger(value) || value < 1)
      throw new ScenarioError(`Invalid budget: ${key}`);
  }
}

/** Use existing placement and bucket helpers, without pickup effects or engine actions. */
export function injectInventory(state: GameState, ids: readonly string[]): GameState {
  let next = state;
  for (const id of ids) {
    requireId(next, "items", id);
    const attachedTo = { ...next.itemState.attachedTo };
    delete attachedTo[id];
    next = { ...next, itemState: {
      ...next.itemState, attachedTo,
      ...Object.fromEntries((["containerContents", "containerFilled", "surfaceContents", "underContents", "searchableContents"] as const)
        .map(key => [key, removeItemFromPlacementLists(next.itemState[key], id)])),
    } };
    next = { ...next, worldState: { ...next.worldState,
      mensLockerContents: { ...next.worldState.mensLockerContents, ...removeItemFromPlacementLists(next.worldState.mensLockerContents, id) },
      womensLockerContents: { ...next.worldState.womensLockerContents, ...removeItemFromPlacementLists(next.worldState.womensLockerContents, id) },
    } };
    next = updateItemLocation(next, id, "INVENTORY");
    const inventory = removeFromAllBuckets(next.player.inventory, id);
    const bucket = bucketForItem(next.world.items.find(item => item.id === id));
    next = { ...next, player: { ...next.player, inventory: { ...inventory, [bucket]: [...inventory[bucket], id] } } };
  }
  return next;
}

// Definitions contain functions, so structuredClone cannot isolate them. Copy data
// recursively and retain authored callbacks; prerequisite mutations stay session-local.
function copyData<T>(value: T): T {
  if (Array.isArray(value)) return value.map(copyData) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, copyData(child)])) as T;
  return value;
}
export function prepareScenario(state: GameState, scenario: Scenario): GameState {
  validateScenario(scenario);
  if (scenario.startRoom !== undefined) requireId(state, "rooms", scenario.startRoom);
  for (const id of scenario.exploredRooms ?? []) requireId(state, "rooms", id);
  let next = copyData(state);
  next = { ...next, player: { ...next.player, roomId: scenario.startRoom ?? next.player.roomId, prevRoomId: undefined, recentMoves: [] } };
  next = { ...next, worldState: { ...next.worldState, visitedRooms: {
    ...next.worldState.visitedRooms,
    ...Object.fromEntries((scenario.exploredRooms ?? []).map(id => [id, true])),
    [next.player.roomId]: true,
  } } };
  next = injectInventory(next, scenario.inventory ?? []);
  for (const step of scenario.prerequisites ?? []) {
    try { next = step.apply(next); }
    catch (error) { throw new ScenarioError(`Prerequisite "${step.description}" failed: ${error instanceof Error ? error.message : "invalid state"}`); }
  }
  if (!next?.player || !next?.world || !next?.worldState || !next?.itemState) throw new ScenarioError("Prerequisites returned an invalid game state.");
  requireId(next, "rooms", next.player.roomId);
  if (scenario.startRoom !== undefined && next.player.roomId !== scenario.startRoom) throw new ScenarioError("Prerequisites changed the starting room.");
  if (!scenario.allowSetupTurns && next.moves !== state.moves) throw new ScenarioError("Setup consumed game turns; allowSetupTurns must be explicit.");
  const carried = Object.values(next.player.inventory).flat();
  if (new Set(carried).size !== carried.length) throw new ScenarioError("Duplicate inventory placement after setup.");
  for (const id of carried) {
    requireId(next, "items", id);
    if (next.itemState.itemRoomId[id] !== "INVENTORY" || next.world.items.find(item => item.id === id)?.location !== "INVENTORY" || next.itemState.attachedTo[id] ||
      [next.itemState.containerContents, next.itemState.containerFilled, next.itemState.surfaceContents, next.itemState.underContents, next.itemState.searchableContents]
        .some(lists => Object.values(lists).some(items => items.includes(id))))
      throw new ScenarioError(`Inconsistent inventory placement: ${id}`);
  }
  for (const id of scenario.inventory ?? []) {
    if (!inventoryHas(next.player.inventory, id)) throw new ScenarioError(`Missing injected item: ${id}`);
    if ([next.worldState.mensLockerContents, next.worldState.womensLockerContents].some(lists => Object.values(lists).some(items => items.includes(id))))
      throw new ScenarioError(`Stale locker placement: ${id}`);
  }
  for (const check of scenario.success ?? []) predicates.get(check.type)!.validate(check, next);
  return next;
}
export function evaluateScenario(scenario: Scenario, state: GameState): GoalEvaluation {
  const checks = (scenario.success ?? []).map(condition => {
    const predicate = predicates.get(condition.type);
    if (!predicate) throw new ScenarioError(`Unknown predicate: ${condition.type}`);
    return { condition, description: predicate.describe(condition), met: predicate.test(condition, state) };
  });
  const verified = checks.length > 0 && checks.every(check => check.met);
  return { verified, checks, reason: verified ? checks.map(check => check.description).join("; ")
    : checks.length ? "Success conditions have not all been met." : "Success was not independently verified: no machine-verifiable conditions supplied." };
}
export const summarizeState = (state: GameState): StateSummary => copyData({
  roomId: state.player.roomId, alive: playerIsAlive(state), moves: state.moves,
  inventory: state.player.inventory, vitals: state.player.vitals, statusEffects: state.player.statusEffects,
});
export const scenarioMetadata = (scenario: Scenario, state: GameState): ScenarioMetadata => copyData({
  id: scenario.id, objective: scenario.objective, startRoom: state.player.roomId,
  inventory: [...(scenario.inventory ?? [])], success: [...(scenario.success ?? [])],
  exploredRooms: [...(scenario.exploredRooms ?? [])], maxDeaths: scenario.maxDeaths,
  prerequisites: (scenario.prerequisites ?? []).map(step => step.description), budgets: scenario.budgets,
});
export const runtimeSnapshot = (state: GameState): HostStatus["finalGameState"] => copyData({
  player: state.player, itemState: state.itemState, worldState: state.worldState,
  moves: state.moves, score: state.score, rating: state.rating,
});
