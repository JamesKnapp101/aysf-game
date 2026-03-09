import type { Dispatch, SetStateAction } from "react";
import { Menu } from "@game/components/Menu";
import { buildHydroponicsTerminalMenu } from "src/world/maps/levelSix/hydroponicsPuzzle";
import type { GameState } from "../types/gameTypes";
import type { MenuLeafNode } from "../types/menuTypes";
import { CrtModal } from "./CrtModal";

type Props = {
  onClose: () => void;
  state: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
};

const HYDROPONICS_LOG_SOURCE = "Hydroponics Admin Terminal";
const HYDROPONICS_RECORD_LEAF_PREFIX = "hydro-record-";

export function HydroponicsAdminTerminalModal({
  onClose,
  state,
  setGameState,
}: Props) {
  const rootMenu = buildHydroponicsTerminalMenu(state);

  function handleLeafActivated(leaf: MenuLeafNode) {
    if (!leaf.id.startsWith(HYDROPONICS_RECORD_LEAF_PREFIX)) return;

    const title = `Employee Record: ${leaf.title}`;
    const body = leaf.description.trim();

    setGameState((prev) => {
      const alreadyLogged = prev.player.log.some(
        (entry) =>
          entry.source === HYDROPONICS_LOG_SOURCE && entry.title === title
      );
      if (alreadyLogged) return prev;

      return {
        ...prev,
        player: {
          ...prev.player,
          log: [
            ...prev.player.log,
            {
              source: HYDROPONICS_LOG_SOURCE,
              title,
              loggedAtTurn: prev.moves,
              body,
            },
          ],
        },
      };
    });
  }

  return (
    <CrtModal
      title="OMNICONNECT - HYDROPONICS ADMIN TERMINAL"
      onClose={onClose}
      width={640}
      height={540}
    >
      <Menu
        rootMenu={rootMenu}
        emptyDetailMessage="Select an employee record to see more information."
        onLeafActivated={handleLeafActivated}
      />
    </CrtModal>
  );
}
