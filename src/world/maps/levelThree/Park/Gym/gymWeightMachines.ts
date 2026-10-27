import type { GameState } from "@game/types/gameTypes";
import type { ParsedCommand } from "@game/types/parserTypes";

export const GYM_MUSCLE_GROUPS = [
  "Ab",
  "Deltoid",
  "Lat",
  "Pect",
  "Glute",
  "Quad",
  "Calf",
  "Hammy",
  "Tricep",
  "Bicep",
];
export const GYM_EFFECT_NAMES = [
  "Shredder",
  "Ripper",
  "Annihilator",
  "Destroyer",
  "Blaster",
  "Pumper",
  "Buster",
];
export const GYM_MACHINE_SUFFIXES = ["5000", "Pro", "Xtreme", "Supreme", "2"];
export const GYM_LIFTING_MESSAGE =
  "You do a little light lifting, respectable, though you feel like the robot is judging you.";

export function exerciseOnGymMachine(state: GameState, components?: string[]) {
  const [muscleGroup, effectName, machineSuffix] =
    components ??
    [GYM_MUSCLE_GROUPS, GYM_EFFECT_NAMES, GYM_MACHINE_SUFFIXES].map(
      (values) => values[Math.floor(state.rng() * values.length)],
    );
  return {
    state,
    message: `You decide to give the ${muscleGroup}-${effectName} ${machineSuffix} a try. You get yourself situated and grind out a few reps. You can really feel it in your ${muscleGroup}s!`,
  };
}

export function handleGymWeightMachineCommand(
  state: GameState,
  cmd: ParsedCommand,
) {
  if (state.player.roomId !== "GymWeightRoom" || cmd.type !== "action")
    return undefined;
  if (cmd.verb === "pump" && cmd.direct === "iron" && !cmd.indirect)
    return { state, message: GYM_LIFTING_MESSAGE };
  if (cmd.verb !== "use" || cmd.indirect || !cmd.direct) return undefined;
  const tokens = cmd.direct
    .replace(/^(?:the|a|an)\s+/, "")
    .toLowerCase()
    .split(/[\s-]+/);
  if (tokens.length !== 3) return undefined;
  const components = [
    GYM_MUSCLE_GROUPS,
    GYM_EFFECT_NAMES,
    GYM_MACHINE_SUFFIXES,
  ].map((values, index) =>
    values.find((value) => value.toLowerCase() === tokens[index]),
  );
  if (components.some((value) => !value)) return undefined;
  return exerciseOnGymMachine(state, components as string[]);
}
