import { Item } from "@game/types/itemTypes";
import { extractChefSample } from "src/world/maps/levelThree/Park/Restaurant/chefSample";

export const doomedChefItems: Item[] = [
  {
    id: "DoomedChef",
    name: "The doomed man",
    itemCategory: "animate",
    initialDescription: `A man wearing the bloodied remains of a chef's uniform lay on his back on the floor of the walk-in, his body mangled, and twisted.`,
    description: `It's hard to say what happened to him; his body has partially dissolved, and what's left is in ruins, exposing bone and viscera. His head is intact, and somehow his eyes are still open, and looking around but he doesn't seem in pain. You might be able to take a sample of the affected flesh if you had something to cut with. `,
    location: "WalkIn",
    vocab: ["chef", "doomed", "man", "head", "body", "Matthias", "Venn"],
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
    isSearchable: true,
    overrides: {
      cut: extractChefSample,
      search:
        "Everything is fused together, you don't see anything useful in the wreckage though he does seem to somehow still be alive. The exposed parts of his remaining flesh are riddled with some kind of webbing. You might be able to get a sample of it, if you had something to cut with.",
    },
    idleActions: [
      `"It pulls me...calls me..."`,
      `The chef's eyes swim, but stay focused on you.`,
      `"This thing," the chef croaks, "it is drawn...to me...it wants...to take me..."`,
      `"Can't...feel my...body..."`,
    ],
    meta: {
      isAlive: true,
      canMove: false,
      memories: [
        "Tiny leak in sous-vide, no larger than pinhole, where from?. Elephant tenderloin moving inside sous-vide?. The warmer it gets, the more it moves.",
        "Sous-vide exploded when the meat inside erupted!. Glass in my face and eyes!. Something is very wrong. Blood everywhere, can't see, have to hide. Get to freezer. I feel it, something worming its way through me. Spreading like mycelium through my guts, my brains, quelqu'un, aidez-moi. Je vous en supplie, aidez-moi. C'est à l'intérieur de moi, ça se propage en moi. Je vous en prie, sauvez-moi.",
        "This thing has run through every part of me, now, but, it stopped. The freezing cold has stopped it from its final step. It desires to consume every part of my body to fuel a massive change, a true metamorphosis. It can't, it's stuck. We are stuck together in this hell.",
      ],
    },
  },
];
