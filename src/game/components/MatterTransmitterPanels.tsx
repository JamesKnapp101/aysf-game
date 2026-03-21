import { useRef, type KeyboardEventHandler } from "react";
import type {
  Axis,
  MatterTransmitterOption,
} from "./matterTransmitterHelpers";

const AXES: Axis[] = ["x", "y", "z"];

type MatterTransmitterCoordinatePanelProps = {
  currentCoordKey: string;
  modeLabel: string;
  onBump: (axis: Axis, dir: 1 | -1) => void;
  targetRoomId: string | undefined;
  targetRoomName: string;
  x: number;
  y: number;
  z: number;
};

type MatterTransmitterTransferPanelProps = {
  canTransmit: boolean;
  hintText: string;
  onSelectItemId: (itemId: string) => void;
  onTransmit: () => void;
  plateItemId: string | undefined;
  plateItemName: string;
  selectedItemId: string;
  targetItems: MatterTransmitterOption[];
  targetRoomId: string | undefined;
};

export function MatterTransmitterHeader() {
  return (
    <div className="mt-top">
      <div className="mt-top-left">
        <span className="mt-brand-omni">OMNI</span>
        <span className="mt-brand-dot">{"\u00B7"}</span>
        <span className="mt-brand-port">PORT</span>
      </div>
      <div className="mt-top-right">
        <span className="mt-bars">|||</span>
        <span className="mt-title">MATTER TRANSCEIVER</span>
      </div>
    </div>
  );
}

export function MatterTransmitterCoordinatePanel({
  currentCoordKey,
  modeLabel,
  onBump,
  targetRoomId,
  targetRoomName,
  x,
  y,
  z,
}: MatterTransmitterCoordinatePanelProps) {
  const valuesByAxis = { x, y, z };

  return (
    <section className="mt-left" aria-label="Coordinates">
      <div className="mt-panel-header" title={targetRoomId ?? ""}>
        <div className="mt-target-label">TARGET LOCATION:</div>
        <div className="mt-target-value">{targetRoomName}</div>
      </div>

      <div className="mt-coords">
        {AXES.map((axis) => (
          <MatterTransmitterAxisControl
            key={axis}
            axis={axis}
            onBump={onBump}
            value={valuesByAxis[axis]}
          />
        ))}
      </div>

      <div className="mt-subline">
        <span className="mt-sub-label">COORD:</span>
        <span className="mt-sub-value">{currentCoordKey}</span>
        <span className="mt-sub-spacer" />
        <span className="mt-sub-label">MODE:</span>
        <span className="mt-sub-value">{modeLabel}</span>
      </div>
    </section>
  );
}

export function MatterTransmitterTransferPanel({
  canTransmit,
  hintText,
  onSelectItemId,
  onTransmit,
  plateItemId,
  plateItemName,
  selectedItemId,
  targetItems,
  targetRoomId,
}: MatterTransmitterTransferPanelProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const isListDisabled = !targetRoomId || !!plateItemId || targetItems.length === 0;

  const handleListKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (isListDisabled) return;

    const currentIndex = selectedItemId
      ? targetItems.findIndex((item) => item.id === selectedItemId)
      : -1;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = Math.min(targetItems.length - 1, currentIndex + 1);
      onSelectItemId(targetItems[nextIndex]?.id ?? "");
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex = Math.max(0, currentIndex - 1);
      onSelectItemId(targetItems[nextIndex]?.id ?? "");
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      onSelectItemId(targetItems[0]?.id ?? "");
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      onSelectItemId(targetItems[targetItems.length - 1]?.id ?? "");
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onSelectItemId("");
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (canTransmit) onTransmit();
    }
  };

  return (
    <section className="mt-right" aria-label="Transmission controls">
      <div className="mt-plate">
        <div className="mt-plate-label">TX/RX PLATE</div>
        <div className="mt-plate-value">{plateItemName}</div>
      </div>

      <div className="mt-list-wrap">
        <div className="mt-list-label">TARGET ITEMS</div>

        <div
          ref={listRef}
          className={[
            "mt-picklist",
            isListDisabled ? "is-disabled" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          role="listbox"
          aria-label="Target item list"
          aria-disabled={isListDisabled}
          tabIndex={isListDisabled ? -1 : 0}
          onKeyDown={handleListKeyDown}
        >
          <MatterTransmitterPickRow
            isSelected={selectedItemId === ""}
            label="No Selection"
            onClick={() => onSelectItemId("")}
          />

          {targetItems.map((item) => (
            <MatterTransmitterPickRow
              key={item.id}
              isSelected={selectedItemId === item.id}
              label={item.name}
              onClick={() => onSelectItemId(item.id)}
              title={item.id}
            />
          ))}
        </div>

        <div className="mt-hint">{hintText}</div>
      </div>

      <button
        className="mt-transmit"
        onClick={onTransmit}
        disabled={!canTransmit}
        aria-label="Transmit"
      >
        TRANSMIT
      </button>
    </section>
  );
}

function MatterTransmitterAxisControl({
  axis,
  onBump,
  value,
}: {
  axis: Axis;
  onBump: (axis: Axis, dir: 1 | -1) => void;
  value: number;
}) {
  const label = axis.toUpperCase();

  return (
    <div className="mt-axis">
      <button
        className="mt-arrow"
        onClick={() => onBump(axis, 1)}
        aria-label={`Increase ${label}`}
      >
        {"\u25B2"}
      </button>
      <div className="mt-digit" aria-label={`${label} coordinate`}>
        {value}
      </div>
      <button
        className="mt-arrow"
        onClick={() => onBump(axis, -1)}
        aria-label={`Decrease ${label}`}
      >
        {"\u25BC"}
      </button>
    </div>
  );
}

function MatterTransmitterPickRow({
  isSelected,
  label,
  onClick,
  title,
}: {
  isSelected: boolean;
  label: string;
  onClick: () => void;
  title?: string;
}) {
  return (
    <div
      className={["mt-pickrow", isSelected ? "is-selected" : ""]
        .filter(Boolean)
        .join(" ")}
      role="option"
      aria-selected={isSelected}
      onClick={onClick}
      title={title}
    >
      <span className="mt-pickname">{label}</span>
    </div>
  );
}
