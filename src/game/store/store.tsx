import { GameState } from "@game/types/gameTypes";
import { create } from "zustand";
import type { OrganismDeathPayload, Overlay } from "../types/uiTypes";

type UIOverlayState = {
  overlay: Overlay;
  openOverlay: (overlay: Overlay) => void;
  closeOverlay: () => void;
};

export const useUIOverlayStore = create<UIOverlayState>((set) => ({
  overlay: { kind: "none" },
  openOverlay: (overlay) => set({ overlay }),
  closeOverlay: () =>
    set({
      overlay: { kind: "none" },
    }),
}));

export type MindFlashPayload = {
  memory: string;
  seed?: number;
  onStart?: () => void;
  onEnd?: () => void;
};

type UIEffectsState = {
  teleportFlashNonce: number;
  mindFlash: MindFlashPayload | null;
  playMindFlash: (payload: MindFlashPayload) => void;
  clearMindFlash: () => void;

  organismDeath: OrganismDeathPayload | null;
  playOrganismDeath: (payload: OrganismDeathPayload) => void;
  clearOrganismDeath: () => void;

  triggerTeleportFlash: () => void;
};

export const useUIEffectsStore = create<UIEffectsState>((set) => ({
  mindFlash: null,
  playMindFlash: (payload) =>
    set((s) => {
      s.mindFlash?.onEnd?.();
      payload.onStart?.();
      return { mindFlash: payload };
    }),

  clearMindFlash: () =>
    set((s) => {
      s.mindFlash?.onEnd?.();
      return { mindFlash: null };
    }),
  organismDeath: null,
  playOrganismDeath: (payload) =>
    set((s) => {
      s.organismDeath?.onEnd?.();
      payload.onStart?.();
      return { organismDeath: payload };
    }),
  clearOrganismDeath: () =>
    set((s) => {
      s.organismDeath?.onEnd?.();
      return { organismDeath: null };
    }),
  teleportFlashNonce: 0,
  triggerTeleportFlash: () =>
    set((s) => ({ teleportFlashNonce: s.teleportFlashNonce + 1 })),
}));
function setPlayerBrainActivityLevel(
  state: GameState,
  val: number,
): GameState | undefined {
  throw new Error("Function not implemented.");
}
