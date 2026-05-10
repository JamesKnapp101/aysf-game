import { Item } from "@game/types/itemTypes";

const SPIN_INSTRUCTOR_UNRESPONSIVE_MESSAGE =
  "The woman continues to stare forward, eyes bulging, muscles locked.";

export const spinInstructorSpinStageItems: Item[] = [
  {
    id: "SpinInstructor",
    name: "The electrocuted woman",
    itemCategory: "animate",
    initialDescription: `Sitting on the bike is a young woman with her brown hair in a ponytail, dressed inbike shorts, white sneakers, and a green sports bra. She leans forward gripping the bike handles, as if she were going full tilt, but she's just staring forward, bug-eyed, not moving at all. Her muscles are all tensed, the striations and cords all standing out.`,
    description: `Something's wrong, she's having some sort of seizure. The bike is electronic, maybe electrocution?`,
    location: "SpinInstructorCorpseMemory",
    vocab: ["myndy", "woman", "spin", "instructor", "electrocuted"],
    itemClass: "solid",
    itemWeight: 2,
    itemSize: 2,
    meta: {
      unresponsiveInteractionMessage: SPIN_INSTRUCTOR_UNRESPONSIVE_MESSAGE,
    },
    overrides: {
      //   examine: SPIN_INSTRUCTOR_UNRESPONSIVE_MESSAGE,
      listen: SPIN_INSTRUCTOR_UNRESPONSIVE_MESSAGE,
      touch: SPIN_INSTRUCTOR_UNRESPONSIVE_MESSAGE,
    },
  },
];
