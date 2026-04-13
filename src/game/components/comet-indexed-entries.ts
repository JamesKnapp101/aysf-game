import type { CometEntry } from "./comet-index";
import { DEFAULT_COMET_ENTRIES } from "./comet-entries";
import { DEFAULT_COMET_HELP_ENTRIES } from "./comet-help-entries";

export const DEFAULT_COMET_INDEXED_ENTRIES: CometEntry[] = [
  ...DEFAULT_COMET_HELP_ENTRIES,
  ...DEFAULT_COMET_ENTRIES,
];
