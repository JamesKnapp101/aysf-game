import { appendLog } from "@game/engine/log";
import { useUIEffectsStore } from "@game/store/store";
import type { GameState } from "@game/types/gameTypes";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import {
  canPrintThreeDPrinterRecipe,
  getCurrentAtumCount,
  getThreeDPrinterRecipe,
  printThreeDPrinterRecipe,
  THREE_D_PRINTER_RECIPES,
} from "src/world/maps/levelSix/threeDPrinter";
import "../../styles/three-d-printer.css";
import { CrtModal } from "./CrtModal";

type ThreeDPrinterModalProps = {
  onClose: () => void;
  state: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
};

function AtumSymbol() {
  return (
    <svg
      aria-hidden="true"
      className="three-d-printer-atum-symbol"
      focusable="false"
      viewBox="0 0 100 100"
    >
      <path
        className="three-d-printer-atum-leg"
        d="M18 88 L50 12 L82 88"
      />
      <path className="three-d-printer-atum-crossbar" d="M12 52 H88" />
      <path className="three-d-printer-atum-strike" d="M12 69 H88" />
    </svg>
  );
}

export function ThreeDPrinterModal({
  onClose,
  state,
  setGameState,
}: ThreeDPrinterModalProps) {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const atumCount = getCurrentAtumCount(state);
  const selectedRecipe = selectedRecipeId
    ? getThreeDPrinterRecipe(selectedRecipeId)
    : undefined;
  const canPrintSelected = canPrintThreeDPrinterRecipe(state, selectedRecipe);

  function handlePrint() {
    if (!selectedRecipe) return;

    const result = printThreeDPrinterRecipe(state, selectedRecipe.id);
    if (!result.printed) return;

    setGameState((prev) => {
      const latestResult = printThreeDPrinterRecipe(prev, selectedRecipe.id);
      if (!latestResult.printed) return prev;
      return appendLog(latestResult.state, `${latestResult.message}\n`);
    });
    useUIEffectsStore.getState().triggerTeleportFlash();
    onClose();
  }

  return (
    <CrtModal
      title="OMNI PRINT 3D PRINTER"
      onClose={onClose}
      className="three-d-printer-modal"
      width={780}
      height={455}
      showHeader={false}
    >
      <div
        className="three-d-printer crt-modal-fill"
        role="document"
        aria-label="OMNI PRINT 3D printer"
      >
        <header className="three-d-printer-header">
          <div className="three-d-printer-brand">
            <span className="three-d-printer-brand-omni">OMNI</span>
            <span className="three-d-printer-brand-print">PRINT</span>
          </div>
          <div className="three-d-printer-title">3D PRINTER</div>
        </header>

        <main className="three-d-printer-body">
          <section
            className="three-d-printer-wallet"
            aria-label="Current atums"
          >
            <div className="three-d-printer-wallet-label">Current Atums:</div>
            <div className="three-d-printer-wallet-value">
              <AtumSymbol />
              <span>{atumCount}</span>
            </div>
            <button
              className="three-d-printer-print"
              disabled={!canPrintSelected}
              onClick={handlePrint}
              type="button"
            >
              PRINT
            </button>
          </section>

          <section
            className="three-d-printer-menu"
            aria-label="Printable templates"
          >
            <div className="three-d-printer-recipe-list">
              {THREE_D_PRINTER_RECIPES.map((recipe) => {
                const selected = recipe.id === selectedRecipeId;

                return (
                  <button
                    aria-label={`${recipe.name}, ${recipe.atumCost} atums`}
                    aria-pressed={selected}
                    className={[
                      "three-d-printer-recipe",
                      selected ? "is-selected" : "",
                    ].join(" ")}
                    key={recipe.id}
                    onClick={() => setSelectedRecipeId(recipe.id)}
                    type="button"
                  >
                    <span className="three-d-printer-recipe-name">
                      {recipe.name}
                    </span>
                    <span className="three-d-printer-recipe-cost">
                      <AtumSymbol />
                      <span>{recipe.atumCost}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </CrtModal>
  );
}

export default ThreeDPrinterModal;
