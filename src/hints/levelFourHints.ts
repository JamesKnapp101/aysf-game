import type { MenuBranchNode } from "../game/types/menuTypes";

export const levelFourHints: MenuBranchNode = {
  kind: "menu",
  id: "level4-root",
  title: "HINTS FOR LEVEL FOUR",
  children: [
    // ======================================================================
    // Yellow security door / Power Station
    // ======================================================================
    {
      kind: "menu",
      id: "l4-yellow-door",
      title: "How do I get past the yellow security door?",
      children: [
        {
          kind: "hint",
          id: "L4PWR1_1",
          title: "Hint One",
          description:
            "It looks like it requires some kind of security badge in order to get in.",
        },
        {
          kind: "hint",
          id: "L4PWR1_2",
          title: "Hint Two",
          description:
            "You'll have to find the right badge. You'll know it when you find it.",
        },
      ],
    },
    {
      kind: "menu",
      id: "l4-yellow-door-after",
      title:
        "Okay, I've gotten past the yellow security door, and I'm still stuck!",
      children: [
        {
          kind: "hint",
          id: "L4PWR2_1",
          title: "Hint One",
          description:
            "It looks like the main power station is offline; you'll need to manually power it back up.",
        },
        {
          kind: "hint",
          id: "L4PWR2_2",
          title: "Hint Two",
          description:
            "There seems to be a keyhole on the power station, with a button next to it. That must have something to do with it.",
        },
        {
          kind: "hint",
          id: "L4PWR2_3",
          title: "Hint Three",
          description:
            "Obtaining the key is a different puzzle. You'll need to get your hands on it before you can proceed.",
        },
        {
          kind: "hint",
          id: "L4PWR2_4",
          title: "Hint Four",
          description: "If you HAVE the key, put it in the keyhole!",
        },
        {
          kind: "hint",
          id: "L4PWR2_5",
          title: "Hint Five",
          description: "...perhaps you should turn the key.",
        },
        {
          kind: "hint",
          id: "L4PWR2_6",
          title: "Hint Six",
          description: "That made the button start flashing. Push it.",
        },
        {
          kind: "hint",
          id: "L4PWR2_7",
          title: "Hint Seven",
          description:
            "The power station is on, but you'll need to log in and manually restart the systems.",
        },
        {
          kind: "hint",
          id: "L4PWR2_8",
          title: "Hint Eight",
          description:
            "Use the 'LOGIN' command here and you'll access the Power Station Main Menu. You can turn many of the ship's systems on and off here.",
        },
        {
          kind: "menu",
          id: "l4-power-station-uses",
          title: "What can I use the Power Station for?",
          children: [
            {
              kind: "hint",
              id: "L4PWR3_1",
              title: "Hint One",
              description:
                "I'd encourage you to experiment; you shouldn't hurt anything too bad as long as you don't blow the power station up.",
            },
            {
              kind: "hint",
              id: "L4PWR3_2",
              title: "Hint Two",
              description:
                "If you must know, you can route power to the ship's library.",
            },
            {
              kind: "hint",
              id: "L4PWR3_3",
              title: "Hint Three",
              description:
                "...you could route power to the lights on level five.",
            },
            {
              kind: "hint",
              id: "L4PWR3_4",
              title: "Hint Four",
              description:
                "...you could route power to the ship's teleportation pads.",
            },
            {
              kind: "hint",
              id: "L4PWR3_5",
              title: "Hint Five",
              description:
                "...but there's one really important thing you HAVE to do...",
            },
            {
              kind: "hint",
              id: "L4PWR3_6",
              title: "Hint Six",
              description:
                "What has the ship's computer been issuing warnings about?",
            },
            {
              kind: "hint",
              id: "L4PWR3_7",
              title: "Hint Seven",
              description:
                "The ship's engines are spinning out of control...they're overheating and will eventually explode!",
            },
            {
              kind: "hint",
              id: "L4PWR3_8",
              title: "Hint Eight",
              description:
                "You'd better shut them down. The first step is to disengage the power lock on the engines from the power station.",
            },
          ],
        },
      ],
    },

    // ======================================================================
    // Green security door / Botanical area
    // ======================================================================
    {
      kind: "menu",
      id: "l4-green-door",
      title: "How do I get past the green security door?",
      children: [
        {
          kind: "hint",
          id: "L4BOT1_1",
          title: "Hint One",
          description:
            "It looks like it requires some kind of security badge in order to get in.",
        },
        {
          kind: "hint",
          id: "L4BOT1_2",
          title: "Hint Two",
          description:
            "You'll have to find the right badge. You'll know it when you find it.",
        },
      ],
    },
    {
      kind: "menu",
      id: "l4-green-door-after",
      title:
        "Okay, I've gotten past the green security door, and I'm still stuck!",
      children: [
        {
          kind: "menu",
          id: "l4-bot-fire",
          title: "How do I put out the fire?",
          children: [
            {
              kind: "hint",
              id: "L4BOT2_1",
              title: "Hint One",
              description:
                "The fire is huge, you'll never put it out with a bucket of water or extinguisher.",
            },
            {
              kind: "hint",
              id: "L4BOT2_2",
              title: "Hint Two",
              description:
                "The botanical area is equipt with a sprinkler system, it just didn't activate for some reason...",
            },
            {
              kind: "hint",
              id: "L4BOT2_3",
              title: "Hint Three",
              description:
                "You'll need to get them working. If you haven't accessed the maintenence hatch, don't read any further.",
            },
            {
              kind: "hint",
              id: "L4BOT2_4",
              title: "Hint Four",
              description:
                "Okay, there's a big machine here with pipes leading up...that looks promising. Examine the device carefully.",
            },
            {
              kind: "hint",
              id: "L4BOT2_5",
              title: "Hint Five",
              description:
                "It looks like it has two bay doors which open to reveal two slots for different sized canisters. If you haven't located the canisters, don't read any further.",
            },
            {
              kind: "hint",
              id: "L4BOT2_6",
              title: "Hint Six",
              description:
                "Okay, looks like you'd have to work in the botanical area to know what these mean...perhaps the library might come in handy.",
            },
            {
              kind: "hint",
              id: "L4BOT2_7",
              title: "Hint Seven",
              description:
                "It looks like in the future they've found a more efficient way to store huge amounts of water; you'll need the correct agents to mix in order to create the water you need for the sprinklers. The library should help with that.",
            },
            {
              kind: "hint",
              id: "L4BOT2_8",
              title: "Hint Eight",
              description:
                "Once the correct cannisters are in place, you'll need to mix them. There are two valves present; one of them (the small one) is positioned at the junction where pipes leading from each bay meet...",
            },
            {
              kind: "hint",
              id: "L4BOT2_9",
              title: "Hint Nine",
              description:
                "Turning the small valve seems to have provoked a reaction. The water you need for the sprinklers is building up...",
            },
            {
              kind: "hint",
              id: "L4BOT2_10",
              title: "Hint Ten",
              description:
                "...you want to be careful, though; you need the water to be distributed amongst the sprinkler heads then spray down with force...",
            },
            {
              kind: "hint",
              id: "L4BOT2_11",
              title: "Hint Eleven",
              description:
                "You need water pressure...let it build up. Keep your eye on the pressure gauge.",
            },
            {
              kind: "hint",
              id: "L4BOT2_12",
              title: "Hint Twelve",
              description:
                "Once you've got the pressure built up, there's only one valve left to work; the big one.",
            },
            {
              kind: "hint",
              id: "L4BOT2_13",
              title: "Hint Thirteen",
              description:
                "Turn the large valve. If you've done it correctly, you'll hear the sprinkler system activate and put out the fire.",
            },
            {
              kind: "hint",
              id: "L4BOT2_14",
              title: "Hint Fourteen",
              description:
                "You can't put out a fire that size without generating a lot of smoke; smoke can be even more dangerous than fire...",
            },
            {
              kind: "hint",
              id: "L4BOT2_15",
              title: "Hint Fifteen",
              description:
                "Better lay low until it dissipates (about 40 turns)...you can stay in the maintenance basement, or just surface long enough the scoot back out the green security door and come back later.",
            },
          ],
        },
        {
          kind: "menu",
          id: "l4-maint-hatch",
          title: "How do I access the maintenance hatch?",
          children: [
            {
              kind: "hint",
              id: "L4BOT3_1",
              title: "Hint One",
              description:
                "Authorized personel only, looks like you need a key.",
            },
            {
              kind: "hint",
              id: "L4BOT3_2",
              title: "Hint Two",
              description:
                "The key is probably on whoever worked in maintenance.",
            },
            {
              kind: "hint",
              id: "L4BOT3_3",
              title: "Hint Three",
              description:
                "The key is not hidden per se; search around the ship and you'll locate it.",
            },
            {
              kind: "hint",
              id: "L4BOT3_4",
              title: "Hint Four",
              description: "It's marked 'MAINTENANCE'.",
            },
          ],
        },
      ],
    },

    // ======================================================================
    // Zoo
    // ======================================================================
    {
      kind: "menu",
      id: "l4-zoo",
      title: "What do I do in the Zoo?",
      children: [
        {
          kind: "menu",
          id: "l4-zoo-force-field",
          title: "I can't bypass the force field...",
          children: [
            {
              kind: "hint",
              id: "L4ZOO1_1",
              title: "Hint One",
              description:
                "The force field is in place for a reason; a potentially dangerous animal seems to be free. It's part of a failsafe system.",
            },
            {
              kind: "hint",
              id: "L4ZOO1_2",
              title: "Hint Two",
              description:
                "The Zoo personnel wouldn't want a potentially dangerous animal roaming free on the ship where it might hurt others or itself...but they would want the freedom to go in and recapture it.",
            },
            {
              kind: "hint",
              id: "L4ZOO1_3",
              title: "Hint Three",
              description:
                "The Zoo probably had lots of personnel; one of them might be among the bodies you have seen...",
            },
            {
              kind: "hint",
              id: "L4ZOO1_4",
              title: "Hint Four",
              description:
                "Have you searched what you can of the ship? Did you visit all the living quarters? Did you examine all the corpses and objects on or around them?",
            },
            {
              kind: "hint",
              id: "L4ZOO1_5",
              title: "Hint Five",
              description:
                "On level three, in one of the sets of living quarters, is the body of a man wearing a bracelet; examine the bracelet.",
            },
            {
              kind: "hint",
              id: "L4ZOO1_6",
              title: "Hint Six",
              description:
                "The note in his room may also be relevant...it seems he worked in the Zoo.",
            },
            {
              kind: "hint",
              id: "L4ZOO1_7",
              title: "Hint Seven",
              description:
                "Perhaps his bracelet grants him special privlidges and access...",
            },
          ],
        },
        {
          kind: "menu",
          id: "l4-zoo-gorilla",
          title: "What do I do with the gorilla?",
          children: [
            {
              kind: "hint",
              id: "L4ZOO2_1",
              title: "Hint One",
              description:
                "You'll need to figure out how to get through the force field before you can interact with the gorilla.",
            },
            {
              kind: "hint",
              id: "L4ZOO2_2",
              title: "Hint Two",
              description:
                "Gorillas are potentially dangerous, though, due to their immense strength...especially when they're under a lot of stress. For the time being, it might be a good idea to keep the force field between you and it.",
            },
            {
              kind: "hint",
              id: "L4ZOO2_3",
              title: "Hint Three",
              description:
                "That doesn't mean you can't interact with it; if you can bypass the field you can hand things to the gorilla. What might the gorilla want?",
            },
            {
              kind: "hint",
              id: "L4ZOO2_4",
              title: "Hint Four",
              description:
                "Watch the gorilla...it probably hasn't eaten in quite a while.",
            },
            {
              kind: "hint",
              id: "L4ZOO2_5",
              title: "Hint Five",
              description:
                "Feeding the gorilla will help a little, but it is still very scared. What might calm this particular gorilla down?",
            },
            {
              kind: "hint",
              id: "L4ZOO2_6",
              title: "Hint Six",
              description:
                "Knowing how to calm down this particular gorilla is something his handler probably knew...of course, he's dead. You may be able to deduce what might help from clues left behind, if not, an item may help you. If you have not acquired the blue security badge and accessed the blue security door in the medical area, don't read any further.",
            },
            {
              kind: "hint",
              id: "L4ZOO2_7",
              title: "Hint Seven",
              description:
                "If you haven't figured out what the strange gun is for, don't read any further.",
            },
            {
              kind: "hint",
              id: "L4ZOO2_8",
              title: "Hint Eight",
              description:
                "Once you know what the strange gun is for and how to use it, you can see how it might be useful in this scenario.",
            },
            {
              kind: "hint",
              id: "L4ZOO2_9",
              title: "Hint Nine",
              description:
                "Using the strange gun on the gorilla will reveal a few things that used to calm it down when it was excited...you may have seen a couple of these items in real life...",
            },
            {
              kind: "hint",
              id: "L4ZOO2_10",
              title: "Hint Ten",
              description: "...back in the room of his handler...",
            },
            {
              kind: "hint",
              id: "L4ZOO2_11",
              title: "Hint Eleven",
              description:
                "Give the gorilla its stuffed toy cat, this will calm it down somewhat. Enough for you to be able to enter the room.",
            },
            {
              kind: "hint",
              id: "L4ZOO2_12",
              title: "Hint Twelve",
              description:
                "The gorilla is still really agitated, though, so be careful. Mimic what his handler did in his memories and pet it to soothe it further.",
            },
            {
              kind: "hint",
              id: "L4ZOO2_13",
              title: "Hint Thirteen",
              description:
                "Now is your chance to act; you have a very limited window before the gorilla gets agitated again. You actually have a few choices here so think about the items you have acquired.",
            },
            {
              kind: "hint",
              id: "L4ZOO2_14",
              title: "Hint Fourteen",
              description:
                "If you have acquired a weapon and don't care about the gorilla you could always just kill it.",
            },
            {
              kind: "hint",
              id: "L4ZOO2_15",
              title: "Hint Fifteen",
              description:
                "...but you won't get the full points for completing the puzzle, and it will hurt your rating as well. Maybe there's a more non-violent way to deal with the situation. A way to keep the gorilla calm longer...",
            },
            {
              kind: "hint",
              id: "L4ZOO2_16",
              title: "Hint Sixteen",
              description:
                "If you haven't accessed the medical storage room on level three, don't read any further.",
            },
            {
              kind: "hint",
              id: "L4ZOO2_17",
              title: "Hint Seventeen",
              description:
                "That syringe might come in handy here...in fact, the gorilla even remembers being injected at some point. Have you found any serums that might be useful here?",
            },
            {
              kind: "hint",
              id: "L4ZOO2_18",
              title: "Hint Eighteen",
              description:
                "The library describes one as a 'powerful sleeping drug'...",
            },
            {
              kind: "hint",
              id: "L4ZOO2_19",
              title: "Hint Nineteen",
              description:
                "The sleeping drug keeps the gorilla nice and woozy for some time; long enough to grab what you want.",
            },
            {
              kind: "hint",
              id: "L4ZOO2_20",
              title: "Hint Twenty",
              description:
                "A kind person may want to help Jinto get back safely to his sleep pod...you can do this for extra rating points. It's extra credit so I won't go into the whole specifics of how it is done; I'll only say there is a clue in his memories.",
            },
          ],
        },
      ],
    },
  ],
};
