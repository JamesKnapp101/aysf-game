import type { HintMenuNode } from "../game/types/hintTypes";

export const levelFiveHints: HintMenuNode = {
  kind: "menu",
  id: "level5-root",
  title: "HINTS FOR LEVEL FIVE",
  children: [
    // ======================================================================
    // Light into Level Five
    // ======================================================================
    {
      kind: "menu",
      id: "l5-light",
      title: "How do I get light into level five?",
      children: [
        {
          kind: "hint",
          id: "L5ENG1_1",
          title: "Hint One",
          description:
            "There doesn't seem to be a portable light source lying around...",
        },
        {
          kind: "hint",
          id: "L5ENG1_2",
          title: "Hint Two",
          description: "...but maybe you can get the lights working again.",
        },
        {
          kind: "hint",
          id: "L5ENG1_3",
          title: "Hint Three",
          description:
            "If you can figure out how to get the power station working again, maybe you can get the lights back on.",
        },
      ],
    },

    // ======================================================================
    // General Level Five help
    // ======================================================================
    {
      kind: "menu",
      id: "l5-more-help",
      title: "Okay, I'm in level five but I still need help.",
      children: [
        // ------------------------------------------------------------------
        // Brown security door
        // ------------------------------------------------------------------
        {
          kind: "menu",
          id: "l5-brown-door",
          title: "How do I access the brown security door?",
          children: [
            {
              kind: "hint",
              id: "L5SEC1_1",
              title: "Hint One",
              description: "Looks like you'll need a security badge.",
            },
            {
              kind: "hint",
              id: "L5SEC1_2",
              title: "Hint Two",
              description:
                "It's color matched to the security door, you'll know it when you find it.",
            },
          ],
        },

        // ------------------------------------------------------------------
        // Radiation / sickness puzzle
        // ------------------------------------------------------------------
        {
          kind: "menu",
          id: "l5-radiation-sickness",
          title: "I keep getting sick and dying, WTF?",
          children: [
            {
              kind: "hint",
              id: "L5ENG2_1",
              title: "Hint One",
              description:
                "This isn't the virus that's affected the rest of the ship, it's happening way too fast...",
            },
            {
              kind: "hint",
              id: "L5ENG2_2",
              title: "Hint Two",
              description:
                "Funny how it always seems to happen when you go in the Engine Room...",
            },
            {
              kind: "hint",
              id: "L5ENG2_3",
              title: "Hint Three",
              description:
                "Before entering the engine room, did you notice that big radiation symbol lit up in red?",
            },
            {
              kind: "hint",
              id: "L5ENG2_4",
              title: "Hint Four",
              description:
                "You have radiation sickness...but you need to access the engine room. Think of there being two ways to deal with this situation.",
            },
            {
              kind: "hint",
              id: "L5ENG2_5",
              title: "Hint Five",
              description:
                "The cold suit doesn't seem to protect you against the radiation...ask the library about it.",
            },
            {
              kind: "hint",
              id: "L5ENG2_6",
              title: "Hint Six",
              description:
                "It seems you can't protect yourself from GETTING radiation sickness.",
            },
            {
              kind: "hint",
              id: "L5ENG2_7",
              title: "Hint Seven",
              description:
                "Maybe you can do something about it after the fact.",
            },
            {
              kind: "hint",
              id: "L5ENG2_8",
              title: "Hint Eight",
              description:
                "If you haven't accessed the Shuttle, don't read any further.",
            },
            {
              kind: "hint",
              id: "L5ENG2_9",
              title: "Hint Nine",
              description:
                "This is one of the more complex puzzles in the game; it involves things you've found or encountered on several of the ship's levels.",
            },
            {
              kind: "hint",
              id: "L5ENG2_10",
              title: "Hint Ten",
              description:
                "Oddly enough, this will involve the cat you encountered on Level Three where you woke up (if you somehow managed not to bump into the cat, go introduce yourself now.",
            },
            {
              kind: "hint",
              id: "L5ENG2_11",
              title: "Hint Eleven",
              description:
                "Follow the cat around for a while, see where it goes...",
            },
            {
              kind: "hint",
              id: "L5ENG2_12",
              title: "Hint Twelve",
              description:
                "Go back to the Level Three main corridor and go north as far as you can go, then go north again...",
            },
            {
              kind: "hint",
              id: "L5ENG2_13",
              title: "Hint Thirteen",
              description: "The cat is pretty small.",
            },
            {
              kind: "hint",
              id: "L5ENG2_14",
              title: "Hint Fourteen",
              description:
                "Cats are curious...bring him to the tunnel and see what he does.",
            },
            {
              kind: "hint",
              id: "L5ENG2_15",
              title: "Hint Fifteen",
              description:
                "I wonder what's in there? If only there were some way to see what the cat sees...",
            },
            {
              kind: "hint",
              id: "L5ENG2_16",
              title: "Hint Sixteen",
              description:
                "If you haven't already, seach the storage warehouse on level six thouroughly.",
            },
            {
              kind: "hint",
              id: "L5ENG2_17",
              title: "Hint Seventeen",
              description:
                "If you have, you have encountered a device which can help you. Those darts will stick to anything.",
            },
            {
              kind: "hint",
              id: "L5ENG2_18",
              title: "Hint Eighteen",
              description:
                "Shoot the cat with a dart, then monitor the hand-held viewer. If you bring the cat to the tunnel it will go inside...watch carefully what the camera dart sends back. When in doubt about something, consult the library.",
            },
            {
              kind: "hint",
              id: "L5ENG2_19",
              title: "Hint Nineteen",
              description:
                "It looks like there's an item in there that can help you - you'll never get to it, but maybe you can bring it to you...",
            },
            {
              kind: "hint",
              id: "L5ENG2_20",
              title: "Hint Twenty",
              description:
                "You'd never even get a dog who didn't know you and wasn't trained to retrieve it; you'll never get the cat to do it.",
            },
            {
              kind: "hint",
              id: "L5ENG2_21",
              title: "Hint Twenty-One",
              description:
                "Ok, the Matter Transmitter is going to be key, here...but how can you get the coordinants? You can't get the cat to carry the coordinant finder...",
            },
            {
              kind: "hint",
              id: "L5ENG2_22",
              title: "Hint Twenty-Two",
              description:
                "This one has a low-tech solution; you can't get the coordinant finder to GIVE you the exact coordinants, but you can make a note of the Living Quarters number as seen in the viewer...measuring two of the ones you DO have access to, you can derive the coordinants and plug them into the matter transmitter.",
            },
          ],
        },

        // ------------------------------------------------------------------
        // Person trapped behind warehouse door
        // ------------------------------------------------------------------
        {
          kind: "menu",
          id: "l5-free-person",
          title: "How do I free the person trapped behind the warehouse door?",
          children: [
            {
              kind: "hint",
              id: "L5ENG3_1",
              title: "Hint One",
              description:
                "The doors are way too heavy to budge with your bare hands, or even to force with a lever.",
            },
            {
              kind: "hint",
              id: "L5ENG3_2",
              title: "Hint Two",
              description:
                "You're going to need to use extreme measures to move those doors.",
            },
            {
              kind: "hint",
              id: "L5ENG3_3",
              title: "Hint Three",
              description:
                "Nothing short of explosives will get those doors open.",
            },
          ],
        },

        // ------------------------------------------------------------------
        // Shuttle access
        // ------------------------------------------------------------------
        {
          kind: "menu",
          id: "l5-shuttle",
          title: "How do I access the shuttle?",
          children: [
            {
              kind: "hint",
              id: "L5ENG4_1",
              title: "Hint One",
              description:
                "Well, the door is locked. What kind of key does it use?",
            },
            {
              kind: "hint",
              id: "L5ENG4_2",
              title: "Hint Two",
              description:
                "Okay, the door will only open for the thumbprint of the last person who requisitioned the shuttle.",
            },
            {
              kind: "hint",
              id: "L5ENG4_3",
              title: "Hint Three",
              description:
                "The computer mentioned the code could be changed if the shuttle requisition was changed, but you don't have the authority to make a change like that, assuming you could even figure out how to go about it.",
            },
            {
              kind: "hint",
              id: "L5ENG4_4",
              title: "Hint Four",
              description:
                "It's looking like this problem is going to require a somewhat grisly solution.",
            },
            {
              kind: "hint",
              id: "L5ENG4_5",
              title: "Hint Five",
              description:
                "You need the thumb that can unlock the shuttle door. This is an emergency, I'm sure people will understand.",
            },
            {
              kind: "hint",
              id: "L5ENG4_6",
              title: "Hint Six",
              description:
                "The problem is, you have a name...but where is Commander Warren Otts? Which body? A certain piece of technology can help you with this...",
            },
            {
              kind: "hint",
              id: "L5ENG4_7",
              title: "Hint Seven",
              description:
                "If you haven't accessed every area of the Medical Facility don't read any further.",
            },
            {
              kind: "hint",
              id: "L5ENG4_8",
              title: "Hint Eight",
              description:
                "If you haven't gotten into the medical storage room, don't read any further.",
            },
            {
              kind: "hint",
              id: "L5ENG4_9",
              title: "Hint Nine",
              description:
                "The DNA reader will help. If you touch a corpse with the wand, it will test the DNA and tell you the name and rank of the body.",
            },
            {
              kind: "hint",
              id: "L5ENG4_10",
              title: "Hint Ten",
              description:
                "Sample the different corpses you find; one of them is Warren Otts. You can remove his thumb with either the scalpel, the knife, or the axe.",
            },

            // --- Whimp “just tell me” submenu ----------------------------
            {
              kind: "menu",
              id: "l5-shuttle-whimp",
              title:
                "Okay, I can't find it or I'm just sick of looking, where is it?",
              children: [
                {
                  kind: "hint",
                  id: "L5WHIMP_1",
                  title: "Hint One",
                  description:
                    "Party pooper. I'll give you a hint; he's below level four.",
                },
                {
                  kind: "hint",
                  id: "L5WHIMP_2",
                  title: "Hint Two",
                  description: "Okay, he's below level five.",
                },
                {
                  kind: "hint",
                  id: "L5WHIMP_3",
                  title: "Hint Three",
                  description: "Okay, he's on level seven.",
                },
                {
                  kind: "hint",
                  id: "L5WHIMP_4",
                  title: "Hint Four",
                  description: "Okay, okay! He's in the Cryo Lab!",
                },
                {
                  kind: "hint",
                  id: "L5WHIMP_5",
                  title: "Hint Five",
                  description:
                    "Still, sample everyone or every sample you find...you may learn some interesting things...",
                },
              ],
            },
          ],
        },

        // ------------------------------------------------------------------
        // Elevator
        // ------------------------------------------------------------------
        {
          kind: "menu",
          id: "l5-elevator",
          title: "Can I do anything with the elevator?",
          children: [
            {
              kind: "hint",
              id: "L5ENG5_1",
              title: "Hint One",
              description: "You'll never get it working again.",
            },
            {
              kind: "hint",
              id: "L5ENG5_2",
              title: "Hint Two",
              description:
                "Have you examined the interior of the elevator carefully?",
            },
            {
              kind: "hint",
              id: "L5ENG5_3",
              title: "Hint Three",
              description: "There's an access panel on the ceiling.",
            },
          ],
        },
      ],
    },
  ],
};
