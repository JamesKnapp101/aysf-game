import { create } from "zustand";
import type { Overlay } from "../types/uiTypes";

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
  mindFlash: MindFlashPayload | null;
  playMindFlash: (payload: MindFlashPayload) => void;
  clearMindFlash: () => void;
};

export const useUIEffectsStore = create<UIEffectsState>((set) => ({
  mindFlash: null,
  playMindFlash: (payload) =>
    set((s) => {
      // end any previous effect cleanly
      s.mindFlash?.onEnd?.();
      payload.onStart?.();
      return { mindFlash: payload };
    }),

  clearMindFlash: () =>
    set((s) => {
      s.mindFlash?.onEnd?.();
      return { mindFlash: null };
    }),
}));
