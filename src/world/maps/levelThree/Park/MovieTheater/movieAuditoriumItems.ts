import type { Item } from "@game/types/itemTypes";

export const movieAuditoriumItems: Item[] = [
  {
    id: "glasspartition",
    name: "glass partition",
    description:
      "A thick glass partition looks into a cramped ticket booth. The booth itself is empty.",
    sceneryDescription:
      "Faint scratches and smear marks trace arcs across the glass at hand level, where bored patrons once leaned or drummed their fingers. Beyond it sits an abandoned chair, a dead terminal, and the lingering memory of someone who used to ask, “Next?” all day.",
    location: "MovieTheatreOne",
    vocab: ["glass", "partition", "window", "booth"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 4,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
];
