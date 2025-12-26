import type { Item } from "../../game/types/itemTypes";

export const corpseItems: Item[] = [
  // LEVEL 7 – Splattered corpse in corridor ---------------------------------
  {
    id: "SplatteredCorpse",
    name: "splattered corpse",
    description:
      "The man’s body looks like it was subjected to a full-on assault: focused burn scars, ragged gunshot wounds, and a brutal blast that has torn apart the upper-left side of his torso and head. He wears only a pair of pants; no shirt, socks, or shoes.",
    initialDescription:
      "The gristly remains of a man lie in the corridor, dressed only in a pair of pants and torn apart by gunfire and an explosion.",
    sceneryDescription:
      "A ruined corpse lies in the corridor, the upper-left side of his body blasted into rags.",
    location: "LevelSevenCorridorBend",
    vocab: ["splattered", "corpse", "body", "man"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 80,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  // Burned area remains ------------------------------------------------------
  {
    id: "EdgeOfBurnedAreaRemains",
    name: "burned remains",
    description:
      "Under the surrounding ash you can make out the twisted suggestion of a human frame, blackened bone half-fused with char and debris.",
    initialDescription: undefined,
    sceneryDescription:
      "Near one corner of the room, a tangle of charred bone and ash suggests what might once have been a person.",
    location: "EdgeOfBurnedArea",
    vocab: ["remains", "person", "charred", "body", "corpse"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 4,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "BurnedSkeleton",
    name: "burned skeleton",
    description:
      "The skeleton is burned a dead matte black, draped in fragile flakes of ash where clothing and skin used to be. Empty eye sockets stare upward and the jaw hangs slack in a permanent, silent scream.",
    initialDescription: undefined,
    sceneryDescription:
      "A blackened skeleton rests in the ashes, its empty eye sockets turned toward you.",
    location: "CornerOfBurnedArea",
    vocab: ["burned", "skeleton", "body", "corpse", "remains", "skull"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 25,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "brains",
    name: "spray of viscera",
    description:
      "What’s left of the man’s skull has been blasted open, scattering blood, bone, and brain across the floor in a grisly fan.",
    initialDescription: undefined,
    sceneryDescription:
      "A spray of blood and viscera is splashed across the floor nearby.",
    location: "NOWHERE", // TODO: moved into ARMORY when the event triggers
    vocab: ["brains", "viscera", "blood", "head"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 3,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "FrozenGuyD",
    name: "sprawled body",
    description:
      "The man lies naked and face down on the floor. One hand is clamped to his neck, and his tongue hangs partway out of his mouth, lips dark and still.",
    initialDescription: undefined,
    sceneryDescription:
      "A naked body lies face down on the floor, one hand clutching its own throat.",
    location: "LevelTwoSecondaryCorridorThree",
    vocab: ["sprawled", "body", "man", "person", "corpse", "cadaver"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 80,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "StairWellThreeBurnedBody",
    name: "burned corpse",
    description:
      "The body is so thoroughly burned you can’t even be sure of its sex. Charred scraps of clothing cling like brittle parchment, and the remains look as though whoever it was collapsed here while already on fire and finished burning where they fell.",
    initialDescription: undefined,
    sceneryDescription:
      "A badly burned corpse lies crumpled on the stairs, little more than char and ash-wrapped bone.",
    location: "StairFour",
    vocab: ["burned", "body", "corpse"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 70,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  // LEVEL 1 – Bridge ---------------------------------------------------------
  {
    id: "CaptainsCorpse",
    name: "captain",
    description:
      "The captain’s body lies where she fell, uniform rumpled, features slack in death. Whatever command she once held has been reduced to this still, silent shape.",
    initialDescription: undefined,
    sceneryDescription:
      "The captain’s body lies near the command chair, unmoving.",
    location: "BridgeCaptain",
    vocab: ["captain", "body", "corpse"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 70,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "ScienceOfficer",
    name: "dead body",
    description:
      "The science officer lies where they collapsed at their station. For a moment the shadows around their features play tricks on your eyes, but it’s just another corpse in a dead room.",
    initialDescription: undefined,
    location: "BridgeScience",
    vocab: ["dead", "body", "science", "officer", "corpse"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 70,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "TactCorpse",
    name: "weapons officer",
    description:
      "The weapons officer was a stocky man in his late thirties. His eyes and mouth are speckled red, tongue swollen in his mouth. He lies face down in front of the weapons console, as if he died still trying to do his job.",
    initialDescription: undefined,
    location: "BridgeTact",
    vocab: ["weapons", "officer", "tactical", "security", "body", "corpse"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 75,
    itemSize: 9,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "HelmCorpse",
    name: "helmsman",
    description:
      "The helmsman looks to have been in his thirties. His eyes and mouth are speckled red, his tongue grotesquely swollen. He is slumped face down over the helm console, fingers still resting on the controls.",
    initialDescription: undefined,
    sceneryDescription:
      "The helmsman lies slumped over the console, fingers still touching the controls.",
    location: "BridgeHelm",
    vocab: ["helmsman", "dead", "body", "corpse"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 70,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "BridgeCommCorpse",
    name: "communications officer",
    description:
      "The communications officer is a lithe woman with long, straight red hair that now hangs over her face, brushing the floor. She has slumped so far forward in her chair that her head hangs between her knees.",
    initialDescription: undefined,
    sceneryDescription:
      "The comm officer hangs forward in her chair, red hair spilling over her face toward the floor.",
    location: "BridgeComm",
    vocab: ["communications", "officer", "body", "corpse"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 65,
    itemSize: 7,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  // LEVEL 2 – Quarters, armory, etc. ----------------------------------------
  {
    id: "EDSGIRL",
    name: "burned corpse",
    description:
      "What’s left of the young girl is fragile and nearly ash. She looks to have been in her teens, burned almost to nothing where she fell after fleeing the bedroom area.",
    initialDescription:
      "A frail-looking charred corpse lies sprawled in the middle of the floor.",
    location: "LevelTwoBurnedQuartersTwo",
    vocab: ["burned", "corpse", "body", "girl"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 40,
    itemSize: 6,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "FrozenGuy",
    name: "sprawled body",
    description:
      "The man’s body lies where he fell in the armory. Whether he died frozen in a chemically induced sleep or from the shot that took the back of his head off, the result is the same: naked, slack, and utterly still.",
    initialDescription: undefined,
    sceneryDescription:
      "A naked man lies sprawled on the deck, face down and unmoving.",
    location: "ARMORY",
    vocab: ["body", "man", "guy", "sprawled", "corpse", "cadaver"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 80,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "LevelTwoConferenceRoomCorpse",
    name: "woman's body",
    description:
      "The woman lies curled in a fetal position under the conference table. Her skin is ashen, lips bloodless, and there’s a dark speckling around her eyes and mouth. Her swollen tongue fills her mouth.",
    initialDescription:
      "Under the conference table, a woman’s body is curled tightly into the fetal position.",
    sceneryDescription:
      "A woman’s body lies curled under the conference table, still and tight as a knot.",
    location: "LevelTwoConferenceRoom",
    vocab: ["woman", "body", "corpse"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 60,
    itemSize: 7,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  // LEVEL 3 – Living quarters / spa / etc. ----------------------------------

  {
    id: "sevenwestcorpse",
    name: "legs",
    description:
      "The legs are clearly female, clad in nylons and half-covered by the tattered edge of a black skirt. They’re splayed in a posture that could be repose or collapse, bare feet exposed and empty of shoes.",
    initialDescription: undefined,
    sceneryDescription:
      "A pair of stockinged legs lies sprawled on the floor, skirt torn and feet bare.",
    location: "LivingQuartersSevenWest",
    vocab: ["legs", "body", "corpse"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 25,
    itemSize: 4,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "corpsesix",
    name: "corpse",
    description:
      "This is the corpse of a young man, sprawled across the floor as if he staggered here before collapsing. A faint trail of dark droplets leads away to the north. His uniform is scorched and tattered, hair burned away by heat or flame.",
    initialDescription:
      "A human figure lies sprawled at your feet, motionless.",
    location: "LevelThreeCorridorSix",
    vocab: ["corpse", "body", "figure"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 70,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "saunacorpse",
    name: "woman",
    description:
      "The woman appears to be in her early thirties. Her blonde hair hangs in a tangled, dried mess. She’s dressed in a black one-piece swimsuit with a small waterproof purse tied to her right wrist by a neon cord. Her face is frozen in a mask of terror, lips blue and parted, eyes bulging wide. Two gaping puncture wounds mark either side of her neck, and her upper body looks almost bloodless.",
    initialDescription:
      "A woman in a black one-piece bathing suit sits slumped in the corner on a cedar platform, her face turned toward the wall.",
    location: "Sauna",
    vocab: ["woman", "corpse", "body", "suit", "bathing"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 60,
    itemSize: 7,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "steamroomcorpseone",
    name: "older man",
    description:
      "The middle-aged man lies where he fell, slightly overweight, balding, with hair at his head and chest dusted grey. He wears swimming trunks. On his left forearm is a tattoo: an upside-down isosceles triangle within a circle, pierced by a V-shape whose point meets the triangle’s tip, with the stylized letters “DeM” beneath. The crown of his head is almost white, his lips and ears faintly blue, and there are two deep puncture wounds at either side of his neck.",
    initialDescription:
      "A middle-aged, slightly overweight man lies sprawled face down on the floor in swim trunks.",
    location: "SteamRoom",
    vocab: ["older", "man", "corpse", "body"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 70,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "steamroomcorpsetwo",
    name: "younger man",
    description:
      "The younger man has dark, close-cropped hair. His eyes are frozen wide in terror, tongue bulging from his open mouth. He wears swimming trunks. The same tattoo marks his left forearm—triangle within a circle, pierced by a V, with “DeM” beneath. His face, neck, and shoulders all the way to his chest are nearly bloodless, with twin puncture wounds at either side of his neck.",
    initialDescription:
      "Near the corner of the room, a younger man’s body is sprawled in a half-sitting position, arms and legs thrown out at odd angles.",
    location: "SteamRoom",
    vocab: ["young", "younger", "man", "corpse", "body"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 65,
    itemSize: 7,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "hubwestcorpse",
    name: "woman's body",
    description:
      "The woman has long greying hair that spills over her shoulders. Her face is slack but strangely serene, eyes fixed toward the obelisk even in death. She shows no obvious external wounds, but there is a fine red speckling clustered at the corners of her eyes and mouth. She wears a white blouse and a tartan skirt, now forever still.",
    initialDescription: undefined,
    sceneryDescription:
      "A woman’s body lies near the obelisk, gaze still locked in its direction.",
    location: "HubWest",
    vocab: ["body", "corpse", "woman"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 60,
    itemSize: 7,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  // Mens / Womens room – ELVIS, etc. ----------------------------------------
  {
    id: "ELVIS",
    name: "dead body",
    description:
      "A man in his thirties sits rigidly on the toilet, fully dressed in some kind of military uniform. His skin is waxy, face speckled red around the eyes and mouth, eyes frozen in a horrified stare toward the front of the stall. In better days he clutched a satchel and a small key; now he is just another uniform gone slack.",
    initialDescription:
      "A fully dressed man sits on the toilet inside the stall, wearing a military-style uniform and staring straight ahead in frozen horror.",
    location: "MensRoom",
    vocab: ["dead", "body", "man", "corpse"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 70,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "WomensShitterCorpse",
    name: "woman's body",
    description:
      "The woman is sharply dressed in a pantsuit and pillbox hat. No amount of makeup can disguise how stark white her skin has become. Two deep puncture wounds mark either side of her neck, and her blue eyes bulge in frozen horror. Her lips are parted slightly, and whatever color they once held is long gone.",
    initialDescription: undefined,
    sceneryDescription:
      "A well-dressed woman lies dead here, skin bloodless and eyes bulging wide.",
    location: "WomensRoom",
    vocab: ["woman", "corpse", "body"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 60,
    itemSize: 7,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "BODIES",
    name: "pile of bodies",
    description:
      "A pile of bodies has been heaped against the door, as if they died trying to barricade something out. Faces and limbs blur together, but the same red speckling circles the mouths and eyes of nearly every one.",
    initialDescription: undefined,
    sceneryDescription:
      "A tangled pile of bodies slumps against the door, frozen mid-barricade.",
    location: "PatientCareTwo",
    vocab: ["bodies", "corpses", "pile", "corpse"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 400,
    itemSize: 20,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "ORBody",
    name: "body",
    description:
      "This was a young man with red hair and a freckled but otherwise unmarked face. His chest cavity has been opened and the ribcage spread to expose the organs within. His neck has been cut up the center and one side of the flesh peeled away, revealing muscle beneath. Two large puncture wounds at either side of his neck appear to have pierced the jugular, and more such wounds can be found on the inside of each thigh.",
    initialDescription: undefined,
    sceneryDescription:
      "A young man lies on the operating table, chest and neck opened in a grim, unfinished autopsy.",
    location: "OperatingTable",
    vocab: ["body", "corpse", "man"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 70,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "LabCorpse",
    name: "man's body",
    description:
      "An older man with grey hair and a trimmed grey van dyke beard lies dead on the lab floor. His face is speckled red near the corners of his eyes and mouth, and his tongue is grotesquely swollen, filling his mouth. Whatever strange work he was doing here, it clearly didn’t save him.",
    initialDescription: undefined,
    sceneryDescription:
      "An older man in a lab coat lies dead on the floor, tongue distended and face speckled with tiny red bursts.",
    location: "Lab",
    vocab: ["man", "body", "corpse"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 65,
    itemSize: 7,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  // LEVEL 4 – Hydroponics / tunnels / bomb chamber --------------------------
  {
    id: "smokedcorpse",
    name: "sooty corpse",
    description:
      "The woman is coated head to toe in soot, skin and clothing alike stained grey-black. It looks as though she managed to stay ahead of the flames but not the smoke; whatever burned here, it finally choked the life out of her.",
    initialDescription:
      "A sooty woman lies face down in the grass, her whole body dusted black.",
    location: "HydroponicsThree",
    vocab: ["sooty", "body", "corpse", "woman", "dead"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 60,
    itemSize: 7,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "TunnelGuy",
    name: "man's body",
    description:
      "The man wears a black security uniform—fatigues, combat boots, and a heavy vest. He lies face down in the duct facing the access port to the north, as if he died trying to reach it. One boot is missing, and both lower pant legs are shredded to reveal deep puncture wounds in each calf. His legs are white as paper; something got him from behind and drained him dry.",
    initialDescription: undefined,
    sceneryDescription:
      "A security man lies face down in the duct, one boot missing and both calves shredded and bloodless.",
    location: "MaintenanceDuctThree",
    vocab: ["body", "man", "corpse"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 70,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "ALICEKreegle",
    name: "woman's body",
    description:
      "She looks to have been in her early forties but in excellent physical condition. A gunshot wound has punched through her, most likely catching a lung; the dried pattern of blood tells the story of someone who bled to death quickly and violently. Her face is frozen in an expression of horror.",
    initialDescription: undefined,
    sceneryDescription:
      "A fit woman lies where she fell, a gunshot wound having emptied her out onto the deck.",
    location: "BombChamber",
    vocab: ["body", "corpse", "woman", "alice", "kreegle"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 60,
    itemSize: 7,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "BombSquadGuy",
    name: "man's body",
    description:
      "The man’s gear marks him as security or military personnel; the white stenciling on his armor reads “BOMB SQUAD.” A knife wound has torn straight through his left jugular. The blood trail makes it clear he never had a chance.",
    initialDescription: undefined,
    sceneryDescription:
      "A man in bomb squad armor lies dead on the floor, throat opened by a single, decisive cut.",
    location: "BombChamber",
    vocab: ["body", "corpse", "man"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 70,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  // LEVEL 6 – Storage / zero-g ----------------------------------------------
  {
    id: "quadfourbody",
    name: "dead body",
    description:
      "The body floats near the floor in a shredded space suit. Both hands clutch at the torn fabric where the suit has been ripped completely open, the material hanging in limp ribbons.",
    initialDescription: undefined,
    sceneryDescription:
      "A body in a ripped space suit drifts near the deck, hands still clutching at the gaping tear.",
    location: "StorageQuadFour",
    vocab: ["dead", "corpse", "body", "man"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 65,
    itemSize: 7,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "storagecorpse",
    name: "dead body",
    description:
      "A woman’s body floats a short distance off the deck, one hand pressed to the damaged seal of her space helmet. A fracture runs through the faceplate. From what you can see of her features, she died of simple asphyxiation.",
    initialDescription: undefined,
    sceneryDescription:
      "A suited woman drifts in the air, one hand still pressed uselessly to a cracked helmet seal.",
    location: "QuadTwoStack",
    vocab: ["dead", "corpse", "body", "woman"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 60,
    itemSize: 7,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  // LEVEL 7 – Cryolab / grid / stairs ---------------------------------------
  {
    id: "cryolabcorpse",
    name: "messy corpse",
    description:
      "A dark-haired man with a close-cropped beard lies face down in a spreading pool of dried blood. He wears a military-style uniform. Three ragged exit wounds tear through his back where bullets punched their way out.",
    initialDescription:
      "A man in uniform lies face down in a pool of drying blood, shot several times.",
    sceneryDescription:
      "A uniformed corpse lies face down in a dried pool of blood, back torn by multiple exit wounds.",
    location: "CryoLab",
    vocab: ["man", "body", "corpse"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 70,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "gridcorpse",
    name: "gory corpse",
    description:
      "This man looks to have been hit with serious firepower. His body is seared with burn marks, and several large-caliber bullet wounds have torn through him, leaving his clothing shredded and stiff with dried blood.",
    initialDescription:
      "A corpse has been flung across the floor like a ragdoll, torn apart by gunfire.",
    location: "GridD4",
    vocab: ["body", "man", "corpse", "gory"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 70,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "StairFourBody",
    name: "dead soldier",
    description:
      "The young man wears heavy black clothing woven from reinforced fibers, the kind favored by commandos. Whatever weapon he carried is gone, scavenged by someone else. His face is drained of color, lips a cold blue, and two gory puncture wounds gape at either side of his neck.",
    sceneryDescription:
      "A young man in military-style garb lies on his back in the middle of the landing, lifeless eyes staring up the stairwell.",
    location: "StairSix",
    vocab: ["dead", "body", "man", "soldier"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 75,
    itemSize: 9,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "StairOneBody",
    name: "corpse",
    description:
      "The woman is long past saving—cold and rigid to the touch. Brushing her hair aside reveals red speckling around the corners of her eyes and mouth, as if countless tiny blood vessels had burst. Her tongue is so swollen it forces her lips apart slightly.",
    initialDescription: undefined,
    sceneryDescription:
      "A woman lies on the stairs, skin gone still and cold, hair half-hiding a face marked with fine red speckling.",
    location: "StairOne",
    vocab: ["body", "corpse", "woman"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 60,
    itemSize: 7,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  // Dead other self / gorilla -----------------------------------------------
  {
    id: "DeadOtherSelf",
    name: "strangely familiar dead person",
    description:
      "Your twin lies crumpled on the floor, disturbingly familiar in every line. In one ending, a hole burned straight through the breastbone and heart tells the story. In another, black, bulging veins mar the face and chest from some vicious drug. In yet another, the telltale red speckling of the virus rims the eyes and mouth—and in the last, the body is simply broken by accumulated trauma, slack and empty.",
    initialDescription:
      "A strangely familiar dead person lies in a crumpled heap on the floor.",
    location: "UNKNOWN", // TODO: set correct room id where the other self dies
    vocab: ["dead", "strangely", "familiar", "corpse", "body", "self", "other"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 70,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },

  {
    id: "DeadGorilla",
    name: "dead silverback gorilla",
    description:
      "The massive silverback gorilla lies in a heap, a mountain of muscle finally stilled. In one version of events, a gauss blast has cored a horrible cavity through its chest and torn an even larger exit wound from its back. In another, the eyes bulge wide and the jaws are peeled open in a rictus that shows far too many teeth.",
    initialDescription:
      "A dead silverback gorilla lies in a massive heap on the floor.",
    location: "UNKNOWN", // TODO: set correct room id for the gorilla encounter
    vocab: ["dead", "gorilla", "silverback", "ape"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 400,
    itemSize: 25,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },
];
