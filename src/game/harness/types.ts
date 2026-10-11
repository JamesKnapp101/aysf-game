export type Observation = Readonly<{
  sequence: number;
  text: readonly string[];
}>;

export type TranscriptEntry = Readonly<{
  sessionId: string;
  episodeId: string;
  timestamp: string;
  sequence: number;
  kind: "start" | "command" | "information" | "reset" | "end";
  event?: "restart" | "restore";
  input?: string;
  observation: Observation;
}>;

export type TranscriptInfo = Readonly<{ path: string; sessionId: string; records: number }>;

export type SessionOptions = Readonly<{ transcriptDirectory?: string }>;

export type InformationView = "log" | "gossip" | "dna" | "objectives" | "room" | "history";

export interface ExplorerPort {
  command(input: string): Promise<Observation>;
  /** Record numbers are 1-based positions in the current player-owned list. */
  information(view: InformationView, record?: number): Promise<Observation>;
}

/** Trusted host controls. Only explorer is intended for a future player. */
export interface SessionController {
  readonly explorer: ExplorerPort;
  start(): Promise<Observation>;
  reset(): Promise<Observation>;
  transcript(): TranscriptInfo;
  dispose(): Promise<void>;
}
