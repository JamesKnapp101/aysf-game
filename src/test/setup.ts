import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { useUIEffectsStore, useUIOverlayStore } from "@game/store/store";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  window.localStorage.clear();

  useUIOverlayStore.setState({
    overlay: { kind: "none" },
  });

  useUIEffectsStore.setState({
    mindFlash: null,
    organismDeath: null,
    teleportFlashNonce: 0,
  });

  Object.defineProperty(window, "requestIdleCallback", {
    configurable: true,
    writable: true,
    value: (cb: () => void) => window.setTimeout(cb, 0),
  });

  Object.defineProperty(window, "cancelIdleCallback", {
    configurable: true,
    writable: true,
    value: (id: number) => window.clearTimeout(id),
  });

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  Object.defineProperty(window, "scrollTo", {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });

  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });

  Object.defineProperty(HTMLElement.prototype, "scrollTo", {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });

  class ResizeObserverMock {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }

  Object.defineProperty(window, "ResizeObserver", {
    configurable: true,
    writable: true,
    value: ResizeObserverMock,
  });

  Object.defineProperty(globalThis, "ResizeObserver", {
    configurable: true,
    writable: true,
    value: ResizeObserverMock,
  });
});
