import type { Item } from "@game/types/itemTypes";

export const movieProjectionItems: Item[] = [
  {
    id: "bloodytrail",
    name: "trail of blood",
    description:
      "A dried trail of blood snakes across the floor. There are no footprints, just smeared and pooled patches, as if something was carried instead of walking on its own.",
    sceneryDescription:
      "The blood has turned a dark, rusted brown, clinging to the floor in uneven streaks and blotches. In places it’s smeared wide, as if a weight shifted mid-carry; in others it pools in small, round stains where something dripped steadily for a while. The lack of footprints makes it worse—whoever bled like this wasn’t ambulatory.",
    location: "Projection",
    vocab: ["blood", "trail", "dried"],
    itemClass: "liquid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      smell:
        "Up close it has that stale, metallic tang that blood gets when it’s had time to oxidize and disappoint everyone involved.",
      taste:
        "You lean in like you’re actually going to taste it, then decide you like being alive too much. Good call.",
    },
  },
  {
    id: "clawsmarks",
    name: "claw marks",
    description:
      "Deep claw marks rip through the surfaces here, grouped in sets of six. The claws must have been long and extremely sharp to leave gouges like that.",
    sceneryDescription:
      "The gouges bite straight through paint and panel, exposing raw material underneath in six-fingered arcs. Some lines overlap where the creature—or creatures—changed direction mid-swipe, leaving tangled clusters of scars. The geometry doesn’t match anything you’d find in a friendly field guide.",
    location: "Projection",
    vocab: ["claw", "marks", "gouges"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      examine:
        "You trace the air above the gouges with your fingers. Whatever made these didn’t bother negotiating first.",
    },
  },
  {
    id: "brokenchairs",
    name: "wooden debris",
    description:
      "Splintered wood and twisted hardware litter the floor. At one point it was a chair; now it’s kindling.",
    sceneryDescription:
      "Jagged lengths of varnished wood jut out at random angles, some still attached to bent metal brackets and torn upholstery. The way the pieces are scattered suggests violence, not simple decay—someone or something hit the chair hard enough to turn it into abstract art.",
    location: "Projection",
    vocab: ["wooden", "chair", "debris", "splinters"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 3,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      siton:
        "You could try to sit in the debris pile, but mostly you’d just collect splinters and regrets.",
    },
  },
  {
    id: "MovieCartrage",
    name: "slim cartridge",
    description:
      "A slim movie cartridge about the size of a business card and almost as thin. A label on one side bears a stylized logo: “Jeffey and Pippy: Stright Up The Wall.” The cartridge has been bent almost in half.",
    sceneryDescription:
      "The cartridge’s casing is a smooth, matte plastic, now creased with a sharp kink where someone folded it past its tolerance. The printed logo is bright and cartoonish, all exaggerated fonts and cheerful colors that feel wildly out of place here.",
    location: "projector",
    vocab: ["slim", "cartridge", "movie", "fred"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: true,
    isContainer: false,
    readableText: "Jeffey and Pippy: Stright Up The Wall",
    overrides: {
      take: "You pick up the bent cartridge.",
    },
  },
];
