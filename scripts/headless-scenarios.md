# Autonomous scenario playtesting

Run from the repository root with Node 22+ and installed pnpm dependencies:

```sh
node scripts/run-headless-agent.mjs --live --scenario spa-entry
node scripts/run-headless-agent.mjs --live --scenario spa-trap --max-actions 60 --max-turns 80
node scripts/run-headless-agent.mjs --live --scenario spa-trap-informed --max-deaths 3 --max-actions 60 --max-turns 80
node scripts/run-headless-agent.mjs --help
```

`--live` retains the launcher's existing explicit opt-in to paid Anthropic calls.
Credentials come from `ANTHROPIC_API_KEY` or `server/.env.local`. Tests use mock
agent responses and require no paid API calls.

Without scenario flags, the existing opening, objective, budgets, protocol,
continuation allowance, and termination behavior remain in place.

| Scenario | Starting room | Injected inventory | Verified objective |
| --- | --- | --- | --- |
| `spa-entry` | `WalkIn` | `CarvingKnife`, `Cooler` | Alive in `Sauna` after the command resolves |
| `spa-trap` | `WalkIn` | `CarvingKnife`, `Cooler` | Alive in `Sauna`, organism in `SteamRoom`, Steam Room door closed, no escape route under current movement and lighting rules |
| `spa-trap-informed` | Same as `spa-trap` | Same as `spa-trap` | Same as `spa-trap`, with the SecretLab research whiteboard already in the player log |

All use the Spa's normal initial puzzle state. Only the objective and focus
instructions reach the model. Setup callbacks, success checks, hidden state, and
acceptance details remain host-only. `spa-trap-informed` seeds the whiteboard's
existing record using the ordinary read/knowledge effects; review it with `:log`
and `:log <number>`. It consumes no turns and does not visit SecretLab or put the
clue in the system prompt. `spa-trap` remains the blind-discovery control.

All Spa scenarios also start familiar with the public Park: its four sides,
center, outdoor maintenance-depot approach, and the Restaurant, Bar, Gym and Movie
entrances. The known connection out of WalkIn includes Kitchen and Restaurant;
Spa itself is known. Sauna, SteamRoom, the depot interior, rooftop, NailSalon and
hidden rooms remain unvisited. This knowledge uses only existing `visitedRooms`
flags and does not run arrival scripts, discoveries or turns. The whiteboard
record does not mark SecretLab as visited.

The agent already has `game_information` with `view: "map"`, optional
`detail: "overview" | "nearby" | "full"`, and optional `level: 3`. In the manual
headless CLI these are `:map`, `:map nearby`, and `:map full 3`. No new player tool
or directions in the system prompt are needed. Map requests spend an agent action,
but no game turns. `:log` and `:log <number>` still expose the informed clue.

## One-off experiments

```sh
node scripts/run-headless-agent.mjs --live --start-room WalkIn --inventory CarvingKnife,Cooler --goal "Find a way to enter the Sauna alive."
node scripts/run-headless-agent.mjs --live --scenario spa-entry --max-game-turns 50 --max-actions 70
```

`--start-room`, `--inventory`, `--explored-rooms`, and `--goal` can override named scenarios.
Inventory is a comma-separated list of existing item IDs; it replaces the named
scenario's injection list and preserves the normal game's baseline inventory.
One-off scenarios require `--goal`. They have no machine-verifiable conditions:
an agent saying it succeeded is reported as unverified. Named checks remain in
force when overriding a named scenario, including when replacing its objective.
`--explored-rooms ID,ID` replaces prior map familiarity; `--explored-rooms none`
reproduces a scenario without extra map visits. The normal start's visits and
actual starting location are retained. Unknown/duplicate room IDs are errors.

Budget precedence is explicit CLI/API options, then scenario budgets, then the
existing agent defaults. `--max-actions` counts commands and information requests.
`--max-turns` retains its original meaning: model message-creation attempts.
`--max-game-turns` optionally limits actual engine turns. Free commands and views
use zero game turns but still use an action. All counts appear separately in reports.

