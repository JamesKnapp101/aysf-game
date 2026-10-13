import { operateReactorTerminal, reactorTerminalView, REACTOR_TERMINAL_INITIAL_MESSAGE } from "src/world/zoneRegistrations";

/** Zone-specific terminal rules stay registered at the world integration boundary. */
export const reactorTerminalRules = {
  operate: operateReactorTerminal,
  view: reactorTerminalView,
  initialMessage: REACTOR_TERMINAL_INITIAL_MESSAGE,
};
