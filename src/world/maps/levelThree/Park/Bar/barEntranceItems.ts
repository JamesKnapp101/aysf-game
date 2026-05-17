import type { Item } from "@game/types/itemTypes";
import { BAR_DRINK_MENU_TEXT } from "./barDrinks";

export const barEntranceItems: Item[] = [
  {
    id: "BarEntranceExterior",
    name: "bar exterior",
    description:
      "The exterior is cozy and unpretentious in a carefully managed way, the kind of modesty that probably cost extra.",
    sceneryDescription:
      "The exterior is unpretentious, but still gives the impression that it's more expensive than it pretends it is.",
    location: "BarEntrance",
    vocab: ["exterior", "bar", "building"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1000,
    itemSize: 20,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "BarEntrancePath",
    name: "paved path",
    description:
      "The path leads southeast from the grass to the bar entrance, its edges trimmed by neat landscaping.",
    sceneryDescription:
      "A paved path leads southeast through tidy landscaping to the front entrance.",
    location: "BarEntrance",
    vocab: ["path", "paved path", "landscaping", "landscaped"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1000,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "BarEntranceNeonSign",
    name: "red neon sign",
    description:
      "The red neon sign reads 'The Loosened Tongue' in cursive letters, buzzing faintly over the entrance.",
    sceneryDescription:
      "The front of the bar bears a red neon sign that reads 'The Loosened Tongue' in cursive letters,",
    location: "BarEntrance",
    vocab: ["sign", "neon", "red", "loosened", "tongue", "loosened tongue"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 5,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "BarEntranceWindows",
    name: "large windows",
    description:
      "The windows look directly into the bar, though a heavy layer of fliers blocks enough of the view to make the interior feel withheld.",
    sceneryDescription:
      "and beneath that is the entrance, flanked on either side by large windows looking directly into the bar, though much of each window is covered in fliers.",
    location: "BarEntrance",
    vocab: ["window", "windows", "large windows", "fliers", "flyers"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
  {
    id: "BarEntranceBlackboard",
    name: "blackboard sign",
    description:
      "The blackboard advertises the night's specials in chalk and adds: 'Answer tonight's Trivia Question for a Mystery Prize!'",
    sceneryDescription:
      "Just outside the bar is a stand holding a blackboard sign with the specials written in chalk, along with the message 'Answer tonight's Trivia Question for a Mystery Prize!'",
    location: "BarEntrance",
    vocab: ["blackboard", "blackboard sign", "chalk", "specials", "trivia"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 8,
    itemSize: 4,
    isReadable: true,
    readableText: `Tonight's Specials\n\n${BAR_DRINK_MENU_TEXT}\n\nAnswer tonight's Trivia Question for a Mystery Prize!`,
    meta: {
      sceneryDescriptionOrder: 5,
    },
  },
];