## Death and regeneration

`--max-deaths 3` permits recovery from the first two deaths and stops on the third
with reason `death_limit`. Without an override, verified scenarios retain their
first-death stop (`death`). A scenario may also set `maxDeaths: 3`; explicit CLI/API
options take precedence. Positive integers only are accepted. Normal no-verifier
exploration keeps its existing termination behavior unless given a death limit.

Only the game's normal regeneration runs. The harness does not reload, replace
lost/dropped items, teleport to the scenario start or reset puzzles. The objective,
predicates and cumulative action/turn/token/time/spending budgets stay active.
An unrecoverable death stops immediately regardless of the configured allowance.
After a death the agent sees the ordinary death narrative, explicit regenerated
location, room description, inventory and status. Remaining actions in a preplanned
tool batch are returned as unexecuted so the model can reconsider. A later resolved
action can establish verified success despite earlier deaths.

Death counts come from state changes (husk deltas, new death records and terminal
death), including repeated deaths in the same room; echoed text and acquired log
entries cannot create deaths. A **recovery attempt** is the first command or
information request after a regeneration, so reaching death limit three normally
records three deaths and two recovery attempts, even if the third death regenerated.

## Defining scenarios and predicates

Definitions live under `src/game/harness/scenarios/`. Register new definitions in
that catalog with `registerScenario`. Each requires only an ID and objective;
the following example illustrates optional settings:

```ts
const scenario: Scenario = {
  id: "inspect-start",
  objective: "Investigate the starting room and pick up the timer.",
  startRoom: "StairWellSeven",
  inventory: [],
  exploredRooms: ["ParkWest", "Spa"],
  maxDeaths: 3,
  budgets: { maxActions: 10, maxTurns: 15, maxGameTurns: 8 },
  prerequisites: [{
    description: "Set an explicit power prerequisite",
    apply: state => ({
      ...state,
      worldState: {
        ...state.worldState,
        powerRestoredSections: {
          ...state.worldState.powerRestoredSections,
          "lights-level-three": true,
        },
      },
    }),
  }],
  success: [
    { type: "player-room", roomId: "StairWellSeven" },
    { type: "alive" },
    { type: "inventory", itemId: "BombTimer" },
  ],
};
```

Use `createHeadlessSession({ scenario })` and pass that session to
`runHeadlessAgent`. The session supplies its objective and budget defaults to
the controller; callers do not need to repeat the definition.

The harness creates and hydrates a fresh normal world, copies its data to isolate
setup mutations, sets the starting room and requested visited flags, moves inventory with
existing placement/location/bucket helpers, and applies prerequisite callbacks
in order. Setup never sends gameplay commands. Injection removes old container,
surface, under, searchable, filled-container, attachment and locker references;
it invokes no pickup effects, discoveries or puzzle ticks. Requested items must
still be carried consistently after prerequisites. Unknown IDs, duplicate
inventory IDs, invalid predicates/budgets, or accidental setup turns are errors.
`allowSetupTurns: true` explicitly permits prerequisite callbacks to consume turns.

Prerequisites are trusted TypeScript setup functions, not commands or arbitrary
expressions supplied by the player/model. They should return a consistent state
using ordinary helpers. Starting-room entry events are not run automatically;
any required pre-existing puzzle flags must be configured explicitly.

All supplied success predicates must pass:

| Type | Parameters | Meaning |
| --- | --- | --- |
| `player-room` | `roomId` | Physical player location |
| `alive` | none | No game-over/death status and health above zero |
| `item-location` | `itemId`, either `roomId` or `containerId` | Physical room, following nested placement, or direct container membership |
| `inventory` | `itemId` | Direct player inventory membership |
| `door` | `doorId`, `open: boolean` | Effective open/closed state |
| `world-state` | `path: string[]`, `equals: string \| number \| boolean \| null` | Equality at an existing world-state path |

