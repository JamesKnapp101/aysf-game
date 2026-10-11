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
          stop_reason: 'tool_use', usage: { input_tokens: 100, output_tokens: 20 }
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
  });
});
