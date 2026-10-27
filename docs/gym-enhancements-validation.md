# Gym enhancements validation

Implemented on October 26, 2026.

- Gym: juice bar, banner, stools, contextual ordering and posture, generated reservation table, and angle-dependent exercise-ball rolls using the existing treadmill settings and wire bin.
- Weight Room: smart-barbell and pinned-body feedback, preserved strength solution, free-weight exercise, and random or explicitly named machines.
- Spin Stage: remotely visible but unreachable gym tote, seeded yoga pants, crop top, and ordinary teacher badge; normal container and clothing behavior.
- Persistence: refresh older gym content without changing progress, seed the new tote for older saves, and prevent existing containers from being reseeded when another map chunk loads.

Validation:

- 90 new cases in `src/test/game-gym-enhancements.test.ts`, all passing.
- Gym, showers, action smoke, and resume suites: 199 tests passing across five files.
- `pnpm exec tsc -b --pretty false`: passes.
- ESLint on the four new gym modules and enhancement tests: passes.
- `git diff --check`: passes.
- Full suite (`pnpm exec vitest run`): 2,219 passed, 35 failed, one todo across 105 files.
- Compared every final failing test name with a full run from an isolated archive of the original HEAD: all 35 failures also occur on that baseline. No new failing tests remain.

Existing failures by file:

| Test file | Failures |
| --- | ---: |
| `aquarium-solver.test.ts` | 2 |
| `cooler-preservation.test.tsx` | 3 |
| `game-spa-content.test.ts` | 8 |
| `game-ui.test.tsx` | 1 |
| `headless-information.test.tsx` | 1 |
| `headless-session.test.ts` | 3 |
| `level-five.test.ts` | 6 |
| `level-six-airlock-and-storage.test.ts` | 2 |
| `player-husks.test.ts` | 1 |
| `restaurant-chef-sample.test.ts` | 1 |
| `restaurant.test.ts` | 1 |
| `ship-map-ui.test.tsx` | 1 |
| `spa-lighting.test.tsx` | 1 |
| `teleportation-pads.test.tsx` | 2 |
| `three-d-printer.test.tsx` | 1 |
| `world-chunks.test.ts` | 1 |

Changed implementation and test files:

- `src/game/actions/index.ts`
- `src/game/containerContents.ts`
- `src/game/gameInit.ts`
- `src/game/helpers/scriptedEvents.ts`
- `src/game/registries/actionInteractionRegistry.ts`
- `src/game/registries/scopeResolverRegistry.ts`
- `src/game/registries/snapshotMigrationRegistry.ts`
- `src/test/game-actions.smoke.test.ts`
- `src/test/game-gym-enhancements.test.ts`
- `src/world/maps/levelThree/Park/Gym/Gym.ts`
- `src/world/maps/levelThree/Park/Gym/gymAmenities.ts`
- `src/world/maps/levelThree/Park/Gym/gymContentMigration.ts`
- `src/world/maps/levelThree/Park/Gym/gymExerciseBall.ts`
- `src/world/maps/levelThree/Park/Gym/gymSpinStageItems.ts`
- `src/world/maps/levelThree/Park/Gym/gymTreadmill.ts`
- `src/world/maps/levelThree/Park/Gym/gymWeightlifterPuzzle.ts`
- `src/world/maps/levelThree/Park/Gym/gymWeightMachines.ts`
- `src/world/zoneRegistrations.ts`

No remaining requirement deviations were identified. Scenery uses the existing `sceneryDescriptionOrder` renderer field; the new displayed props also carry the requested `sceneryOrder` metadata. Broader baseline failures remain outside this task.
