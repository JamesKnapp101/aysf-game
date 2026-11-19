import type {
  ContactDiscovery,
  GameState,
  PlayerLogEntry,
  TriviaFact,
} from "../types/gameTypes";

type CollectionResult = { state: GameState; added: boolean; updated: boolean };

/** Preserve first acquisition time and array position; updates are explicit. */
export function collectLogEntry(
  state: GameState,
  entry: Omit<PlayerLogEntry, "loggedAtTurn">,
  update = false,
): CollectionResult {
  const entries = state.player.log;
  const index = entries.findIndex(current => current.id === entry.id);
  if (index < 0) {
    return {
      state: { ...state, player: { ...state.player, log: [...entries, { ...entry, loggedAtTurn: state.moves }] } },
      added: true, updated: false,
    };
  }
  const previous = entries[index];
  if (!update || (previous.body === entry.body && previous.title === entry.title && previous.source === entry.source)) {
    return { state, added: false, updated: false };
  }
  return {
    state: { ...state, player: { ...state.player, log: entries.map((current, i) => i === index ? { ...entry, loggedAtTurn: previous.loggedAtTurn } : current) } },
    added: false, updated: true,
  };
}

export function collectTrivia(state: GameState, facts: TriviaFact[] = []): CollectionResult {
  const seen = new Set(state.player.trivia.map(fact => fact.id));
  const fresh = facts.filter(fact => {
    if (!fact.id || seen.has(fact.id)) return false;
    seen.add(fact.id);
    return true;
  }).map(fact => ({ ...fact, loggedAtTurn: state.moves }));
  return fresh.length ? {
    state: { ...state, player: { ...state.player, trivia: [...state.player.trivia, ...fresh] } },
    added: true, updated: false,
  } : { state, added: false, updated: false };
}

/** Extensions are strings. Case/outer whitespace are insignificant; zeros are not. */
export function collectContacts(state: GameState, discoveries: ContactDiscovery[] = []): CollectionResult {
  const contacts = [...state.player.contacts];
  let added = false;
  let updated = false;
  for (const discovery of discoveries) {
    const extension = discovery.extension.trim().toUpperCase();
    if (!extension) continue;
    const id = `contact:${extension}`;
    const index = contacts.findIndex(contact => contact.id === id);
    const name = discovery.name?.trim() || undefined;
    const description = discovery.description?.trim() || undefined;
    if (index < 0) {
      contacts.push({ id, extension, name, description, loggedAtTurn: state.moves });
      added = true;
    } else {
      const previous = contacts[index];
      // An unidentified rediscovery must never erase an established identity.
      const next = { ...previous, name: name ?? previous.name, description: description ?? previous.description };
      if (next.name !== previous.name || next.description !== previous.description) {
        contacts[index] = next;
        updated = true;
      }
    }
  }
  return added || updated ? {
    state: { ...state, player: { ...state.player, contacts } }, added, updated,
  } : { state, added, updated };
}
