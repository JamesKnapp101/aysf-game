import type { MapInformationOptions } from "../map/shipMapText";
import type { AiConversationFailure } from "../services/conversationDiagnostics";
import type { DeathEvent, HostStatus, Scenario, ScenarioMetadata, StateSummary } from "./scenario";

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
  /** Host-only failures for this command; excluded from observations/tool results. */
  aiConversationFailures?: readonly AiConversationFailure[];
  /** Host-only scenario setup and end summary; never part of the observation. */
  scenario?: ScenarioMetadata;
  initialState?: StateSummary;
  agentSummary?: AgentSummary;
  deathEvent?: DeathEvent;
  recoveryAttempt?: number;
}> & ActionExplanation;

export type TranscriptInfo = Readonly<{ path: string; sessionId: string; records: number }>;

export type SessionOptions = Readonly<{
  transcriptDirectory?: string;
  onAiConversationFailure?: (failure: AiConversationFailure) => void;
  scenario?: Scenario;
}>;
export type Termination = "success" | "death" | "budget_exhaustion" | "agent_termination" | "error" | "interrupted";
export type AgentSummary = {
  objective: string;
  actions: number;
  modelTurns: number;
  reason: string;
  termination: Termination;
  recoveryAttempts?: number;
  maxDeaths?: number;
  playtest?: HostStatus;
};
export type SessionEndOptions = Readonly<{ finalAgentMessage?: string; agentSummary?: AgentSummary }>;

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
  readonly scenario?: Pick<Scenario, "id" | "objective" | "budgets" | "maxDeaths">;
  readonly explorer: ExplorerPort;
  start(): Promise<Observation>;
  reset(): Promise<Observation>;
  transcript(): TranscriptInfo;
  capabilityDiagnostics?(): readonly MissingCapabilityDiagnostic[];
  /** Read-only trusted-host projection; never passed to the model. */
  hostStatus?(): HostStatus | undefined;
  dispose(options?: SessionEndOptions): Promise<void>;
}
