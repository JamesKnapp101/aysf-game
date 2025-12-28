export type PltEntry = {
  id: string; // stable id
  terms: string[]; // synonyms / triggers (first term is the “display name”)
  body: string; // raw text (can include ~ and ^ markers)
};

function normalizeTerm(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Build a lookup index:
 * - exact normalized term -> entry id
 * - if duplicates exist, the first one wins (keep your synonyms clean)
 */
export function buildPltIndex(seedEntries?: PltEntry[]) {
  const entryList: PltEntry[] = seedEntries ?? DEFAULT_PLT_ENTRIES;

  const index = new Map<string, string>();
  for (const entry of entryList) {
    for (const t of entry.terms) {
      const key = normalizeTerm(t);
      if (!key) continue;
      if (!index.has(key)) index.set(key, entry.id);
    }
  }

  return { entryList, index };
}

// Seed entries adapted from your Inform data.
// Note: I kept your ~ and ^ markers so you can paste old content without rewriting it.
export const DEFAULT_PLT_ENTRIES: PltEntry[] = [
  {
    id: "pentatrosin",
    terms: ["pentatrosin"],
    body: "Pentatrosin is a powerful drug used as a counteragent to Jacovski-Zhang disease and is extremely effective in the treatment of that condition. Due to it's effects of rapid platlet clearing and cell rehydration, the drug is extremely toxic to individuals not affected by J-Z.",
  },
  {
    id: "jacovski_zhang_disease",
    terms: ["jackovsky", "zhang", "jz"],
    body: "Named for the unfortunate husband and wife medical team who first contracted it, and who, prior to their deaths, were responsible for uncovering a wealth of valuable information about the condition, this disease primarily effects the blood, causing rapid interior clotting which begins at the extremities and works its way in over the course of days to the lungs, heart and brain. It is generally treated with pentatrosin.",
  },
  {
    id: "disease_drug_serum",
    terms: ["disease", "drug", "serum"],
    body: "You'll have to be more specific.",
  },
  {
    id: "seritroxin",
    terms: ["seritroxin"],
    body: "Seritroxin is a powerful drug used to counteract the effects of radiation exposure.",
  },
  {
    id: "vanitrax",
    terms: ["vanitrax"],
    body: "Vanitrax is a powerful pain killer.",
  },
  {
    id: "amnesia",
    terms: ["amnesia"],
    body: "A disturbance in the memory of information stored in long-term memory, in contrast to short-term memory, manifested by total or partial inability to recall past experiences. There are many varieties and potential causes of amnesia, such as Anterograde amnesia, Retrograde amnesia, Emotional/Hysterical amnesia, Lacunar amnesia, Korsakoff syndrome, Transient global amnesia, and Posthypnotic amnesia.",
  },
  {
    id: "anterograde_amnesia",
    terms: ["anterograde", "amnesia"],
    body: "Anterograde amnesia is a form of amnesia where the afflicted person can not recall events after the incidence of a physical trauma.",
  },
  {
    id: "retrograde_amnesia",
    terms: ["retrograde", "amnesia"],
    body: "Retrograde amnesia is a form of amnesia where the afflicted person can not recall events prior to the incidence of a trauma.",
  },
  {
    id: "emotional_amnesia",
    terms: ["emotional", "amnesia"],
    body: "Emotional amnesia, also called hysterical amnesia, is a form of memory loss which may be brought on by a psychological trauma.",
  },
  {
    id: "hysterical_amnesia",
    terms: ["hysterical", "amnesia"],
    body: "Hysterical amnesia, also called emotional amnesia, is a form of memory loss which may be brought on by a psychological trauma.",
  },
  {
    id: "lacunar_amnesia",
    terms: ["lacunar", "amnesia"],
    body: "Lacunar amnesia is a form of amnesia where a specific event can not be recalled.",
  },
  {
    id: "korsakoff_syndrome",
    terms: ["korsakoff", "syndrome"],
    body: "Korsakoff syndrome is a form of memory loss which is related to alcoholism or severe alcohol abuse.",
  },
  {
    id: "posthypnotic_amnesia",
    terms: ["posthypnotic", "amnesia"],
    body: "Posthypnotic amnesia concerns memory loss associated with post-hypnotic suggestion.",
  },
  {
    id: "transient_global_amnesia",
    terms: ["transientglobal", "amnesia"],
    body: "Transient global amnesia is a form of memory loss associated with advanced age.",
  },
  {
    id: "space",
    terms: ["space"],
    body: "Once believed to be the final frontier, space turned out to be the penultimate frontier when, in 2518, Professor Noonenbaum's advances in 'Flagella Theory' mathematically described the presence of sub-sub-atomic flagella on sub-atomic strings on membranes on dimensions on space and time.",
  },
  {
    id: "cryonic_suits",
    terms: ["space", "cold", "suit"],
    body: "Cryonic Suits, also called Cold Suits, are any airtight suit used for work with cryonics or in cryonic laboratories. They are usually rated for use in vacuums. They may or may not be rated to withstand heavy doses of radiation.",
  },
  {
    id: "james_knapp",
    terms: ["james", "knapp"],
    body: "James Knapp, aka 'Jim Knapp' aka 'Funkdog', was a software tester and independent interactive fiction writer back in the early 00's. While he is perhaps best known for bringing peace and harmony to Earth and the known universe, he was also the author of a well-received technical publication, could drink a 22oz beer without stopping, and achieved an overall colony score of $100,000 in M.U.L.E. while playing the humanoid against three other computer players.",
  },
  {
    id: "xyzzy",
    terms: ["xyzzy"],
    body: "Xyzzy is a well known 'magic word' from a pioneer interactive fiction game.",
  },
  {
    id: "plugh",
    terms: ["plugh"],
    body: "Plugh is a well known 'magic word' from a pioneer interactive fiction game.",
  },
  {
    id: "plover",
    terms: ["plover"],
    body: "So's your Mom.",
  },
  {
    id: "deus_ex_machina",
    terms: ["ship", "deus", "ex", "machina"],
    body: "Deus ex Machina; Literally 'The God in the Machine', the phrase originated with the ancient Greek plays where a story conflict or problem would be resolved at the last moment by the fortuitous arrival of a God sweeping down from the sky in a chariot. The name was given to the first of the deep space exploration vessels to be entirely self-sufficient. The Deus ex Machina also holds the distinction of being the first deep space exploration vessel which was never intended to return to Earth, but rather sustain generations kept in cold sleep, to be awakened in the event of a viable colonization, or peacemeal in order to round out the waking population as needed.",
  },
  {
    id: "cryonics",
    terms: ["cryonics"],
    body: "The technology, firmly established for the first time in the mid 20th century, of using extreme cold to arrest a living system, with the ability of later reviving that system intact.",
  },
  {
    id: "me",
    terms: ["me"],
    body: "I'm afraid I don't know anything about you...",
  },
  {
    id: "trixophine",
    terms: ["trixophine"],
    body: "Trixophine is a powerful drug used to stimulate neural activity in patients who have experienced any condition which may temporarilly interrupt, slow down, or stop the synaptic flow in the brain. In subjects whose neural activity falls within normal parameters, trixophine causes extreme visual and aural hallucinations. For this reason it is also prized as a recreational drug, and is in fact sometimes used to treat chronic depression. Trixophine is typically not immediately effective after injection, and depending on the person may take upwards of ten to twenty minutes to reach its full effect.",
  },
  {
    id: "xantophol",
    terms: ["xantophol"],
    body: "Xantophol is a powerful tranquilizer.",
  },
  {
    id: "body",
    terms: ["body"],
    body: "Please be more specific.",
  },
  {
    id: "pba_body_armor",
    terms: ["pba", "body", "armor"],
    body: "PBA, or Personal Body Armor, is used extensively by the military, the police, and even the civilian sector for lightweight, effective personal protection. There are five basic classes; Class One is a heavy armored exoskeleton used almost exclusively by the military, Class Two is more portable and effectively defends against even armor piercing or gauss rounds, Class Three is similar to Class Two, except it also is effective against electrical attacks. Class Three PBA is easilly recognizable by its characteristic spike in the front and back which acts as a lightning rod which then disperses the charge through the vest which absorbs it. Class Four is also similar to Class Two, but does not protect against electrical attacks, gauss rounds, and is lighter weight. Class Five is most popular in the civilian sector and effectively protects against most projectile and stabbing weapons. All forms of body armor will eventually be worn down under persistent attack.",
  },
  {
    id: "idf_inertial_dampening_field",
    terms: ["idf", "inertial", "dampening", "field"],
    body: "An IDF, or Inertial Dampening Field, is a form of personal shield protection which usually comes in the form of a belt, or harness. An inertial dampening field extends around the wearer, and converts inertial energy to electrical energy, which it then absorbs. The incoming projectile or projectiles, robbed of their inertial energy, fall to the ground harmlessly as long as the field is effective. The belt contains the power source as well as the electronics which absorb the charge. An IDF will eventually wear out under persistent attack, as the absorbed energy burns out a portion of its self-contained fuse system each time it is struck. When the fuse system is completely burned out, the field disintegrates. The fuse system is currently not field replacable. IDFs come in two classes; Class One will absorb anything up to and including a gauss projectile, and will also convert heat and electrical attacks. Class Two is the same as Class One, except it will not repell heat or electricity.",
  },
  {
    id: "nexicorp",
    terms: ["nexicorp"],
    body: "NexiCorp is one of the largest providers of advanced medical technology, specializing in tools involving the analysis of brainwaves, and the health, state, and condition of the brain.",
  },
  {
    id: "xl999_defender_robot",
    terms: ["XL999", "robot"],
    body: "The XL999 Defender series robot is a modular, self-contained unit used to protect precious commodities or cargo. They come mounted with a single weapon standard, but can support up to six total. A typical deployment will be outfitted with three; an armor piercing projectile weapon, a heat or electrical beam weapon, and a small missile or rocket propelled grenade launcher. The XL999 is extremely resilient; even if disabled it contains a series of internal nanomachines which will initiate self repair, allowing it to be combat effective again in a matter of minutes. To disable one completely its power connection must be severed.",
  },
  {
    id: "squirrel",
    terms: ["squirrel"],
    body: "A squirrel is a small rodent, typically grey and white in color, with a bushy tail. Their diet consists mainly of nuts and grains, although they are known to scavange almost any available food source when the opportunity is presented.",
  },
  {
    id: "gorilla",
    terms: ["gorilla"],
    body: "The silverback gorilla is the largest of the great apes, with an adult male capable of reaching 180 Kilograms, or 400 pounds. They are primarilly vegetarians, and their diet consists mainly of leaves and fruit. While not aggressive by nature, they can become so when angered or frightened.",
  },
  {
    id: "matter",
    terms: ["matter"],
    body: "Matter can be niether created nor destroyed.",
  },
  {
    id: "matter_transmission",
    terms: ["matter", "transmitter"],
    body: "Matter transmission involves the instantaneous conversion of matter into energy, the transmission of said energy to a remote location, then the decoding and reconstituting of energy back into matter. Matter transmission, or teleportation as it is still sometimes called, was first demonstrated in 2041, and later perfected in 2097.",
  },
  {
    id: "emp",
    terms: ["emp"],
    body: "E.M.P. weapons, or, Electro-Magnetic Pulse weapons, are used to target delicate electronic systems. While of little use against organic, or even sturdy robotic or heavilly shielded electronic systems, EMP weapons discharge a pulse which expands outward and is extremely effective at rendering delicate electronics such as radios, computers, and receivers...anything which might use microelectronics or have a sensitive reciever unit. For this reason, the EMP was particularly effective against explosive Z4 charges whose detonators were extremely vulnerable to such an attack. Combined with the fact that such an attack also left the explosive itself intact, the EMP actually obsoleted Z4 as a military weapon and relegated it to demolition use.",
  },
  {
    id: "coordinant",
    terms: ["coordinant"],
    body: "A point in space.",
  },
  {
    id: "coordinant_finder",
    terms: ["coordinant", "finder"],
    body: "A coordinant pinpointer. A simple device which generally provides a useful coordinant using a preprogrammed source point.",
  },
  {
    id: "dna",
    terms: ["DNA"],
    body: "Deoxyribonucleic Acid. The building blocks of life.",
  },
  {
    id: "dna_reader_wand",
    terms: ["DNA", "reader", "wand"],
    body: "DNA readers/analyzers can be extremely useful in both the medical and law enforcement fields; consisting of a handheld wand with a sensetive bulb located at its tip, such devices are capable of reading even minute traces of DNA and cross-refrencing the genome against a centralized database.",
  },
  {
    id: "thumb_pads",
    terms: ["thumb", "pad"],
    body: "Thumb pads are a common crude, but effective, method of security which requires a correct thumb-print match as well as DNA match.",
  },
  {
    id: "cooler",
    terms: ["cooler"],
    body: "Such coolers are popular amongst military groups, humanitatian groups, and tailgate party frequenters. They are capable of providing varying levels of coolness, up to and including flash-freezing.",
  },
  {
    id: "ghosts",
    terms: ["ghost", "ghosts"],
    body: "Claims of sightings of and visitations by such entities have been reported throughout the ages, but while much of the evidence has been compelling no case has ever been scientifically confirmed. While the nature of some such encounters have never been explained, many reports have been tied to stress, fatigue, and being alone in a strange place.",
  },
  {
    id: "brain_slug_holothuroidea_adduco",
    terms: ["slug", "jellyfish", "holothuroidea", "adduco"],
    body: "The Holothuroidea Adduco, or, 'Brain Slug', as it is commonly called, is one of a few xenobiological specimens collected throughut the Deus Ex Machina's journey and does indeed resemble a sort of green sea slug or jellyfish, with a bulbous gelatinous body connected to a base mass of fat, elastic tentacles. Found on the planet 'Hypnos' (so named after the Greek God of sleep, and inspired by the specimens observed there), the Brain Slug was thought at first to be an unusually large and successful non-intelligent parasite. While its nature did turn out to be parasitic, it was determined to possess the capacity for significant intelligence. Of the fifty or so other species recorded on Hypnos (examples of each stored in the zoological stasis warehouse after extensive study) examples of nearly all were found harboring a Slug. The Slug always connected on or at the base of the head, where, being acquatic by nature, the Slug was thought to connect when an unsuspecting animal came to drink. Animals so afflicted were found to be unusually successful, and they displayed what seemed to be a higher order of intelligence. After study it was found that nearly all of the Slug's gelatinous body consisted of a super high concentration of neuro fibers, and it's enitre network of tentacles had evolved to act as sensitive electrodes. The end result was that, by making a connection at the skull, the Brain Slug was able to actually 'tap into' the host creatures brain functions, and in fact take them over completely. The Slug then in effect acted as the brain for its new body for as long as the connections was useful (typically, it was observed, until the host animal became either too old, or too injured to be of further use). The extent of this unique ability was unfortunately discovered first in the Deus Ex Machina Xenobiology Lab where it gained control of a human host. It was then discovered that the creature was actually capable of even human-level intelligence, and due to its extreme cleverness and resistance, it was very difficult to remove. In the end, only the spike of neural activity associated with the drug Trixophine inticed the Slug to depart its host willingly. No other method was successful, including anesthisising the host. The Brain Slug can be found in two forms; its active state, and its dormant state. In the dormant state, the Slug discharges all of its moisture, collapsing to a quarter of its original size, and in this state appears to be dried. Although it appears dead, it will become active quickly after being submerged in water. As long as it is connected to a viable host, it seems to be able to leech enough water from it to maintain its waking state without harming the host, but it will revert to its dormant state very quickly if separated from both a host and a source of water. The Brain Slug is considered a Class Two Dangerous Creature.",
  },
  {
    id: "anoxiflourine",
    terms: ["anoxiflourine"],
    body: "Anoxiflourine is an extremely powerful nervous system inhibitor, used primarily for crowd control, or as a non-lethal combat weapon. It is also often used in security systems to incapacitate would-be thieves until authorities can arrive at the scene. The drug (typically administered as a gas, or an unstable liquid concentration which quickly sublimates into a gas) is so effective, that it will shut down everything but involuntary systems for as little as a day and as long as several weeks, unless an antidote is administered.",
  },
  {
    id: "singularity_bomb",
    terms: ["singularity", "bomb"],
    body: "Few if any weapons throughout history have generated as much controversy, anger, and fear as the singularity bomb. About seven feet long and five feet wide, usually in a rough capsule configuration (the size and shape of a human coffin, author Edward Hillman once dryly observed) is capable of creating a singularity capable of capturing and swallowing nearby planets. Although never used in combat, the field tests on the (former) planet XF133 continue to capture the imagination of people worldwide. They can be activated either by a warhead, or, by a standard issue GE detonator.",
  },
  {
    id: "clip_magazine",
    terms: ["clip"],
    body: "Many modern projectile weapons, including the popular gauss pistol and rifle, use a clip, or magazine, as a convenient, fast method of reloading.",
  },
  {
    id: "baton",
    terms: ["baton"],
    body: "Still a favorite of security and military forces, this low-tech weapon is nonetheless cheap and effective.",
  },
  {
    id: "teleportation",
    terms: ["teleportation"],
    body: "The technology of transmitting solid matter instantaneously from one point to another.",
  },
  {
    id: "teleportation_pads",
    terms: ["teleportation", "pads"],
    body: "First developed as booths over fifty years ago, the teleportation technology was eventually reduced in size to a convenient pad at floor level which can be used to transport cargo, or, by stepping on them, people instantaneously from one location to another nearby location. Although their range is somewhat limited, by strategically positioning them they have proved very effective in covering large distances quickly by hopping from one to the next. Alternately, they can be keyed in a 'round robin' fashion so that stepping back onto a pad you've just departed actually transports you to a third pad and so on, rather than sending you back to the original one. These circuits eventually lead back to the original pad and so are handy for travelling commonly used routes. Teleportation pads can be keyed to security badges or pay travel cards.",
  },
  {
    id: "plt",
    terms: ["plt"],
    body: "A convenient, portable method of communicating with the central library without having to physically travel to a library terminal.",
  },
  {
    id: "quantum_folder",
    terms: ["quantum", "folder"],
    body: "First developed some forty years ago, the technology has many applications, but transporting goods turned out to be perhaps the most common. A favorite among professionals and students alike, the Black Field Folder (sometimes called a 'Heinlein's Folder' or 'Quantum Folder') is typically slim and ranges in size from a business card or badge, to a large flatscreen. The Black Field is capable of containing an almost limitless number of objects of any size and weight (provided they can fit into the field itself). Objects within the field are visible only as a floating point of light, and have no weight making such fields a very convenient way to carry and/or ship large numbers of things. Black Fields are often equipt with neural signature technology, allowing the device to anticipate with 98% accuracy the item you wish to retrieve and feeding that item back out of the field.",
  },
  {
    id: "vitaboost",
    terms: ["vitaboost"],
    body: "VitaBOOST is the marketing name for the drug Ibuproxitine which is capable of accelerating body repair in excess of 1000% for a short time.",
  },
  {
    id: "whiskey",
    terms: ["whiskey"],
    body: "A distilled spirit made from corn.",
  },
  {
    id: "rum",
    terms: ["rum"],
    body: "A distilled spirit made from mollasses.",
  },
  {
    id: "vodka",
    terms: ["vodka"],
    body: "A distilled spirit made from either potatoes, or grain such as wheat or rye.",
  },
  {
    id: "bourbon",
    terms: ["bourbon"],
    body: "A distilled spirit made from corn.",
  },
  {
    id: "gin",
    terms: ["gin"],
    body: "A distilled spirit made from juniper berries",
  },
  {
    id: "scotch",
    terms: ["scotch"],
    body: "A distilled spirit made from barley",
  },
  {
    id: "tequila",
    terms: ["tequila"],
    body: "A distilled spirit made from the blue agave plant.",
  },
  {
    id: "artificial_intelligence",
    terms: ["AI", "artificial", "intelligence"],
    body: "Artificial Intelligence was first successfully demonstrated over 100 years ago and has become incorporated in many aspects of modern technology, including the Central Library.",
  },
  {
    id: "mind_spider_arachnida_psionica",
    terms: ["mind", "spider", "arachnida", "psionica"],
    body: "The Arachnida Psionica, or Mind Spider, as it is often called, is actually not an arachnid at all, and in fact does not even resemble one biologically (although they are quite similar visually). What appears to be an exoskeleton is actually a series of hard, leathery skin plates and the creature actually has a lightweight internal skeleton with latticed bones, much like a terrestrial bird. They do not spin webs, although like some spiders they are capable of leaping great distances. Even after study, little is known about why the creature exhibits the strange behavior which gives it its name. It seems to use its jumping ability almost exclusively for the purpose of leaping up to the head or face of another creature, where it will grab on with its spindly legs very effectively. It then attaches two sensetive feelers to its victim, through which it is somehow able to absorb the electrical impulses coursing through the brain. Brainscans taken while this is occurring show a noticable diminishing in brain activity during the course of this odd ritual. After feeding in this way, the creature will drop off and, sated for the time being, will ignore its former victim and may even linger nearby. The creature does not use this method of 'feeding' as a form of sustanence, and must physically eat about as often and as much as other terrestrial creatures its size, so it is not clear what exactly it derives from this behavior. The effects on the victim have not appeared to be permenant.",
  },
  {
    id: "screecher_alien_parrot",
    terms: ["parrot", "screecher", "xenopsephotus", "wallicus"],
    body: "The Xenopsephotus Wallicus, or Screecher as it is often called, is sometimes also referred to as the 'Alien Parrot'. This is a bit of a misnomer, in that the creature is not a bird, but it does exhibit the ability to mimic human speech and repeat it back much like the parrot does. It is in fact many times better at it than the terrestrial parrot; the Screecher has been observed to repeat back rather long phrases and is capable of remembering things it has heard for weeks or even months. It does not appear to be dangerous to humans in any way, however, on a side note, it has displayed an intense interest in predating the Brain Slug.",
  },
  {
    id: "sex",
    terms: ["sex"],
    body: "Well, you see, when two or more humans love each other very much, they... The Central Library goes on for quite some time delivering a lecture which is at times, even for you, quite informational...",
  },
];
