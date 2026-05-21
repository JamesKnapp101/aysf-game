import type { Item } from "@game/types/itemTypes";

export const movieProjectionItems: Item[] = [
  {
    id: "MovieProjectionPortal",
    name: "circular portal",
    description:
      "The circular portal looks out over the auditorium dome. Through it you can see the suspended projector sphere turning with patient mechanical grace.",
    sceneryDescription:
      "It does not contain the actual projector, but it does offer a view of it through a circular portal.",
    location: "Projection",
    vocab: ["portal", "circular portal", "window", "view", "projector"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 80,
    itemSize: 5,
    meta: {
      sceneryDescriptionOrder: 1,
    },
    overrides: {
      lookthrough:
        "Through the circular portal you can see the projector sphere hanging at the peak of the dome, its tiny lenses shifting as the movie spills across the auditorium.",
    },
  },
  {
    id: "MovieProjectionSphere",
    name: "projector sphere",
    description:
      "The projector itself is a large, intricate sphere covered in tiny glistening lenses and LEDs. It hangs suspended at the peak of the dome, always moving, always stitching the movie together out of light.",
    sceneryDescription:
      "The projector itself looks like a large, intricate sphere covered in tiny, glistening lenses and LEDs that hangs suspended at the peak of the dome covering the circular theater, and as the movie plays the surface is in constant motion as it projects the intricate light show beneath it.",
    location: "Projection",
    vocab: ["sphere", "projector sphere", "projector", "lenses", "leds"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 200,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "MovieProjectionConsole",
    name: "projection console",
    description:
      "The console occupies one corner, its controls labeled with theater jargon and small warning stickers. A folding chair sits behind it for whoever used to keep the show running.",
    sceneryDescription:
      "The booth itself is a little cramped. There is a console in one corner with a folding chair behind it for one person to man it, though it does not look like anyone has been here for a while.",
    location: "Projection",
    vocab: ["console", "controls", "chair", "folding chair", "booth"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 90,
    itemSize: 5,
    meta: {
      sceneryDescriptionOrder: 3,
    },
    overrides: {
      use: "The console is active, but whatever it is doing to keep the movie running is already doing it without you.",
    },
  },
];
