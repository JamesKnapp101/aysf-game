import type { HintMenuNode } from "../game/types/hintTypes";

export const levelTwoHints: HintMenuNode = {
  kind: "menu",
  id: "level2-root",
  title: "HINTS FOR LEVEL TWO",
  children: [
    // -----------------------------------------------------------------------
    // How can I get the lights back on?
    // -----------------------------------------------------------------------
    {
      kind: "menu",
      id: "l2-lights",
      title: "How can I get the lights back on?",
      children: [
        {
          kind: "hint",
          id: "L2L_1",
          title: "Hint One",
          description:
            "You can't; this part of the ship has been completely devestated.",
        },
        {
          kind: "hint",
          id: "L2L_2",
          title: "Hint Two",
          description: "This space intentionally left blank.",
        },
        {
          kind: "hint",
          id: "L2L_3",
          title: "Hint Three",
          description: "This one, too.",
        },
      ],
    },

    // -----------------------------------------------------------------------
    // What's up here with me?
    // -----------------------------------------------------------------------
    {
      kind: "menu",
      id: "l2-whats-up-here",
      title: "What's up here with me?",
      children: [
        {
          kind: "hint",
          id: "L2V_1",
          title: "Hint One",
          description:
            "Most likely the same creatures that you've found lurking in other dark parts of the ship. It sounds like they have the run of this area.",
        },
        {
          kind: "hint",
          id: "L2V_2",
          title: "Hint Two",
          description: "They do. Don't let your light source go out.",
        },
      ],
    },

    // -----------------------------------------------------------------------
    // I need help with the Armory
    // -----------------------------------------------------------------------
    {
      kind: "menu",
      id: "l2-armory",
      title: "I need help with the Armory",
      children: [
        {
          kind: "hint",
          id: "L2A_1",
          title: "Hint One",
          description:
            "There's a naked guy on the floor, I wonder what happened to him?  Check him out...",
        },
        {
          kind: "hint",
          id: "L2A_2",
          title: "Hint Two",
          description:
            "Hey, he's not dead!  He's in some kind of deep sleep, or coma.",
        },
        {
          kind: "hint",
          id: "L2A_3",
          title: "Hint Three",
          description:
            "It looks like whatever happened to him happened suddenly, you probably don't want it happening to you...",
        },
        {
          kind: "hint",
          id: "L2A_4",
          title: "Hint Four",
          description:
            "You don't want to make the same mistake he did...but what was his mistake?",
        },
        {
          kind: "hint",
          id: "L2A_5",
          title: "Hint Five",
          description:
            "It looks like they frown on people just looting the Armory...security probably would have picked this guy up and revived him, but they're all dead now. You need that magazine, though...",
        },
        {
          kind: "hint",
          id: "L2A_6",
          title: "Hint Six",
          description:
            "Look around...what form of security protects this room?",
        },
        {
          kind: "hint",
          id: "L2A_7",
          title: "Hint Seven",
          description:
            "Anoxiflourine...sounds dangerous. Maybe you'd better ask the library terminal about it...",
        },
        {
          kind: "hint",
          id: "L2A_8",
          title: "Hint Eight",
          description:
            "Woah!  You don't want to breathe THAT in!  You need to breathe, though.",
        },
        {
          kind: "hint",
          id: "L2A_9",
          title: "Hint Nine",
          description:
            "You'll need some kind of protection in order to wait out the gas.",
        },
        {
          kind: "hint",
          id: "L2A_10",
          title: "Hint Ten",
          description: "The cold suit will work. So will the gas mask.",
        },
      ],
    },

    // -----------------------------------------------------------------------
    // How do I get the safe open?
    // (no hints defined yet in the original)
    // -----------------------------------------------------------------------
    {
      kind: "menu",
      id: "l2-safe-closed",
      title: "How do I get the safe open?",
      children: [],
    },

    // -----------------------------------------------------------------------
    // Okay, the safe is open...
    // -----------------------------------------------------------------------
    {
      kind: "menu",
      id: "l2-safe-open",
      title: "Okay, the safe is open...",
      children: [
        {
          kind: "menu",
          id: "l2-silvery-capsule",
          title: "What's this silvery capsule for?",
          children: [],
        },
        {
          kind: "menu",
          id: "l2-gun-no-bullets",
          title: "Nice gun...it would be nicer if I had bullets for it...",
          children: [],
        },
      ],
    },
  ],
};
