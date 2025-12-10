import React, { useEffect, useReducer, useRef, useState } from "react";
import { buildRoomDescription, handleCommand } from "./engine";
import {
  describeBodyTemperatureLevel,
  describeRadiationLevel,
  describeSicknessLevel,
  getCurrentRoom,
  getCurrentRoomExits,
  getItemsInInventory,
} from "./selectors";
import { parseCommand } from "../parse/parser";
import { WORLD } from "../world/World";
import { RoomCompass } from "./Compass";
import type { GameState } from "../world/types";
import { createInitialState } from "./gameInit";
import { StatusTab } from "./StatusTab";

type Action = { type: "command"; input: string };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "command": {
      const trimmed = action.input.trim();
      if (!trimmed) return state;

      const parsed = parseCommand(trimmed);
      const next = handleCommand(state, parsed);
      return { ...next, moves: next.moves + 1 };
    }
    default:
      return state;
  }
}

export const Game: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, createInitialState(WORLD));
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<"inventory" | "status" | "hints">(
    "inventory"
  );
  const logRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const currentRoom = getCurrentRoom(state);
  const inventoryItems = getItemsInInventory(state);
  const exits = getCurrentRoomExits(state);
  const desc = buildRoomDescription(state, state.player.roomId);

  const formatLabel = (key: string) =>
    key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    dispatch({ type: "command", input: trimmed });
    setInput("");
  };

  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [state.log]);

  return (
    <div
      className="game-root"
      onClick={() => {
        inputRef.current?.focus();
      }}
    >
      {/* HEADER */}
      <div className="game-header">
        <div className="game-header-location">
          {currentRoom.name || "Unknown Location"}
        </div>
        <div className="game-header-stats">
          <span>Score: {state.score}</span>
          <span>Memory: {state.player.memories.memoryScore}%</span>
          <span>Rating: {state.rating}</span>
          <span>Moves: {state.moves}</span>
        </div>
      </div>

      {/* ROOM DESCRIPTION PANEL */}
      <div className="game-room-panel">
        <div
          className="game-room-inner"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="room-compass-float">
            <RoomCompass exits={exits} />
          </div>
          <div className="game-room-text">{desc}</div>
        </div>
      </div>

      {/* MAIN ROW: TEXT + SIDEBAR */}
      <div className="game-main-row">
        {/* LEFT: TRANSCRIPT + INPUT */}
        <div className="game-left">
          <div className="game-log-panel">
            <div className="game-log-inner" ref={logRef}>
              {state.log.map((line, idx) => (
                <p key={idx} className="game-line">
                  {line}
                </p>
              ))}
            </div>
          </div>

          <form className="game-footer" onSubmit={onSubmit}>
            <span className="game-prompt">&gt;</span>
            <input
              ref={inputRef}
              className="game-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
            />
          </form>
        </div>

        {/* RIGHT: TABBED SIDEBAR */}
        <aside className="game-sidebar">
          <div className="game-tabs">
            <button
              type="button"
              className={
                "game-tab" +
                (activeTab === "inventory" ? " game-tab-active" : "")
              }
              onClick={() => setActiveTab("inventory")}
            >
              Inventory
            </button>
            <button
              type="button"
              className={
                "game-tab" + (activeTab === "status" ? " game-tab-active" : "")
              }
              onClick={() => setActiveTab("status")}
            >
              Status
            </button>
            <button
              type="button"
              className={
                "game-tab" + (activeTab === "hints" ? " game-tab-active" : "")
              }
              onClick={() => setActiveTab("hints")}
            >
              Hints
            </button>
          </div>

          <div className="game-sidebar-content">
            {activeTab === "inventory" && (
              <div>
                {inventoryItems.length === 0 ? (
                  <p className="game-line">You are carrying nothing.</p>
                ) : (
                  <>
                    <p className="game-line">You are carrying:</p>
                    <ul className="game-list">
                      {inventoryItems.map((item) => (
                        <li style={{ marginLeft: "1.5rem" }} key={item.id}>
                          {item.name}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {/* STATUS TAB */}
            {activeTab === "status" && <StatusTab gameState={state} />}

            {activeTab === "hints" && (
              <div>
                <p className="game-line">Hint system coming online soon…</p>
                {/* Later: render your actual hint UI here */}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
