# NailBot voucher and gossip encounter

NailBot now requires the Bar trivia voucher before conversation or gossip trading. Showing, giving, presenting, redeeming, or using the voucher consumes it once and permanently unlocks the encounter. Bar trivia and its acquisition rules are unchanged.

## Commands and browser interface

- `show voucher to robot`, `show voucher to nailbot`, `give voucher to robot`, `give voucher to nailbot`, `give voucher`, and `use voucher` redeem payment. `present gift card to nailbot`, `redeem voucher`, and `use voucher on nailbot` also work.
- `share gossip`, `spill tea`, and any `tell nailbot about <anything>` command open the browser exchange without sharing. Bare `tell robot` and `tell nailbot about` also work when the target is present and paid. A target can be supplied with `share gossip with nailbot`.
- The overlay's Share buttons submit an explicit `share <topic> with nailbot` command. Matching accepts existing IDs, exact titles, or unambiguous partial titles, without AI interpretation. Player-facing gossip views show titles and useful metadata rather than internal IDs. `ask nailbot` continues through the existing conversation system.
- Headless sessions receive the same engine-produced listing and instructions for all selector entry points, and immediately dismiss the presentation overlay. Explicit `share <topic> with nailbot` commands execute the same operation as browser Share buttons; `tell` never submits gossip.

The reusable CRT modal shows collected gossip alongside an ongoing scripted conversation. Shared entries stay visible and disabled. Entries learned from the receiving NPC are also disabled. The interface never displays the required count. It scrolls new dialogue into view, permits rereading, supports keyboard focus wrapping and Escape dismissal, restores focus on close, and adapts to narrow screens. The final revelation stays open until the player closes it.

## Deterministic state and persistence

- `worldState.conditionalTriggers.NailBotVoucherRedeemed` is the only new payment flag; an absent flag means unpaid.
- Existing `conversation.npcs[npcId].gossipToldIds` stores accepted, distinct gossip IDs in original sharing order. Gossip remains in `player.spiltTea`. There is no numeric progress counter or persisted UI transcript.
- Existing `worldState.npcSecrets[npcId].secretRevealed` marks the atomic completion of the secret, item reward, and gossip discovery. Existing item placement and `pickedUpByPlayer` records protect against duplicating rewards that were dropped or used.
- `JuicyTopic.sourceNpcId` is optional source metadata. It is displayed in the existing gossip sidebar and headless knowledge view and prevents trading an NPC's own secret back for credit.

The existing snapshot format already serializes all these records. Its migration hook transfers legacy `npcSecrets.gossipSharedIds` into conversation state and removes the redundant record. Legacy completed encounters stay completed and unlocked. Migration also repairs interrupted completion, including a whistle placement saved before its inventory bucket was updated. Fully completed restores do not repeat reward or gossip notifications.

Reopening reconstructs the overlay transcript from ordered accepted IDs, collected topic summaries, and authored reaction configuration. The registry-defined revelation is inserted after the third response; later rumors follow it. The existing journal also stores one readable summary of this exchange, described below; it never determines puzzle progression.

## Exchange logging and output

The first accepted rumor creates an ordinary `player.log` entry with source `NailBot` and title `Gossip exchange with NailBot`. Later accepted rumors update that same entry in place, preserving its initial `loggedAtTurn` and position among other records. Its body contains the chronological player contributions, authored reactions, transition, and revealed secret where applicable.

Creation queues the same `buildLogNotification` / `enqueueNotification` popup used for logged information from `read`. Routine updates, duplicate submissions, and opening or closing the exchange do not repeat it. An empty exchange creates no entry or log notification. The player rereads partial or completed conversations through Log Entries and the existing reader, or `:log <number>` in headless play.

The browser's main game output receives only the existing `secretTransition` message, exactly once on revelation. The complete conversation remains in the overlay and journal. Headless presentation still returns each new reaction and the secret directly, using the same deterministic dialogue definitions without adding that transcript to the main game log. Whistle and gossip notifications are unchanged.

Existing snapshot serialization already includes `player.log`; there are no new state fields. Older saves with accepted rumors but no journal entry are backfilled silently by the existing migration registry. Current authored NailBot dialogue, voucher logic, and the secret/reward registry are unchanged by these refinements.

Refinement files: `src/game/rules/informationExchange.ts`, `src/game/harness/informationExchange.ts`, `src/game/harness/session.ts`, `src/game/components/LogTab.tsx`, `src/game/registries/snapshotMigrationRegistry.ts`, and `src/game/text/help.ts`; focused assertions in `nailbot-logging.test.ts`, `nailbot-exchange.test.ts`, `nailbot-overlay.test.tsx`, `headless-nailbot.test.ts`, and `gossip-system.test.tsx`.

