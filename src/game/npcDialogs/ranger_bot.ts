import type { NpcDialogEntry } from "@game/types/npcTypes";
import { COMMON_TELL } from "./common";

export const rangerBotDialog = {
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
    park: `Vivarium Park is open for approved recreation, reflection, exercise, dining, and absolutely no unauthorized entry without a pass.`,
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
    badge: `For park entry purposes, the relevant credential is a valid park pass. A badge, sadly, is not a park pass wearing a different hat.`,
    "what happened":
        "Something catastrophic happened aboard the Aeneas. The fine details are still a mess, but the result is impossible to miss.",
    self: `I am a Vivarium Park ranger unit, optimized for park access, park safety, and cheerful obstruction.`,
    hours: `The park is available around the clock, the only requirement being a valid park pass.`,
    pass: `If you don't have a valid park pass, you can request one from Park Services. Current wait time is estimated to be: *Infinite Number*`,
    amenities: `Vivarium Park amenities include Ultra Fitness, The Loosened Tongue, Saveurs du Passe, and the Movphitheater.`,
  },
  tell: {
    ...COMMON_TELL,
    pass: `Thank you for the park pass related information, sir.`,
    badge: `Thank you, sir. I will file that under park-adjacent credential commentary.`,
  },
} satisfies NpcDialogEntry;
