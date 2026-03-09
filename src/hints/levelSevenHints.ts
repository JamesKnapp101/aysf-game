import type { MenuBranchNode } from "../game/types/menuTypes";

export const levelSevenHints: MenuBranchNode = {
  kind: "menu",
  id: "level7-root",
  title: "HINTS FOR LEVEL SEVEN",
  children: [
    // ======================================================================
    // Accessing Level Seven
    // ======================================================================
    {
      kind: "menu",
      id: "l7-access",
      title: "How do I access Level Seven?",
      children: [
        {
          kind: "hint",
          id: "L7CRYO1_1",
          title: "Hint One",
          description:
            "Looks like you'll need a security badge to get by the door.",
        },
        {
          kind: "hint",
          id: "L7CRYO1_2",
          title: "Hint Two",
          description: "You'll know the badge when you find it.",
        },
        {
          kind: "hint",
          id: "L7CRYO1_3",
          title: "Hint Three",
          description:
            "Level seven has an additional snarl; weapons aren't allowed on level seven.",
        },
      ],
    },

    // ======================================================================
    // Reached Level Seven but need help
    // ======================================================================
    {
      kind: "menu",
      id: "l7-need-help",
      title: "Okay, I've accessed Level Seven, I still need help.",
      children: [
        // ------------------------------------------------------------------
        // Freezing environment
        // ------------------------------------------------------------------
        {
          kind: "menu",
          id: "l7-freezing",
          title: "It's freezing! WTF!?",
          children: [
            {
              kind: "hint",
              id: "FRZ_1",
              title: "Hint One",
              description:
                "The kinds of temperatures involved with cryonics are far lower than your average freezer...",
            },
            {
              kind: "hint",
              id: "FRZ_2",
              title: "Hint Two",
              description:
                "Bundling up with clothing you find around the ship isn't going to cut it.",
            },
            {
              kind: "hint",
              id: "FRZ_3",
              title: "Hint Three",
              description:
                "You won't be able to stray too far from the door; better stick to poking around the immediate area.",
            },
            {
              kind: "hint",
              id: "FRZ_4",
              title: "Hint Four",
              description: "That suit looks promising...",
            },
            {
              kind: "hint",
              id: "FRZ_5",
              title: "Hint Five",
              description: "Just keep your eye on that oxygen gauge!",
            },
          ],
        },

        // ------------------------------------------------------------------
        // The robot
        // ------------------------------------------------------------------
        {
          kind: "menu",
          id: "l7-robot",
          title: "Holy crap, what is that thing?!",
          children: [
            {
              kind: "hint",
              id: "L7CRYO2_1",
              title: "Hint One",
              description:
                "It's some kind of big robot, and it's heavilly armed.",
            },
            {
              kind: "hint",
              id: "L7CRYO2_2",
              title: "Hint Two",
              description:
                "Examine it; it appears to be man-made, not an invader.",
            },
            {
              kind: "hint",
              id: "L7CRYO2_3",
              title: "Hint Three",
              description: "Ask the library about it.",
            },
            {
              kind: "hint",
              id: "L7CRYO2_4",
              title: "Hint Four",
              description:
                "The cargo on level seven is about as precious as it gets; with the death of just about every living thing on board and the ship invaded, the robot is shooting first and asking questions later, be careful.",
            },

            // --------------------------------------------------------------
            // Robot keeps killing player
            // --------------------------------------------------------------
            {
              kind: "menu",
              id: "l7-robot-kills",
              title: "The robot keeps killing me!",
              children: [
                {
                  kind: "hint",
                  id: "L7CRYO3_1",
                  title: "Hint One",
                  description:
                    "The robot is only doing its job. If security were still alive they could order it to stand down. The library will give you an idea of its capabilities.",
                },
                {
                  kind: "hint",
                  id: "L7CRYO3_2",
                  title: "Hint Two",
                  description:
                    "The robot has a gun, an electrical beam, and stinger missiles, and it can track you once it sees you. You're not going to be able to avoid it.",
                },
                {
                  kind: "hint",
                  id: "L7CRYO3_3",
                  title: "Hint Three",
                  description:
                    "All three of its attacks can hit you from a great distance. You need two things.",
                },
                {
                  kind: "hint",
                  id: "L7CRYO3_4",
                  title: "Hint Four",
                  description: "You're going to need some protection...",
                },
                {
                  kind: "hint",
                  id: "L7CRYO3_5",
                  title: "Hint Five",
                  description: "...and you're going to need a weapon.",
                },
                {
                  kind: "hint",
                  id: "L7CRYO3_6",
                  title: "Hint Six",
                  description:
                    "You'll recognize the protection when you find it—defend against projectile AND electrical attacks.",
                },

                // ------------------------------
                // Counterattack hints
                // ------------------------------
                {
                  kind: "hint",
                  id: "L7CRYO4a_1",
                  title: "Hint Seven",
                  description:
                    "For your counterattack you're going to need something with some punch.",
                },
                {
                  kind: "hint",
                  id: "L7CRYO4a_2",
                  title: "Hint Eight",
                  description:
                    "Explosives would kill a lot of innocent people...",
                },
                {
                  kind: "hint",
                  id: "L7CRYO4a_3",
                  title: "Hint Nine",
                  description:
                    "Even a technically advanced blade won't cut it against a machine like that.",
                },
                {
                  kind: "hint",
                  id: "L7CRYO4a_4",
                  title: "Hint Ten",
                  description:
                    "There are several guns on board, but only one packs the punch you need.",
                },
                {
                  kind: "hint",
                  id: "L7CRYO4a_5",
                  title: "Hint Eleven",
                  description:
                    "...the gauss pistol seems like a good candidate.",
                },
                {
                  kind: "hint",
                  id: "L7CRYO4a_6",
                  title: "Hint Twelve",
                  description:
                    "All you need now is a way to smuggle it onto level seven...and ammunition.",
                },

                // ----------------------------------------------------------
                // Robot won’t stay down
                // ----------------------------------------------------------
                {
                  kind: "menu",
                  id: "l7-robot-wont-stay-down",
                  title: "I managed to stop the robot but it won't stay down!",
                  children: [
                    {
                      kind: "hint",
                      id: "L7CRYO4_1",
                      title: "Hint One",
                      description:
                        "The robot is extremely resilient. The library mentions this...",
                    },
                    {
                      kind: "hint",
                      id: "L7CRYO4_2",
                      title: "Hint Two",
                      description:
                        "You must cut its power source if you want to stop it for good.",
                    },
                    {
                      kind: "hint",
                      id: "L7CRYO4_3",
                      title: "Hint Three",
                      description:
                        "Examine the robot—there’s a large blue cable on its back connecting the midsection to the base.",
                    },
                    {
                      kind: "hint",
                      id: "L7CRYO4_4",
                      title: "Hint Four",
                      description:
                        "You have to sever the cable. It protects it while operating, but not while regenerating.",
                    },
                    {
                      kind: "hint",
                      id: "L7CRYO4_5",
                      title: "Hint Five",
                      description:
                        "Once it’s down, approach quickly. You can shoot the cable or cut it with the axe from the botanical area.",
                    },
                  ],
                },

                // ----------------------------------------------------------
                // Smuggling a weapon onto Level Seven
                // ----------------------------------------------------------
                {
                  kind: "menu",
                  id: "l7-smuggle",
                  title: "How can I smuggle a weapon into level seven?",
                  children: [
                    {
                      kind: "hint",
                      id: "L7CRYO5_1",
                      title: "Hint One",
                      description:
                        "Both the security door and the teleportation pad detect weapons. You can't enter with one.",
                    },
                    {
                      kind: "hint",
                      id: "L7CRYO5_2",
                      title: "Hint Two",
                      description:
                        "Those two entrances are the only ways into level seven.",
                    },
                    {
                      kind: "hint",
                      id: "L7CRYO5_3",
                      title: "Hint Three",
                      description:
                        "If you haven't accessed every area on level five, stop here.",
                    },
                    {
                      kind: "hint",
                      id: "L7CRYO5_4",
                      title: "Hint Four",
                      description:
                        "If you haven't accessed the shuttle on level five, don't read further.",
                    },
                    {
                      kind: "hint",
                      id: "L7CRYO5_5",
                      title: "Hint Five",
                      description:
                        "There are two key items in the shuttle that solve this.",
                    },
                    {
                      kind: "hint",
                      id: "L7CRYO5_6",
                      title: "Hint Six",
                      description:
                        "Use the matter transmitter to beam your weapon into level seven. Use the portable coordinate finder to get the exact coordinates.",
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ==================================================================
        // Past the robot
        // ==================================================================
        {
          kind: "menu",
          id: "l7-past-robot",
          title: "I'm past the robot, but I still need help.",
          children: [
            {
              kind: "menu",
              id: "l7-stasis",
              title: "What do I do in the stasis area?",
              children: [
                {
                  kind: "hint",
                  id: "L7CRYO6_1",
                  title: "Hint One",
                  description:
                    "Look around...at least one other interloper was down here before being intercepted by the robot.",
                },
                {
                  kind: "hint",
                  id: "L7CRYO6_2",
                  title: "Hint Two",
                  description:
                    "Perhaps you can find something of use on the body.",
                },
                {
                  kind: "hint",
                  id: "L7CRYO6_3",
                  title: "Hint Three",
                  description:
                    "Did you check the manifest in the Stasis Entry area?",
                },
                {
                  kind: "hint",
                  id: "L7CRYO6_4",
                  title: "Hint Four",
                  description: " ",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
