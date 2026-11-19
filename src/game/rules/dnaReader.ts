import { DNA_DATABASE } from "@game/dnaDatabase";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import { formatDNASampleBody } from "@game/text/playerKnowledge";

export type DNAResult = {
  id: string;
  title: string;
  loggedAtTurn: number;
  causeOfDeath: string;
  name: string;
  gender: "Male" | "Female" | "Non-binary";
  age: number;
  occupation: string;
  info: string;
};

const UNKNOWN_DNA_RESULT_BASE: Omit<
  DNAResult,
  "id" | "title" | "loggedAtTurn"
> = {
  causeOfDeath: "Unknown",
  name: "Unknown",
  gender: "Non-binary",
  age: 0,
  occupation: "Unknown",
  info: "Subject not in records, or could not be identified.",
};

function createUnknownResult(itemId: string, turn: number): DNAResult {
  return {
    ...UNKNOWN_DNA_RESULT_BASE,
    id: `unknown:${itemId}`,
    title: `Unknown sample: ${itemId}`,
    loggedAtTurn: turn,
  };
}

export function takeDNASample(state: GameState, item: Item) {
  const template = DNA_DATABASE[item.id];
  const result = template
    ? { ...template, loggedAtTurn: state.moves }
    : createUnknownResult(item.id, state.moves);

  const formattedResult = `\n\n${formatDNASampleBody(result)}`;

  const alreadyBanked = state.player.dnaBank.some(
    (sample) => sample.id === result.id,
  );

  if (alreadyBanked) {
    return {
      updatedState: state,
      formattedResult: `${formattedResult}\n\n[Sample already banked.]`,
    };
  }

  const updatedState = {
    ...state,
    player: {
      ...state.player,
      dnaBank: [...state.player.dnaBank, result],
    },
  };
  return { updatedState, formattedResult };
}
