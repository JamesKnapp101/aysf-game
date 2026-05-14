import { Item } from "@game/types/itemTypes";

export const barBotItems: Item[] = [
  {
    id: "BarBot",
    name: "The robot bartender",
    itemCategory: "scenery",
    sceneryDescription: `[[newline]]A tall robot stands behind the bar, dressed in slacks and a buttoned white shirt, with a spiffy bow tie and suspenders. Its face shield presents the face of a handsome, older man whose attentive eyes twinkle in the dim lighting.`,
    description: `The robot has a human build, and stands about six feet tall. It's snappily dressed in slacks and a buttoned white shirt, with a bow tie and leather suspenders. The face that glows on its face shield looks handsome, and empathetic.`,
    location: "Bar",
    vocab: [
      "sam",
      "samsynth",
      "synth",
      "roswink",
      "barbot",
      "robot",
      "bot",
      "bartender",
      "mixologist",
    ],
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
    meta: {
      sceneryDescriptionOrder: 10,
    },
  },
];
