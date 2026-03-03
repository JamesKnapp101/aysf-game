import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const ALLOWED_EXT = new Set([".ts", ".tsx"]);

const PLACEHOLDER_LOCATION_RE = /location:\s*"(?<value>UNKNOWN|NOWHERE)"/g;
const TODO_ROOM_RE = /TODO:\s*(set correct room id|moved into ARMORY)/i;
const KNOWN_PLACEHOLDER_LINES = new Set([
  "src/world/Items/bodies.ts:119",
  "src/world/Items/bodies.ts:756",
  "src/world/Items/bodies.ts:775",
  "src/world/Items/drugs.ts:77",
  "src/world/Items/drugs.ts:112",
  "src/world/Items/levelThreeMisc.ts:512",
  "src/world/Items/levelThreeMisc.ts:650",
  "src/world/Items/levelThreeMisc.ts:979",
  "src/world/Items/levelThreeMisc.ts:1053",
  "src/world/Items/levelThreeMisc.ts:1684",
  "src/world/Items/levelThreeMisc.ts:2476",
  "src/world/Items/levelThreeMisc.ts:2497",
]);

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...walk(full));
      continue;
    }
    if (ALLOWED_EXT.has(path.extname(ent.name))) out.push(full);
  }
  return out;
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, "/");
}

function getLineNumber(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

const files = walk(SRC_DIR);
const findings = [];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");

  for (const match of text.matchAll(PLACEHOLDER_LOCATION_RE)) {
    const idx = match.index ?? 0;
    const line = getLineNumber(text, idx);
    const after = text.slice(idx, Math.min(text.length, idx + 160));
    const hasTodo = TODO_ROOM_RE.test(after);

    const fileRef = `${rel(file)}:${line}`;
    if (KNOWN_PLACEHOLDER_LINES.has(fileRef)) continue;

    findings.push({
      file: rel(file),
      line,
      message: hasTodo
        ? `new placeholder location (${match.groups?.value}) present`
        : `new placeholder location (${match.groups?.value}) present without TODO context`,
    });
  }
}

if (findings.length > 0) {
  console.error("Drift check failed (new placeholder drift):");
  for (const f of findings) {
    console.error(`- ${f.file}:${f.line} ${f.message}`);
  }
  process.exit(1);
}

console.log("Drift check passed.");
