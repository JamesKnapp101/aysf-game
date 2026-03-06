import { useUIOverlayStore } from "@game/store/store";
import type { GameState, PlayerLogEntry } from "@game/types/gameTypes";
import * as React from "react";
import "../../styles/log-tab.css";

function previewText(body: string, maxChars = 80): string {
  const s = (body ?? "").replace(/\s+/g, " ").trim();
  if (s.length <= maxChars) return s;
  return s.slice(0, maxChars).trimEnd() + " …";
}

export function LogTab({ gameState }: { gameState: GameState }) {
  const openOverlay = useUIOverlayStore((s) => s.openOverlay);

  const entries = gameState.player.log ?? [];

  const openEntry = React.useCallback(
    (e: PlayerLogEntry) => {
      openOverlay({
        kind: "reader",
        title: e.title || "Log Entry",
        body: e.body || "",
        sourceItemId: undefined,
      } as any);
    },
    [openOverlay],
  );

  return (
    <div
      className="logtab"
      style={{
        height: "96%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "2px solid currentColor",
        borderRadius: 10,
        padding: 10,
      }}
    >
      <div
        className="logtab-header"
        style={{
          flex: "0 0 auto",
          padding: "2px 4px 10px 4px",
          borderBottom: "2px solid currentColor",
          marginBottom: 10,
          letterSpacing: 1,
        }}
      >
        CURRENT LOG ENTRIES
      </div>

      <div
        className="logtab-list"
        role="list"
        aria-label="Log entries"
        style={{
          flex: "1 1 auto",
          overflowY: "auto",
          overflowX: "hidden",
          minHeight: 0,
          paddingRight: 8,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {entries.length === 0 ? (
          <div style={{ opacity: 0.85, padding: 8 }}>No log entries yet.</div>
        ) : (
          entries.map((e, idx) => {
            const onActivate = () => openEntry(e);

            return (
              <div
                key={`${e.loggedAtTurn}-${e.title}-${idx}`}
                role="listitem"
                style={{
                  padding: 4,
                }}
              >
                {/* Entire row is keyboard-focusable/clickable */}
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
                  aria-label={`Open log entry: ${e.title}`}
                  style={{
                    outline: "none",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {/* Top line: source (left) + turn (right) */}
                  <div
                    className="logtab-rowTop"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      fontSize: 14,
                      opacity: 0.95,
                    }}
                  >
                    <div style={{ whiteSpace: "nowrap" }}>
                      Log Source:{" "}
                      <span style={{ fontWeight: 700 }}>
                        {(e.source ?? "UNKNOWN").toUpperCase()}
                      </span>
                    </div>

                    <div style={{ whiteSpace: "nowrap" }}>
                      Logged at Turn:{" "}
                      <span style={{ fontWeight: 700 }}>{e.loggedAtTurn}</span>
                    </div>
                  </div>

                  <div className="logtab-rowBody">
                    <span className="logtab-rowIcon" aria-hidden="true" />

                    {/* Title */}
                    <div
                      className="logtab-rowTitle"
                      style={{
                        fontSize: 20,
                        lineHeight: 1.05,
                      }}
                    >
                      {e.title || "Untitled"}
                    </div>

                    {/* Preview */}
                    <div
                      className="logtab-rowPreview"
                      style={{
                        fontSize: 14,
                        opacity: 0.95,
                      }}
                    >
                      {previewText(e.body, 50)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
