import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const ALLOWED_EXT = new Set([".ts", ".tsx"]);

const PLACEHOLDER_LOCATION_RE = /location:\s*"(?<value>UNKNOWN|NOWHERE)"/g;
const TODO_ROOM_RE = /TODO:\s*(set correct room id|moved into ARMORY)/i;
const ITEM_ID_RE = /id:\s*"(?<id>[^"]+)"/g;
const KNOWN_PLACEHOLDER_ITEMS = new Set([
  "src/world/Items/bodies.ts:brains",
  "src/world/Items/bodies.ts:DeadOtherSelf",
  "src/world/Items/bodies.ts:DeadGorilla",
  "src/world/Items/drugs.ts:DeathCart",
  "src/world/Items/drugs.ts:InocCart",
  "src/world/Items/levelThreeMisc.ts:KibbleBOX",
  "src/world/Items/levelThreeMisc.ts:POEM",
  "src/world/Items/levelThreeMisc.ts:note",
  "src/world/Items/levelThreeMisc.ts:STUMP",
  "src/world/Items/levelThreeMisc.ts:TIRLET",
  "src/world/Items/levelThreeMisc.ts:RemoteBlueIND",
  "src/world/Items/levelThreeMisc.ts:LabBlueIND",
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

function getNearestItemId(source, index) {
  const prefix = source.slice(0, index);
  let itemId = null;

  for (const match of prefix.matchAll(ITEM_ID_RE)) {
    itemId = match.groups?.id ?? itemId;
  }

  return itemId;
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
    const itemId = getNearestItemId(text, idx);
    const itemRef = itemId ? `${rel(file)}:${itemId}` : null;

    if (itemRef && KNOWN_PLACEHOLDER_ITEMS.has(itemRef)) continue;

    findings.push({
      file: rel(file),
      line,
      message: hasTodo
        ? `new placeholder location (${match.groups?.value}) present${itemId ? ` on ${itemId}` : ""}`
        : `new placeholder location (${match.groups?.value}) present${itemId ? ` on ${itemId}` : ""} without TODO context`,
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
