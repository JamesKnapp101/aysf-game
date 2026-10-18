import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import { resolve, sep } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

const execute = promisify(execFile);
async function invoke(program) {
  const result = await execute(process.execPath, ["--input-type=module", "--eval", `import { parseArguments, loadCredential } from './scripts/run-headless-agent.mjs'; ${program}`], { timeout: 15000 });
  return JSON.parse(result.stdout);
}
const directories = [];
afterEach(async () => {
  for (const directory of directories.splice(0)) {
    if (!directory.startsWith(resolve(".headless-transcripts") + sep)) throw new Error("Unsafe test cleanup.");
    await fs.rm(directory, { recursive: true, force: true });
  }
});

describe("autonomous player launch configuration", () => {
  it("parses limits, output directory, and explicit live opt-in", async () => {
    const config = await invoke(`console.log(JSON.stringify(parseArguments(["--live", "--max-actions", "5", "--timeout-seconds", "30", "--request-timeout-seconds", "10", "--max-tokens", "2000", "--max-cost-usd", "0.05", "--max-errors", "2", "--max-turns", "8", "--max-output-tokens", "300", "--verbose", "--output-dir", ".headless-transcripts/custom"])));`);
    expect(config).toMatchObject({ live: true, verbose: true, options: { maxActions: 5, timeoutMs: 30000, requestTimeoutMs: 10000, maxTokens: 2000, maxCostUsd: 0.05, maxErrors: 2, maxTurns: 8, maxOutputTokens: 300 } });
    expect(config.outputDirectory).toBe(resolve(".headless-transcripts/custom"));
    expect(await invoke('console.log(JSON.stringify(parseArguments([])));')).toMatchObject({ live: false });
  });

  it.each([["--max-actions"], ["--max-actions", "0"], ["--max-actions", "NaN"], ["--arbitrary"], ["--live", "--live"], ["--model", "another-model"]])("rejects invalid launch arguments %j", async (...args) => {
    const rejected = await invoke(`try { parseArguments(${JSON.stringify(args)}); console.log('false'); } catch { console.log('true'); }`);
    expect(rejected).toBe(true);
  });

  it("requires explicit prices for another model", async () => {
    expect(await invoke('console.log(JSON.stringify(parseArguments(["--model", "another-model", "--input-price", "3", "--output-price", "15"]).options));')).toMatchObject({ model: "another-model", inputUsdPerMillion: 3, outputUsdPerMillion: 15 });
  });

  it("parses cache controls and preserves custom-model price requirements", async () => {
    expect(await invoke('console.log(JSON.stringify(parseArguments(["--no-cache", "--cache-read-multiplier", "0.2"]).options));'))
      .toEqual({ promptCaching: false, cacheReadMultiplier: 0.2 });
    for (const args of [["--no-cache", "--no-cache"], ["--cache-read-multiplier", "0"], ["--cache-read-multiplier", "NaN"], ["--model", "custom", "--no-cache"]]) {
      expect(await invoke(`try { parseArguments(${JSON.stringify(args)}); console.log('false'); } catch { console.log('true'); }`)).toBe(true);
    }
  });

  it("loads only the server-side key with environment precedence and does not mutate environment", async () => {
    const directory = resolve(".headless-transcripts", `credential-test-${randomUUID()}`);
    directories.push(directory);
    await fs.mkdir(resolve(directory, "server"), { recursive: true });
    await fs.writeFile(resolve(directory, "server/.env.local"), '# synthetic test values only\nANTHROPIC_API_KEY="fake-test-key" # comment\nPRIVATE_NPC_CONFIG=never-forward\n');
    const result = await invoke(`const env = {}; console.log(JSON.stringify({
      file: await loadCredential(${JSON.stringify(directory)}, env), env,
      precedence: await loadCredential(${JSON.stringify(directory)}, { ANTHROPIC_API_KEY: 'fake-env-key' }),
      missing: await loadCredential(${JSON.stringify(resolve(directory, "missing"))}, {}) ?? null
    }));`);
    expect(result).toEqual({ file: "fake-test-key", env: {}, precedence: "fake-env-key", missing: null });
  });

  it("shows help and refuses absent live opt-in without accessing the API", async () => {
    const help = await execute(process.execPath, ["scripts/run-headless-agent.mjs", "--help"], { timeout: 15000 });
    expect(help.stdout).toContain("--live");
    expect(help.stdout).toContain("claude-haiku-4-5-20251001");
    await expect(execute(process.execPath, ["scripts/run-headless-agent.mjs", "--max-actions", "5"], { timeout: 15000 })).rejects.toMatchObject({ stderr: expect.stringContaining("Live API execution is disabled") });
  });

  it("loads the actual Node controller and game through Vite, using only a mocked SDK", async () => {
    const directory = resolve(".headless-transcripts", `node-agent-test-${randomUUID()}`);
    directories.push(directory);
    const program = `
      import { play } from './scripts/run-headless-agent.mjs';
      let calls = 0;
      const client = { messages: {
        countTokens: async () => ({ input_tokens: 100 }),
        create: async () => ({
          content: [{ type: 'tool_use', id: 'tool_' + (++calls), name: 'game_command', input: { command: calls === 1 ? 'examine dead man' : 'inventory' } }],
          stop_reason: 'tool_use', usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 }
        })
      }};
      await play({ options: { maxActions: 2 }, outputDirectory: ${JSON.stringify(directory)} }, client);
    `;
    const result = await execute(process.execPath, ["--input-type=module", "--eval", program], { timeout: 20000 });
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Stopped: action_limit. Actions: 2");
    const files = await fs.readdir(directory);
    expect(files.some(file => file.endsWith(".jsonl"))).toBe(true);
    expect(files.some(file => file.endsWith(".report.md"))).toBe(true);
    const records = (await fs.readFile(resolve(directory, files.find(file => file.endsWith(".jsonl"))), "utf8")).trim().split("\n").map(JSON.parse);
    expect(records.map(record => record.kind)).toEqual(["start", "command", "command", "end"]);
    expect(records[2].observation.text.join(" ")).toMatch(/timer/i);
  }, 20000);

  it("retains NPC failure diagnostics despite suppressing the runtime console", async () => {
    const directory = resolve(".headless-transcripts", `node-conversation-${randomUUID()}`);
    directories.push(directory);
    const program = `
      import { play } from './scripts/run-headless-agent.mjs';
      globalThis.fetch = async () => {
        throw new TypeError('fetch failed', { cause: Object.assign(new Error('refused'), { code: 'ECONNREFUSED' }) });
      };
      const commands = ['up', 'up', 'take radio', 'use radio', 'tell radio about reactor'];
      let calls = 0;
      const client = { messages: {
        countTokens: async () => ({ input_tokens: 100 }),
        create: async () => ({
          content: [{ type: 'tool_use', id: 'tool_' + calls, name: 'game_command', input: { command: commands[calls++] } }],
          stop_reason: 'tool_use', usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 }
        })
      }};
      await play({ options: { maxActions: 5 }, outputDirectory: ${JSON.stringify(directory)} }, client);
    `;
    const result = await execute(process.execPath, ["--input-type=module", "--eval", program], { timeout: 20000 });
    const diagnostic = JSON.parse(result.stderr.trim().replace(/^\[AI CONVERSATION FAILURE\] /, ""));
    expect(diagnostic).toMatchObject({ npcId: "you_1st_contact", type: "tell", reason: "network_error", reasonCode: "ECONNREFUSED" });
    expect(result.stdout).toContain("Stopped: action_limit. Actions: 5");
    expect(result.stdout).not.toMatch(/ECONNREFUSED|network_error/);
    const files = await fs.readdir(directory);
    const records = (await fs.readFile(resolve(directory, files.find(file => file.endsWith(".jsonl"))), "utf8")).trim().split("\n").map(JSON.parse);
    expect(records.find(record => record.input === 'tell radio about reactor').aiConversationFailures).toEqual([diagnostic]);
  }, 20000);

  it.each([
    [false, "Complete **findings**.\n\nSecond paragraph.\n"],
    [true, "Complete **findings**.\n\nSecond paragraph.\n"],
    [true, ""],
  ])("prints the captured final message according to verbose=%s, text=%j", async (verbose, finalAgentMessage) => {
    const directory = resolve(".headless-transcripts", `node-final-message-${randomUUID()}`);
    directories.push(directory);
    const program = `
      import { play } from './scripts/run-headless-agent.mjs';
      let calls = 0;
      const client = { messages: {
        countTokens: async () => ({ input_tokens: 100 }),
        create: async () => ++calls === 1 ? ({
          content: [{ type: 'text', text: 'I will look.' }, { type: 'tool_use', id: 'tool_1', name: 'game_command', input: { command: 'look' } }],
          stop_reason: 'tool_use', usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 }
        }) : ({
          content: [{ type: 'thinking', thinking: 'PRIVATE_THOUGHT', signature: 'PRIVATE_SIGNATURE' }, { type: 'text', text: ${JSON.stringify(finalAgentMessage)} }],
          stop_reason: 'end_turn', usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 }
        })
      }};
      await play({ options: { maxActions: 2 }, verbose: ${verbose}, outputDirectory: ${JSON.stringify(directory)} }, client);
    `;
    const result = await execute(process.execPath, ["--input-type=module", "--eval", program], { timeout: 20000 });
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Stopped: model_finished. Actions: 1; model turns: 3; tokens: 360");
    if (!finalAgentMessage) expect(result.stdout).toContain("No final text was returned by the model.");
    else if (verbose) expect(result.stdout).toContain(`Final Agent Message:\n${finalAgentMessage}`);
    else {
      expect(result.stdout).toContain("Final agent message captured in transcript and report.");
      expect(result.stdout).not.toContain(finalAgentMessage);
    }
    const files = await fs.readdir(directory);
    const jsonl = await fs.readFile(resolve(directory, files.find(file => file.endsWith(".jsonl"))), "utf8");
    const records = jsonl.trim().split("\n").map(JSON.parse);
    expect(records.map(record => record.kind)).toEqual(["start", "command", "end"]);
    expect(records.map(record => record.sequence)).toEqual([1, 2, 3]);
    expect(records.at(-1).finalAgentMessage).toBe(finalAgentMessage);
    const report = await fs.readFile(resolve(directory, files.find(file => file.endsWith(".report.md"))), "utf8");
    expect(report).toContain("## Final Agent Message");
    if (finalAgentMessage) expect(report).toContain(finalAgentMessage.split("\n").map(line => `    ${line}`).join("\n"));
    expect(result.stdout + jsonl + report).not.toMatch(/PRIVATE_THOUGHT|PRIVATE_SIGNATURE|I will look/);
  }, 20000);

  it.each([false, true])("keeps action goals and reasons in artifacts and prints them only with verbose=%s", async verbose => {
    const directory = resolve(".headless-transcripts", `node-action-goals-${randomUUID()}`);
    directories.push(directory);
    const goal = "Explore the immediate surroundings";
    const commandReason = "Inspect the available exits.";
    const informationReason = "Review the visible room description.";
    const program = `
      import { play } from './scripts/run-headless-agent.mjs';
      const client = { messages: {
        countTokens: async () => ({ input_tokens: 100 }),
        create: async () => ({
          content: [
            { type: 'thinking', thinking: 'PRIVATE_THOUGHT', signature: 'PRIVATE_SIGNATURE' },
            { type: 'tool_use', id: 'command', name: 'game_command', input: { command: 'look', goal: ${JSON.stringify(goal)}, reason: ${JSON.stringify(commandReason)} } },
            { type: 'tool_use', id: 'information', name: 'game_information', input: { view: 'room', goal: ${JSON.stringify(goal)}, reason: ${JSON.stringify(informationReason)} } }
          ],
          stop_reason: 'tool_use', usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 }
        })
      }};
      await play({ options: { maxActions: 2 }, verbose: ${verbose}, outputDirectory: ${JSON.stringify(directory)} }, client);
    `;
    const result = await execute(process.execPath, ["--input-type=module", "--eval", program], { timeout: 20000 });
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Stopped: action_limit. Actions: 2; model turns: 1; tokens: 120");
    if (verbose) {
      expect(result.stdout).toContain(`[2] look\nGoal: ${goal}\nReason: ${commandReason}\n`);
      expect(result.stdout).toContain(`[3] :room\nGoal: ${goal}\nReason: ${informationReason}\n`);
    } else {
      expect(result.stdout).not.toMatch(/Goal:|Reason:/);
      expect(result.stdout).not.toContain(goal);
    }
    const files = await fs.readdir(directory);
    const jsonl = await fs.readFile(resolve(directory, files.find(file => file.endsWith(".jsonl"))), "utf8");
    const records = jsonl.trim().split("\n").map(JSON.parse);
    expect(records.map(record => record.kind)).toEqual(["start", "command", "information", "end"]);
    expect(records[1]).toMatchObject({ input: "look", goal, reason: commandReason });
    expect(records[2]).toMatchObject({ input: ":room", goal, reason: informationReason });
    const report = await fs.readFile(resolve(directory, files.find(file => file.endsWith(".report.md"))), "utf8");
    expect(report).toContain(`### Transcript #2: look\n\n- **Goal:** ${goal}\n- **Reason:** ${commandReason}`);
    expect(report).toContain(`### Transcript #3: :room\n\n- **Goal:** ${goal}\n- **Reason:** ${informationReason}`);
    expect(result.stdout + jsonl + report).not.toMatch(/PRIVATE_THOUGHT|PRIVATE_SIGNATURE/);
  }, 20000);
});
