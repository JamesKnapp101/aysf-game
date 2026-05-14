function formatAudioDirectionMovement(dirFromPlayer: string): string {
  if (dirFromPlayer === "down") return "down below";
  if (dirFromPlayer === "up") return "up above";
  return `to the ${dirFromPlayer}`;
}

function formatAudioDirectionSource(dirFromPlayer: string): string {
  if (dirFromPlayer === "down") return "from down below";
  if (dirFromPlayer === "up") return "from up above";
  return `from the ${dirFromPlayer}`;
}

export const audioRegistry = {
  cat: ({ dirFromPlayer }: any) =>
    `You hear tiny footsteps somewhere ${formatAudioDirectionSource(
      dirFromPlayer,
    )}.`,
  organism1: ({ dirFromPlayer }: any) =>
    `You hear something moving in the darkness ${formatAudioDirectionMovement(
      dirFromPlayer,
    )}.`,
  // spider: ({ dirFromPlayer }: any) =>
  //   `A long, otherworldly moan eminates from the ${dirFromPlayer}.`,
} satisfies Record<string, any>;
