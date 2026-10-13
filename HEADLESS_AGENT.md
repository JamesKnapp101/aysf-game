# Autonomous Claude player

The local controller starts a fresh Explorer session with authored NPC dialogue. Claude sees the opening observation and its own gameplay history, with only `game_command` and `game_information` available. It never receives source files, world definitions, transcript paths, host controls, NPC prompts, environment configuration, or credentials. Gameplay text is untrusted story content; permissions are enforced by the controller and existing Explorer interface.

Requires Node.js 22+ and the project's existing pnpm-installed dependencies. No browser, game server, MCP service, or additional package is needed. The Vite SSR loader runs in middleware mode without listening on a port, following `scripts/play-headless.mjs`.

Credentials come from `ANTHROPIC_API_KEY`, otherwise from the existing backend's `server/.env.local`. Only that key is read from the file. It is passed directly to a separate official Anthropic SDK client; the NPC conversation service is not imported. The file and environment are never sent to Claude or included in reports. Do not put the key in a `VITE_*` variable or commit it.

Start with a limited smoke test:

```powershell
node scripts/run-headless-agent.mjs --live --max-actions 5
```

The normal initial experiment is:

```powershell
node scripts/run-headless-agent.mjs --live --max-actions 25
```

`--live` explicitly enables paid API execution. Help and invocations without that flag make no API requests. Implementation validation uses only mocked clients. No automatic live smoke test or extended exploration is performed.

The default model is `claude-haiku-4-5-20251001`, the same model configured in the existing NPC backend. Availability is account-dependent; this implementation does not query your account. To choose another tool-capable model, supply its current input and output prices too:

```powershell
node scripts/run-headless-agent.mjs --live --model YOUR_MODEL --input-price 3 --output-price 15 --max-actions 5
```

| Option | Default | Meaning |
| --- | --- | --- |
| `--model` | `claude-haiku-4-5-20251001` | Anthropic Messages model |
| `--max-actions` | 25 | Executed commands and information requests, including unsuccessful gameplay commands |
| `--timeout-seconds` | 600 | Run deadline, including initialization |
| `--request-timeout-seconds` | 60 | Each token-counting/message API request deadline |
| `--max-tokens` | 100000 | Cumulative input plus output tokens across model turns |
| `--max-output-tokens` | 1024 | Maximum generated tokens in one model turn |
| `--max-cost-usd` | 0.50 | Estimated cumulative API spending limit |
| `--max-errors` | 3 | Consecutive malformed or unsupported tool requests |
| `--max-turns` | 40 | Message-creation attempts; separate from gameplay actions |
| `--input-price` | 1 | USD per million input tokens |
| `--output-price` | 5 | USD per million output tokens |
| `--no-cache` | off | Disable automatic prompt caching |
| `--cache-read-multiplier` | model-derived | Override the cache-read multiplier applied to the explicit input price |
| `--output-dir` | `.headless-transcripts` | Host output directory; custom paths may need a gitignore entry |
| `--verbose` | off | Full visible responses instead of short previews |

Price flags specify uncached input/output rates; update them when pricing changes. Both remain required for a different model, including direct controller calls. Automatic prompt caching is enabled by default; no thinking configuration or server tools are requested. See Anthropic's [pricing](https://platform.claude.com/docs/en/about-claude/pricing), [token counting](https://platform.claude.com/docs/en/build-with-claude/token-counting), and [tool definitions](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools).

Caching uses the installed SDK's top-level `cache_control: {type: "ephemeral", ttl: "5m"}` on message creation and token counting. The provider moves the boundary to the last cacheable request block, covering repeated tools, system instructions and the accumulated history. No content blocks are edited, marked, summarized or removed. `--no-cache` restores uncached requests and legacy metrics handling. See Anthropic's [prompt caching contract](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).

For reported uncached input `U`, five-minute writes `W5`, one-hour writes `W1`, cache reads `R`, output `O`, explicit input/output prices `P/Q`, and read multiplier `r`, cumulative tokens are `U + W5 + W1 + R + O`; estimated cost is `(P*(U + 1.25*W5 + 2*W1 + r*R) + Q*O)/1,000,000`. Requested writes use five minutes; any reported one-hour breakdown is accounted for separately. Reads use `r = 0.1`, with documented `0.05` for Sonnet/Opus 5.5 and `0.025` for Fable/Mythos 5.1. The override flag supports other rate configurations without replacing base model prices. Reports show each category and cost, read/write response counts, effective rates and a clearly hypothetical uncached comparison.

Each spending reservation assumes the entire estimated input misses and incurs the five-minute write premium, even after cache hits, plus the existing token margin. Missing cache totals while caching is enabled stop the run with uncertain usage; explicit null/zero totals are valid. Missing TTL breakdowns use the requested five-minute rate; malformed or inconsistent breakdowns fail validation. Failed requests still stop without retry. Flat rates are estimates: model-dependent context tiers, regional modifiers, priority/batch pricing and future pricing changes require appropriate host configuration.

