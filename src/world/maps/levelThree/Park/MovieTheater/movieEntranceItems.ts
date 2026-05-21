import type { Item } from "@game/types/itemTypes";

export const movieEntranceItems: Item[] = [
  {
    id: "MovieEntranceGlassDoors",
    name: "glass doors",
    description:
      "A pair of glass doors lead northwest into the theater lobby. The panes are clean enough to reflect the marquee glow in bright, wobbling streaks.",
    sceneryDescription:
      "A pair of glass doors lead into the theater to the northwest,",
    location: "MovieEntrance",
    vocab: ["door", "doors", "glass", "glass doors", "entrance"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "MovieEntranceMarquee",
    name: "lit marquee",
    description:
      "The marquee's block letters advertise a film called 'OUR JOURNEY HOME: CHAPTER 542'. A couple of letters sit a little crooked in their tracks.",
    sceneryDescription:
      "hanging over which is a lit marquee with the words 'OUR JOURNEY HOME: CHAPTER 542' spelled out in block lettering.",
    location: "MovieEntrance",
    vocab: ["marquee", "lit marquee", "letters", "lettering", "movie title"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 6,
    isReadable: true,
    readableText: "NOW PLAYING: OUR JOURNEY HOME: CHAPTER 542",
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "MovieEntrancePosterWindows",
    name: "poster windows",
    description:
      "The display windows hold upcoming movie posters across a suspiciously complete spectrum of genres: romance, disaster, courtroom drama, erotic submarine thriller, and a children's cartoon whose mascot is winking too hard.",
    sceneryDescription:
      "In the windows are displayed several upcoming movies across a spectrum of genres, as well as a cheerful sign promising candy and popcorn.",
    location: "MovieEntrance",
    vocab: [
      "window",
      "windows",
      "poster",
      "posters",
      "upcoming movies",
      "sign",
      "candy",
      "popcorn",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 5,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "MovieEntranceBrickPath",
    name: "brick-paved path",
    description:
      "The tan bricks are laid in a careful herringbone pattern, scuffed pale where park traffic has crossed and recrossed the theater entrance.",
    sceneryDescription:
      "A tan colored brick-paved path leads southwest toward the towering white obelisk in the Park's center.",
    location: "MovieEntrance",
    vocab: ["path", "brick", "bricks", "brick-paved", "obelisk"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 500,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
];
