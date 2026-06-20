import { normalize } from "@game/rules/scope";
import type { NpcDialogEntry } from "@game/types/npcTypes";

export { NPC_DIALOG } from "@game/npcDialogs";

type TopicDefinition = {
  aliases?: string[];
  all?: string[];
  any?: string[];
  key: string;
};

const TOPIC_DEFINITIONS: TopicDefinition[] = [
  {
    key: "what fuck",
    aliases: ["what the fuck", "what the hell", "what hell", "what fuck"],
    all: ["what"],
    any: ["fuck", "hell"],
  },
  {
    key: "where we are",
    aliases: ["where are we", "where we are", "where am i", "what is this place"],
  },
  {
    key: "what to do",
    aliases: [
      "what should i do",
      "what do i do",
      "what now",
      "where next",
      "help me",
      "i am stuck",
      "stuck",
    ],
    any: ["help", "stuck"],
  },
  {
    key: "self",
    aliases: [
      "yourself",
      "about yourself",
      "who are you",
      "what are you",
      "your name",
      "name",
    ],
  },
  {
    key: "pass",
    aliases: ["park pass", "pass", "permit", "ticket", "park permit"],
    all: ["park"],
    any: ["pass", "permit", "ticket"],
  },
  {
    key: "badge",
    aliases: [
      "badge",
      "badges",
      "security badge",
      "what is the badge for",
      "what the badge is for",
      "badge for",
    ],
    any: ["badge", "badges"],
  },
  { key: "hours", aliases: ["hours", "open", "closing", "schedule"] },
  {
    key: "amenities",
    aliases: ["amenities", "attractions", "things to do", "inside the park"],
  },
  {
    key: "aeneas",
    aliases: [
      "aeneas",
      "the aeneas",
      "ship",
      "the ship",
      "century ship",
      "vessel",
    ],
    any: ["aeneas", "ship", "vessel"],
  },
  {
    key: "mayor",
    aliases: ["mayor", "the mayor", "ship ai", "ai mayor"],
    any: ["mayor"],
  },
  {
    key: "journey",
    aliases: [
      "journey",
      "voyage",
      "destination",
      "new home",
      "great beyond",
      "where are we going",
    ],
    any: ["journey", "voyage", "destination"],
  },
  {
    key: "size",
    aliases: ["how big", "massive", "population", "large", "huge"],
    any: ["massive", "population"],
  },
  {
    key: "rotations",
    aliases: [
      "rotation",
      "rotations",
      "cryo sleep",
      "cryonic sleep",
      "cryosleep",
      "deep storage cycle",
      "waking population",
    ],
    any: ["rotation", "rotations", "cryonic", "cryosleep"],
  },
  {
    key: "transfers",
    aliases: ["transfer", "transfers", "population cluster", "red tape"],
    any: ["transfer", "transfers"],
  },
  {
    key: "zones",
    aliases: ["zones", "areas", "levels", "ship zones", "ship areas"],
    any: ["zones"],
  },
  { key: "hydroponics", aliases: ["hydroponics", "plants"], any: ["hydroponics"] },
  { key: "botanical", aliases: ["botanical", "greenhouse", "garden", "seed bank", "fungal caves"], any: ["botanical", "greenhouse", "garden"] },
  { key: "zoological", aliases: ["zoological", "zoology", "aquarium", "aviary", "game preserve"], any: ["zoological", "zoology", "aquarium", "aviary"] },
  { key: "power", aliases: ["power", "power distribution"], any: ["power"] },
  { key: "engineering", aliases: ["engineering", "reactors", "reactor"], any: ["engineering"] },
  { key: "park", aliases: ["vivarium park", "park"], any: ["park"] },
  { key: "gym", aliases: ["gym", "gymnasium", "ultra fitness", "fitness"], any: ["gym", "gymnasium", "fitness"] },
  { key: "bar", aliases: ["bar", "loosened tongue", "the loosened tongue"], any: ["bar"] },
  { key: "restaurant", aliases: ["restaurant", "saveurs", "matthias venn"], any: ["restaurant", "saveurs"] },
  { key: "movie theater", aliases: ["movie theater", "movphitheater", "theater", "cinema"], any: ["movphitheater", "theater", "cinema"] },
  { key: "storage", aliases: ["storage", "storage area"], any: ["storage"] },
  { key: "printing", aliases: ["3d printing", "printing", "printer", "fabrication"], any: ["printing", "printer"] },
  { key: "deep storage", aliases: ["deep storage", "cryo grid", "cryonic grid"], all: ["deep", "storage"] },
  { key: "living quarters", aliases: ["living quarters", "quarters", "housing"], any: ["quarters", "housing"] },
  { key: "learnatorium", aliases: ["learnatorium", "classroom", "school"], any: ["learnatorium", "classroom"] },
  { key: "medical", aliases: ["medical", "hospital", "pharmacy", "or", "operating room", "lab"], any: ["medical", "hospital", "pharmacy"] },
  { key: "operations", aliases: ["operations", "ops", "mayor office"], any: ["operations", "ops"] },
  { key: "xenobiology", aliases: ["xenobiology", "alien lab", "aliens", "xenolab"], any: ["xenobiology", "xenolab", "aliens"] },
  { key: "mox", aliases: ["mox", "mox eegler", "player"], any: ["mox"] },
  { key: "isosceles", aliases: ["isosceles", "onche", "isosceles onche"], any: ["isosceles", "onche"] },
  { key: "volonope", aliases: ["volonope", "volonope fick", "fick"], any: ["volonope"] },
  { key: "henk", aliases: ["henk", "umboltz", "henk umboltz", "head of security"], any: ["henk", "umboltz"] },
  { key: "iggy", aliases: ["iggy", "iggy onche", "cat"], any: ["iggy"] },
  { key: "reactor", aliases: ["reactor", "reactors", "meltdown"], any: ["reactor", "reactors"] },
  { key: "reset key", aliases: ["reset key", "power key", "manual override"], all: ["key"] },
  { key: "dark", aliases: ["dark", "darkness", "dark areas", "dark rooms"], any: ["dark", "darkness"] },
  { key: "organism", aliases: ["organism", "thing", "creature", "monster"], any: ["organism", "creature", "monster"] },
  { key: "bug", aliases: ["bug", "spider", "husk", "itsy bitsy spider"], any: ["bug", "spider", "husk"] },
  { key: "supervisor", aliases: ["supervisor", "control room supervisor", "power supervisor"], any: ["supervisor"] },
  { key: "moan", aliases: ["moan", "wail", "weird sound", "weird noise", "stairwell noise", "stairwell sound"], any: ["moan", "wail"] },
  { key: "trash", aliases: ["trash", "garbage", "litter", "rubbish"], any: ["trash", "garbage", "litter"] },
  { key: "workout", aliases: ["workout", "exercise", "lift", "lifting", "muscles"], any: ["workout", "exercise", "lift", "lifting"] },
  { key: "weight", aliases: ["weight", "weights", "barbell", "bench press"], any: ["weight", "weights", "barbell"] },
  { key: "body", aliases: ["body", "corpse", "dead man", "dead body"], any: ["body", "corpse"] },
  { key: "insta roids", aliases: ["insta roids", "insta-roids", "roids", "steroids"], any: ["roids", "steroids"] },
  { key: "trivia", aliases: ["trivia", "bar trivia", "question", "answer"], any: ["trivia"] },
  { key: "cellar", aliases: ["cellar", "basement", "stock boy"], any: ["cellar", "basement"] },
  { key: "drink", aliases: ["drink", "drinks", "cocktail", "beer"], any: ["drink", "drinks", "cocktail"] },
  { key: "darts", aliases: ["dart", "darts", "dartboard"], any: ["dart", "darts", "dartboard"] },
  { key: "movie", aliases: ["movie", "film", "our journey home", "chapter 542"], any: ["movie", "film"] },
  { key: "otto", aliases: ["otto", "movie ai"], any: ["otto"] },
  { key: "smoking", aliases: ["smoking", "smoke", "vapor", "vape", "vaping"], any: ["smoking", "smoke", "vapor", "vape"] },
  { key: "bathroom", aliases: ["bathroom", "restroom", "lavatory"], any: ["bathroom", "restroom", "lavatory"] },
  { key: "gossip", aliases: ["gossip", "tea", "secret", "secrets"], any: ["gossip", "secret", "secrets"] },
  { key: "whistle", aliases: ["whistle", "robot whistle", "blow whistle"], any: ["whistle"] },
  { key: "warehouse", aliases: ["warehouse", "robot refuge", "hiding robot"], any: ["warehouse"] },
  { key: "freezer", aliases: ["freezer", "walk in", "walk-in", "cold"], any: ["freezer", "cold"] },
  { key: "cooking", aliases: ["cooking", "food", "dish", "dishes", "chef"], any: ["cooking", "food", "dish", "dishes"] },
  { key: "contamination", aliases: ["contamination", "infection", "sickness", "pinholes", "shrew nebula"], any: ["contamination", "infection", "pinholes"] },
  { key: "package", aliases: ["package", "contraband", "sink"], any: ["package", "contraband"] },
  { key: "drink vision", aliases: ["vision", "hallucination", "master of drink"], any: ["vision", "hallucination"] },
  { key: "horny clone", aliases: ["horny clone", "sanyi clone", "three-way"], all: ["clone"] },
  { key: "steel door", aliases: ["steel door", "heavy door", "polished door", "polished steel door"], all: ["door"] },
  { key: "me", aliases: ["me", "myself", "who am i"], any: ["myself"] },
  { key: "what happened", aliases: ["what happened", "catastrophe", "disaster"], any: ["catastrophe", "disaster"] },
];

