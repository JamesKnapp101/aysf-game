import type { GameState, ReactorLobeState } from "@game/types/gameTypes";
import {
  getReactorConsensusState,
  getReactorContainmentIntegrity,
  getReactorHeatLevel,
  getReactorLobeCounts,
  getReactorPowerLevel,
  getReactorRadiationLevel,
} from "./reactorConsensus";

type ReactorBigBoardProps = {
  state: GameState;
};

function Lobe({ lobe }: { lobe: ReactorLobeState }) {
  return (
    <span
      className="reactor-board__lobe"
      data-lobe-status={lobe.status}
      role="img"
      aria-label={`${lobe.id}: ${lobe.status}`}
      title={`${lobe.id.replace("reactor-lobe-", "Lobe ")}: ${lobe.status}`}
    />
  );
}

export function ReactorBigBoard({ state }: ReactorBigBoardProps) {
  const consensus = getReactorConsensusState(state);
  const counts = getReactorLobeCounts(consensus);
  const containment = getReactorContainmentIntegrity(consensus);
  const heatLevel = getReactorHeatLevel(consensus);
  const radiationLevel = getReactorRadiationLevel(consensus);
  const powerLevel = getReactorPowerLevel(consensus);
  const firstRow = consensus.lobes.filter((_lobe, index) => index % 2 === 0);
  const secondRow = consensus.lobes.filter((_lobe, index) => index % 2 === 1);

  return (
    <aside
      className="reactor-board"
      data-alert={
        containment <= 30
          ? "critical"
          : containment <= 60
            ? "warning"
            : "stable"
      }
      data-exploded={consensus.hasExploded ? "true" : "false"}
      aria-label="Reactor lobe consensus display"
    >
      <div className="reactor-board__bezel">
        <header className="reactor-board__header">
          <span className="reactor-board__eyebrow">ENGINEERING // ARRAY 5</span>
          <strong>REACTOR LOBE CONSENSUS</strong>
          <span className="reactor-board__state">
            {consensus.hasExploded ? "CONTAINMENT LOST" : "LIVE CONSENSUS"}
          </span>
        </header>

        <div
          className="reactor-board__array"
          aria-label="Twenty-five reactor lobes"
        >
          <div className="reactor-board__lobe-row">
            {firstRow.map((lobe) => (
              <Lobe key={lobe.id} lobe={lobe} />
            ))}
          </div>
          <div className="reactor-board__lobe-row reactor-board__lobe-row--offset">
            {secondRow.map((lobe) => (
              <Lobe key={lobe.id} lobe={lobe} />
            ))}
          </div>
        </div>

        <div className="reactor-board__readouts">
          <dl className="reactor-board__tallies">
            <div>
              <dt>
                <i data-swatch="harmonic" />Harmonic
              </dt>
              <dd>{counts.harmonic}</dd>
            </div>
            <div>
              <dt>
                <i data-swatch="undecided" />Undecided
              </dt>
              <dd>{counts.undecided}</dd>
            </div>
            <div>
              <dt>
                <i data-swatch="dissonant" />Dissonant
              </dt>
              <dd>{counts.dissonant}</dd>
            </div>
            <div>
              <dt>
                <i data-swatch="missing" />Offline
              </dt>
              <dd>{counts.missing}</dd>
            </div>
          </dl>

          <dl className="reactor-board__telemetry">
            <div>
              <dt>Core heat</dt>
              <dd>{heatLevel.toFixed(1)} K</dd>
            </div>
            <div>
              <dt>Radiation</dt>
              <dd>{radiationLevel} mSv</dd>
            </div>
            <div>
              <dt>Net output</dt>
              <dd>{powerLevel.toFixed(3)} ZW</dd>
            </div>
          </dl>

          <div className="reactor-board__containment">
            <span>Containment integrity</span>
            <strong>{containment}%</strong>
            <div className="reactor-board__meter" aria-hidden="true">
              <span style={{ width: `${containment}%` }} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
