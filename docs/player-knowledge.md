# Player knowledge

The Log has Discoveries, Contacts, and DNA views. Authoritative state remains
separate: `player.log`, `player.spiltTea`, `player.trivia`, `player.contacts`, and
`player.dnaBank`. No collection grants access to another collection's mechanics.

## Record identity and acquisition

- Ordinary text uses `PlayerLogEntry.id`. Reading defaults to `item:<item ID>`.
  Optional item `readableId` lets several surfaces explicitly reveal the same
  information. Objects with identical names/titles remain distinct by default.
- `collectLogEntry(state, entry)` adds once. Passing `true` as its third argument
  explicitly updates narrative/source/title, retaining the first turn and array
  position. Ordinary rereading retains the first recorded text.
- Hydroponics records use `hydroponics:<menu leaf ID>`. Exchange journals use
  `exchange:<NPC ID>`. Each Syndrome X fragment uses `syndrome-x:fragment:<N>`;
  its source, narrative, and progression behavior remain intact.
- Gossip retains authored `JuicyTopic.id`, `containsTea`, `overheardTea`, and the
  existing collection/exchange rules. Sharing never consumes owned gossip.
- Trivia definitions use `TriviaFact`: stable authored `id`, `title`, `answer`,
  optional full `body`, and optional `source`. Collected `PlayerTrivia` adds the
  first acquisition turn. Deduplication compares IDs, never answer text.
- Contact definitions use string `extension`, optional `name`, and optional
  `description`. Missing name means unidentified. Collected records derive their
  stable ID from the trimmed, uppercased extension; leading zeros remain intact.
  Later authored names/descriptions update that record in place. An unknown
  rediscovery never erases a known name or description.
- DNA keeps sample IDs, not person identities. Different samples from the same
  named person remain separate. Full analysis includes cause of death.

The immutable helpers in `src/game/rules/knowledge.ts` return `state`, `added`,
and `updated`, allowing callers to control presentation. `collectDiscoveries` in
`rules/discoveries.ts` combines explicit awards and returns notification drafts.
It delegates gossip to the existing helper; it does not combine stored types.

## Authored discovery metadata

Items, scripted experience events, and recorded messages accept
`KnowledgeDiscoveries`: `containsTea`, `containsTrivia`, `containsContacts`.
Existing experience `overheardTea` remains supported.

```ts
containsContacts: [{ extension: "X0007" }]
// A later reveal can identify the same extension:
containsContacts: [{ extension: "X0007", name: "An authored identity" }]

containsTrivia: [{
  id: "authored-fact-id",
  title: "An authored fact",
  answer: "An authored answer",
  body: "The complete explanation.",
}]
```

These are authoring examples, not new world content. Trivia starts empty; no facts
were added merely to fill the interface.

Reading, examination, and item listening use the award hook. Reader-based actions
defer popups until close; other actions enqueue them immediately. Experience
events award at their scripted reveal point. Other scripted interactions can call
the same hook and enqueue its notifications. Neither narrative strings nor AI
responses are inspected for awards.

Existing number clues are explicitly annotated: the restaurant plaque provides
three named emergency contacts; the gym slip provides unidentified `X7239`.
The plaque now resides in the active `Toilettes` room instead of its retired
`BathroomEntrance` location, so players can discover it normally.
The Swinth memory's second event speaks the existing `X9203` clue from the
character profile and records the Swinth residence contact without an AI call.

## Recorded messages

`PhoneMessage` supports the same metadata. `setMessageListened` finds the authored
message by its existing ID and awards metadata on first playback, through the same
action used by browser and headless PLAY controls. Examining a machine or listing
its archive does not award its messages' contacts. Replays do not notify or
duplicate records. Existing messages have no caller-extension metadata; no caller
extensions or identities were invented to populate them.

## Display and harness

Discoveries offers All/Text/Gossip/Trivia filters. Display order is text, then
gossip, then trivia, preserving each bank's stored acquisition order. Gossip has
no acquisition timestamp, so this is not a combined chronology. Text and trivia
open in the existing reader; gossip retains its full summary, source, and tags.
Contacts has static extension/name/detail rows without calling controls. DNA
retains its existing presentation.

Sidebar notifications include new trivia, contacts, contact identification, and
journal body updates. Looking at the outer Log tab still clears its marker;
no per-record read-state system was added.

The CLI and agent `game_information` support `trivia` and `contacts`.
`:trivia [number]` and `:contacts [number]` return acquired records only, with full
details through one-based collection positions. `:log` retains its existing
document/gossip/DNA sections and appends trivia and contacts. `:log N` still
selects ordinary text, not the combined Discoveries view. Existing `:gossip`,
`:dna`, and `:dna N` behavior remains. Information requests spend no game turns.

## Persistence and scope

All collections are included in snapshots, browser resume, normal regeneration,
and fresh-game/restart behavior. Snapshot version 2 intentionally rejects version
1 development saves; no new migration framework was added. Existing unrelated
snapshot migrations remain in place.

Dialing, routing, telephone conversations, and click-to-call remain deferred.
Trivia selectors and the minigame remain deferred. The bartender's existing
free-text answer, score, and voucher behavior is unchanged.

Focused verification lives in `player-knowledge.test.ts`,
`knowledge-acquisition.test.tsx`, `knowledge-ui.test.tsx`, and existing headless
knowledge/agent and NailBot regression suites.

## Verification

- Phase 1: 86 focused tests passed; TypeScript passed.
- Phase 2: 81 focused tests passed; TypeScript passed.
- Phase 3: 32 focused tests passed; TypeScript passed.
- Final focused regression group: 424 tests passed across 21 files.
- After the final plaque placement correction: 78 relevant tests passed and the
  production build passed again. `git diff --check` passed.
- Full suite before that final placement correction: 2,226 passed, 48 failed,
  1 todo. The initial baseline was 2,208 passed, 50 failed, 1 todo. Forty-seven
  failure headings matched the baseline; an additional chef-sample assertion
  selected randomized NPC idle output instead of the expected command output
  and passed on targeted rerun. Three baseline CLI failures did not recur.
- Repository-wide lint reports only the existing `set-state-in-effect` errors
  in `Game.tsx:230` and `ShipMap.tsx:492`. Those files were not changed.

The pre-existing suite/lint failures remain outside this feature's scope.
