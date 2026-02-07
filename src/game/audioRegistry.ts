export const audioRegistry = {
  cat: ({ dirFromPlayer }: any) =>
    `You hear tiny footsteps somewhere off to the ${dirFromPlayer}.`,
  organism1: ({ dirFromPlayer }: any) =>
    `You hear something moving in the darkness to the ${dirFromPlayer}.`,
  spider: ({ dirFromPlayer }: any) =>
    `A long, otherworldly moan eminates from the ${dirFromPlayer}.`,
} satisfies Record<string, any>;
