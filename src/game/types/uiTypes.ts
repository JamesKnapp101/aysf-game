import type { PhoneMessage } from "../../world/maps/livingQuartersTemplate";
import type { CoolerMode } from "./itemTypes";

type OverlayPostClose = {
  postCloseMessage?: string;
};

export type OverlayIntent = {
  kind: "reader" | "cooler" | "message-machine";
  title: string;
  body: string;
  mode?: CoolerMode;
  sourceItemId?: string;
};

export type Overlay =
  | { kind: "none" }
  | ({
      kind: "reader";
      title: string;
      body: string;
      sourceItemId?: string;
    } & OverlayPostClose)
  | ({ kind: "cooler"; mode: CoolerMode } & OverlayPostClose)
  | ({
      kind: "message-machine";
      messages: PhoneMessage[];
      messagesPlayedById: Record<string, boolean>;
    } & OverlayPostClose)
  | ({ kind: "camera-gun-viewer"; currentViewIndex: number } & OverlayPostClose)
  | ({ kind: "plt-viewer"; isOn: boolean; hasLink: boolean } & OverlayPostClose)
  | ({ kind: "power-station-terminal"; isOn: boolean } & OverlayPostClose)
  | ({ kind: "hydroponics-admin-terminal" } & OverlayPostClose)
  | ({ kind: "mens-lockers" } & OverlayPostClose)
  | ({ kind: "womens-lockers" } & OverlayPostClose)
  | ({ kind: "matter-transmitter"; isOn: boolean } & OverlayPostClose)
  | ({ kind: "teleportation-terminal" } & OverlayPostClose)
  | ({
      kind: "mindFlash";
      title?: string;
      memory: string;
      seed?: number;
    } & OverlayPostClose);

export type UIOverlayActions = {
  openReader: (args: {
    title: string;
    body: string;
    sourceItemId?: string;
  }) => void;
  openCooler: (args: { mode: CoolerMode }) => void;
  closeOverlay: () => void;
};

export type OrganismDeathPayload = {
  title?: string;
  cipherText: string;
  seed?: number;
  onStart?: () => void;
  onEnd?: () => void;

  // Display tuning
  revealMode?: "fade" | "type" | "random-chunks";
  chunkMs?: number; // for chunk-by-chunk reveal
  chunkSize?: number; // characters per revealed chunk
};
