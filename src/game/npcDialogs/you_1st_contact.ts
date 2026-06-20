import type { NpcDialogEntry } from "@game/types/npcTypes";
import { COMMON_TELL } from "./common";

export const youFirstContactDialog = {
  ask: {
    aeneas:
        "The Aeneas is the century ship we are all on. It is less a vehicle than a moving civilization with engines attached.",
    mayor:
        "The Mayor is an AI meant to handle the population's needs and wishes. It answers upward to a more powerful system that actually runs the vessel.",
    journey:
        "The Aeneas is on a thousands-year journey toward a new home waiting somewhere in the great beyond.",
    size:
        "The Aeneas is massive, built to carry huge populations across absurd spans of time without everyone going completely feral.",
    rotations:
        "Rotations are the waking cycles. One population lives and works for six years, then returns to cryonic sleep while another population wakes up.",
    transfers:
        "People usually stay with their population cluster each rotation. Transfers are possible, but the paperwork is legendary.",
    zones:
        "The Aeneas has specialized zones for power, engineering, recreation, medicine, storage, education, habitats, and stranger work besides.",
    hydroponics:
        "Hydroponics is a huge multilevel silo where plants of all kinds are grown for food, research, and keeping everyone from forgetting green exists.",
    botanical:
        "Botanical includes the Greenhouse, Garden, Seed Bank, and Fungal Caves. It is the ship's curated argument against emptiness.",
    zoological:
        "Zoological includes the aquarium, aviary, and Game Preserve. It is ambitious, expensive, and probably full of bad decisions in the current circumstances.",
    ["power"]: `"Something must have overloaded...the Control Room Supervisor should have...the reset key..."`,
    engineering:
        "Engineering is where the reactors live. Those reactors generate the power the rest of the Aeneas spends so confidently.",
    park:
        "Vivarium Park is the main recreation zone, with Ultra Fitness, The Loosened Tongue, Saveurs du Passe, and the Movphitheater among its attractions.",
    gym:
        "Ultra Fitness has spin classes, cardio machines, free weights, weight machines, lockers, showers, and robot trainers with opinions.",
    bar:
        "The Loosened Tongue is a Park bar with drinks, darts, a mechanical bull, and a reputation for conversations that go further than intended.",
    restaurant:
        "Saveurs du Passe is a fancy restaurant built around ancient techniques and extinct ingredients grown under very careful conditions.",
    "movie theater":
        "The Movphitheater is an arena-style theater with tiered seats and a dome that can project three-dimensional films.",
    storage:
        "Storage is enormous and multilevel. If the Aeneas needed to keep it, misplace it, or forget why it mattered, it probably ended up there.",
    printing:
        "The 3D printing facility can fabricate most practical objects, assuming the files, materials, and permissions all cooperate.",
    "deep storage":
        "Deep Storage is the lower grid where hundreds of thousands of people are kept in cryonic suspension between rotations.",
    "living quarters":
        "The Aeneas has living quarters on level three and level two, because even a century ship needs places where people can make terrible roommate choices.",
    learnatorium:
        "The Learnatorium is the ship's classroom, where children plug into VR and relive historical events instead of merely being bored by them.",
    medical:
        "Medical has a hospital, operating rooms, a pharmacy, vision and dental support, and its own lab.",
    operations:
        "Operations is where the ship is managed at a high level. It is also where someone would normally seek an audience with The Mayor.",
    xenobiology:
        "The Xenobiology Lab houses alien samples discovered by probes during the Aeneas' long journey.",
    mox:
        "Mox Eegler is known as a genius hotshot inventor. He is also known for an ego problem and a personality problem that may overlap.",
    isosceles:
        "Isosceles Onche is the Water Treatment Supervisor, a media figure, famously social, and devoted to her cat Iggy.",
    volonope:
        "Volonope Fick is known mostly as Mox Eegler's partner. She has a much more reserved reputation than he does.",
    henk:
        "Henk Umboltz is Head of Security, which makes him one of those people everyone knows even if they wish they did not.",
    iggy:
        "Iggy Onche is Isosceles Onche's cat. On a ship like this, that somehow counts as public-interest information.",
    badge:
        "Security badges control access through parts of the Aeneas. If a scanner wants one, arguing philosophy with the door will not help.",
    ["what happened"]: `No idea (cough) it was like this when I woke up...(cough) whatever happened it wiped out most everybody...it's like a (cough) freakin' graveyard in here...`,
    ["what fuck"]: `"I don't know man...but I'm pretty sure that if we don't get things back on track...we are effed in the A..."`,
    ["where we are"]: `"My memory is totally fried...some kind of facility (cough) but I know this place, I know where we are I just can't place it..."`,
    ["reactor"]: `"It's unstable...you can reset it...but first...you need to get the power on..."`,
    ["reset key"]: `"Yeah it's like a manual override...it should cut everything over (cough) you just need to find it..."`,
    ["plumbus"]: `"Yeah, I don't know man...I think it's just a regular old plumbus..."`,
    ["self"]: `My name's Mox (cough) at least...I think it is (cough) ...I'm ninety percent sure my name is (cough) Mox...`,
    ["name"]: `My name's Mox (cough) at least...I think it is (cough) ...I'm ninety percent sure my name is (cough) Mox...`,
    ["dark"]: `Yeah stay out of the dark (cough)...I don't know what it is but there's some kind of organism in here with us...it won't come into the light (cough)...`,
    ["organism"]: `Well, I say that (cough)...I don't know what it is...but if it touches you...you're a dead man (cough)...`,
    ["himself"]: `I managed to get onto the floor where the reactor is (cough)...I was (cough) searching the warehouse when (cough)...collapsed...I'm pinned under (cough) a shit ton of crates...I don't think I'm gonna make it...`,
    ["me"]: `I wish I knew more (cough)...I woke up just like you (cough cough)...we're not the first...I think we're supposed to (cough) fix this...`,
    ["what to do"]: `Don't bother coming to the...reactor (cough) until you get the...power back on (cough) ...the lights went out down here, you gotta get them back (cough) on. Some floors...need a security badge...(cough) but there's housing on the (cough) third floor...should be clear...start there...`,
    ["bug"]: `I found one of those, too (cough)...right near where I woke up...whatever it is (cough)...I don't think it's a real bug...it's mechanical (cough) with some kind of biological (cough) payload...`,
    ["key"]: `Any key in particular..?`,
    ["supervisor"]: `I don't remember his name (cough) but he'd have the key...you gotta find him, or (cough) at least his body...(cough) check his quarters, too...`,
    ["moan"]: `Oh crap, are you in the stairwell (cough)? I heard that too, creepy as hell... (cough) (cough)...I never figured out what was making it...`,
  },
  tell: {
    ...COMMON_TELL,
    ["bug"]: `"Shit, no way (cough)...I found one when I woke up too..."`,
    ["steel door"]: `"Huh, I don't know man (cough), it sounds like it won't open for a reason..."`,
  },
  ping: [
        `"Hey...you still there..?`,
        `"You still there, man..?`,
        `"Hey...can you still hear me..?`,
      ],
  signOff:
        `(cough) (cough) ...looks like you're gonna be on your own from here out...(cough) wish I could help you more...(cough) good luck, man...`,
} satisfies NpcDialogEntry;
