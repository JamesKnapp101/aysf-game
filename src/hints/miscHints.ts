import type { MenuBranchNode } from "../game/types/menuTypes";

export const miscHints: MenuBranchNode = {
  kind: "menu",
  id: "misc-root",
  title: "MISCELLANIOUS HINTS",
  children: [
    // ======================================================================
    // Terminal / Colored Disks
    // ======================================================================
    {
      kind: "menu",
      id: "misc-terminal-colored-disks",
      title: "THE TERMINAL/COLORED DISKS",
      children: [
        {
          kind: "menu",
          id: "misc-colored-disks-what-for",
          title:
            "What are these colored disks for?  They don't seem to do anything.",
          children: [],
        },

        {
          kind: "menu",
          id: "misc-colored-disks-work-now",
          title: "Okay, they work now...",
          children: [
            // --------------------------------------------------------------
            // Blue Disk Area
            // --------------------------------------------------------------
            {
              kind: "menu",
              id: "misc-blue-disk-area",
              title: "BLUE DISK AREA",
              children: [
                {
                  kind: "menu",
                  id: "misc-blue-disk-what-do",
                  title: "What do I do here?",
                  children: [
                    {
                      kind: "hint",
                      id: "TPADB1_1",
                      title: "Hint One",
                      description:
                        "One of the interesting things about the remote medical facility is not so much what is there, as what ISN'T there.",
                    },
                    {
                      kind: "hint",
                      id: "TPADB1_2",
                      title: "Hint Two",
                      description:
                        "Namely, there seem to be at least three alien specimens which are no longer in their cages.",
                    },
                    {
                      kind: "hint",
                      id: "TPADB1_3",
                      title: "Hint Three",
                      description: "They didn't leave the ship...",
                    },
                    {
                      kind: "hint",
                      id: "TPADB1_4",
                      title: "Hint Four",
                      description:
                        "Activate the library as soon as possible and try to get more information on the missing creatures.",
                    },
                  ],
                },
                {
                  kind: "menu",
                  id: "misc-blue-disk-drugs",
                  title: "Should I use any of these drugs?",
                  children: [
                    {
                      kind: "hint",
                      id: "TPADB2_1",
                      title: "Hint One",
                      description:
                        "Unlike some of the drugs you encounter, these are pretty clear about what they do.",
                    },
                    {
                      kind: "hint",
                      id: "TPADB2_2",
                      title: "Hint Two",
                      description:
                        "Using them is totally up to your own discretion.",
                    },
                    {
                      kind: "hint",
                      id: "TPADB2_3",
                      title: "Hint Three",
                      description:
                        "If you've been injured, you might want to take advantage of the VITABOOST...",
                    },
                    {
                      kind: "hint",
                      id: "TPADB2_4",
                      title: "Hint Four",
                      description:
                        "If you haven't been injured, you might want to hang onto it!",
                    },
                  ],
                },
              ],
            },

            // --------------------------------------------------------------
            // Yellow Disk Area (placeholder)
            // --------------------------------------------------------------
            {
              kind: "menu",
              id: "misc-yellow-disk-area",
              title: "YELLOW DISK AREA",
              children: [],
            },

            // --------------------------------------------------------------
            // Brown Disk Area
            // --------------------------------------------------------------
            {
              kind: "menu",
              id: "misc-brown-disk-area",
              title: "BROWN DISK AREA",
              children: [
                // ----------------------------------------------------------
                // Dried green thing (slug)
                // ----------------------------------------------------------
                {
                  kind: "menu",
                  id: "misc-brown-dried-green-thing",
                  title: "What is this dried green thing?",
                  children: [
                    {
                      kind: "hint",
                      id: "TPADBR1_1",
                      title: "Hint One",
                      description: "It's a lot more complex than it looks.",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_2",
                      title: "Hint Two",
                      description:
                        "If you haven't been to the remote medical facility don't read any further.",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_3",
                      title: "Hint Three",
                      description:
                        "It sort of matches the description of one of the missing creatures from the remote medical facility, but it looks to have dried up.",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_4",
                      title: "Hint Four",
                      description: "How did it end up here?",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_5",
                      title: "Hint Five",
                      description:
                        "Maybe it's not a coincidence that both it and the corpse are in the same room...have you examined the corpse?",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_6",
                      title: "Hint Six",
                      description:
                        "Looks like whoever it was his blood was drained like many of the others onboard the ship, but the plaque in the remote medical facility said there was only one specimen like the one nearby. It seems unlikely something so small drained all the blood of so many people. Perhaps it isn't the culprit.",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_7",
                      title: "Hint Seven",
                      description:
                        "Perhaps there's more information on the specimen in the ship's library...",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_8",
                      title: "Hint Eight",
                      description:
                        "That might explain how both it, and the body got here. Whatever it was trying to do, it looks like its host was killed before it had a chance to get very far. It seems to have entered its dormant phase. Perhaps you can wake it up.",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_9",
                      title: "Hint Nine",
                      description:
                        "The library entry said the creature goes into its dormant state if it has no access to water, or a host. Since its host was killed and there was no water around, it dried up...you'll need to rehydrate it.",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_10",
                      title: "Hint Ten",
                      description:
                        "The ship seems to have no shortage of water...however, the slug will dry up again if you're not careful.",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_11",
                      title: "Hint Eleven",
                      description:
                        "You'll need a vessel to transport it to a host (which is not yourself, of course) or it will go dormant before you can transport it.",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_12",
                      title: "Hint Twelve",
                      description:
                        "The fishbowl from Living Quarters Five East is the perfect size.",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_13",
                      title: "Hint Thirteen",
                      description:
                        "It's looking a little more lively now. Supposedly it's intelligent...it may have information, but it will need a host in order to communicate.",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_14",
                      title: "Hint Fourteen",
                      description:
                        "Based on what you've read in the library entry, you'll probably want to be careful with it...maybe using yourself as a host isn't the best choice. Is there anyone else left alive on the ship?",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_15",
                      title: "Hint Fifteen",
                      description:
                        "You may have spoken to someone via the radio, but there's no telling where they are right now. Did you find anyone else alive..?",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_16",
                      title: "Hint Sixteen",
                      description:
                        "The boy in the main medical facility is in a coma, but he's still alive. You can attach the creature to the boy and communicate with it.",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_17",
                      title: "Hint Seventeen",
                      description:
                        "...think about where you found it. What might it know about?",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_18",
                      title: "Hint Eighteen",
                      description:
                        "Ask it about the corpse it was found near, or the access port, or the keypad.",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_19",
                      title: "Hint Nineteen",
                      description:
                        "It seems like the creature is leaving you no choice; you're going to have to agree to its deal to get what you want, but maybe there's a way to ensure your safety...",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_20",
                      title: "Hint Twenty",
                      description:
                        "The library entry gave you a key piece of information.",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_21",
                      title: "Hint Twenty One",
                      description:
                        "If you haven't searched all the Living Quarters then don't read any further.",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_22",
                      title: "Hint Twenty Two",
                      description:
                        "If you have, you've run into at least one item which gives no clue as to its purpose; it's always best to consult the library in those circumstances.",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_23",
                      title: "Hint Twenty Three",
                      description:
                        "What part of the body does the drug Trixophine affect, and what does it do?",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_24",
                      title: "Hint Twenty Four",
                      description:
                        "Trixophine has another attribute; it takes a little while for it to kick in...",
                    },
                    {
                      kind: "hint",
                      id: "TPADBR1_25",
                      title: "Hint Twenty Five",
                      description:
                        "...the creature won't be able to maintain its grip on you once the Trixophine sends your neural activity sky high, but the lag before it kicks in ought to be just long enough for it to do what it promised.",
                    },
                  ],
                },

                // ----------------------------------------------------------
                // Access port
                // ----------------------------------------------------------
                {
                  kind: "menu",
                  id: "misc-brown-access-port",
                  title: "How do I get through the access port?",
                  children: [
                    {
                      kind: "hint",
                      id: "AP_1",
                      title: "Hint One",
                      description:
                        "You'll need to deactivate the force field first...",
                    },
                    {
                      kind: "hint",
                      id: "AP_2",
                      title: "Hint Two",
                      description:
                        "Examine everything in the room...it looks like this was set up in a hurry.",
                    },
                    {
                      kind: "hint",
                      id: "AP_3",
                      title: "Hint Three",
                      description:
                        "It looks like it's tied to the keypad...you'll need a code to deactivate it.",
                    },
                  ],
                },

                // ----------------------------------------------------------
                // Keypad combination
                // ----------------------------------------------------------
                {
                  kind: "menu",
                  id: "misc-brown-keypad-combo",
                  title: "How can I figure out the combination for the keypad?",
                  children: [
                    {
                      kind: "hint",
                      id: "KP_1",
                      title: "Hint One",
                      description:
                        "Well, one person probably did know it, but it looks like he won't be able to help you now...",
                    },
                    {
                      kind: "hint",
                      id: "KP_2",
                      title: "Hint Two",
                      description:
                        "Looks like he didn't write it down, either.",
                    },
                    {
                      kind: "hint",
                      id: "KP_3",
                      title: "Hint Three",
                      description:
                        "There's no human left alive on the ship who would know the code.",
                    },
                    {
                      kind: "hint",
                      id: "KP_4",
                      title: "Hint Four",
                      description:
                        "There seem to be various inhuman things wandering the ship, though...",
                    },
                    {
                      kind: "hint",
                      id: "KP_5",
                      title: "Hint Five",
                      description:
                        "Examine the green rag found near the body in the maintenance duct.",
                    },
                  ],
                },

                // ----------------------------------------------------------
                // After access port
                // ----------------------------------------------------------
                {
                  kind: "menu",
                  id: "misc-brown-after-access-port",
                  title:
                    "Okay, I've gotten through the access port, but I'm still stuck...",
                  children: [
                    {
                      kind: "menu",
                      id: "misc-brown-singularity-stop",
                      title:
                        "How do I stop the singularity bomb from going off?",
                      children: [],
                    },
                    {
                      kind: "menu",
                      id: "misc-brown-singularity-detonator",
                      title:
                        "How do I get the detonator from the singularity bomb?",
                      children: [],
                    },
                    {
                      kind: "menu",
                      id: "misc-brown-weird-bird",
                      title: "What is the deal with that weird bird?",
                      children: [
                        {
                          kind: "hint",
                          id: "TPADBR6_1",
                          title: "Hint One",
                          description:
                            "If you haven't been to the remote medical facility, don't read any further.",
                        },
                        {
                          kind: "hint",
                          id: "TPADBR6_2",
                          title: "Hint Two",
                          description:
                            "It seems to match the description of one of the missing creatures. This particular creature has the ability to mimic complex sounds and speech, much like a parrot.",
                        },
                        {
                          kind: "hint",
                          id: "TPADBR6_3",
                          title: "Hint Three",
                          description:
                            "...it also seems to be the sole survivor of the grisly scene that played itself out here.",
                        },
                        {
                          kind: "hint",
                          id: "TPADBR6_4",
                          title: "Hint Four",
                          description:
                            "It remembers a lot of what it heard. If you wait long enough, it will provide you with some useful information.",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
