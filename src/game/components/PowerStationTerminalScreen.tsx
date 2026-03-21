import type {
  KeyboardEventHandler,
  MouseEventHandler,
  RefObject,
} from "react";
import type { SwitchStates } from "../types/itemTypes";
import {
  canToggleNode,
  getNodeStatus,
  isBackNode,
  isMenu,
  statusGlyph,
  statusText,
  stripParenNotes,
  type MenuTreeNode,
  type PowerListItem,
} from "./powerStationTerminalHelpers";

type PowerStationTerminalScreenProps = {
  breadcrumbText: string;
  currentMenu: MenuTreeNode;
  listItems: PowerListItem[];
  onActivateIndex: (index: number) => void;
  onKeyDown: KeyboardEventHandler<HTMLDivElement>;
  onSelectIndex: (index: number) => void;
  rootRef: RefObject<HTMLDivElement | null>;
  selectedIndex: number;
  switchStates: SwitchStates;
};

export function PowerStationTerminalScreen({
  breadcrumbText,
  currentMenu,
  listItems,
  onActivateIndex,
  onKeyDown,
  onSelectIndex,
  rootRef,
  selectedIndex,
  switchStates,
}: PowerStationTerminalScreenProps) {
  return (
    <div className="pst-root">
      <div
        className="pst-screen"
        ref={rootRef}
        tabIndex={0}
        role="application"
        aria-label="Power Station Terminal"
        onKeyDown={onKeyDown}
      >
        <div className="pst-topline">
          <div className="pst-title">{currentMenu.label}</div>
          <div className="pst-breadcrumb">{breadcrumbText}</div>
        </div>

        <div
          className="pst-list"
          role="listbox"
          aria-label="Power distribution options"
        >
          {listItems.map((item, index) => (
            <PowerStationTerminalRow
              key={item.id}
              index={index}
              isSelected={index === selectedIndex}
              item={item}
              onActivateIndex={onActivateIndex}
              onSelectIndex={onSelectIndex}
              switchStates={switchStates}
            />
          ))}
        </div>

        <div className="pst-footer">
          <div className="pst-help">
            {"\u2191\u2193"} select {"\u2022"} SPACE/ENTER open/toggle {"\u2022"}{" "}
            {"\u2190"} back {"\u2022"} ESC close {"\u2022"} mouse supported
          </div>
        </div>
      </div>
    </div>
  );
}

function PowerStationTerminalRow({
  index,
  isSelected,
  item,
  onActivateIndex,
  onSelectIndex,
  switchStates,
}: {
  index: number;
  isSelected: boolean;
  item: PowerListItem;
  onActivateIndex: (index: number) => void;
  onSelectIndex: (index: number) => void;
  switchStates: SwitchStates;
}) {
  const onMouseEnter = () => onSelectIndex(index);
  const onClick = () => onActivateIndex(index);
  const onDoubleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
  };

  if (isBackNode(item)) {
    return (
      <button
        type="button"
        className={`pst-row ${isSelected ? "is-selected" : ""}`}
        onMouseEnter={onMouseEnter}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        role="option"
        aria-selected={isSelected}
      >
        <span className="pst-glyph" aria-hidden="true">
          {"\u25C0"}
        </span>
        <span className="pst-label">BACK</span>
        <span className="pst-status" />
      </button>
    );
  }

  const glyph = isMenu(item)
    ? "\u25B6"
    : statusGlyph(getNodeStatus(item, switchStates));
  const status = isMenu(item) ? "" : statusText(getNodeStatus(item, switchStates));
  const label = isMenu(item) ? item.label : stripParenNotes(item.label);
  const canToggle = !isMenu(item) && canToggleNode(item, switchStates);

  return (
    <button
      type="button"
      className={`pst-row ${isSelected ? "is-selected" : ""}`}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      role="option"
      aria-selected={isSelected}
    >
      <span className="pst-glyph" aria-hidden="true">
        {glyph}
      </span>
      <span className="pst-label">{label}</span>
      <span className="pst-status" aria-hidden="true">
        {status}
      </span>
      {!isMenu(item) && item.kind === "switch" ? (
        <span className="pst-hint" aria-hidden="true">
          {canToggle ? "[SPACE]" : ""}
        </span>
      ) : (
        <span className="pst-hint" aria-hidden="true" />
      )}
    </button>
  );
}
