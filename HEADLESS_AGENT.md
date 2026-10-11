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
| `--output-dir` | `.headless-transcripts` | Host output directory; custom paths may need a gitignore entry |
| `--verbose` | off | Full visible responses instead of short previews |

Prices use standard uncached input/output rates; update them when pricing changes. Both price flags are required for a different model. No prompt caching, thinking configuration, or server tools are requested. See Anthropic's [pricing](https://platform.claude.com/docs/en/about-claude/pricing), [token counting](https://platform.claude.com/docs/en/build-with-claude/token-counting), and [tool definitions](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools).

Before each model turn, the supported token-counting endpoint estimates the full player context. The controller reserves input tokens plus a 2%/32-token margin and limits output by remaining tokens and estimated dollars. Reported usage updates the next reservation. Anthropic describes token counts as estimates, so these limits are not an exact billing guarantee. A failed API response may have incurred usage that cannot be reported; the run stops immediately and marks usage as incomplete. Automatic SDK retries are disabled. Ordinary parser and puzzle failures are responses rather than controller errors.

The controller executes one game operation at a time, including multi-tool responses. It checks limits before every operation and never executes tools beyond the action budget. Unsupported tools or extra/malformed arguments never reach the game. Existing parser normalization and developer-command rejection remain authoritative. Truncated tool batches and duplicate tool IDs stop without execution. The model gets no reset tool; ordinary commands such as restart retain existing Explorer behavior.

SIGINT/SIGTERM and the elapsed deadline abort SDK requests through an `AbortSignal`. A separate cancellation race prevents late responses from an abort-ignoring transport from invoking tools. This cannot guarantee that Anthropic stops billing work already received by its servers. Game initialization and commands do not offer cancellation, so the controller drains outstanding game operations before disposing the session and loader. Shutdown can extend past the deadline; a permanently hung engine operation needs external process termination. No uncertain operation is retried.

Each run retains `.headless-transcripts/<session-id>.jsonl` using the harness's append-only, synced persistence, plus `.headless-transcripts/<session-id>.report.md`. The report includes revision/limits/usage/termination, visible room headings, examination/reading attempts, explicit acquisition messages, shown objectives, failed/repeated commands, speculative findings, and response excerpts linked by transcript sequence number. JSONL preserves complete responses. Deterministic text heuristics are labeled as uncertain. Claude is never asked to infer undiscovered state. Commands rejected before reaching the harness appear in Markdown. A transcript disk failure is terminal; previously synced records remain available, but a filesystem failure can also prevent the report.

The harness still stops at unsupported terminals and effects requiring adapters. The agent does not bypass them or change puzzle/content logic. Next, run the five-action smoke test and review both artifacts before increasing the action budget.

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
