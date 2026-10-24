import { ScenarioError, validateScenario, type Scenario } from "../scenario";
import { spaScenarios } from "./spa";

const scenarios = new Map<string, Scenario>();
export function registerScenario(scenario: Scenario): void {
  validateScenario(scenario);
  if (scenarios.has(scenario.id)) throw new ScenarioError(`Duplicate scenario: ${scenario.id}`);
  scenarios.set(scenario.id, scenario);
}
for (const scenario of spaScenarios) registerScenario(scenario);
export const listScenarios = () => [...scenarios.keys()];
export function loadScenario(id: string): Scenario {
  const scenario = scenarios.get(id);
  if (!scenario) throw new ScenarioError(`Unknown scenario "${id}". Available: ${listScenarios().join(", ")}`);
  return { ...scenario, inventory: scenario.inventory && [...scenario.inventory], exploredRooms: scenario.exploredRooms && [...scenario.exploredRooms], success: scenario.success && structuredClone(scenario.success),
    prerequisites: scenario.prerequisites && [...scenario.prerequisites], budgets: scenario.budgets && { ...scenario.budgets } };
}
export function resolveScenario(selection: { name?: string; startRoom?: string; inventory?: string[]; exploredRooms?: string[]; goal?: string } = {}): Scenario | undefined {
  if (Object.values(selection).every(value => value === undefined)) return undefined;
  const base = selection.name ? loadScenario(selection.name) : { id: "ad-hoc", objective: selection.goal ?? "" };
  const scenario = { ...base, ...(selection.startRoom === undefined ? {} : { startRoom: selection.startRoom }),
    ...(selection.inventory === undefined ? {} : { inventory: selection.inventory }),
    ...(selection.exploredRooms === undefined ? {} : { exploredRooms: selection.exploredRooms }),
    ...(selection.goal === undefined ? {} : { objective: selection.goal }) };
  validateScenario(scenario);
  return scenario;
}
