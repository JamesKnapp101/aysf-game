import { Console } from "node:console";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const args = process.argv.slice(2);
if (args.includes("--help")) {
  process.stdout.write(
    "Usage: node scripts/play-headless.mjs [--demo]\n" +
    "Ordinary game commands; :reset starts fresh, :transcript shows host transcript metadata, :quit exits.\n" +
    "Uses authored NPC dialogue. Inventory, status, reading and help are available as text.\n" +
    "Phone message machines: examine phone, then play for one message at a time, and close to continue.\n" +
    "Player information: :log [number], :gossip, :dna [number], :objectives, :room, :history, :map [overview|nearby|full] [2-7].\n" +
    "State stays in memory; transcripts are flushed to .headless-transcripts/*.jsonl.\n" +
    "Reset is required at unsupported UI interactions. The engine log cap does not limit transcript capture.\n",
  );
} else if (args.some((arg) => arg !== "--demo")) {
  process.stderr.write("Unknown option. Use --help for usage.\n");
  process.exitCode = 1;
} else {
  try {
    await play(args.includes("--demo"));
  } catch {
    // Also keep unexpected shutdown failures out of the player interface.
    process.stderr.write("The headless session could not be completed.\n");
    process.exitCode = 1;
  }
}

async function play(demo) {
  const root = fileURLToPath(new URL("../", import.meta.url));
  let loader;
  let session;
  let input;
  let stopping = false;
  const stop = () => { stopping = true; input?.close(); };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  // Imported engine/loader warnings can contain private diagnostics. CLI
  // player output uses stdout.write exclusively; no runtime console is sent.
  const previousConsole = globalThis.console;
  const sink = new Writable({ write(_chunk, _encoding, done) { done(); } });
  globalThis.console = new Console({ stdout: sink, stderr: sink });

  const show = (observation) => {
    if (observation.text.length) process.stdout.write(`${observation.text.join("\n\n")}\n\n`);
  };

  try {
    // Vite's config runner also resolves tooling relative to process.cwd().
    process.chdir(root);
    loader = await createServer({
      root,
      configFile: fileURLToPath(new URL("../vite.config.ts", import.meta.url)),
      configLoader: "runner",
      mode: "test",
      logLevel: "silent",
      appType: "custom",
      server: { middlewareMode: true, hmr: false, watch: null, preTransformRequests: false },
      optimizeDeps: { noDiscovery: true, include: [] },
      ssr: { optimizeDeps: { noDiscovery: true, include: [] } },
    });
    const { createHeadlessSession } = await loader.ssrLoadModule("/src/game/harness/session.ts");
    session = createHeadlessSession();
    show(await session.start());
    if (stopping) return;

    if (demo) {
      for (const command of ["look", "examine boxes", "examine dead man", "wait", "up"]) {
        if (stopping) return;
        show(await session.explorer.command(command));
      }
      process.stdout.write(":reset\n");
      show(await session.reset());
      await session.dispose();
      const transcript = session.transcript();
      process.stdout.write(`Transcript: ${transcript.records} records written to ${transcript.path}\n`);
      return;
    }

    process.stdout.write("Enter a game command; player views: :log [number], :gossip, :dna [number], :objectives, :room, :history, :map [overview|nearby|full] [2-7]. Phone controls: play, close. Host controls: :reset, :transcript, :quit.\n");
    const terminal = Boolean(process.stdin.isTTY && process.stdout.isTTY);
    input = createInterface({ input: process.stdin, output: process.stdout, terminal });
    if (terminal) { input.setPrompt("> "); input.prompt(); }
    for await (const line of input) {
      if (stopping) break;
      const control = line.trim();
      const information = control.match(/^:(log|gossip|dna|objectives|room|history|map)(?:\s+(.*))?$/i);
      if (control === ":quit") break;
      if (control === ":reset") show(await session.reset());
      else if (control === ":transcript") process.stdout.write(`${JSON.stringify(session.transcript(), null, 2)}\n`);
      else if (information?.[1].toLowerCase() === "map") {
        const selected = /^(?:(overview|nearby|full)(?:\s+|$))?([2-7])?$/i.exec(information[2]?.trim() ?? "");
        show(await session.explorer.information("map", selected ? {
          ...(selected[1] ? { detail: selected[1].toLowerCase() } : {}),
          ...(selected[2] ? { level: Number(selected[2]) } : {}),
        } : NaN));
      }
      else if (information) show(await session.explorer.information(information[1].toLowerCase(),
        information[2] === undefined ? undefined : /^[1-9]\d*$/.test(information[2]) ? Number(information[2]) : NaN));
      else show(await session.explorer.command(line));
      if (terminal) input.prompt();
    }
  } catch {
    process.stderr.write("The headless session could not be completed.\n");
    process.exitCode = 1;
  } finally {
    process.removeListener("SIGINT", stop);
    process.removeListener("SIGTERM", stop);
    input?.close();
    try {
      await session?.dispose();
    } finally {
      try {
        await loader?.close();
      } finally {
        globalThis.console = previousConsole;
        sink.end();
      }
    }
  }
}
