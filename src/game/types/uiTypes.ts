import type { PhoneMessage } from "../../world/maps/livingQuartersTemplate";
import type { CoolerMode } from "./itemTypes";

export type OverlayIntent = {
  kind: "reader" | "cooler" | "message-machine";
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
  | { kind: "cooler"; mode: CoolerMode }
  | {
      kind: "message-machine";
      messages: PhoneMessage[];
      messagesPlayedById: Record<string, boolean>;
    }
  | { kind: "camera-gun-viewer"; currentViewIndex: number }
  | { kind: "plt-viewer"; isOn: boolean; hasLink: boolean }
  | { kind: "power-station-terminal"; isOn: boolean }
  | {
      kind: "mindFlash";
      title?: string;
      memory: string;
      seed?: number;
    };

export type UIOverlayActions = {
  openReader: (args: {
    title: string;
    body: string;
    sourceItemId?: string;
  }) => void;
  openCooler: (args: { mode: CoolerMode }) => void;
  closeOverlay: () => void;
};