Cache effectiveness depends on exact prefixes, model-specific minimum lengths (Haiku 4.5: 4,096 tokens), five-minute expiry, provider lookback limits, and model-specific thinking retention. Short contexts may not cache. Older models can invalidate cached thinking when non-tool-result user content is added. Every run preserves full history regardless of cache hits; real savings require inspecting reported usage. The implementation targets the direct Claude API, not legacy Bedrock integrations.

Responses may still contain thinking on models that enable it by default. The controller accepts `text`, `tool_use`, `thinking` and `redacted_thinking`, and echoes the complete supported assistant content back unchanged and in order, including opaque signatures and encrypted redactions. Tool results follow immediately in a user message containing only results in call order. Thinking stays in memory for API history and token counting; it is never printed or written to reports/transcripts. Only validated `game_command` and `game_information` tool-use blocks execute gameplay. See Anthropic's [thinking tool workflows](https://platform.claude.com/docs/en/build-with-claude/thinking-tool-workflows).

Each received response records safe diagnostics in the report: turn number, fixed content-block type labels, stop reason, and validation failure category. Unknown type/stop strings become `unknown`, preventing arbitrary payloads from being logged. Malformed usage, blocks, duplicate tool IDs, missing tool calls and inconsistent tool stops have distinct categories. Historical reports without these diagnostics cannot establish which validation branch failed.

When a validated response has no tool calls and ends with `model_finished`, its ordinary text blocks are concatenated in order, without trimming or added separators, into the host-only `finalAgentMessage`. Thinking, signatures, encrypted redactions and API metadata are excluded. This field is stored on the existing JSONL end record and displayed in full as a literal Markdown block under **Final Agent Message**. An empty string means the final response contained no visible text; the report says "No final text was returned by the model." An absent field means no terminal message was captured, including older runs and budget/harness/API endings. Earlier text accompanying tools or truncated responses is not captured. No explanation of why the model stopped is inferred. `--verbose` prints the complete final text; otherwise the CLI only indicates that it was captured. Shutdown still writes one end record with unchanged sequence numbering.

Both player tool schemas request `goal` and `reason` alongside the existing gameplay input. `goal` is the agent's current short-term objective, preferably 3–10 words, based only on information it has already seen; it may repeat across actions until the immediate objective changes. `reason` is a one-sentence public explanation for choosing that particular action. These fields use the existing tool call, without extra API requests or private reasoning. Supplied values must be nonblank strings (goal up to 160 characters; reason up to 500). The controller still accepts legacy calls missing either field and never fills in absent context. Accepted context is snapshotted onto the corresponding append-only JSONL command/information record, shown under Goal and Reason in Markdown command evidence, and printed by `--verbose`. It is kept out of player observations, engine input and tool-result text. Older transcripts without either field remain valid. Action sequence numbers, execution, permissions, limits, usage accounting, caching strategy and prices are unchanged.

`end_turn`, `refusal` and `stop_sequence` finish the run; `model_context_window_exceeded` stops with `context_window_limit`. Plain text truncated by `max_tokens` retains the existing bounded continuation behavior. Truncated thinking stops with `incomplete_thinking_response`, and truncated tool batches execute no actions. Server tools, their response blocks, programmatic tool callers and `pause_turn` continuation are unsupported because they are outside the authorized toolset. Unknown/null stop reasons fail validation. Signatures are checked for presence, not decrypted or locally verified; Anthropic verifies them. Usage totals include nullable cache input fields; `output_tokens` already includes thinking, so `output_tokens_details` is not added again. No model, pricing, permissions, retries or thinking settings are changed by this handling. See Anthropic's [stop reasons](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons).

Before each model turn, the supported token-counting endpoint estimates the full player context. The controller reserves input tokens plus a 2%/32-token margin and limits output by remaining tokens and estimated dollars. Reported usage updates the next reservation. Anthropic describes token counts as estimates, so these limits are not an exact billing guarantee. A failed API response may have incurred usage that cannot be reported; the run stops immediately and marks usage as incomplete. Automatic SDK retries are disabled. Ordinary parser and puzzle failures are responses rather than controller errors.

The controller executes one game operation at a time, including multi-tool responses. It checks limits before every operation and never executes tools beyond the action budget. Unsupported tools or extra/malformed arguments never reach the game. Existing parser normalization and developer-command rejection remain authoritative. Truncated tool batches and duplicate tool IDs stop without execution. The model gets no reset tool; ordinary commands such as restart retain existing Explorer behavior.

SIGINT/SIGTERM and the elapsed deadline abort SDK requests through an `AbortSignal`. A separate cancellation race prevents late responses from an abort-ignoring transport from invoking tools. This cannot guarantee that Anthropic stops billing work already received by its servers. Game initialization and commands do not offer cancellation, so the controller drains outstanding game operations before disposing the session and loader. Shutdown can extend past the deadline; a permanently hung engine operation needs external process termination. No uncertain operation is retried.

Each run retains `.headless-transcripts/<session-id>.jsonl` using the harness's append-only, synced persistence, plus `.headless-transcripts/<session-id>.report.md`. The report includes revision/limits/usage/termination, visible room headings, examination/reading attempts, explicit acquisition messages, shown objectives, failed/repeated commands, speculative findings, and response excerpts linked by transcript sequence number. JSONL preserves complete responses. Deterministic text heuristics are labeled as uncertain. Claude is never asked to infer undiscovered state. Commands rejected before reaching the harness appear in Markdown. A transcript disk failure is terminal; previously synced records remain available, but a filesystem failure can also prevent the report.

