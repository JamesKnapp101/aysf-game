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
