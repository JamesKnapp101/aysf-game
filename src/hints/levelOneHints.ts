import type { MenuBranchNode } from "../game/types/menuTypes";

export const levelOneHints: MenuBranchNode = {
  kind: "menu",
  id: "level1-root",
  title: "HINTS FOR LEVEL ONE",
  children: [
    // -----------------------------------------------------------------------
    // I'm having trouble accessing Level One
    // -----------------------------------------------------------------------
    {
      kind: "menu",
      id: "l1-access",
      title: "I'm having trouble accessing Level One",
      children: [
        {
          kind: "hint",
          id: "L1H1",
          title: "Hint One",
          description:
            "The door to level one seems to require some kind of security badge to get in.",
        },
        {
          kind: "hint",
          id: "L1H2",
          title: "Hint Two",
          description: "There's no other way in; you'll need to find a badge.",
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Okay, I've accessed level one but I'm still having trouble.
    // -----------------------------------------------------------------------
    {
      kind: "menu",
      id: "l1-after-access",
      title: "Okay, I've accessed level one but I'm still having trouble.",
      children: [
        // ----- THE WEAPON'S STATION ----------------------------------------
        {
          kind: "menu",
          id: "l1-weapons-station",
          title: "THE WEAPON'S STATION",
          children: [
            {
              kind: "menu",
              id: "l1-weapons-console-inactive",
              title: "Hey, the console is inactive!",
              children: [
                {
                  kind: "hint",
                  id: "L1WA_1",
                  title: "Hint One",
                  description:
                    "Well, everything requires power in order to run...",
                },
                {
                  kind: "hint",
                  id: "L1WA_2",
                  title: "Hint Two",
                  description:
                    "Everything else on the bridge seems to be working...",
                },
                {
                  kind: "hint",
                  id: "L1WA_3",
                  title: "Hint Three",
                  description:
                    "Perhaps someone shut down the weapons console specifically...",
                },
                {
                  kind: "hint",
                  id: "L1WA_4",
                  title: "Hint Four",
                  description: "...but who would do such a thing..?",
                },
                {
                  kind: "hint",
                  id: "L1WA_5",
                  title: "Hint Five",
                  description:
                    "...it would have to had been someone with access to the ship's power station...",
                },
                {
                  kind: "hint",
                  id: "L1WA_6",
                  title: "Hint Six",
                  description: "Oh yeah, it was you!  Go turn it back on.",
                },
              ],
            },
            {
              kind: "menu",
              id: "l1-weapons-buttons",
              title: "What do these buttons do?",
              children: [
                {
                  kind: "hint",
                  id: "L1WB_1",
                  title: "Hint One",
                  description:
                    "They're not labeled...the person manning this station was probably specially trained. Maybe the buttons themselves give a clue as to what they do...",
                },
                {
                  kind: "hint",
                  id: "L1WB_2",
                  title: "Hint Two",
                  description:
                    "This is the weapon's station...probably they have something to do with either attacking or defending...",
                },
                {
                  kind: "hint",
                  id: "L1WB_3",
                  title: "Hint Three",
                  description:
                    "A straight line might suggest a steady stream...",
                },
                {
                  kind: "hint",
                  id: "L1WB_4",
                  title: "Hint Four",
                  description:
                    "A single point might suggest a single pulse of some kind...",
                },
                {
                  kind: "hint",
                  id: "L1WB_5",
                  title: "Hint Five",
                  description:
                    "An empty circle...it's suggestive of perhaps a shell...",
                },
                {
                  kind: "hint",
                  id: "L1WB_6",
                  title: "Hint Six",
                  description:
                    "As you've probably gathered from a few different sources by now, though, the ship's crew was pretty hot not to shut down the shields until a specific task had been performed...",
                },
              ],
            },
            {
              kind: "menu",
              id: "l1-weapons-console-display",
              title: "What do I do with the console display?",
              children: [
                {
                  kind: "hint",
                  id: "L1WC_1",
                  title: "Hint One",
                  description:
                    "Hmm...it's a schematic of some kind, but of what?",
                },
                {
                  kind: "hint",
                  id: "L1WC_2",
                  title: "Hint Two",
                  description:
                    "Hmm...the corpse lying here is wearing a headset. Maybe he was talking to someone when he died...",
                },
                {
                  kind: "hint",
                  id: "L1WC_3",
                  title: "Hint Three",
                  description:
                    "If somewhere else in the ship a body were found wearing a similar headset, certain things might suggest the topic of their conversation.",
                },
                {
                  kind: "hint",
                  id: "L1WC_4",
                  title: "Hint Four",
                  description:
                    "Maybe the weapon's officer was looking up some specific information for the owner of the other headset.",
                },
                {
                  kind: "hint",
                  id: "L1WC_5",
                  title: "Hint Five",
                  description:
                    "Whatever was going on, it looks like they were too late to help themselves, but maybe you can finish what they started.",
                },
                {
                  kind: "hint",
                  id: "L1WC_6",
                  title: "Hint Six",
                  description:
                    "The marked lines are the one's you should be interested in.",
                },
              ],
            },
          ],
        },

        // ----- THE SCIENCE STATION -----------------------------------------
        {
          kind: "menu",
          id: "l1-science-station",
          title: "THE SCIENCE STATION",
          children: [
            {
              kind: "menu",
              id: "l1-science-cant-login",
              title: "I can't log into the computer!",
              children: [
                {
                  kind: "hint",
                  id: "L1SSC_1",
                  title: "Hint One",
                  description:
                    "Hey, this isn't just any computer, you'll need a security code to access bridge functions!",
                },
                {
                  kind: "hint",
                  id: "L1SSC_2",
                  title: "Hint Two",
                  description:
                    "...but everyone is dead, there's no one to give you the code. Maybe the code is recorded somewhere...",
                },
                {
                  kind: "hint",
                  id: "L1SSC_3",
                  title: "Hint Three",
                  description:
                    "Okay, the code IS recorded somewhere...where have you typically found things recorded?",
                },
                {
                  kind: "hint",
                  id: "L1SSC_4",
                  title: "Hint Four",
                  description: "It's not on a chit.",
                },
                {
                  kind: "hint",
                  id: "L1SSC_5",
                  title: "Hint Five",
                  description: "It's not in the log.",
                },
                {
                  kind: "hint",
                  id: "L1SSC_6",
                  title: "Hint Six",
                  description:
                    "Check the message machines...someone wanted to make sure, in a worst case scenario, the code didn't die with them.",
                },
              ],
            },
            {
              kind: "menu",
              id: "l1-science-logged-in",
              title: "I'm logged in...now WTF?",
              children: [
                {
                  kind: "hint",
                  id: "L1SSS_1",
                  title: "Hint One",
                  description: "Well, you can shut things down...",
                },
                {
                  kind: "hint",
                  id: "L1SSS_2",
                  title: "Hint Two",
                  description:
                    "One thing in particular REALLY needs shutting down...",
                },
                {
                  kind: "hint",
                  id: "L1SSS_3",
                  title: "Hint Three",
                  description:
                    "You'll want to shut down the engines before they overheat and explode.",
                },
                {
                  kind: "hint",
                  id: "L1SSS_4",
                  title: "Hint Four",
                  description:
                    "Of course, shutting them down is a pretty big deal - it's not as easy as just flipping a switch.",
                },
                {
                  kind: "hint",
                  id: "L1SSS_5",
                  title: "Hint Five",
                  description:
                    "Check the section on shutting down the engines if you get stuck.",
                },
              ],
            },
          ],
        },

        // ----- THE HELM ----------------------------------------------------
        {
          kind: "menu",
          id: "l1-helm",
          title: "THE HELM",
          children: [
            {
              kind: "hint",
              id: "L1H_1",
              title: "Hint One",
              description: "What does the helmsman of a ship do?",
            },
            {
              kind: "hint",
              id: "L1H_2",
              title: "Hint Two",
              description:
                "The station must control the ship's movement, course, etc.",
            },
            {
              kind: "hint",
              id: "L1H_3",
              title: "Hint Three",
              description:
                "The ship is flying off at some random trajectory after the impact...THAT can't be safe.",
            },
            {
              kind: "hint",
              id: "L1H_4",
              title: "Hint Four",
              description:
                "Someone who knows more about this than you is going to have to change the course, assuming this disaster can be averted, but there's one thing you can do.",
            },
            {
              kind: "hint",
              id: "L1H_5",
              title: "Hint Five",
              description: "Stop the ship, before it hits anything else.",
            },
          ],
        },

        // ----- READY ROOM --------------------------------------------------
        {
          kind: "menu",
          id: "l1-ready-room",
          title: "READY ROOM",
          children: [
            {
              kind: "menu",
              id: "l1-ready-room-what-do-i-do",
              title: "What do I do in here?",
              children: [
                {
                  kind: "hint",
                  id: "L1RR_1",
                  title: "Hint One",
                  description: "Get ready?",
                },
                {
                  kind: "hint",
                  id: "L1RR_2",
                  title: "Hint Two",
                  description:
                    "Well, since everyone on board is either dead or in stasis, one obvious thing presents itself...",
                },
                {
                  kind: "hint",
                  id: "L1RR_3",
                  title: "Hint Three",
                  description:
                    "...rifle through the Captain's personal things, of course!",
                },
                {
                  kind: "hint",
                  id: "L1RR_4",
                  title: "Hint Four",
                  description: "Captains on T.V. always keep a log.",
                },
                {
                  kind: "hint",
                  id: "L1RR_5",
                  title: "Hint Five",
                  description:
                    "This one is no exception, maybe it's in the desk.",
                },
                {
                  kind: "hint",
                  id: "L1RR_6",
                  title: "Hint Six",
                  description:
                    "Looks like you'll need to get a special access card if you want to listen to it.",
                },
              ],
            },
            {
              kind: "menu",
              id: "l1-ready-room-desk",
              title: "What do I do with the desk?",
              children: [
                {
                  kind: "hint",
                  id: "L1RRD_1",
                  title: "Hint One",
                  description: "Look inside it.",
                },
                {
                  kind: "hint",
                  id: "L1RRD_2",
                  title: "Hint Two",
                  description:
                    "Hmm...that looks interesting. Looks like you need a badge to access it.",
                },
                {
                  kind: "hint",
                  id: "L1RRD_3",
                  title: "Hint Three",
                  description:
                    "Who usually hangs out in the ship's ready room?",
                },
                {
                  kind: "hint",
                  id: "L1RRD_4",
                  title: "Hint Four",
                  description: "Find that person...maybe they have it on them.",
                },
              ],
            },
            {
              kind: "menu",
              id: "l1-ready-room-terrarium",
              title: "What do I do with the terrarium?",
              children: [
                {
                  kind: "hint",
                  id: "L1RRT_1",
                  title: "Hint One",
                  description: "Take a look inside...",
                },
                {
                  kind: "hint",
                  id: "L1RRT_2",
                  title: "Hint Two",
                  description: "Don't tap on the glass.",
                },
                {
                  kind: "hint",
                  id: "L1RRT_3",
                  title: "Hint Three",
                  description: "Some spiders are poisonous...",
                },
                {
                  kind: "hint",
                  id: "L1RRT_4",
                  title: "Hint Four",
                  description: "...but not these.",
                },
                {
                  kind: "hint",
                  id: "L1RRT_5",
                  title: "Hint Five",
                  description:
                    "Maybe you could do something with the spiders...",
                },
                {
                  kind: "hint",
                  id: "L1RRT_6",
                  title: "Hint Six",
                  description:
                    "...but not really. The terrarium is just scenery.",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