The harness still stops at unsupported terminals and effects requiring adapters. The agent does not bypass them or change puzzle/content logic. Next, run the five-action smoke test and review both artifacts before increasing the action budget.

Automatic scanner mind-flashes are now consumed within the triggering command. The harness uses the same sentence-fragment function as the React panel, records every visible fragment in order, invokes the same completion callback once, then restores the full room presentation. It does not wait through visual delays or advance extra turns. Only the already-triggered payload is consumed, so later target memories remain unavailable until another legitimate scan. Empty/exhausted payloads complete without invented narration. React timing is unchanged; browser commands and UI actions are locked until completion.

Corpse extraction is a different feature: its six authored memory experiences are interactive rooms with turn-driven events and return transitions. These remain playable through ordinary commands, including wait/abort where the browser allows them. The automatic adapter never advances those turns, skips their choices, or reveals future stages. Living-target scans advance their existing per-target index without adding score or memory-percentage rewards; other progression effects retain the engine's existing rules.

Phones with message machines are supported. `examine phone` or the existing `take messages` command opens the phone and shows only the archive count and controls. Use `game_command` with `play` to reveal one message and mark it heard through the existing browser action, then `close` to return to exploration. PLAY prefers remaining unheard messages in archive order and wraps for replay once all have been heard. No unplayed transcript or internal message ID is exposed. Normal gameplay commands require closing the phone first. Playback and closing consume no engine turns, but each tool request still counts against the agent action budget. Empty phones can be closed normally, and deferred close notifications are preserved.

## Ship map information

`game_information` now accepts `view: "map"`. It shows the browser drawing's current
position, visited labels, unnamed unvisited footprints, outlines and visible strokes.
Optional `detail` is `overview` (default), `nearby`, or `full`; optional `level` is a
drawn level from 2 through 7. Omit the level for the player's current level. The full
browser map can freely pan across these levels; Level One has no authored drawing.

The local player CLI accepts `:map`, `:map nearby`, `:map full`, and an optional level
number, such as `:map full 3` or `:map 3`. P/O references and grid cells describe
positions in the drawing. Lines, arrows and adjacent footprints do not confirm
passages or provide navigation commands. Only current/visited map labels are shown;
invisible label-only regions are not invented as anonymous rooms. The response has
a short legend and preserves visible teleport colors/glow without exposing flags.

Map requests are free information views, change no game state or moves, and record
full JSONL observations. They count toward the normal action budget and use unchanged
history/explanation, caching and spending controls. Maps are shown only on request.
See [HEADLESS_SHIP_MAP_ADAPTER.md](HEADLESS_SHIP_MAP_ADAPTER.md) for the presentation
rules, Level Three example, verification and visual precision limits.

## Room observation presentation

The harness retains a full player-visible room snapshot internally. Its description is compared with the last presented description independently of score, memory, and move counters. Unchanged descriptions are omitted from automatic command snapshots; the compact room/status header remains. The opening, reset/restart/restore, arrivals (including revisits and movement caused by interactions), explicit `look`, and changed visible descriptions get a full refresh. If the complete description is already present in engine narration, the automatic snapshot uses only the header. Engine narration, document bodies, notifications, and requested information are always preserved. `:room` always returns the full current view; `:history` may legitimately repeat previously narrated room text.

This happens before JSONL recording, so both CLIs, transcripts, reports, and Claude use the same observation text. No controller filtering, transcript format change, hidden state diff, or new player capability is involved. Exact visible text changes can still produce repeated paragraphs when only one part of the room changes; preserving the entire new description keeps clues and visibility reliable.

An offline mocked-agent measurement used the real game and the sequence `look`, `inventory`, `take paper`, `read paper`, `:log`, with fixed global randomness. No live API calls were made. Character counts include the actual tool-result separators:

| Payload | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| Five action responses | 6,167 | 3,853 | 37.5% |
| Opening plus action responses | 8,713 | 6,399 | 26.6% |
| Message text across six mocked model requests | 37,236 | 30,194 | 18.9% |

`look`, `take paper`, and `:log` were identical before and after. The paper acquisition still refreshes the room because the paper disappears from view. Only duplicate automatic snapshots were removed from inventory and reading; all document text and gameplay messages remain. These are character measurements, not billed token counts. The mock's synthetic usage/cost fields are not API measurements. Before/after artifacts are in `.headless-transcripts/room-observations-before-mocked/` and `.headless-transcripts/room-observations-after-mocked/`.

Mocked validation:

```powershell
pnpm exec vitest run src/test/headless-observations.test.ts src/test/headless-agent.test.ts src/test/headless-agent-cli.test.mjs src/test/headless-session.test.ts src/test/headless-information.test.tsx src/test/headless-knowledge.test.tsx src/test/command-output-capture.test.ts
pnpm exec tsc -b
```
