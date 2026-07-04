import { DNASampleTab } from "@game/components/DNASampleTab";
import { useUIOverlayStore } from "@game/store/store";
import type {
  GameState,
  JuicyTopic,
  PlayerLogEntry,
} from "@game/types/gameTypes";
import * as React from "react";
import "../../styles/log-tab.css";

type LogSubview = "entries" | "gossip" | "dna";

function previewText(body: string, maxChars = 80): string {
  const s = (body ?? "").replace(/\s+/g, " ").trim();
  if (s.length <= maxChars) return s;
  return s.slice(0, maxChars).trimEnd() + "...";
}

function formatTopicType(type: JuicyTopic["type"]): string {
  return type === "secret" ? "Secret" : "Gossip";
}

function renderLogEntry(
  entry: PlayerLogEntry,
  idx: number,
  onOpen: (entry: PlayerLogEntry) => void,
) {
  const onActivate = () => onOpen(entry);

  return (
    <div key={`${entry.loggedAtTurn}-${entry.title}-${idx}`} role="listitem">
      <div
        className="logtab-row"
        role="button"
        tabIndex={0}
        onClick={onActivate}
        onKeyDown={(ev) => {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            onActivate();
          }
        }}
        aria-label={`Open log entry: ${entry.title}`}
      >
        <div className="logtab-rowTop">
          <div style={{ whiteSpace: "nowrap" }}>
            Log Source:{" "}
            <span style={{ fontWeight: 700 }}>
              {(entry.source ?? "UNKNOWN").toUpperCase()}
            </span>
          </div>

          <div style={{ whiteSpace: "nowrap" }}>
            Logged at Turn:{" "}
            <span style={{ fontWeight: 700 }}>{entry.loggedAtTurn}</span>
          </div>
        </div>

        <div className="logtab-rowBody">
          <span className="logtab-rowIcon" aria-hidden="true" />

          <div className="logtab-rowTitle">{entry.title || "Untitled"}</div>

          <div className="logtab-rowPreview">{previewText(entry.body, 50)}</div>
        </div>
      </div>
    </div>
  );
}

function renderGossipTopic(topic: JuicyTopic, idx: number) {
  const tags = topic.tags?.filter(Boolean) ?? [];

  return (
    <div key={`${topic.id}-${idx}`} role="listitem">
      <div className="logtab-row logtab-row-static">
        <div className="logtab-rowTop">
          <div>
            Topic Type:{" "}
            <span style={{ fontWeight: 700 }}>
              {formatTopicType(topic.type).toUpperCase()}
            </span>
          </div>

          <div>
            Topic ID: <span style={{ fontWeight: 700 }}>{topic.id}</span>
          </div>
        </div>

        <div className="logtab-rowBody">
          <span
            className="logtab-rowIcon logtab-rowIcon--gossip"
            aria-hidden="true"
          />

          <div className="logtab-rowTitle">
            {topic.title || "Untitled topic"}
          </div>

          <div className="logtab-rowPreview logtab-rowPreview--full">
            {topic.summary || "No summary recorded."}
          </div>

          {tags.length > 0 ? (
            <div className="logtab-rowTags">{tags.join(" | ")}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function LogTab({ gameState }: { gameState: GameState }) {
  const openOverlay = useUIOverlayStore((s) => s.openOverlay);
  const [activeView, setActiveView] = React.useState<LogSubview>("entries");

  const entries = gameState.player.log ?? [];
  const gossipTopics = gameState.player.spiltTea ?? [];
  const dnaSamples = gameState.player.dnaBank ?? [];

  const openEntry = React.useCallback(
    (entry: PlayerLogEntry) => {
      openOverlay({
        kind: "reader",
        title: entry.title || "Log Entry",
        body: entry.body || "",
        sourceItemId: undefined,
      } as any);
    },
    [openOverlay],
  );

  const tabs: Array<{ id: LogSubview; label: string; count: number }> = [
    { id: "entries", label: "Log Entries", count: entries.length },
    { id: "gossip", label: "Gossip", count: gossipTopics.length },
    { id: "dna", label: "DNA", count: dnaSamples.length },
  ];

  return (
    <div className="logtab">
      <div className="logtab-subtabs" role="tablist" aria-label="Log sections">
        {tabs.map((tab) => {
          const isActive = tab.id === activeView;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`logtab-subtab ${isActive ? "isActive" : ""}`}
              onClick={() => setActiveView(tab.id)}
            >
              {tab.label}{" "}
              <span className="logtab-subtabCount">{tab.count}</span>
            </button>
          );
        })}
      </div>

      {activeView === "dna" ? (
        <DNASampleTab gameState={gameState} />
      ) : (
        <div
          className="logtab-list"
          role="list"
          aria-label={
            activeView === "entries" ? "Log entries" : "Gossip topics"
          }
        >
          {activeView === "entries" ? (
            entries.length === 0 ? (
              <div className="logtab-empty">No log entries yet.</div>
            ) : (
              entries.map((entry, idx) => renderLogEntry(entry, idx, openEntry))
            )
          ) : gossipTopics.length === 0 ? (
            <div className="logtab-empty">No gossip collected yet.</div>
          ) : (
            gossipTopics.map((topic, idx) => renderGossipTopic(topic, idx))
          )}
        </div>
      )}
    </div>
  );
}