Refinement validation: 105 focused tests passed across 12 files, including journal retrieval, popup styling, partial/completed saves, old-save backfill, and browser/headless parity. The frontend build, TypeScript, and ESLint on changed files pass. The full run recorded 2,081 passed, 32 pre-existing failures, and 1 todo, with no new failures compared with the pre-change run (2,072 passed, 34 failed, 1 todo). The stale NailBot empty-state assertion now follows the current authored message; a separate intermittent chef-sample assertion also passed in the final full run. The extra focused test added afterward checks preservation of unrelated headless output.

## Content and secret registry

`NPC_SECRETS` remains authoritative for the original secret text, its three-rumor requirement, and whistle reward. Its added gossip mapping identifies `gossip_hiding_robot`, titled **The Hiding Robot**. The existing collection and notification helpers copy the registry text into acquired knowledge, preserving all warehouse, decommissioning, visit, and whistle instructions without maintaining another authored narrative definition.

NailBot's refusals, reaction mapping keyed by stable gossip ID, fallback reaction, payment greeting, and revelation transition live in `src/world/maps/levelThree/Park/NailSalon/nailBotExchange.ts`. All currently collectible gossip has an individualized reaction. Future entries use the authored fallback.

The world previously had only two collectible rumors. The existing steam-room male memory's conversation about powerful people welcoming the transformation now also discovers `steam room coverup`, using the established memory gossip hook. This supplies the third rumor without inventing a separate collection system or changing the conversation's narrative.

## AI boundaries

Payment and exchange guards run before AI requests in either conversation mode. Gossip submission, acceptance, reactions, eligibility, reward completion, and knowledge discovery are scripted game actions. Ordinary questions after payment can still use NailBot's AI personality. Unrevealed secret text is excluded from AI requests and the static character profile. The server prompt directs trading to scripted actions and never asks the model to decide progression. Even a model response claiming payment or rewards cannot change encounter state.

## Changed systems

- New zone configuration and voucher interaction under `src/world/maps/levelThree/Park/NailSalon/`, exposed through the existing zone/action registries.
- Shared exchange operations in `src/game/rules/informationExchange.ts`; conversation guards in the existing conversation helpers.
- Secret/reward integration and migration in `npcSecrets.ts` and the snapshot migration registry; small additions to the existing NPC, gossip, and overlay types.
- New `InformationExchangeModal.tsx` and matching CRT styles, connected through `OverlayHost.tsx` and normal command dispatch.
- Parser aliases, help, headless session presentation, source attribution in the existing knowledge views, and the steam-room memory gossip event.
- Focused engine, UI, and real headless session tests; updated obsolete one-rumor/AI reward assertions and registered-verb smoke coverage.

## Validation and remaining work

Focused tests cover both conversation modes, required voucher aliases, unknown and repeated topics, NPC-specific progress, chronological reactions, completion order, notification deduplication, source eligibility, room revisits, UI dismissal and focus behavior, browser/headless parity, legacy saves, and interrupted reward recovery. Existing Bar, gossip, radio dialogue, and save tests are included in regression verification.

Original encounter implementation verification (before the logging refinements):

| Check | Result |
| --- | --- |
| Focused encounter and regression group (10 files) | 86 passed |
| Registered action smoke coverage | Passed |
| Full suite (99 files, 2,107 tests) | 2,075 passed, 31 baseline failures, 1 todo |
| Frontend build and TypeScript | Passed |
| Server build | Passed |
| ESLint on changed TypeScript/TSX files | Passed |
| Repository-wide lint | 2 existing errors |

The baseline had 96 files and 2,075 tests, with 2,043 passed, 31 failed, and 1 todo. The implementation adds 32 tests across three files. The final full run has the same failures in the same 14 existing files, with no newly introduced failures.

Frontend and server builds pass. Repository-wide lint reports the two pre-existing `react-hooks/set-state-in-effect` errors in `src/game/Game.tsx:230` and `src/game/components/ShipMap.tsx:492`; the changed files introduce no lint errors.

The pre-change full suite had 31 failures across 14 files: aquarium solver; cooler preservation; Spa content and lighting; game UI; headless information and session; Level Five; Level Six airlock/storage; player husks; restaurant; ship map UI; teleportation pads; and 3D printer. These unrelated failures remain follow-up work. One full run additionally hit a chef-sample save assertion involving randomized idle output; that file passed all 59 tests when run separately.

The automated encounter verification uses authored content acquisition fixtures and the real headless session. No live model service or manual browser visual review is needed for puzzle completion; generated conversational wording remains model-dependent.
