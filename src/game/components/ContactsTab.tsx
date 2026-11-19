import type { GameState } from "@game/types/gameTypes";
import { contactName } from "@game/text/playerKnowledge";

export function ContactsTab({ gameState }: { gameState: GameState }) {
  return (
    <div className="logtab-list" role="list" aria-label="Collected contacts">
      {gameState.player.contacts.length === 0 ? (
        <div className="logtab-empty">No contacts collected yet.</div>
      ) : gameState.player.contacts.map(contact => (
        <article key={contact.id} role="listitem" className="logtab-row logtab-row-static logtab-contact">
          <div className="logtab-contactExtension">{contact.extension}</div>
          <div className="logtab-rowTitle">{contactName(contact)}</div>
          {contact.description && <p className="logtab-contactDescription">{contact.description}</p>}
        </article>
      ))}
    </div>
  );
}
