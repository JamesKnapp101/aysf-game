import { Item } from "@game/types/itemTypes";

export const moxMovieTheaterItems: Item[] = [
  {
    id: "MoxTheater",
    name: "The moviegoer",
    itemCategory: "animate",
    initialDescription: `A bald, naked man stands in the theater, looking up at the images moving overhead.`,
    description: `He looks pretty interested in the film.`,
    location: "TheaterCorpseMemory",
    vocab: ["scientist", "man", "guy", "mox"],
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
  },
];
