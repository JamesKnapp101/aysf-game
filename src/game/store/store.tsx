import { create } from "zustand";
import type { OrganismDeathPayload, Overlay } from "../types/uiTypes";

type UIOverlayState = {
  overlay: Overlay;
  openOverlay: (overlay: Overlay) => void;
  closeOverlay: () => void;
};

export type UIOverlayClosedEvent = {
  closed: Overlay;
};

export const useUIOverlayStore = create<UIOverlayState>((set, get) => ({
  overlay: { kind: "none" },
  openOverlay: (overlay) => set({ overlay }),
  closeOverlay: () => {
    const closed = get().overlay;
    set({ overlay: { kind: "none" } });
    return { closed };
  },
}));

export type MindFlashPayload = {
  memory: string;
  seed?: number;
  onStart?: () => void;
  onEnd?: () => void;
};

export type SyndromeXSignalPayload = {
  id: string;
  text: string;
  onStart?: () => void;
  onEnd?: () => void;
};

type UIEffectsState = {
  teleportFlashNonce: number;
  screenShakeNonce: number;
  mindFlash: MindFlashPayload | null;
  playMindFlash: (payload: MindFlashPayload) => void;
  clearMindFlash: () => void;

  syndromeXSignal: SyndromeXSignalPayload | null;
  playSyndromeXSignal: (payload: SyndromeXSignalPayload) => void;
  clearSyndromeXSignal: () => void;

  organismDeath: OrganismDeathPayload | null;
  playOrganismDeath: (payload: OrganismDeathPayload) => void;
  clearOrganismDeath: () => void;

  triggerTeleportFlash: () => void;
  triggerScreenShake: () => void;
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
  syndromeXSignal: null,
  playSyndromeXSignal: (payload) =>
    set((s) => {
      s.syndromeXSignal?.onEnd?.();
      payload.onStart?.();
      return { syndromeXSignal: payload };
    }),
  clearSyndromeXSignal: () =>
    set((s) => {
      s.syndromeXSignal?.onEnd?.();
      return { syndromeXSignal: null };
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
  screenShakeNonce: 0,
  triggerScreenShake: () =>
    set((s) => ({ screenShakeNonce: s.screenShakeNonce + 1 })),
}));
