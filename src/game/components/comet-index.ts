export type CometEntrySource = "help" | "library";

export type CometEntry = {
  id: string;
  source?: CometEntrySource;
  terms: string[];
  title?: string;
  body: string;
};
