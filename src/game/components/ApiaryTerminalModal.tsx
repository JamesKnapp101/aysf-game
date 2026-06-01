import type { GameState } from "@game/types/gameTypes";
import {
  getApiaryTrayBeeSpecs,
  isDeactivatedBeeOnApiaryTray,
} from "src/world/maps/levelFour/Apiary";
import type { BeeSpecs } from "src/world/maps/levelFour/Greenhouse";
import "../../styles/apiary-terminal.css";
import { CrtModal } from "./CrtModal";

type ApiaryTerminalModalProps = {
  onClose: () => void;
  state: GameState;
};

type BeeSpecRow = {
  label: string;
  value: string;
};

function OmniBeeIcon() {
  return (
    <svg
      className="apiary-terminal-bee-icon"
      viewBox="0 0 96 96"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="apiary-terminal-bee-wing"
        d="M32 42c-12-11-23-9-27 0-4 10 4 23 18 24 9 1 16-4 20-12"
      />
      <path
        className="apiary-terminal-bee-wing"
        d="M64 42c12-11 23-9 27 0 4 10-4 23-18 24-9 1-16-4-20-12"
      />
      <path
        className="apiary-terminal-bee-body"
        d="M48 25c13 0 23 14 23 31S61 84 48 84 25 73 25 56s10-31 23-31Z"
      />
      <path
        className="apiary-terminal-bee-stripe"
        d="M30 48h36M28 60h40M34 72h28"
      />
      <path
        className="apiary-terminal-bee-head"
        d="M36 27c2-9 7-14 12-14s10 5 12 14"
      />
      <path
        className="apiary-terminal-bee-detail"
        d="M39 22 30 12M57 22l9-10M40 34h-7M63 34h-7"
      />
    </svg>
  );
}

function buildBeeSpecRows(specs: BeeSpecs): BeeSpecRow[] {
  return [
    { label: "Id", value: specs.id },
    { label: "Model", value: specs.model },
    { label: "Version", value: specs.version },
    { label: "Uptime", value: String(specs.uptime) },
    { label: "Ping freq", value: `${specs.pingFrequencyMs}ms` },
    { label: "Last ping", value: String(specs.lastPing) },
    { label: "Last objective", value: specs.objective },
    { label: "Trips", value: String(specs.trips) },
    {
      label: "Total payloads",
      value: `${specs.totalPayloadGrams.toFixed(3)}g`,
    },
    { label: "Status", value: specs.status },
    { label: "Error Code", value: specs.errorCode },
    { label: "Req Shutdown?", value: String(specs.requiresShutdown) },
    {
      label: "Shutdown freq",
      value: `${specs.shutdownFrequencyMHz.toFixed(4)}MHz`,
    },
    { label: "Swarm ID", value: String(specs.swarmId) },
    { label: "Hive ID", value: specs.hiveId },
    { label: "Region", value: specs.region },
    { label: "Section", value: String(specs.section) },
    { label: "Last log", value: specs.log },
  ];
}

function renderTerminalReadout(hasUnit: boolean, specs: BeeSpecs | undefined) {
  if (!hasUnit) {
    return <div className="apiary-terminal-prompt">Place Unit on Tray</div>;
  }

  if (!specs) {
    return <div className="apiary-terminal-prompt">Unit data unavailable</div>;
  }

  return (
    <dl className="apiary-terminal-specs" aria-label="Bee diagnostics">
      {buildBeeSpecRows(specs).map((row) => (
        <div className="apiary-terminal-spec-row" key={row.label}>
          <dt className="apiary-terminal-spec-label">{row.label}:</dt>
          <dd className="apiary-terminal-spec-value">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ApiaryTerminalModal({
  onClose,
  state,
}: ApiaryTerminalModalProps) {
  const hasUnit = isDeactivatedBeeOnApiaryTray(state);
  const specs = getApiaryTrayBeeSpecs(state);

  return (
    <CrtModal title="OMNI-Bee" onClose={onClose} width={820} showHeader={false}>
      <div className="apiary-terminal crt-modal-fill">
        <div className="apiary-terminal-brand-bar">
          <div className="apiary-terminal-logo" aria-hidden="true">
            OMNI-BEE
          </div>
          <div className="apiary-terminal-bee-mark">
            <OmniBeeIcon />
          </div>
        </div>
        <div className="apiary-terminal-subtitle">
          Pollination Unit Diagnostic Terminal
        </div>
        <div className="apiary-terminal-readout" aria-live="polite">
          {renderTerminalReadout(hasUnit, specs)}
        </div>
      </div>
    </CrtModal>
  );
}

export default ApiaryTerminalModal;
