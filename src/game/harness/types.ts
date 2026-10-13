import type { MapInformationOptions } from "../map/shipMapText";

export type Observation = Readonly<{
  sequence: number;
  text: readonly string[];
}>;

/** Agent-authored public context, stored on action records rather than player observations. */
export type ActionExplanation = Readonly<{ goal?: string; reason?: string }>;

export type TranscriptEntry = Readonly<{
  sessionId: string;
  episodeId: string;
  timestamp: string;
  sequence: number;
  kind: "start" | "command" | "information" | "reset" | "end";
  event?: "restart" | "restore";
  input?: string;
  observation: Observation;
  /** Host-only end-record text. Absent in older transcripts and non-model endings. */
  finalAgentMessage?: string;
}> & ActionExplanation;

export type TranscriptInfo = Readonly<{ path: string; sessionId: string; records: number }>;

export type SessionOptions = Readonly<{ transcriptDirectory?: string }>;
export type SessionEndOptions = Readonly<{ finalAgentMessage?: string }>;

/** Host-only metadata. Never attach this to a player observation or tool result. */
export type MissingCapabilityDiagnostic = Readonly<{
  overlayKind: string;
  originatingCommand: string | null;
  category: "menu-controls" | "authentication" | "item-transfer" | "locked-container" |
    "remote-view" | "travel-selection" | "crafting" | "hunt-selection" | "frequency-input" |
    "automatic-sequence" | "suit-navigation" | "unknown-interface";
  triggeringActionExecuted: boolean;
  overlayEntered: boolean;
}>;

export type InformationView = "log" | "gossip" | "dna" | "objectives" | "room" | "history" | "map";

export interface ExplorerPort {
  command(input: string, explanation?: ActionExplanation): Promise<Observation>;
  /** Record numbers are 1-based positions in the current player-owned list. */
  information(view: InformationView, selection?: number | MapInformationOptions, explanation?: ActionExplanation): Promise<Observation>;
}

/** Trusted host controls. Only explorer is intended for a future player. */
export interface SessionController {
  readonly explorer: ExplorerPort;
  start(): Promise<Observation>;
  reset(): Promise<Observation>;
  transcript(): TranscriptInfo;
  capabilityDiagnostics?(): readonly MissingCapabilityDiagnostic[];
  dispose(options?: SessionEndOptions): Promise<void>;
}
