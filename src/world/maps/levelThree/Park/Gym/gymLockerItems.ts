import type { Item } from "@game/types/itemTypes";

export const gymLockerItems: Item[] = [
  // Men's Locker 1
  {
    id: "UndergroundZinePage",
    name: "torn out magazine page",
    description:
      "It looks like it was torn from a small, print magazine. The publication name is printed at the top of the page: 'The Anarchist's Guide to Unauthorized, Illegal, or Otherwise Discouraged Alcohol'",
    location: "ManLocker1",
    vocab: ["magazine", "page", "torn", "magazine page"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: true,
    isContainer: false,
    isLoggable: true,
    readableTitle: `Urban Legend?`,
    readableText: `"You can file this one under 'color me skeptical' but I love a great urban legend and hey, it's a big universe out there, so who knows? This one comes to us courtesy of a reader going by the handle 'C2H6O-NO-NO' and involves a curious cocktail mix you'll find only in Vivarium Park, AND only when the bar for the current rotation is 'The Loosened Tongue' AND only when the correct drink specials are on offer for that night. So, right off the bat this will be impossible to prove unless at a minimum you have access to 'The Loosened Tongue', and even then they'll need to be offering all of the correct drinks on the same night. Curious? I was, but have, as of yet, been unable to test this out. If any readers out there get the chance, send me a message.\n\nOnce the stars align, basically this boils down to one thing; drink each of the drinks on special, in the correct order. Each drink must be finished completely, and nothing can break the order, meaning if you drink water, or anything else, before completing all six drinks, then this will not, according to C2H6O-NO-NO, work.\n\nIf you manage to meet all the criteria, and get through all six drinks, then, according to legend, you will experience some sort of vision, the specifics of which can only be known to those who experience it. Hey, sign me up, right? Well, for the curious, and persistent, here's the list of cocktails you'll need to drink, in the order you need to drink them:\n\nBangalore Sling\nWhiskey Sweet\nHand-stuff on the Beach\nGin Fizz\nDurian Colada\nFischermeister shot\n\nAny souls out there brave enough to give it a shot? Let us know and we'll feature you in a future issue!"`,
  },
  // Men's Locker 5
  {
    id: "IResign",
    name: "folded letter",
    description:
      "A neatly folded sheet of 9x11 paper. Even from here you can tell someone really needed to get something off their chest.",
    location: "ManLocker5",
    vocab: ["folded", "resignation", "letter", "paper"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: true,
    isContainer: false,
    isLoggable: true,
    readableTitle: `Angry Resignation Letter`,
    readableText:
      "To whom it may concern,\n\n" +
      "This letter is to inform you of my resignation, effective immediately.\n" +
      "I am not giving two weeks notice, or one week, or even one day; by the\n" +
      "time you read this I will be safely far away from you, your moronic,\n" +
      "micromanaging lackeys, and the sweltering, putrid hellhole you all\n" +
      "call your place of work. To say that working for you has been a bad\n" +
      "experience is to give undue credit to the word 'bad', so let me instead\n" +
      "say that I've rated working for you somewhere between having my short-\n" +
      "hairs caught in a weed-whacker and falling face-first into a well full\n" +
      "of starving, rabid badgers. Your management team are unethical and\n" +
      "sadistic, you are dull-witted and unhygienic, the Director could not\n" +
      "direct her ass out of a wet paper bag, the VPs are clueless, flatulent,\n" +
      "and morbidly obese, the CEO is a plundering pirate drunk on his own\n" +
      "wealth and power...nay, the entire company is nothing but a huge,\n" +
      "mismanaged behemoth which, fatally wounded by you and your cronies'\n" +
      "ineffective policies and shameless thievery, moves forward only with\n" +
      "the inertia of a rhino who has not yet realized the final shot has\n" +
      "been dealt. I wish you and yours a miserable day, an even more\n" +
      "miserable holiday, and, should there be any justice at all in this\n" +
      "existence, long and miserable jail sentences under the very worst\n" +
      "conditions imaginable.\n\n" +
      "Sincerely,\n\n" +
      "The Guy You Fired\n",
  },
  // Men's Locker 6
  {
    id: "LottoTicket",
    name: "lotto ticket",
    description:
      "A Deus Ex Machina Trillion Dollar PowerSlamstravaganza lotto ticket. The printed number sequence reads: 1 10 88 7 43 39 13 with a PowerSlam of 3.",
    location: "ManLocker6",
    vocab: ["lotto", "ticket", "lottery"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: true,
    isContainer: false,
    readableText: "1 10 88 7 43 39 13 : 3",
    scoreId: "obtained_lotto_ticket",
  },
  // Men's Locker 13
  {
    id: "CoordFinder",
    name: "small rectangular readout",
    description:
      "A non-descript black device fits neatly in the palm of your hand, its only feature a narrow red readout on the front. A constant sequence of numbers scrolls across the display, glowing in a flat, unfriendly red. Whatever it's tracking, it's doing so with obsessive precision.",
    initialDescription:
      "A small, black rectangular device lies nearby, its single red readout cycling through a stream of numbers.",
    location: "ManLocker13",
    vocab: ["readout", "small", "rectangular", "device"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isContainer: false,
    scoreId: "obtained_coord_finder",
  },
  // Men's Locker 14
  {
    id: "BrokenLamp",
    name: "elephant lamp",
    description:
      "A grey ceramic lamp shaped like a small elephant. The light is switched on and off by pulling its trunk, which gives the whole thing a weirdly dignified air.",
    location: "ManLocker14",
    vocab: ["elephant", "lamp", "shaped", "elephant-shaped", "trunk"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 5,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isSwitchable: true,
    isOn: false,
    providesLight: false,
  },
  // Women's Locker 1
  {
    id: "MagicWord",
    name: "used napkin",
    description:
      "A slightly crumpled napkin with a smudge of lipstick across one edge. Someone has written something on it in hurried, uneven letters.",
    location: "ChickLocker1",
    vocab: ["used", "napkin", "smear", "lipstick"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: true,
    isContainer: false,
    isLoggable: true,
    readableTitle: `Word Scrawled in Lipstick`,
    readableText: "ffektagga",
  },
  // Women's Locker 3
  {
    id: "MusicBOX",
    name: "tiny music box",
    description:
      "A tiny, old-fashioned music box whose exposed workings have been updated with microlasers reading notes from a revolving strip of nanocircuit film.",
    location: "ChickLocker3",
    vocab: ["tiny", "music", "box"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    scoreId: "obtained_music_box",
  },
  // Women's Locker 12
  {
    id: "PhoneNumber",
    name: "slip of paper",
    description:
      "A torn strip of paper with a single extension number written on it:\n\n            X7239",
    location: "ChickLocker12",
    vocab: ["phone", "number", "slip", "paper"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: true,
    isContainer: false,
    isLoggable: true,
    readableTitle: `Phone Number Found in Gym Locker`,
    readableText: "X7239",
    scoreId: "obtained_secret_phone_number_1",
  },
];
