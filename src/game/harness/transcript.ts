import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import type { FileHandle } from "node:fs/promises";
import { resolve } from "node:path";
import type { TranscriptEntry } from "./types";

export const TRANSCRIPT_FAILED =
  "The session transcript could not be saved. End this session and start a new one.";

/** Node host infrastructure only. The serialized session awaits each append. */
export function createTranscript(directory = resolve(".headless-transcripts")) {
  const root = resolve(directory);
  const sessionId = randomUUID();
  const path = resolve(root, `${sessionId}.jsonl`);
  let file: FileHandle | undefined;
  let failed = false;
  let closing: Promise<void> | undefined;
  let records = 0;

  return {
    sessionId,
    info: () => Object.freeze({ path, sessionId, records }),
    append: async (entry: TranscriptEntry): Promise<void> => {
      if (failed || closing) throw new Error(TRANSCRIPT_FAILED);
      try {
        if (!file) {
          await fs.mkdir(root, { recursive: true });
          // Exclusive creation prevents overwriting any earlier run; append
          // mode prevents resets/restarts from truncating this run's history.
          file = await fs.open(path, "ax");
        }
        await file.appendFile(`${JSON.stringify(entry)}\n`, "utf8");
        await file.sync();
        records += 1;
      } catch {
        failed = true;
        throw new Error(TRANSCRIPT_FAILED);
      }
    },
    close: (): Promise<void> => {
      closing ??= (async () => {
        if (!file) return;
        try {
          try {
            await file.sync();
          } finally {
            await file.close();
          }
        } catch {
          throw new Error(TRANSCRIPT_FAILED);
        }
      })();
      return closing;
    },
  };
}
