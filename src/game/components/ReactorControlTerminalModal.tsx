import { useState } from "react";
import { operateReactorTerminal, reactorTerminalView, REACTOR_TERMINAL_INITIAL_MESSAGE, type ReactorTerminalControl } from "src/world/maps/levelFive/reactorTerminal";
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
  const [message, setMessage] = useState(REACTOR_TERMINAL_INITIAL_MESSAGE);
  const view = reactorTerminalView(state);
  const authenticated = view.authenticated;

  const apply = async (control: ReactorTerminalControl) => {
    const result = await new Promise<ReturnType<typeof operateReactorTerminal>>((resolve) => {
      setGameState((previous) => {
        const operated = operateReactorTerminal(previous, control, password);
        resolve(operated);
        return operated.state;
      });
    });
    if (!result.available) return;
    if (result.message) setMessage(result.message);
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
              apply("authenticate");
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
              <span>ENGINE ROOM KEY</span><strong>{view.keyStatus}</strong>
              <span>REACTOR CORE</span><strong>{view.coreStatus}</strong>
            </div>

            <div className="reactor-terminal__actions">
              {view.controls.includes("insert") && (
                <button onClick={() => apply("insert")} type="button">
                  INSERT ENGINE ROOM KEY
                </button>
              )}
              {view.controls.includes("turn") && (
                <button onClick={() => apply("turn")} type="button">
                  TURN AUTHORIZATION KEY
                </button>
              )}
              {view.controls.includes("restart") && (
                <button onClick={() => apply("restart")} type="button">
                  RESTART REACTOR CORE
                </button>
              )}
              {view.coreStatus === "ONLINE" && <strong className="reactor-terminal__online">REACTOR CORE ONLINE</strong>}
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
