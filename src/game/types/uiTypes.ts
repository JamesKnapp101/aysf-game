import { PhoneMessage } from "@game/components/MessageMachineModal";
import type { GameNotificationDraft } from "./gameTypes";
import type { CoolerMode } from "./itemTypes";

type OverlayPostClose = {
  postCloseMessage?: string;
  postCloseNotifications?: GameNotificationDraft[];
};

export type OverlayIntent = {
  body: string;
  kind: "reader" | "cooler" | "message-machine";
  mode?: CoolerMode;
  sourceItemId?: string;
  title: string;
};

export type Overlay =
  | { kind: "none" }
  | ({
      body: string;
      kind: "reader";
      sourceItemId?: string;
      title: string;
    } & OverlayPostClose)
  | ({ kind: "help" } & OverlayPostClose)
  | ({ kind: "cooler"; mode: CoolerMode } & OverlayPostClose)
  | ({
      kind: "message-machine";
      messages: PhoneMessage[];
      messagesPlayedById: Record<string, boolean>;
    } & OverlayPostClose)
  | ({ currentViewIndex: number; kind: "camera-gun-viewer" } & OverlayPostClose)
  | ({ isOn: boolean; kind: "power-station-terminal" } & OverlayPostClose)
  | ({ kind: "hydroponics-admin-terminal" } & OverlayPostClose)
  | ({ kind: "mens-lockers" } & OverlayPostClose)
  | ({ kind: "womens-lockers" } & OverlayPostClose)
  | ({ isOn: boolean; kind: "matter-transmitter" } & OverlayPostClose)
  | ({ kind: "teleportation-terminal" } & OverlayPostClose)
  | ({ kind: "game-preserve-terminal" } & OverlayPostClose)
  | ({
      kind: "mindFlash";
      memory: string;
      seed?: number;
      title?: string;
    } & OverlayPostClose);

export type UIOverlayActions = {
  closeOverlay: () => void;
  openCooler: (args: { mode: CoolerMode }) => void;
  openReader: (args: {
    body: string;
    sourceItemId?: string;
    title: string;
  }) => void;
};

export type OrganismDeathPayload = {
  chunkMs?: number; // for chunk-by-chunk reveal
  chunkSize?: number; // characters per revealed chunk
  cipherText: string;
  onEnd?: () => void;
  onStart?: () => void;
  revealMode?: "fade" | "type" | "random-chunks";
  seed?: number;
  title?: string;
};
