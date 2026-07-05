import { getVisibleObjectives } from "@game/rules/objectives";
import type { GameState, PlayerObjective } from "@game/types/gameTypes";
import "../../styles/objectives-tab.css";

function renderObjective(objective: PlayerObjective) {
  const completed = objective.status === "completed";

  return (
    <div
      key={objective.id}
      className={`objectives-tab-row ${completed ? "is-completed" : ""}`}
      role="listitem"
    >
      <input
        aria-label={`${objective.title} ${completed ? "completed" : "active"}`}
        checked={completed}
        className="objectives-tab-checkbox"
        disabled
        readOnly
        type="checkbox"
      />
      <div className="objectives-tab-text">
        <div className="objectives-tab-title">{objective.title}</div>
        {objective.optional ? (
          <div className="objectives-tab-meta">Optional</div>
        ) : null}
      </div>
    </div>
  );
}

export function ObjectivesTab({ gameState }: { gameState: GameState }) {
  const objectives = getVisibleObjectives(gameState);
  const completedCount = objectives.filter(
    (objective) => objective.status === "completed",
  ).length;

  return (
    <div className="objectives-tab">
      <div className="objectives-tab-header">
        <div className="objectives-tab-heading">Objectives</div>
        <div className="objectives-tab-count">
          {completedCount}/{objectives.length}
        </div>
      </div>

      {objectives.length === 0 ? (
        <div className="objectives-tab-empty">No objectives tracked.</div>
      ) : (
        <div
          className="objectives-tab-list"
          role="list"
          aria-label="Current objectives"
        >
          {objectives.map(renderObjective)}
        </div>
      )}
    </div>
  );
}