function tokenizeTopic(text: string): string[] {
  return normalize(text).split(/\s+/).filter(Boolean);
}

function containsSequence(haystack: string[], needle: string[]): boolean {
  if (needle.length === 0) return false;
  if (needle.length === 1) return haystack.includes(needle[0]);

  for (let index = 0; index <= haystack.length - needle.length; index += 1) {
    if (needle.every((token, offset) => haystack[index + offset] === token)) {
      return true;
    }
  }

  return false;
}

function scoreTopicDefinition(
  normalizedTopic: string,
  tokens: string[],
  definition: TopicDefinition,
): number {
  const tokenSet = new Set(tokens);
  let score = normalizedTopic === definition.key ? 400 : 0;

  for (const alias of definition.aliases ?? []) {
    const normalizedAlias = normalize(alias);
    const aliasTokens = tokenizeTopic(alias);
    if (!normalizedAlias) continue;

    if (normalizedTopic === normalizedAlias) {
      score = Math.max(score, 350);
      continue;
    }

    if (containsSequence(tokens, aliasTokens)) {
      score = Math.max(score, 150 + aliasTokens.length * 10);
    }
  }

  if (definition.all?.length) {
    const allTokens = definition.all.map(normalize);
    if (allTokens.every((token) => tokenSet.has(token))) {
      score = Math.max(score, 130 + allTokens.length * 10);
    }
  }

  if (definition.any?.length) {
    const matches = definition.any
      .map(normalize)
      .filter((token) => tokenSet.has(token));
    if (matches.length > 0) {
      score = Math.max(score, 80 + matches.length * 8);
    }
  }

  if (tokenSet.has(definition.key)) {
    score = Math.max(score, 90);
  }

  return score;
}

export function resolveAskTopic(raw: string): string {
  const normalizedTopic = normalize(raw);
  if (!normalizedTopic) return normalizedTopic;

  const tokens = tokenizeTopic(normalizedTopic);
  const scored = TOPIC_DEFINITIONS.map((definition, index) => ({
    definition,
    index,
    score: scoreTopicDefinition(normalizedTopic, tokens, definition),
  }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  return scored[0]?.definition.key ?? normalizedTopic;
}

export function getNpcAskReply(dialog: NpcDialogEntry, topic: string) {
  const key = resolveAskTopic(topic);
  return dialog.ask[key];
}
