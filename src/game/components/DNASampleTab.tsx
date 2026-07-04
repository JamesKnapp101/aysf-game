import { DNAResult } from "@game/rules/dnaReader";
import { useUIOverlayStore } from "@game/store/store";
import type { GameState } from "@game/types/gameTypes";
import * as React from "react";
import "../../styles/dna-sample-tab.css";

export function DNASampleTab({ gameState }: { gameState: GameState }) {
  const openOverlay = useUIOverlayStore((s) => s.openOverlay);

  const entries = gameState.player.dnaBank ?? [];

  const openEntry = React.useCallback(
    (e: DNAResult) => {
      openOverlay({
        kind: "reader",
        title: e.title || "DNA Sample",
        body: `DNA Analysis Results:\n--------------------\nName: ${e.name}\nGender: ${e.gender}\nAge: ${e.age}\nOccupation: ${e.occupation}\nAdditional Info: ${e.info}`,
        sourceItemId: undefined,
      } as any);
    },
    [openOverlay],
  );

  return (
    <div className="dna-tab">
      <div className="dna-tab-header">BANKED DNA SAMPLES</div>

      <div className="dna-tab-list" role="list" aria-label="DNA sample entries">
        {entries.length === 0 ? (
          <div className="dna-tab-empty">No samples collected yet.</div>
        ) : (
          entries.map((e, idx) => {
            const onActivate = () => openEntry(e);
            const title = e.title || "Unknown sample origin";
            const name = e.name || "Unknown";
            const gender = e.gender || "Unknown";
            const causeOfDeath = e.causeOfDeath || "Unknown";
            const ageText =
              typeof e.age === "number" && e.age > 0
                ? String(e.age)
                : "Unknown";

            return (
              <div key={`${e.loggedAtTurn}-${e.title}-${idx}`} role="listitem">
                <div
                  className="dna-tab-row"
                  role="button"
                  tabIndex={0}
                  onClick={onActivate}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      onActivate();
                    }
                  }}
                  aria-label={`Open DNA sample: ${title}`}
                >
                  <div className="dna-tab-rowMain">
                    <div className="dna-tab-left">
                      <span className="dna-tab-helixIcon" aria-hidden="true" />
                      <div className="dna-tab-nameLine">{name}</div>
                      <div className="dna-tab-causeLine">
                        <b>COD:</b> {causeOfDeath}
                      </div>
                    </div>
                    <div className="dna-tab-right">
                      <div className="dna-tab-metaLine">
                        <b>Gender:</b> {gender}
                      </div>
                      <div className="dna-tab-metaLine">
                        <b>Age:</b> {ageText}
                      </div>
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
