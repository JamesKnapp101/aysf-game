import { ContactsTab } from "@game/components/ContactsTab";
import { DNASampleTab } from "@game/components/DNASampleTab";
import { getDiscoveries, type Discovery } from "@game/selectors/knowledgeSelectors";
import { useUIOverlayStore } from "@game/store/store";
import { formatTopicType, formatTriviaBody, previewText } from "@game/text/playerKnowledge";
import type { GameState } from "@game/types/gameTypes";
import * as React from "react";
import "../../styles/log-tab.css";

type LogSubview = "discoveries" | "contacts" | "dna";
type DiscoveryFilter = "all" | Discovery["kind"];
const filters: { id: DiscoveryFilter; label: string }[] = [
  { id: "all", label: "All" }, { id: "text", label: "Text" },
  { id: "gossip", label: "Gossip" }, { id: "trivia", label: "Trivia" },
];

function DiscoveryRow({ discovery, onOpen }: {
  discovery: Discovery;
  onOpen: (title: string, body: string) => void;
}) {
  const { kind, record } = discovery;
  const title = record.title || "Untitled";
  const body = discovery.kind === "text" ? discovery.record.body
    : discovery.kind === "trivia" ? formatTriviaBody(discovery.record) : discovery.record.summary;
  const type = discovery.kind === "gossip" ? formatTopicType(discovery.record.type) : kind === "text" ? "Text" : "Trivia";
  const interactive = kind !== "gossip";
  const open = () => onOpen(title, body);

  return (
    <div role="listitem">
      <div
        className={`logtab-row${interactive ? "" : " logtab-row-static"}`}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={interactive ? open : undefined}
        onKeyDown={interactive ? event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            open();
          }
        } : undefined}
        aria-label={interactive ? `Open ${kind === "text" ? "log entry" : "trivia fact"}: ${title}` : undefined}
      >
        <div className="logtab-rowTop">
          <span className="logtab-type">{type}</span>
          {discovery.kind === "text" && <>
            <span>Log Source: <b>{discovery.record.source.toUpperCase()}</b></span>
            <span>Logged at Turn: <b>{discovery.record.loggedAtTurn}</b></span>
          </>}
          {discovery.kind === "trivia" && discovery.record.source && <span>Source: {discovery.record.source}</span>}
        </div>
        <div className="logtab-rowBody">
          <span className={`logtab-rowIcon${kind === "gossip" ? " logtab-rowIcon--gossip" : ""}`} aria-hidden="true" />
          <div className="logtab-rowTitle">{title}</div>
          <div className={`logtab-rowPreview${kind === "gossip" ? " logtab-rowPreview--full" : ""}`}>
            {discovery.kind === "gossip" ? body : previewText(discovery.kind === "trivia" ? discovery.record.body || discovery.record.answer : body, 50)}
          </div>
          {discovery.kind === "gossip" && <>
            {discovery.record.sourceNpcId && <div>Source: {discovery.record.sourceNpcId}</div>}
            {discovery.record.tags.filter(Boolean).length > 0 && <div className="logtab-rowTags">{discovery.record.tags.filter(Boolean).join(" | ")}</div>}
          </>}
        </div>
      </div>
    </div>
  );
}

export function LogTab({ gameState }: { gameState: GameState }) {
  const openOverlay = useUIOverlayStore(state => state.openOverlay);
  const [activeView, setActiveView] = React.useState<LogSubview>("discoveries");
  const [filter, setFilter] = React.useState<DiscoveryFilter>("all");
  const panelId = React.useId();
  const discoveries = getDiscoveries(gameState);
  const visible = discoveries.filter(discovery => filter === "all" || discovery.kind === filter);
  const tabs: { id: LogSubview; label: string; count: number }[] = [
    { id: "discoveries", label: "Discoveries", count: discoveries.length },
    { id: "contacts", label: "Contacts", count: gameState.player.contacts.length },
    { id: "dna", label: "DNA", count: gameState.player.dnaBank.length },
  ];

  return (
    <div className="logtab">
      <div className="logtab-subtabs" role="tablist" aria-label="Log sections">
        {tabs.map(tab => (
          <button key={tab.id} type="button" role="tab"
            id={`${panelId}-${tab.id}`} aria-selected={activeView === tab.id} aria-controls={panelId}
            className={`logtab-subtab ${activeView === tab.id ? "isActive" : ""}`}
            onClick={() => setActiveView(tab.id)}>
            {tab.label} <span className="logtab-subtabCount">{tab.count}</span>
          </button>
        ))}
      </div>
      <div id={panelId} role="tabpanel" aria-labelledby={`${panelId}-${activeView}`} className="logtab-panel">
        {activeView === "dna" ? <DNASampleTab gameState={gameState} />
          : activeView === "contacts" ? <ContactsTab gameState={gameState} /> : <>
            <div className="logtab-filters" role="group" aria-label="Discovery filters">
              {filters.map(option => <button key={option.id} type="button"
                className={`logtab-filter ${filter === option.id ? "isActive" : ""}`}
                aria-pressed={filter === option.id} onClick={() => setFilter(option.id)}>{option.label}</button>)}
            </div>
            <div className="logtab-list" role="list" aria-label="Discoveries">
              {visible.length === 0 ? <div className="logtab-empty">
                {filter === "all" ? "No discoveries collected yet." : `No ${filter} collected yet.`}
              </div> : visible.map(discovery => <DiscoveryRow key={`${discovery.kind}:${discovery.record.id}`}
                discovery={discovery} onOpen={(title, body) => openOverlay({ kind: "reader", title, body })} />)}
            </div>
          </>}
      </div>
    </div>
  );
}
