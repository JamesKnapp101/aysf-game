import { HintsTab } from "src/hints/HintMenu";
import { buildHydroponicsTerminalMenu } from "src/world/maps/levelSix/hydroponicsPuzzle";
import type { GameState } from "../types/gameTypes";
import { CrtModal } from "./CrtModal";

type Props = {
  onClose: () => void;
  state: GameState;
};

export function HydroponicsAdminTerminalModal({ onClose, state }: Props) {
  const rootMenu = buildHydroponicsTerminalMenu(state);

  return (
    <CrtModal
      title="OMNICONNECT - HYDROPONICS ADMIN TERMINAL"
      onClose={onClose}
      width={640}
      height={440}
    >
      <HintsTab rootMenu={rootMenu} />
    </CrtModal>
  );
}
