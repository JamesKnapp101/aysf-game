import type { CoolerMode } from "./itemTypes";

export type OverlayIntent = {
  kind: "reader" | "cooler";
  title: string;
  body: string;
  mode?: CoolerMode;
  sourceItemId?: string;
};

export type Overlay =
  | { kind: "none" }
  | {
      kind: "reader";
      title: string;
      body: string;
      sourceItemId?: string;
    }
  | { kind: "cooler"; mode: CoolerMode };
// | { kind: "safe"; ... }
// | { kind: "transmitter"; ... }

export type UIOverlayActions = {
  openReader: (args: {
    title: string;
    body: string;
    sourceItemId?: string;
  }) => void;
  openCooler: (args: { mode: CoolerMode }) => void;
  closeOverlay: () => void;
};
