import type { MenuBranchNode } from "../game/types/menuTypes";

export const levelThreeHints: MenuBranchNode = {
  kind: "menu",
  id: "level3-root",
  title: "HINTS FOR LEVEL THREE",
  children: [
    // ======================================================================
    // THE HUB
    // ======================================================================
    {
      kind: "menu",
      id: "l3-park",
      title: "THE HUB",
      children: [
        // ------------------------------------------------------------------
        // How do I access 'The Park'?
        // ------------------------------------------------------------------
        {
          kind: "menu",
          id: "l3-park-access",
          title: "How do I access 'The Park'?",
          children: [
            {
              kind: "hint",
              id: "L3HUB1_1",
              title: "Hint One",
              description:
                "Examine the door carefully, it looks like you need to provide some kind of badge, or pass in order to get in. You need to find this pass to gain entrance.",
            },
            {
              kind: "hint",
              id: "L3HUB1_2",
              title: "Hint Two",
              description:
                "The pass is not lying around in open view, though. Have you listened to all of the answering machine messages in the different living quarters?",
            },
            {
              kind: "hint",
              id: "L3HUB1_3",
              title: "Hint Three",
              description:
                "It appears that someone named Kira has obtained such a pass that was picked up by a friend named Warren. Kira was told by another friend that Warren said to let Kira know he had left the pass for her so she could pick it up at his place later. He said he left it in 'the usual place.'",
            },
            {
              kind: "hint",
              id: "L3HUB1_4",
              title: "Hint Four",
              description:
                "Since everyone is dead, it's difficult to know which quarters belonged to a man named Warren. Try examining all the different objects in the different rooms.",
            },
            {
              kind: "hint",
              id: "L3HUB1_5",
              title: "Hint Five",
              description:
                "One of the rooms seems to have been the quarters of an amateur musician...a man's body is present in the bedroom, and there is a print on the wall signed by a musician which says 'To Warren'. These are Warren's quarters, the pass is in here somewhere.",
            },
            {
              kind: "hint",
              id: "L3HUB1_6",
              title: "Hint Six",
              description:
                "Warren wanted Kira to be able to pick it up but not just anyone. Where might someone leave a key, or similar item, for a friend that needed to drop by and no one was there to let them in?",
            },
            {
              kind: "hint",
              id: "L3HUB1_7",
              title: "Hint Seven",
              description: "A lot of people leave a key under the welcome mat.",
            },
            {
              kind: "hint",
              id: "L3HUB1_8",
              title: "Hint Eight",
              description:
                "Warren seems to have an ugly shag piece of carpet with a gap under it just inside the doorway. He left the pass under the mat.",
            },
          ],
        },

        // ------------------------------------------------------------------
        // I'm in 'The Park' and I still need help.
        // ------------------------------------------------------------------
        {
          kind: "menu",
          id: "l3-park-more-help",
          title: "I'm in 'The Park' and I still need help.",
          children: [
            // ------------------------ The Library --------------------------
            {
              kind: "menu",
              id: "l3-library",
              title: "The Library",
              children: [
                {
                  kind: "menu",
                  id: "l3-library-what-do-i-do",
                  title: "What do I do here?",
                  children: [
                    {
                      kind: "hint",
                      id: "L3LIB1_1",
                      title: "Hint One",
                      description:
                        "Well, the obvious answer is to access reference material, but there don't seem to be any books here.",
                    },
                    {
                      kind: "hint",
                      id: "L3LIB1_2",
                      title: "Hint Two",
                      description:
                        "This is far in the future; they must not use books any more. They must use some other method of accessing the information they need.",
                    },
                    {
                      kind: "hint",
                      id: "L3LIB1_3",
                      title: "Hint Three",
                      description:
                        "...those strange sarcophagus-like reliefs must have something to do with it.",
                    },
                  ],
                },
                {
                  kind: "menu",
                  id: "l3-library-sarcophagi",
                  title: "What do I do with those weird sarcophagai?",
                  children: [
                    {
                      kind: "hint",
                      id: "L3LIB2_1",
                      title: "Hint One",
                      description:
                        "They can't just be for decoration...they have LEDs and cables running through them. They must be electronic.",
                    },
                    {
                      kind: "hint",
                      id: "L3LIB2_2",
                      title: "Hint Two",
                      description:
                        "However, the power seems to be out. Whatever they are, they won't be of much use until you can turn them on.",
                    },
                    {
                      kind: "hint",
                      id: "L3LIB2_3",
                      title: "Hint Three",
                      description:
                        "...you can't do it from here. If you haven't found a way to access the yellow security doors, don't read any further.",
                    },
                    {
                      kind: "hint",
                      id: "L3LIB2_4",
                      title: "Hint Four",
                      description:
                        "...if you have accessed the yellow security area, consult the section on the Power Grid in the LEVEL FOUR menu.",
                    },
                  ],
                },
              ],
            },

            // ------------------------ The Gymnasium ------------------------
            {
              kind: "menu",
              id: "l3-gym",
              title: "The Gymnasium",
              children: [],
            },

            // --------------------- The Movie Theater -----------------------
            {
              kind: "menu",
              id: "l3-movie-theater",
              title: "The Movie Theater",
              children: [
                {
                  kind: "menu",
                  id: "l3-movie-dark",
                  title: "The theater is dark!  What do I do?",
                  children: [
                    {
                      kind: "hint",
                      id: "L3MOV1_1",
                      title: "Hint One",
                      description:
                        "You'll need to get some light in there, or you're not going to be able to see much. There didn't seem to be any kind of portable light source lying around on level three anywhere.",
                    },
                    {
                      kind: "hint",
                      id: "L3MOV1_2",
                      title: "Hint Two",
                      description:
                        "...movie theaters all have one sure method of sourcing light, though.",
                    },
                    {
                      kind: "hint",
                      id: "L3MOV1_3",
                      title: "Hint Three",
                      description: "Every movie theater has a projector.",
                    },
                  ],
                },
                {
                  kind: "menu",
                  id: "l3-movie-projection-room",
                  title: "What do I do in the Projection Room?",
                  children: [
                    {
                      kind: "hint",
                      id: "L3MOV2_1",
                      title: "Hint One",
                      description:
                        "The projector might be a handy way to get some light down into the seating area...",
                    },
                    {
                      kind: "hint",
                      id: "L3MOV2_2",
                      title: "Hint Two",
                      description:
                        "...but it doesn't seem to be working properly. Have you tried turning it on?",
                    },
                    {
                      kind: "hint",
                      id: "L3MOV2_3",
                      title: "Hint Three",
                      description:
                        "Hmm...it's still not working. Have you examined the projector closely?",
                    },
                    {
                      kind: "hint",
                      id: "L3MOV2_4",
                      title: "Hint Four",
                      description:
                        "There's some kind of slim cartrage in it...that must be where the movie is stored but it looks damaged. Maybe it's causing a problem with the projector...besides, you don't want to watch a movie; a nice big white light on the screen would be best for your purposes.",
                    },
                    {
                      kind: "hint",
                      id: "L3MOV2_5",
                      title: "Hint Five",
                      description:
                        "...yank out the cartrage and you'll get enough light to see by in the seating area.",
                    },
                  ],
                },
                {
                  kind: "menu",
                  id: "l3-movie-seating",
                  title: "What do I do in the Seating Area?",
                  children: [
                    {
                      kind: "hint",
                      id: "L3MOV3_1",
                      title: "Hint One",
                      description:
                        "There's a few dead bodies in here, but it looks like most people bolted. Maybe you can find something useful lying around.",
                    },
                    {
                      kind: "hint",
                      id: "L3MOV3_2",
                      title: "Hint Two",
                      description:
                        "Sometimes people drop things in, under, or around their seats in movie theaters, especially when they're distracted.",
                    },
                    {
                      kind: "hint",
                      id: "L3MOV3_3",
                      title: "Hint Three",
                      description:
                        "Look under the seats; someone dropped their wallet.",
                    },
                    {
                      kind: "hint",
                      id: "L3MOV3_4",
                      title: "Hint Four",
                      description:
                        "You can also sit down here to trigger a memory.",
                    },
                  ],
                },
              ],
            },

            // ------------------------ The Restaurant -----------------------
            {
              kind: "menu",
              id: "l3-restaurant",
              title: "The Restaurant",
              children: [
                {
                  kind: "menu",
                  id: "l3-restaurant-dining",
                  title: "The Dining Area",
                  children: [
                    {
                      kind: "menu",
                      id: "l3-restaurant-what-happened",
                      title: "What happened here?  Where is everyone?",
                      children: [
                        {
                          kind: "hint",
                          id: "L3REST1_1",
                          title: "Hint One",
                          description:
                            "Looks like they didn't even finish their meals; they must have left in a hurry.",
                        },
                        {
                          kind: "hint",
                          id: "L3REST1_2",
                          title: "Hint Two",
                          description:
                            "Didn't one of the answering machine messages say that a group of people were going to take refuge in The Park?",
                        },
                        {
                          kind: "hint",
                          id: "L3REST1_3",
                          title: "Hint Three",
                          description:
                            "I guess it turned out to be not so safe after all.",
                        },
                      ],
                    },
                    {
                      kind: "menu",
                      id: "l3-restaurant-wine-glass",
                      title: "Can I use the wine glass for anything?",
                      children: [
                        {
                          kind: "hint",
                          id: "L3REST2_1",
                          title: "Hint One",
                          description:
                            "The wine is gone so you can't get buzzed.",
                        },
                        {
                          kind: "hint",
                          id: "L3REST2_2",
                          title: "Hint Two",
                          description:
                            "You can use it to carry small amounts of liquid in.",
                        },
                        {
                          kind: "hint",
                          id: "L3REST2_3",
                          title: "Hint Three",
                          description:
                            "Sniffing the glass will trigger a memory.",
                        },
                      ],
                    },
                  ],
                },
                {
                  kind: "menu",
                  id: "l3-kitchen",
                  title: "The Kitchen",
                  children: [
                    {
                      kind: "menu",
                      id: "l3-kitchen-cooler",
                      title: "What do I do with the cooler?",
                      children: [
                        {
                          kind: "hint",
                          id: "L3KIT1_1",
                          title: "Hint One",
                          description:
                            "Well, it can contain things, which could make juggling inventory a little easier. Maybe it has other uses as well, have you examined it?",
                        },
                        {
                          kind: "hint",
                          id: "L3KIT1_2",
                          title: "Hint Two",
                          description:
                            "It's got a dial on it with four settings. Also, when you open it, a faint bluish field seems to be in place over the opening. Experiment with changing the dial settings with the cooler open so you can see the results first hand.",
                        },
                        {
                          kind: "hint",
                          id: "L3KIT1_3",
                          title: "Hint Three",
                          description:
                            "The settings seem to be 'Off', 'Room Temperature', 'Cool', and 'Freezing'.",
                        },
                        {
                          kind: "hint",
                          id: "L3KIT1_4",
                          title: "Hint Four",
                          description:
                            "Cooler technology seems to have come a long way; setting the dial to 3 (freezing) seems to instantly freeze whatever is inside.",
                        },
                        {
                          kind: "hint",
                          id: "L3KIT1_5",
                          title: "Hint Five",
                          description:
                            "No doubt that will come in handy at some point!",
                        },
                      ],
                    },
                  ],
                },
                {
                  kind: "menu",
                  id: "l3-bathrooms",
                  title: "The Bathrooms",
                  children: [
                    {
                      kind: "menu",
                      id: "l3-mens-room",
                      title: "What can I do in the Men's Room?",
                      children: [
                        {
                          kind: "hint",
                          id: "L3MROOM1_1",
                          title: "Hint One",
                          description:
                            "Besides the obvious two things, there seems to be a note on the stall door here, which is closed.",
                        },
                        {
                          kind: "hint",
                          id: "L3MROOM1_2",
                          title: "Hint Two",
                          description:
                            "The note says the author 'will not be taken alive'. That sounds a little ominous, you might want to proceed with caution.",
                        },
                        {
                          kind: "hint",
                          id: "L3MROOM1_3",
                          title: "Hint Three",
                          description:
                            "Take a peek under the stall door before opening it...",
                        },
                        {
                          kind: "hint",
                          id: "L3MROOM1_4",
                          title: "Hint Four",
                          description:
                            "It looks like some people have reacted to the emergency a little more drastically than others...that satchel of explosives looks like it might come in handy though. You'll need to find a way to get the stall door open without triggering it.",
                        },
                        {
                          kind: "hint",
                          id: "L3MROOM1_5",
                          title: "Hint Five",
                          description:
                            "The trigger is right against the door, though, and the door opens inward. You can't reach the trigger by reaching under the stall...there must be another way.",
                        },
                        {
                          kind: "hint",
                          id: "L3MROOM1_6",
                          title: "Hint Six",
                          description:
                            "It looks like the explosive uses three components; the satchel itself, the trigger, and a detonator. If the detonator were out of the picture, the trigger would have nothing to transmit to.",
                        },
                        {
                          kind: "hint",
                          id: "L3MROOM1_7",
                          title: "Hint Seven",
                          description:
                            "You have even less of a chance of reaching the detonator than you do the trigger. Maybe there's some useful information in the Library...",
                        },
                        {
                          kind: "hint",
                          id: "L3MROOM1_8",
                          title: "Hint Eight",
                          description:
                            "The Library will clue you into a weakness that Z4 charges have...if you haven't accessed Level Two don't read any further.",
                        },
                        {
                          kind: "hint",
                          id: "L3MROOM1_9",
                          title: "Hint Nine",
                          description:
                            "...if you haven't gotten the safe open, don't read any further.",
                        },
                        {
                          kind: "hint",
                          id: "L3MROOM1_10",
                          title: "Hint Ten",
                          description:
                            "The EMP will fry the detonator, leaving the satchel and the trigger intact. You'll be able to get into the stall and get the explosive.",
                        },
                        {
                          kind: "hint",
                          id: "L3MROOM1_11",
                          title: "Hint Eleven",
                          description:
                            "...of course, you'll need to find a new detonator if you plan on using it!",
                        },
                      ],
                    },
                    {
                      kind: "menu",
                      id: "l3-womens-room",
                      title: "What can I do in the Women's Room?",
                      children: [
                        {
                          kind: "hint",
                          id: "LR_1",
                          title: "Hint One",
                          description: "Pee?",
                        },
                        {
                          kind: "hint",
                          id: "LR_2",
                          title: "Hint Two",
                          description: "Check out the corpse.",
                        },
                        {
                          kind: "hint",
                          id: "LR_3",
                          title: "Hint Three",
                          description:
                            "Normally you shouldn't rifle through a woman's handbag, but these are unique circumstances.",
                        },
                        {
                          kind: "hint",
                          id: "LR_4",
                          title: "Hint Four",
                          description: "I wonder what that bracelet is for..?",
                        },
                      ],
                    },
                    {
                      kind: "menu",
                      id: "l3-bathrooms-misc",
                      title: "Is there anything else I can do here?",
                      children: [
                        {
                          kind: "hint",
                          id: "L3RMISC_1",
                          title: "Hint One",
                          description: "You could make some phone calls.",
                        },
                        {
                          kind: "hint",
                          id: "L3RMISC_2",
                          title: "Hint Two",
                          description: "You could check out the roof...",
                        },
                        {
                          kind: "hint",
                          id: "L3RMISC_3",
                          title: "Hint Three",
                          description:
                            "Sniffing the clove ball in the kitchen area will trigger a memory.",
                        },
                      ],
                    },
                  ],
                },
                {
                  kind: "menu",
                  id: "l3-squirrel",
                  title: "The Squirrel",
                  children: [
                    {
                      kind: "hint",
                      id: "L3SQRL_1",
                      title: "Hint One",
                      description:
                        "It's hard to say whether mankind decided to bring squirrels along for their voyage, or they were ferreting out scraps and just ended up along for the ride. Either way, the squirrel seems to be making a go of it somehow.",
                    },
                    {
                      kind: "hint",
                      id: "L3SQRL_2",
                      title: "Hint Two",
                      description:
                        "It must have found something to eat, but squirrels never pass up food if it's something they like. What might interest a squirrel?",
                    },
                    {
                      kind: "hint",
                      id: "L3SQRL_3",
                      title: "Hint Three",
                      description:
                        "If you haven't accessed the green security door, don't read any further.",
                    },
                    {
                      kind: "hint",
                      id: "L3SQRL_4",
                      title: "Hint Four",
                      description:
                        "If you haven't put out the fire in the botanical area, don't read any further.",
                    },
                    {
                      kind: "hint",
                      id: "L3SQRL_5",
                      title: "Hint Five",
                      description:
                        "It looks like a nut tree just barely survived the fire. It's a pretty safe bet that squirrels like nuts...",
                    },
                    {
                      kind: "hint",
                      id: "L3SQRL_6",
                      title: "Hint Six",
                      description:
                        "Hey, he didn't eat it, he ran off with it! In addition to their appetite, squirrels are known for something else...",
                    },
                    {
                      kind: "hint",
                      id: "L3SQRL_7",
                      title: "Hint Seven",
                      description:
                        "Squirrels think ahead; they cache their food so they'll have something to eat later. Where did the squirrel run when it took the nut?",
                    },
                    {
                      kind: "hint",
                      id: "L3SQRL_8",
                      title: "Hint Eight",
                      description:
                        "There seems to be some disturbed earth near the base of the tree. Dig it up.",
                    },
                    {
                      kind: "hint",
                      id: "L3SQRL_9",
                      title: "Hint Nine",
                      description:
                        "Looks like it grabbed something else while it was foraging.",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    // ======================================================================
    // THE MEDICAL FACILITY
    // ======================================================================
    {
      kind: "menu",
      id: "l3-medical-facility",
      title: "THE MEDICAL FACILITY",
      children: [
        // ------------------------------ THE LAB ---------------------------
        {
          kind: "menu",
          id: "l3-lab",
          title: "THE LAB",
          children: [
            {
              kind: "menu",
              id: "l3-lab-gun",
              title: "What can I do with the strange gun?",
              children: [
                {
                  kind: "hint",
                  id: "L3LAB_1",
                  title: "Hint One",
                  description:
                    "It doesn't look like your typical firearm...maybe there's some significance to the fact that it's found in the medical facility.",
                },
                {
                  kind: "hint",
                  id: "L3LAB_2",
                  title: "Hint Two",
                  description: "Have you tried firing it?",
                },
                {
                  kind: "hint",
                  id: "L3LAB_3",
                  title: "Hint Three",
                  description:
                    "It doesn't seem to do much, but it seemed like maybe it did something, maybe something you couldn't see...",
                },
                {
                  kind: "hint",
                  id: "L3LAB_4",
                  title: "Hint Four",
                  description: "It's not broken.",
                },
                {
                  kind: "hint",
                  id: "L3LAB_5",
                  title: "Hint Five",
                  description: "Have you examined the gun?",
                },
                {
                  kind: "hint",
                  id: "L3LAB_6",
                  title: "Hint Six",
                  description:
                    "Have you asked the Library about the name printed on the side of the strange gun?",
                },
                {
                  kind: "hint",
                  id: "L3LAB_7",
                  title: "Hint Seven",
                  description: "What else was found near the gun?",
                },
                {
                  kind: "hint",
                  id: "L3LAB_8",
                  title: "Hint Eight",
                  description:
                    "That electronic head-dress seems pretty high-tech...kind of like the gun itself...have you examined it?",
                },
                {
                  kind: "hint",
                  id: "L3LAB_9",
                  title: "Hint Nine",
                  description:
                    "The two objects appear related. Wear the cap, then try firing the gun again...",
                },
                {
                  kind: "hint",
                  id: "L3LAB_10",
                  title: "Hint Ten",
                  description:
                    "Still nothing? Maybe you're not shooting the right thing. In fact, though it looks like a gun, maybe 'shooting' isn't the correct term.",
                },
                {
                  kind: "hint",
                  id: "L3LAB_11",
                  title: "Hint Eleven",
                  description:
                    "While wearing the cap, try shooting the cat; don't worry, it won't be harmed, and the experiment should tell you exactly what the gun is for.",
                },
              ],
            },
            {
              kind: "menu",
              id: "l3-lab-head-dress",
              title: "What can I do with the electronic head-dress?",
              children: [
                {
                  kind: "hint",
                  id: "L3MLAB_1",
                  title: "Hint One",
                  description:
                    "It looks a little high-tech to be a fashion statement, it must have a purpose.",
                },
                {
                  kind: "hint",
                  id: "L3MLAB_2",
                  title: "Hint Two",
                  description: "Have you tried putting it on?",
                },
                {
                  kind: "hint",
                  id: "L3MLAB_3",
                  title: "Hint Three",
                  description:
                    "It created a weird sensation when you put it on, have you tried examining it?",
                },
                {
                  kind: "hint",
                  id: "L3MLAB_4",
                  title: "Hint Four",
                  description:
                    "There's a name printed on it...have you tried asking the Library about the name?",
                },
                {
                  kind: "hint",
                  id: "L3MLAB_5",
                  title: "Hint Five",
                  description:
                    "It still doesn't seem to do much...did you find anything else near the cap?",
                },
                {
                  kind: "hint",
                  id: "L3MLAB_6",
                  title: "Hint Six",
                  description:
                    "Try examining other objects you found near the cap.",
                },
                {
                  kind: "hint",
                  id: "L3MLAB_7",
                  title: "Hint Seven",
                  description:
                    "Okay, two of the objects seem to have been manufactured by the same company...they could be related.",
                },
                {
                  kind: "hint",
                  id: "L3MLAB_8",
                  title: "Hint Eight",
                  description:
                    "Perhaps they are actually components of the same device...",
                },
                {
                  kind: "hint",
                  id: "L3MLAB_9",
                  title: "Hint Nine",
                  description: "Try wearing the cap then firing the gun.",
                },
                {
                  kind: "hint",
                  id: "L3MLAB_10",
                  title: "Hint Ten",
                  description:
                    "Still nothing? Maybe you're not shooting the right thing. In fact, though it looks like a gun, maybe 'shooting' isn't the correct term.",
                },
                {
                  kind: "hint",
                  id: "L3MLAB_11",
                  title: "Hint Eleven",
                  description:
                    "While wearing the cap, try shooting the cat; don't worry, it won't be harmed, and the experiment should tell you exactly what the cap is for.",
                },
              ],
            },
          ],
        },

        // --------------------- THE REST OF THE FACILITY -------------------
        {
          kind: "menu",
          id: "l3-rest-of-facility",
          title: "THE REST OF THE FACILITY",
          children: [
            {
              kind: "menu",
              id: "l3-patient-care",
              title: "PATIENT CARE",
              children: [
                {
                  kind: "menu",
                  id: "l3-patient-serum",
                  title: "I found some serum, what can I do with it?",
                  children: [
                    {
                      kind: "hint",
                      id: "L3PCS_1",
                      title: "Hint One",
                      description:
                        "Well, you'll need to find a method of injecting it if you want to try and inject it into yourself or something else...",
                    },
                    {
                      kind: "hint",
                      id: "L3PCS_2",
                      title: "Hint Two",
                      description:
                        "The names are pretty cryptic...they don't give much clue as to what they do. You could try experimenting, but that might not be too smart.",
                    },
                    {
                      kind: "hint",
                      id: "L3PCS_3",
                      title: "Hint Three",
                      description:
                        "Maybe there's a way to look up what the names mean, so you can have an idea of what they're for before you try and use them.",
                    },
                    {
                      kind: "hint",
                      id: "L3PCS_4",
                      title: "Hint Four",
                      description:
                        "Look around...you'll know the area when you find it.",
                    },
                  ],
                },
                {
                  kind: "menu",
                  id: "l3-patient-blood-bag",
                  title: "I found a blood bag...what can I do with it?",
                  children: [
                    {
                      kind: "hint",
                      id: "L3PCBB_1",
                      title: "Hint One",
                      description:
                        "You're not qualified to attempt a transfusion of any kind...",
                    },
                    {
                      kind: "hint",
                      id: "L3PCBB_2",
                      title: "Hint Two",
                      description:
                        "You're not a vampire, so you can't eat it...",
                    },
                    {
                      kind: "hint",
                      id: "L3PCBB_3",
                      title: "Hint Three",
                      description:
                        "There aren't any vampires here as far as you know so...wait...just a minute...",
                    },
                    {
                      kind: "hint",
                      id: "L3PCBB_4",
                      title: "Hint Four",
                      description:
                        "SOMETHING around here seems to have a taste for blood...",
                    },
                    {
                      kind: "hint",
                      id: "L3PCBB_5",
                      title: "Hint Five",
                      description:
                        "Normally you should waste this kind of thing, but this is an emergency. Maybe it could make a useful distraction...",
                    },
                    {
                      kind: "hint",
                      id: "L3PCBB_6",
                      title: "Hint Six",
                      description:
                        "Of course, nothing's going to be able to smell it in that bag.",
                    },
                    {
                      kind: "hint",
                      id: "L3PCBB_7",
                      title: "Hint Seven",
                      description:
                        "You'll need to puncture the bag (the hairpin or the scalpel will to nicely) then pour the blood into a portable container (of which there are a few scattered around).",
                    },
                  ],
                },
                {
                  kind: "menu",
                  id: "l3-young-man",
                  title: "There's a young man here, can I help him?",
                  children: [
                    {
                      kind: "hint",
                      id: "L3YM_1",
                      title: "Hint One",
                      description: "Well, try examining him.",
                    },
                    {
                      kind: "hint",
                      id: "L3YM_2",
                      title: "Hint Two",
                      description:
                        "He's still alive...he doesn't look very good though. Have you read his chart?",
                    },
                    {
                      kind: "hint",
                      id: "L3YM_3",
                      title: "Hint Three",
                      description:
                        "That doesn't sound good. It looks like a trained medical staff has already done all they can for him, it's unlikely you're going to be able to revive him.",
                    },
                    {
                      kind: "hint",
                      id: "L3YM_4",
                      title: "Hint Four",
                      description:
                        "Still...aside from you he's one of the only people still alive here. He also must have been around when whatever happened here went down. If only there was some way you could communicate with him...",
                    },
                    {
                      kind: "hint",
                      id: "L3YM_5",
                      title: "Hint Five",
                      description: "Maybe there is a way...",
                    },
                    {
                      kind: "hint",
                      id: "L3YM_6",
                      title: "Hint Six",
                      description:
                        "There seems to be some pretty weird technology lying around...maybe something can help here.",
                    },
                    {
                      kind: "hint",
                      id: "L3YM_7",
                      title: "Hint Seven",
                      description: "Maybe something nearby...",
                    },
                    {
                      kind: "hint",
                      id: "L3YM_8",
                      title: "Hint Eight",
                      description:
                        "You may need special access to get to it...",
                    },
                    {
                      kind: "hint",
                      id: "L3YM_9",
                      title: "Hint Nine",
                      description:
                        "Don't read any further until you figure out how to interface with the young man.",
                    },
                    {
                      kind: "hint",
                      id: "L3YM_10",
                      title: "Hint Ten",
                      description:
                        "He's pretty far gone, but his mind seems intact...maybe there are more memories kicking around in there...",
                    },
                    {
                      kind: "hint",
                      id: "L3YM_11",
                      title: "Hint Eleven",
                      description:
                        "Looks like his last hours weren't so great. It sounds like he stashed something somewhere, though. Something important...",
                    },
                    {
                      kind: "hint",
                      id: "L3YM_12",
                      title: "Hint Twelve",
                      description:
                        "The last thing he remembered seeing before he blacked out was a door with a '7' on it.",
                    },
                    {
                      kind: "hint",
                      id: "L3YM_13",
                      title: "Hint Thirteen",
                      description:
                        "You've seen doors with numbers on them, maybe you should visit one with the number 7 on it and retrace his steps.",
                    },
                  ],
                },
              ],
            },

            {
              kind: "menu",
              id: "l3-or",
              title: "THE OR",
              children: [],
            },

            {
              kind: "menu",
              id: "l3-medical-storage",
              title: "MEDICAL STORAGE",
              children: [
                {
                  kind: "menu",
                  id: "l3-medical-storage-locked",
                  title: "I can't get in!",
                  children: [
                    {
                      kind: "hint",
                      id: "L3MS_1",
                      title: "Hint One",
                      description: "It's locked. You need to find the key.",
                    },
                    {
                      kind: "hint",
                      id: "L3MS_2",
                      title: "Hint Two",
                      description:
                        "There aren't that many old-fashioned keys lying around. You'll find it.",
                    },
                    {
                      kind: "hint",
                      id: "L3MS_3",
                      title: "Hint Three",
                      description: "Seriously, that's all there is to it.",
                    },
                    {
                      kind: "hint",
                      id: "L3MS_4",
                      title: "Hint Four",
                      description:
                        "I'm not telling you exactly where the key is, I just wanted to pad out this hint so it would look more complicated than it is.",
                    },
                    {
                      kind: "hint",
                      id: "L3MS_5",
                      title: "Hint Five",
                      description: "Seriously, I did.",
                    },
                    {
                      kind: "hint",
                      id: "L3MS_6",
                      title: "Hint Six",
                      description: "So sue me.",
                    },
                  ],
                },
                {
                  kind: "menu",
                  id: "l3-medical-storage-inside",
                  title: "Ok, I'm in. Now what?",
                  children: [
                    {
                      kind: "hint",
                      id: "L3IMS_1",
                      title: "Hint One",
                      description:
                        "Well, of the objects here, one is pretty self-explanitory. The other one seems a little weird though. It looks like some kind of electronic wand or something, have you tried waving it?",
                    },
                    {
                      kind: "hint",
                      id: "L3IMS_2",
                      title: "Hint Two",
                      description:
                        "That's not it. The end of the wand seems interesting, maybe that's a clue regarding its use.",
                    },
                    {
                      kind: "hint",
                      id: "L3IMS_3",
                      title: "Hint Three",
                      description: "Try touching something with it.",
                    },
                    {
                      kind: "hint",
                      id: "L3IMS_4",
                      title: "Hint Four",
                      description:
                        "Still nothing? Maybe you're touching the wrong thing. Try something else.",
                    },
                    {
                      kind: "hint",
                      id: "L3IMS_5",
                      title: "Hint Five",
                      description: "Try touching something organic.",
                    },
                    {
                      kind: "hint",
                      id: "L3IMS_6",
                      title: "Hint Six",
                      description:
                        "There's an awful lot of bodies and other...organic samples...lying around, it might be useful to know who they are.",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    // ======================================================================
    // THE SPA
    // ======================================================================
    {
      kind: "menu",
      id: "l3-spa",
      title: "THE SPA",
      children: [
        {
          kind: "hint",
          id: "L3SPA_1",
          title: "Hint One",
          description:
            "Well, the other two rooms are pretty accessable, but the sauna seems to already have an occupant...",
        },
        {
          kind: "hint",
          id: "L3SPA_2",
          title: "Hint Two",
          description:
            "Whatever is in there, it doesn't seem to want to come out into the light. You should be okay as long as you stay in the light.",
        },
        {
          kind: "hint",
          id: "L3SPA_3",
          title: "Hint Three",
          description:
            "Of course, whatever it is, you need to get it out of there if you're ever going to get inside. Looking at the rooms you CAN access in the Spa area, what might be relevant from a light standpoint?",
        },
        {
          kind: "hint",
          id: "L3SPA_4",
          title: "Hint Four",
          description:
            "...there's a light switch in the main Spa, but if you flip it off that thing will probably just end up in the room with you!",
        },
        {
          kind: "hint",
          id: "L3SPA_5",
          title: "Hint Five",
          description:
            "...it also looks like the lights are out in the Steam Room, and the only light in there streams in from the main Spa.",
        },
        {
          kind: "hint",
          id: "L3SPA_6",
          title: "Hint Six",
          description:
            "Whatever is in the sauna, it must want something...have you explored what you can of the ship? Have you seen anything suspicious?",
        },
        {
          kind: "hint",
          id: "L3SPA_7",
          title: "Hint Seven",
          description:
            "Some of the bodies seem to have died of some kind of sickness, but quite a few others seem to have been attacked by some kind of creature.",
        },
        {
          kind: "hint",
          id: "L3SPA_8",
          title: "Hint Eight",
          description: "...that drained them of their blood.",
        },
        {
          kind: "hint",
          id: "L3SPA_9",
          title: "Hint Nine",
          description:
            "If you haven't explored the Medical Facility don't read any further.",
        },
        {
          kind: "hint",
          id: "L3SPA_10",
          title: "Hint Ten",
          description:
            "If you haven't figured out how to safely transport the blood, don't read any further.",
        },
        {
          kind: "hint",
          id: "L3SPA_11",
          title: "Hint Eleven",
          description:
            "Hmm...if you bring the blood into the Spa, the thing in the sauna seems to get excited...",
        },
        {
          kind: "hint",
          id: "L3SPA_12",
          title: "Hint Twelve",
          description:
            "It must have a keen sense of smell...maybe you can use the blood to lure it.",
        },
        {
          kind: "hint",
          id: "L3SPA_13",
          title: "Hint Thirteen",
          description:
            "...of course, you'll need to be able to safely contain it.",
        },
        {
          kind: "hint",
          id: "L3SPA_14",
          title: "Hint Fourteen",
          description:
            "Place the blood bag in the Steam Room and make sure the door is open. Head into the Spa and open the Sauna door. Flip the light switch to turn off the lights; the thing in the sauna is so excited by the scent of blood that it barrels right past you and into the Steam Room. Flip the light switch again; the lights come back on and the thing is now effectively trapped in the Steam Room, as long as you leave the light in the Spa on. Just make sure you don't leave anything useful in the Steam Room!",
        },
      ],
    },
  ],
};