Empty or omitted success lists never produce verified success. World-state paths
must exist after setup; initialize optional flags in prerequisites or use a custom
predicate when absence has a specific meaning. Register additional predicates
using `registerGoalPredicate(type, { validate, test, describe })`. Keep puzzle
imports and custom acceptance logic in their scenario module, as `spa.ts` does.
Do not import scenarios into production engine files. Predicates must be pure:
they inspect the resolved state without advancing it or triggering events.

Verification runs at the session's command-record boundary, after engine turns,
hazards, objective reconciliation, and automatic presentations. Initial setup and
information requests cannot newly establish success. The agent stops on verified
success before executing any remaining batched tools or requesting another model
response. Death stops follow the allowance described above; normal regeneration
never implies objective success in the same fatal action.

## Artifacts and limitations

The launcher prints JSONL and Markdown paths under `.headless-transcripts/` (or
`--output-dir`). Existing observation records, action goals/reasons, final visible
agent text, usage, cache accounting, cost estimates, and protocol diagnostics remain.
Start/reset records additionally carry host-only scenario setup metadata. The end
record's `agentSummary` carries actions, model turns, termination category and
detailed reason, initial/final summaries, game turns, deaths, recovery attempts,
the effective death limit and per-condition
verification. The Markdown report distinguishes verified success from subjective
claims and includes the same final runtime snapshot. The snapshot contains player,
item and world state, moves, score and rating; authored definitions and executable
callbacks are excluded. Scenario data is not added to game saves.
Each fatal command also records a host-only `deathEvent` (sequence, move, count,
running total, death rooms and resolved location/regeneration), and the next
request records `recoveryAttempt`. The report lists all death/regeneration events
and configured explored rooms. Existing rationale and usage reporting is retained.

Limitations affecting interpretation:

- The inherited session uses **AI NPC conversation mode**, despite older comments
  and reports claiming authored mode. NPC commands can depend on the local backend;
  NPC costs are outside the agent controller's spending estimate. This change
  preserves that setting and corrects the autonomous launcher's/report's labels.
- Not every graphical interaction has a headless adapter. Unsupported interfaces
  stop the controller and are reported as missing capabilities, not puzzle failures.
- The world RNG is not seeded and live model responses are nondeterministic. One
  failed run does not establish that a puzzle is unsolvable or poorly clued.
- Map text projects the same authored drawing as the graphical player map. It
  reveals labels for visited rooms and retains anonymous footprints/strokes for
  unknown areas; these drawings are not guaranteed passages or compass directions.
  A nearby crop may omit known Spa rooms; use full detail on level 3. There is no
  pathfinder, undiscovered room-description dump or inferred door accessibility.
- `visitedRooms` also supplies the normal regeneration pool. Pre-explored areas
  can therefore become legitimate regeneration destinations, and the game chooses
  the location. The harness does not force a convenient respawn.
- Normal setup intentionally skips starting-room arrival scripts. Scenarios for
  encounters requiring those scripts must explicitly establish prerequisites.
- Defaults (25 requests, 40 model turns, token/time/spending limits) can be too
  small for an unfamiliar agent's experiments. A limit ending is not puzzle failure.
- An in-flight game command drains completely during cancellation/deadlines, so
  a command consuming multiple engine turns can overrun a game-turn limit. No
  follow-up action runs after a limit is observed. Restart/restore can return to
  ordinary saved/fresh locations; only host reset reapplies the scenario. Game-turn
  usage is accumulated across commands even when the move counter resets.
- `spa-trap` checks containment under current rules: there is no traversable escape
  route. It does not predict future player actions reopening doors or changing lights.
- The existing one-time continuation prompt still applies to text-only agent
  endings. Without predicates, success is unverified and ordinary termination
  applies unless an explicit death limit was supplied.

Focused offline verification:

```sh
pnpm exec vitest run src/test/headless-scenarios.test.ts src/test/headless-agent.test.ts src/test/headless-agent-cli.test.mjs src/test/headless-agent-caching.test.ts
pnpm exec tsc -b
```
