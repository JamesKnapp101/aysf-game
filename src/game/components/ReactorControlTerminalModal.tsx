import { useState } from "react";
import {
  authenticateReactorTerminal,
  ENGINE_ROOM_KEY_ID,
  insertReactorTerminalKey,
  isReactorTerminalAuthenticated,
  REACTOR_KEY_SLOT_ID,
  REACTOR_KEY_TURNED_TRIGGER,
  REACTOR_RESTARTED_TRIGGER,
  restartReactorCore,
  turnReactorTerminalKey,
} from "src/world/maps/levelFive/reactorSystems";
import type { GameState } from "../types/gameTypes";
import { CrtModal } from "./CrtModal";
import "../../styles/components/reactor-control-terminal.css";

type Props = {
  onClose: () => void;
  setGameState: (updater: (previous: GameState) => GameState) => void;
  state: GameState;
};

export function ReactorControlTerminalModal({
  onClose,
  setGameState,
  state,
}: Props) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("AWAITING ETHICS CREDENTIAL");
  const authenticated = isReactorTerminalAuthenticated(state);
  const keyInserted = Boolean(
    state.itemState.containerContents[REACTOR_KEY_SLOT_ID]?.includes(
      ENGINE_ROOM_KEY_ID,
    ),
  );
  const keyTurned = Boolean(
    state.worldState.conditionalTriggers[REACTOR_KEY_TURNED_TRIGGER],
  );
  const restarted = Boolean(
    state.worldState.conditionalTriggers[REACTOR_RESTARTED_TRIGGER],
  );

  const apply = (
    action: (current: GameState) => { message: string; state: GameState },
  ) => {
    const result = action(state);
    setMessage(result.message);
    setGameState(() => result.state);
  };

  return (
    <CrtModal
      height={430}
      onClose={onClose}
      showHeader={false}
      title="REACTOR CONTROL TERMINAL"
      width={610}
    >
      <div className="reactor-terminal">
        <header>
          <strong>AENEAS REACTOR CONTROL</strong>
          <span>CORE AUTHORITY // ETHICS DIVISION</span>
        </header>

        {!authenticated ? (
          <form
            className="reactor-terminal__login"
            onSubmit={(event) => {
              event.preventDefault();
              apply((current) =>
                authenticateReactorTerminal(current, password),
              );
            }}
          >
            <label htmlFor="reactor-password">PASSWORD</label>
            <input
              autoFocus
              id="reactor-password"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
            <button type="submit">AUTHENTICATE</button>
          </form>
        ) : (
          <div className="reactor-terminal__controls">
            <div className="reactor-terminal__status">
              <span>ETHICS CREDENTIAL</span><strong>ACCEPTED</strong>
              <span>ENGINE ROOM KEY</span><strong>{keyTurned ? "TURNED" : keyInserted ? "INSERTED" : "MISSING"}</strong>
              <span>REACTOR CORE</span><strong>{restarted ? "ONLINE" : "OFFLINE"}</strong>
            </div>

            <div className="reactor-terminal__actions">
              {!keyInserted && (
                <button onClick={() => apply(insertReactorTerminalKey)} type="button">
                  INSERT ENGINE ROOM KEY
                </button>
              )}
              {keyInserted && !keyTurned && (
                <button onClick={() => apply(turnReactorTerminalKey)} type="button">
                  TURN AUTHORIZATION KEY
                </button>
              )}
              {keyTurned && !restarted && (
                <button onClick={() => apply(restartReactorCore)} type="button">
                  RESTART REACTOR CORE
                </button>
              )}
              {restarted && <strong className="reactor-terminal__online">REACTOR CORE ONLINE</strong>}
            </div>
          </div>
        )}

        <output>{message}</output>
        <button className="reactor-terminal__close" onClick={onClose} type="button">
          EXIT TERMINAL
        </button>
      </div>
    </CrtModal>
  );
}
