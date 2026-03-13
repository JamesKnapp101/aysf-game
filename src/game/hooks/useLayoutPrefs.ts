import { useEffect, useState } from "react";

const LAYOUT_STORAGE_KEY = "aysf-layout-v1";
const CRT_COLOR_STORAGE_KEY = "aysf-crt-color-v1";
const DEFAULT_CRT_COLOR = "#00ff00";
const DEFAULT_LAYOUT_PREFS: LayoutPrefs = {
  roomHeightRatio: 0.33,
  sidebarWidthRatio: 0.3,
};

export type LayoutPrefs = {
  roomHeightRatio: number;
  sidebarWidthRatio: number;
};

function loadInitialCrtColor(): string {
  if (typeof window === "undefined") return DEFAULT_CRT_COLOR;

  try {
    return window.localStorage.getItem(CRT_COLOR_STORAGE_KEY) || DEFAULT_CRT_COLOR;
  } catch {
    return DEFAULT_CRT_COLOR;
  }
}

function loadLayoutPrefs(): LayoutPrefs {
  if (typeof window === "undefined") return DEFAULT_LAYOUT_PREFS;

  try {
    const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!raw) return DEFAULT_LAYOUT_PREFS;

    const parsed = JSON.parse(raw) as Partial<LayoutPrefs>;
    return {
      roomHeightRatio:
        typeof parsed.roomHeightRatio === "number"
          ? parsed.roomHeightRatio
          : DEFAULT_LAYOUT_PREFS.roomHeightRatio,
      sidebarWidthRatio:
        typeof parsed.sidebarWidthRatio === "number"
          ? parsed.sidebarWidthRatio
          : DEFAULT_LAYOUT_PREFS.sidebarWidthRatio,
    };
  } catch {
    return DEFAULT_LAYOUT_PREFS;
  }
}

export function useLayoutPrefs() {
  const [layout, setLayout] = useState<LayoutPrefs>(() => loadLayoutPrefs());
  const [crtColor, setCrtColor] = useState<string>(() => loadInitialCrtColor());

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
    } catch {
      // ignore
    }
  }, [layout]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(CRT_COLOR_STORAGE_KEY, crtColor);
    } catch {
      // ignore
    }
  }, [crtColor]);

  return {
    layout,
    setLayout,
    crtColor,
    setCrtColor,
  };
}
