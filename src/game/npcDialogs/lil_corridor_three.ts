import type { NpcDialogEntry } from "@game/types/npcTypes";
import { COMMON_TELL } from "./common";

export const lilCorridorThreeDialog = {
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
    power:
        "Power handles distribution across the ship. When it goes wrong, everything else becomes dramatically less charming.",
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
    mox: `Mox? Another brilliant man with the emotional safety rating of a fireworks factory.`,
    isosceles: `Isosceles was ours, emotionally if not legally, and somebody in this room knows what he did.`,
    volonope:
        "Volonope Fick is known mostly as Mox Eegler's partner. She has a much more reserved reputation than he does.",
    henk:
        "Henk Umboltz is Head of Security, which makes him one of those people everyone knows even if they wish they did not.",
    iggy:
        "Iggy Onche is Isosceles Onche's cat. On a ship like this, that somehow counts as public-interest information.",
    badge:
        "Security badges control access through parts of the Aeneas. If a scanner wants one, arguing philosophy with the door will not help.",
    "what happened": `Something is wrong, sure, but I am handling a more immediate romantic catastrophe.`,
    self: `Lil-Lilly Tendwick, and I am currently busy being correct and furious.`,
  },
  tell: {
    ...COMMON_TELL,
    isosceles: `Exactly. Finally, somebody understands the assignment.`,
    mox: `Do not defend clever men to me right now.`,
  },
} satisfies NpcDialogEntry;
