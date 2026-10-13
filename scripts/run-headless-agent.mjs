import Anthropic from "@anthropic-ai/sdk";
import { execFileSync } from "node:child_process";
import { Console } from "node:console";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Writable } from "node:stream";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseEnv } from "node:util";

const root = fileURLToPath(new URL("../", import.meta.url));
const flags = {
  "--model": "model", "--max-actions": "maxActions", "--timeout-seconds": "timeoutMs",
  "--request-timeout-seconds": "requestTimeoutMs", "--max-tokens": "maxTokens",
  "--max-output-tokens": "maxOutputTokens", "--max-cost-usd": "maxCostUsd",
  "--max-errors": "maxErrors", "--max-turns": "maxTurns",
  "--input-price": "inputUsdPerMillion", "--output-price": "outputUsdPerMillion",
  "--cache-read-multiplier": "cacheReadMultiplier",
};
const defaultModel = "claude-haiku-4-5-20251001";

export function parseArguments(args) {
  const options = {};
  let live = false;
  let verbose = false;
  let outputDirectory;
  const seen = new Set();
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    if (seen.has(flag)) throw new Error(`Duplicate option: ${flag}`);
    seen.add(flag);
    if (flag === "--live") { live = true; continue; }
    if (flag === "--verbose") { verbose = true; continue; }
    if (flag === "--no-cache") { options.promptCaching = false; continue; }
    if (!Object.hasOwn(flags, flag) && flag !== "--output-dir") throw new Error("Unknown option. Use --help.");
    const value = args[++index];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${flag}.`);
    if (flag === "--output-dir") { outputDirectory = resolve(root, value); continue; }
    if (flag === "--model") options.model = value;
    else {
      if (!/^\d+(?:\.\d+)?$/.test(value) || !Number.isFinite(Number(value)) || Number(value) <= 0) throw new Error(`Invalid value for ${flag}.`);
      options[flags[flag]] = Number(value) * (flag.includes("timeout-seconds") ? 1000 : 1);
    }
  }
  // Never estimate another model's spend using Haiku rates by accident.
  if (options.model && options.model !== defaultModel && (!options.inputUsdPerMillion || !options.outputUsdPerMillion)) {
    throw new Error("A custom model requires --input-price and --output-price (USD per million tokens).");
  }
  return { live, verbose, outputDirectory, options };
}

export async function loadCredential(repositoryRoot, environment = process.env) {
  if (environment.ANTHROPIC_API_KEY?.trim()) return environment.ANTHROPIC_API_KEY.trim();
  try {
    // Same server-side file as server/src/index.ts. Parse locally without
    // importing the NPC client, copying files, or loading config into messages.
    return parseEnv(await readFile(resolve(repositoryRoot, "server/.env.local"), "utf8")).ANTHROPIC_API_KEY?.trim();
  } catch (error) {
    if (error.code === "ENOENT") return undefined;
    throw new Error("Could not read server/.env.local.");
  }
}

const help = `Usage: node scripts/run-headless-agent.mjs --live [options]
Requires Node 22+ and pnpm-installed dependencies. --live explicitly enables paid API execution.
Credentials: ANTHROPIC_API_KEY, otherwise server/.env.local (same as the NPC backend).
NPC dialogue: authored. Only game_command and game_information are available to Claude.

--model MODEL                 Default: ${defaultModel}
--max-actions N               Default: 25 (commands + information requests)
--timeout-seconds N           Default: 600
--request-timeout-seconds N   Default: 60 (token counting and message creation)
--max-tokens N                Default: 100000 (cumulative input + output)
--max-output-tokens N         Default: 1024 per model turn
--max-cost-usd N              Default: 0.50 (estimated spend)
--max-errors N                Default: 3 consecutive invalid tool requests
--max-turns N                 Default: 40 message-creation attempts
--input-price N               Default: 1 USD/million input tokens
--output-price N              Default: 5 USD/million output tokens
                             Both prices required for a custom model.
--no-cache                    Disable automatic 5-minute prompt caching
--cache-read-multiplier N     Override model-derived read multiplier (default 0.1x;
                             Sonnet/Opus 5.5: 0.05x; Fable/Mythos 5.1: 0.025x)
--output-dir PATH             Default: .headless-transcripts (gitignored)
--verbose                     Show full player-visible responses (default: short preview)
--help                        Show help without starting a session or making API calls

SIGINT/SIGTERM abort API requests and drain any game operation before cleanup.
Token counting is an estimate; reservations include a margin, not an exact billing cap.
No automatic request retries. JSONL and Markdown paths are shown after shutdown.
`;

export async function main(args = process.argv.slice(2)) {
  if (args.length === 1 && args[0] === "--help") { process.stdout.write(help); return; }
  const config = parseArguments(args);
  if (!config.live) throw new Error("Live API execution is disabled. Add --live to enable it; use --max-actions 5 for a smoke test.");
  const apiKey = await loadCredential(root);
  if (!apiKey) throw new Error("Configure ANTHROPIC_API_KEY or server/.env.local before using --live.");
  // Keep SDK debug output disabled even if ANTHROPIC_LOG is set locally.
  const client = new Anthropic({ apiKey, authToken: null, logLevel: "off", maxRetries: 0, timeout: config.options.requestTimeoutMs ?? 60_000 });
  await play(config, client);
}

/** Trusted host entry point also permits offline integration tests with a mock. */
export async function play(config, client) {
  let loader;
  let session;
  const abort = new AbortController();
  const stop = () => abort.abort();
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  const previousConsole = globalThis.console;
  const sink = new Writable({ write(_chunk, _encoding, done) { done(); } });
  globalThis.console = new Console({ stdout: sink, stderr: sink });
  try {
    const { createServer } = await import("vite");
    // Match the existing headless CLI's Vite SSR loader. It binds no listener.
    process.chdir(root);
    loader = await createServer({
      root, configFile: fileURLToPath(new URL("../vite.config.ts", import.meta.url)),
      configLoader: "runner", mode: "test", logLevel: "silent", appType: "custom",
      server: { middlewareMode: true, hmr: false, watch: null, preTransformRequests: false },
      optimizeDeps: { noDiscovery: true, include: [] }, ssr: { optimizeDeps: { noDiscovery: true, include: [] } },
    });
    const { runHeadlessAgent, DEFAULT_AGENT_OPTIONS, validateAgentOptions } = await loader.ssrLoadModule("/src/game/harness/agent.ts");
    validateAgentOptions({ ...DEFAULT_AGENT_OPTIONS, ...config.options });
    const { createHeadlessSession } = await loader.ssrLoadModule("/src/game/harness/session.ts");
    let revision = "unknown";
    try {
      revision = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
      if (execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()) revision += " (working tree modified)";
    } catch { /* Revision metadata is optional and never sent to Claude. */ }
    session = createHeadlessSession({ transcriptDirectory: config.outputDirectory });
    process.stdout.write(`Starting fresh game with ${config.options.model ?? defaultModel}; NPC dialogue: authored or maybe not.\n`);
    const run = await runHeadlessAgent({
      client, session, options: config.options, revision, signal: abort.signal,
      onProgress: (event) => {
        const response = event.text.join("\n\n");
        const explanation = config.verbose
          ? `${event.goal === undefined ? "" : `Goal: ${event.goal}\n`}${event.reason === undefined ? "" : `Reason: ${event.reason}\n`}`
          : "";
        process.stdout.write(`[${event.sequence ?? "rejected"}] ${event.request}\n${explanation}${config.verbose ? response : response.replace(/\s+/g, " ").slice(0, 240)}\n\n`);
      },
    });
    process.stdout.write(`Stopped: ${run.reason}. Actions: ${run.actions}; model turns: ${run.turns}; tokens: ${run.inputTokens + run.outputTokens}; estimated cost: $${run.estimatedCostUsd.toFixed(4)}${run.usageUncertain ? " (additional usage unknown)" : ""}.\nTranscript: ${run.transcriptPath}\nReport: ${run.reportPath}\n`);
    if (run.finalAgentMessage !== undefined) {
      process.stdout.write(run.finalAgentMessage === ""
        ? "No final text was returned by the model.\n"
        : config.verbose
          ? `Final Agent Message:\n${run.finalAgentMessage}\n`
          : "Final agent message captured in transcript and report.\n");
    }
    if (/failure/.test(run.reason)) process.exitCode = 1;
  } catch {
    if (session) process.stderr.write(`Run could not be completed. Completed gameplay transcript: ${session.transcript().path}\n`);
    else process.stderr.write("The autonomous player could not be initialized. Check model options and local configuration.\n");
    process.exitCode = 1;
  } finally {
    process.removeListener("SIGINT", stop);
    process.removeListener("SIGTERM", stop);
    try { await session?.dispose(); }
    finally {
      try { await loader?.close(); }
      finally { globalThis.console = previousConsole; sink.end(); }
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { await main(); }
  catch (error) {
    // Only configuration errors above reach here, never raw SDK errors.
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
