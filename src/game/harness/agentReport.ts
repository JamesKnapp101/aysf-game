import type { AgentEvent, AgentRun } from "./agent";

const escape = (value: string) => value.replace(/[\\`*_{}[\]<>#|]/g, "\\$&").replace(/\r?\n/g, " ");
const failure = /I don't understand|can't|cannot|could not|don't (?:see|have)|not (?:here|available)|unavailable|Choose a record|only for|no .+ here|needs a headless gameplay adapter/i;
const evidence = (event: AgentEvent) => `#${event.sequence ?? "rejected"}: ${escape(event.request)} — ${escape(event.text.join(" ").slice(0, 220))}`;
const acquisition = /(?:slip .{0,80} into your inventory|added to your inventory|you pick up|you collect)/i;
function collectionEvidence(event: AgentEvent): string | undefined {
  if (event.error) return undefined;
  const text = event.text.join("\n\n");
  const match = acquisition.exec(text) ?? (/^(?:take|get)\s/i.test(event.request.trim()) ? /(?:^|\n)Taken\./.exec(text) : null);
  if (!match) return undefined;
  return `#${event.sequence}: ${escape(event.request)} — ${escape(text.slice(Math.max(0, match.index - 200), match.index + match[0].length + 100))}`;
}
const bullets = (values: string[]) => values.length ? values.map(value => `- ${value}`).join("\n") : "- None observed in the recorded responses.";
const excerpt = (text: string, length: number) => (text.length > length ? `${text.slice(0, length)}\n[Excerpt; full response in JSONL.]` : text)
  .split("\n").map(line => `    ${line}`).join("\n");

/** Report uses observations and attempted commands only, never world definitions. */
export function renderAgentReport(run: AgentRun): string {
  const all = [run.opening.join("\n\n"), ...run.events.filter(event => !event.error).map(event => event.text.join("\n\n"))];
  const locations = [...new Set(all.flatMap(text => [...text.matchAll(/(?:^|\n)([^\n]+)\nScore: [^\n]+\| Moves: /g)].map(match => match[1])))];
  const examined = run.events.filter(event => /^(?:examine|x|inspect)\s/i.test(event.request));
  const read = run.events.filter(event => /^read\s/i.test(event.request));
  const collected = run.events.flatMap(event => { const evidence = collectionEvidence(event); return evidence ? [evidence] : []; });
  const objectives = [...new Set(all.flatMap(text => text.split("\n").filter(line => /^- \[(Active|Completed)\]/.test(line))))];
  const failed = run.events.filter(event => event.error || failure.test(event.text.join(" ")));
  const repeated = run.events.filter((event, index) => run.events.slice(0, index).some(previous => previous.request.trim().toLowerCase() === event.request.trim().toLowerCase()));
  const accepted = run.events.filter(event => !event.error && !failure.test(event.text.join(" ")));
  const findings: string[] = [];
  if (run.reason.includes("missing_harness_capability")) findings.push(`Missing harness capability: the game reported an unsupported interaction. ${run.events.length ? evidence(run.events[run.events.length - 1]) : escape(run.opening.join(" "))}`);
  if (/harness_failure|initialization_failure|controller_failure|transcript_failure/.test(run.reason)) findings.push(`Possible game/content defect or controller failure: ${escape(run.reason)}. This does not establish a content bug; inspect the transcript and reproduce separately.`);
  if (/api_|incomplete_tool_response/.test(run.reason)) findings.push(`API or service failure: ${escape(run.reason)}. No raw API error or credential is recorded.`);
  const parserFailures = failed.filter(event => /I don't understand|can't go that way|don't see/i.test(event.text.join(" ")));
  if (parserFailures.length || run.events.some(event => event.error)) findings.push(`Model reasoning limitation (possible): rejected requests or unproductive command choices. ${bullets([...parserFailures, ...run.events.filter(event => event.error)].slice(0, 4).map(evidence)).replace(/\n/g, " ")}`);
  const repeatedFailures = repeated.filter(event => failed.includes(event));
  if (repeatedFailures.length) findings.push(`Potential puzzle or clue discoverability issue (speculative): repeated unsuccessful attempts may instead reflect model reasoning. ${evidence(repeatedFailures[0])}`);
  return `# Autonomous playtest report

## Run Summary

- Date (UTC): ${run.date}
- Model: ${escape(run.model)}
- Game revision: ${escape(run.revision)}
- NPC conversation mode: authored
- Initial objective: ${run.objective}
- Gameplay actions/information requests: ${run.actions}; model turns: ${run.turns}
- Reported input tokens: ${run.inputTokens}; output tokens: ${run.outputTokens}
- Estimated cost: $${run.estimatedCostUsd.toFixed(6)} (input/output $${run.limits.inputUsdPerMillion}/$${run.limits.outputUsdPerMillion} per million tokens)
- Usage completeness: ${run.usageUncertain ? "Incomplete: a failed request may have incurred additional unreported usage." : "All completed model responses accounted for."}
- Elapsed: ${(run.elapsedMs / 1000).toFixed(2)} seconds
- Termination: ${escape(run.reason)}
- Limits: ${run.limits.maxActions} actions, ${run.limits.maxTurns} model turns, ${run.limits.timeoutMs / 1000}s elapsed, ${run.limits.requestTimeoutMs / 1000}s per API request, ${run.limits.maxTokens} total tokens, $${run.limits.maxCostUsd} estimated spend, ${run.limits.maxErrors} consecutive invalid requests
- Gameplay transcript: ${escape(run.transcriptPath)}

## Exploration

### Locations discovered (visible room headings)

${bullets(locations.map(escape))}

### Objects examined (attempts; responses establish outcomes)

${bullets(examined.map(evidence))}

### Items collected (recognized acquisition messages only)

${bullets(collected)}

### Documents read (attempts; consult responses for successful reading)

${bullets(read.map(evidence))}

### Objectives discovered or completed (only if shown)

${bullets(objectives.map(escape))}

## Observed Behavior

### Interactions without a recognized failure response

This conservative text heuristic is not proof of success. The complete responses below are the evidence.

${bullets(accepted.slice(0, 8).map(evidence))}

${accepted.length > 8 ? `${accepted.length} such interactions total; the first eight are listed here.` : ""}

### Failed commands and possible confusing parser responses

${bullets(failed.map(evidence))}

### Repeated attempts

${bullets(repeated.map(evidence))}

### Where the model became stuck

${repeatedFailures.length ? bullets(repeatedFailures.map(evidence)) : "No stuck point established by repeated failed commands."} Termination was ${escape(run.reason)}; a limit ending does not establish that the player was stuck.

## Potential Findings

These are observations or candidates, not confirmed bugs. No undiscovered state is inferred.

${bullets(findings)}

## Command/response evidence

The append-only JSONL file is authoritative and contains opening and end records as well as every executed request. Excerpts below point to its sequence numbers. Rejected tool requests are recorded here and do not consume gameplay actions. No model-generated report or hidden diagnostics were used.

### Opening observation

${excerpt(run.opening.join("\n\n"), 1000)}

${run.events.map(event => `### ${event.sequence === undefined ? "Rejected/uncertain request" : `Transcript #${event.sequence}`}: ${escape(event.request)}\n\n${excerpt(event.text.join("\n\n"), 350)}`).join("\n\n")}
`;
}
