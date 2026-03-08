export type PltEntry = {
  id: string;
  terms: string[];
  body: string;
};

function normalizeTerm(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildPltIndex(seedEntries: PltEntry[]) {
  const entryList: PltEntry[] = seedEntries;

  const index = new Map<string, string>();
  for (const entry of entryList) {
    for (const t of entry.terms) {
      const key = normalizeTerm(t);
      if (!key) continue;
      if (!index.has(key)) index.set(key, entry.id);
    }
  }

  return { entryList, index };
}
