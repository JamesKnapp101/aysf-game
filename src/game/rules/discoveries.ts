import type { GameNotificationDraft, GameState, KnowledgeDiscoveries } from "../types/gameTypes";
import { collectTeaResult } from "./gossip";
import { collectContacts, collectTrivia } from "./knowledge";
import { buildLogNotification, getGossipNotifications } from "./notifications";

/** Shared authored award hook for items, scripted events and message playback. */
export function collectDiscoveries(state: GameState, discoveries: KnowledgeDiscoveries = {}) {
  const tea = collectTeaResult(state, discoveries.containsTea);
  const trivia = collectTrivia(tea.state, discoveries.containsTrivia);
  const contacts = collectContacts(trivia.state, discoveries.containsContacts);
  const notifications: GameNotificationDraft[] = getGossipNotifications(tea.obtainedNewTea);
  if (trivia.added) notifications.push(buildLogNotification("You recorded a trivia fact."));
  if (contacts.added || contacts.updated) notifications.push(buildLogNotification(
    contacts.added ? "You recorded a telephone contact." : "You updated a telephone contact.",
  ));
  return { state: contacts.state, notifications };
}
