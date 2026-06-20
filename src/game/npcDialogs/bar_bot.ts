import type { NpcDialogEntry } from "@game/types/npcTypes";
import { COMMON_TELL } from "./common";

export const barBotDialog = {
  ask: {
    aeneas:
      "The Aeneas is what is known as a generation ship, of sorts. It carries hundreds of thousands of souls, most of which remain in cryonic sleep down in Deep Storage, while small populations of trained professionals are awakened in rotations to live, study, and work during the long journey.",
    mayor:
      "The Mayor isn't a Mayor in any elected sense, it's the name given to the AI who handles the human population's, and robot population's, needs and desires. The only way to access The Mayor is through Operations. It's not the top dog, either, by the way. It answers upward to a more powerful AI that actually runs the vessel itself.",
    journey:
      "The Aeneas is on a thousands-year journey toward a new home  waiting somewhere in the great beyond.",
    size: "The Aeneas is massive, built to carry huge populations across absurd spans of time without everyone going completely feral.",
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
    park: "Vivarium Park is the main recreation zone, with Ultra Fitness, The Loosened Tongue, Saveurs du Passe, and the Movphitheater among its attractions.",
    gym: "Ultra Fitness has spin classes, cardio machines, free weights, weight machines, lockers, showers, and robot trainers with opinions.",
    bar: "The Loosened Tongue is a Park bar with drinks, darts, a mechanical bull, and a reputation for conversations that go further than intended.",
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
    mox: `Mox, you were a regular here. Brilliant, exhausting, and usually one drink away from a theory nobody asked for.`,
    isosceles:
      "Isosceles Onche is the Water Treatment Supervisor, a media figure, famously social, and devoted to her cat Iggy.",
    volonope: `Volonope was good for you. I say that as a bartender, which is almost a licensed therapist if the lights are dim enough.`,
    henk: "Henk Umboltz is Head of Security, which makes him one of those people everyone knows even if they wish they did not.",
    iggy: "Iggy Onche is Isosceles Onche's cat. On a ship like this, that somehow counts as public-interest information.",
    badge:
      "Security badges control access through parts of the Aeneas. If a scanner wants one, arguing philosophy with the door will not help.",
    "what happened":
      "Something catastrophic happened aboard the Aeneas. The fine details are still a mess, but the result is impossible to miss.",
    self: `Samsynth Roswink III, bartender, listener, and reluctant custodian of several emotional messes.`,
    trivia: `Bar trivia is active. A correct answer earns a Mani-Pedi voucher for Keratin Kindness.`,
    cellar: `The stock boy went into the cellar and did not come back. Something down there is not him, and I strongly dislike that fact.`,
    drink: `I can make drinks, conversation, and questionable decisions feel briefly intentional.`,
    darts: `Darts are available, assuming you aim at the board and not at customer service.`,
  },
  tell: {
    ...COMMON_TELL,
    cellar: `I believe you. I still advise not going down there unless you have a plan, a light, and a generous definition of courage.`,
    trivia: `If that is your trivia answer, say it plainly and I will judge it with theatrical fairness.`,
    darts: `Darts and alcohol have a long, proud history of pretending to be a good idea.`,
  },
} satisfies NpcDialogEntry;
