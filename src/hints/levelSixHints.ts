import type { MenuBranchNode } from "../game/types/menuTypes";

export const levelSixHints: MenuBranchNode = {
  kind: "menu",
  id: "level6-root",
  title: "HINTS FOR LEVEL SIX",
  children: [
    // ======================================================================
    // Entering the storage area without dying
    // ======================================================================
    {
      kind: "menu",
      id: "l6-storage-entry-death",
      title: "I keep dying when I try to enter the storage area!",
      children: [
        {
          kind: "hint",
          id: "L6STOR1_1",
          title: "Hint One",
          description:
            "Hmm...opening the inner door and the outer door causes you to get sucked out. The room beyond must be in a vacuum.",
        },
        {
          kind: "hint",
          id: "L6STOR1_2",
          title: "Hint Two",
          description:
            "Closing the inner door before opening the outer door would prevent the air from the rest of the level getting sucked out...of course, no one can survive in a vacuum. Not without some kind of help.",
        },
        {
          kind: "hint",
          id: "L6STOR1_3",
          title: "Hint Three",
          description:
            "If you haven't accessed the white security door don't read any further.",
        },
        {
          kind: "hint",
          id: "L6STOR1_4",
          title: "Hint Four",
          description: "Just watch your air!",
        },
      ],
    },

    // ======================================================================
    // Got in alive, now what
    // ======================================================================
    {
      kind: "menu",
      id: "l6-storage-got-in",
      title: "Okay, I got in alive, now WTF?",
      children: [
        {
          kind: "hint",
          id: "L6STOR2_1",
          title: "Hint One",
          description:
            "Looks like in addition to the air, the gravity is out in the storage area as well (the Power Grid system menu mentions this).",
        },
        {
          kind: "hint",
          id: "L6STOR2_2",
          title: "Hint Two",
          description:
            "You're going to need some technological assistance here.",
        },
        {
          kind: "hint",
          id: "L6STOR2_3",
          title: "Hint Three",
          description:
            "If you haven't accessed everything on level five yet, don't read any further.",
        },
        {
          kind: "hint",
          id: "L6STOR2_4",
          title: "Hint Four",
          description:
            "Wear the gravity boots, and turn them on once you're in the storage area.",
        },
      ],
    },

    // ======================================================================
    // Inside the storage area
    // ======================================================================
    {
      kind: "menu",
      id: "l6-storage-inside",
      title: "Okay, I'm inside the storage area, what do I do now?",
      children: [
        // ------------------------------------------------------------------
        // Tiny object near the ceiling
        // ------------------------------------------------------------------
        {
          kind: "menu",
          id: "l6-storage-tiny-object",
          title:
            "What's that tiny object floating near the ceiling and how do I get it?",
          children: [
            {
              kind: "hint",
              id: "L6STOR3_1",
              title: "Hint One",
              description:
                "It's way too high up to grab, even from on top of the pallettes. You'll either need to get it to come to you, or you'll need to get to it.",
            },
            {
              kind: "hint",
              id: "L6STOR3_2",
              title: "Hint Two",
              description:
                "It will take a team of engineers to fix the gravity plating on the storage deck.",
            },
            {
              kind: "hint",
              id: "L6STOR3_3",
              title: "Hint Three",
              description:
                "You'll need to go to the object, then. The lack of gravity can work for you here...",
            },
            {
              kind: "hint",
              id: "L6STOR3_4",
              title: "Hint Four",
              description:
                "...of course, it can work against you as well; you can turn off the gravity boots and jump up to the object, but you'll need to take into consideration how you're going to get back down.",
            },
            {
              kind: "hint",
              id: "L6STOR3_5",
              title: "Hint Five",
              description:
                "Since you can't push off against anything, you'll need some thrust...",
            },
            {
              kind: "hint",
              id: "L6STOR3_6",
              title: "Hint Six",
              description:
                "It's not what it was designed for, but there was an item in with the gravity boots that might be able to provide a little thrust...",
            },
            {
              kind: "hint",
              id: "L6STOR3_7",
              title: "Hint Seven",
              description:
                "Shooting the flare in a direction will cause you to move in the opposite direction.",
            },
            {
              kind: "hint",
              id: "L6STOR3_8",
              title: "Hint Eight",
              description:
                "You have very limited flares; I'd shoot at the ceiling.",
            },
          ],
        },

        // ------------------------------------------------------------------
        // Pistol / camera darts
        // ------------------------------------------------------------------
        {
          kind: "menu",
          id: "l6-storage-pistol",
          title: "I found a pistol, but what do I do with it?",
          children: [
            {
              kind: "hint",
              id: "L6STOR4_1",
              title: "Hint One",
              description: "Try shooting something with it.",
            },
            {
              kind: "hint",
              id: "L6STOR4_2",
              title: "Hint Two",
              description: "Check out the projectile that came out of it.",
            },
            {
              kind: "hint",
              id: "L6STOR4_3",
              title: "Hint Three",
              description:
                "It's a tiny remote camera. You can stick it to things by hand, or shoot things with it.",
            },
            {
              kind: "hint",
              id: "L6STOR4_4",
              title: "Hint Four",
              description: "...wasn't a little display found with it?",
            },
            {
              kind: "hint",
              id: "L6STOR4_5",
              title: "Hint Five",
              description: "Keep your eyes peeled for more darts.",
            },
          ],
        },

        // ------------------------------------------------------------------
        // Dark corner monster
        // ------------------------------------------------------------------
        {
          kind: "menu",
          id: "l6-storage-dark-corner",
          title: "What's the deal with the dark corner?",
          children: [
            {
              kind: "hint",
              id: "L6STOR5_1",
              title: "Hint One",
              description:
                "It sounds like there's something lurking over there...",
            },
            {
              kind: "hint",
              id: "L6STOR5_2",
              title: "Hint Two",
              description:
                "Darkness seems to hide some pretty nasty customers on this ship.",
            },
            {
              kind: "hint",
              id: "L6STOR5_3",
              title: "Hint Three",
              description:
                "Having a light doesn't seem to save your bacon; the space is too confined and the thing is trapped. It has no choice but to attack if you try to pass.",
            },
            {
              kind: "hint",
              id: "L6STOR5_4",
              title: "Hint Four",
              description:
                "Maybe you could dispatch it from a distance? If you haven't found a weapon to do this with don't read any further.",
            },
            {
              kind: "hint",
              id: "L6STOR5_5",
              title: "Hint Five",
              description:
                "Of course, it's dark over there and you can't see it from a distance. Maybe some technological assistance might help...",
            },
            {
              kind: "hint",
              id: "L6STOR5_6",
              title: "Hint Six",
              description:
                "You haven't found what you need yet. You'll know it when you find it.",
            },
          ],
        },
      ],
    },
  ],
};
