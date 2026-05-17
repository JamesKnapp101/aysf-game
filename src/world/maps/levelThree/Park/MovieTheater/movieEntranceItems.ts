import type { Item } from "@game/types/itemTypes";

export const movieEntranceItems: Item[] = [
  {
    id: "GreenDoorway",
    name: "doorway",
    description:
      "A wide doorway framed in dull metal. Just beyond, you can see a flight of steps leading up into deeper shadow.",
    sceneryDescription:
      "The doorway feels like a mouth cut into the wall, the edges scuffed where countless shoulders and packages have brushed past. The steps beyond rise at a shallow angle, the first few visible, the rest swallowed by dim light and whatever waits upstairs.",
    location: "MovieEntrance",
    vocab: ["doorway", "steps", "stairs"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 4,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "GreenDoor",
    name: "green door",
    description:
      "The metal door has been physically bent inward and is marred with deep claw marks, as if something wanted in badly enough to ignore metallurgy.",
    sceneryDescription:
      "The door’s green paint is scraped and flaked away in long arcs, exposing bright metal beneath. The panel itself is warped, buckled around the frame in a way that suggests brute force rather than tools. The claw marks stand out clearly—long, parallel gouges that dig into the steel like it was soft pine.",
    location: "MovieEntrance",
    vocab: ["green", "twisted", "bent", "door"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 60,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      open: "The door’s already been “opened” the hard way. You’re not going to improve the situation with your bare hands.",
      examine:
        "Up close, the buckling around the frame is even worse. Whatever bent this wasn’t subtle, and it definitely wasn’t human.",
    },
  },
  {
    id: "DistMarquee3",
    name: "marquee",
    description:
      "A theater marquee juts out over the entrance, the face of it filled with block lettering for the last movie that ever mattered here.",
    sceneryDescription:
      "The lightbox hums faintly, its translucent panels stained with the ghosts of older titles. Black plastic letters slot into narrow tracks, forming a title in clean, utilitarian capitals. A couple of characters are crooked, giving the whole thing a slightly drunk tilt.",
    location: "MovieEntrance",
    vocab: ["marquee", "block", "lettering"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 15,
    itemSize: 5,
    isWearable: false,
    isReadable: true,
    readableText: "NOW PLAYING: JEFFY AND PIPPY: STRAIGHT UP THE WALL",
    isContainer: false,
  },
];
