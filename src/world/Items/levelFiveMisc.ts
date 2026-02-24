import type { Item } from "../../game/types/itemTypes";

export const levelFiveItems: Item[] = [
  {
    id: "EngineRoomBulkhead",
    name: "bulkhead doors",
    description:
      "A pair of massive, interlocking blast doors seals off the engine core. The metal is warped and buckled as if something hit it from the inside, hard enough to shear the locking braces but not quite enough to tear them free. One door doesn’t fully meet the other, leaving a thin, jagged seam where orange reactor light leaks into the corridor along with a slow, wet hiss of steam. Above the doors, a recessed warning panel glows with the universal radiation symbol, its red halo painting everything in a sickly, emergency-room pall.",
    sceneryDescription:
      "The far wall is dominated by a warped bulkhead, its twin doors welded together by force and heat, bleeding reactor light through a narrow wound in the metal.",
    location: "EngineRoom",
    vocab: ["bulkhead", "doors", "door"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    hasEffect: undefined,
    providesLight: false,

    overrides: {
      open: "You wedge your fingers into the gap and strain until your joints scream. The doors barely shudder. Whatever forced them shut did a better job than you ever will bare-handed.",
      enter:
        "The gap in the bulkhead doors isn’t nearly wide enough to admit you. You’d leave skin and bone behind if you tried.",
    },
  },
  {
    id: "EngineRoomBulkheadGap",
    name: "gap in the bulkhead",
    description:
      "Up close, the gap between the doors is no wider than the edge of your hand. The light bleeding through it is an ugly, molten orange that feels too bright and too hungry, like staring into a wound that never stops glowing. Steam pulses from the sliver in slow, irritated breaths, carrying a faint metallic tang and the suggestion of burnt insulation.",
    sceneryDescription:
      "A hairline gap splits the warped bulkhead, leaking orange reactor light and a thin vein of steaming air.",
    location: "EngineRoom",
    vocab: ["gap", "space"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    hasEffect: undefined,
    providesLight: false,

    overrides: {
      open: "You brace yourself and try to pry the doors wider, but the metal doesn’t care. The gap stays exactly as narrow and unfriendly as before.",
      enter:
        "You eye the slit of light and imagine squeezing through it. You also imagine your ribs snapping. You stay where you are.",
    },
  },
  {
    id: "EngineRoomMonitors",
    name: "monitors and gauges",
    description:
      "A dense forest of analog gauges, digital readouts, and status LEDs blankets the bulkheads here. Pressure dials swing in lazy arcs, flickering between numbers that mean nothing to you. Bars of neon color climb and fall on vertical displays like heart monitors for dead machines. Some of the screens are cracked, edges spider-webbed and bleeding static. You recognize none of the labels, and the sheer number of indicators only confirms one thing: if something is going catastrophically wrong, you wouldn’t know until it was already too late.",
    sceneryDescription:
      "Banks of monitors and gauges blink and twitch, a wall of incomprehensible telemetry that does absolutely nothing to make you feel safer.",
    location: "EngineRoom",
    vocab: ["monitors", "gauges", "equipment"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 4,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    providesLight: true,
  },
  {
    id: "EngineRoomPanel",
    name: "radiation panel",
    description:
      "A squat, utilitarian status panel is bolted above the bulkhead doors. The only thing it bothers to show you is a pulsing radiation symbol, lit in deep, angry red. It doesn’t flicker, doesn’t blink out, just burns steadily as if the ship itself is quietly insisting: this is not a safe place to stand.",
    sceneryDescription:
      "A small panel above the doors burns steadily with a red radiation symbol, like an unblinking eye that knows exactly how doomed this space is.",
    location: "EngineRoom",
    vocab: ["panel", "radiation", "symbol"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    providesLight: true,
    isRadioactive: true,
  },
  {
    id: "EngineRoomKeyhole",
    name: "engine room key receptacle",
    description:
      "A silvery metal receptacle has been set into the wall beside the bulkhead, just below eye level. The slot is shaped for a heavy, specialized key, nothing as mundane as a simple ship’s pass. Two positions are marked with minimalist symbols: a hollow circle and a solid bar. Even without a legend you understand the intent—off and on, sleep and wake, quiet and ignition.",
    sceneryDescription:
      "Beside the doors, a silvery key receptacle waits patiently, marked with a simple circle and bar that promise to change everything if the right key is turned.",
    location: "EngineRoom",
    vocab: ["engine", "room", "keyhole", "receptacle", "silvery"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 1,

    providesLight: false,
  },
  {
    id: "EngineRoomKey",
    name: "large orange and black key",
    description:
      "It's a large key of some kind with a rectangular orange and black grip.",
    initialDescription:
      "Floating nearby in a slow end-over-end spin is a key with a rectangular orange and black grip.",
    location: "AboveTheQuadThree",
    vocab: ["large", "key", "black", "orange"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
    scoreId: "obtained_engine_room_key",
    meta: {
      kind: "key",
    },
  },
  {
    id: "EngineRoomButton",
    name: "square red button",
    description:
      "A square red button sits recessed in a worn metal plate, its edges polished to a dull shine by nervous fingers over the years. It has that particular look shared by all important hardware: no markings, no explanations, just an implied promise that once you press it, the ship will remember you forever.",
    sceneryDescription:
      "A lone red button waits on a small panel, the sort of control that never exists for anything trivial.",
    location: "ReactorRoom",
    vocab: ["square", "red", "button"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    providesLight: false,
  },
  {
    id: "Vomit",
    name: "puddle of vomit",
    description:
      "A slick puddle of half-digested sludge spreads across the deck plates, clinging to the shallow grooves in the metal. Under the emergency lighting it takes on a dirty rust color, and there are veins of red in it that are definitely not from something as harmless as food dye. Flies would be gathering here if the ship supported anything as innocent as normal life.",
    initialDescription: "There is a puddle of vomit here.",
    sceneryDescription:
      "A sour-smelling puddle of vomit clings to the deck, streaked with unmistakable threads of blood.",
    location: "UNPLACED",
    vocab: ["vomit", "puke", "gak", "spew", "chunks"],
    itemClass: "liquid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      eat: "You briefly imagine scooping some up. Your stomach responds by threatening to invert itself out of pure self-defense.",
      take: "Collecting samples is for people with gloves, tools, and a lab. You have none of those things, and even less inclination.",
      smell:
        "You lean in and instantly regret it. The smell is rancid, acidic, and unmistakably laced with blood.",
    },
  },
  {
    id: "EngVioletIND",
    name: "violet indicator disk",
    description:
      "A flat metal disk has been set flush with the bulkhead, its surface emitting a soft, uniform violet glow. The light isn’t bright enough to be useful, exactly, but it feels oddly calm, the way hospital lights feel calm right up until someone pulls a curtain and starts cutting.",
    initialDescription: "The disk is glowing with a warm, violet light.",
    sceneryDescription:
      "A small disk in the wall glows with a warm violet light, more mood lighting than warning—though on this ship those lines tend to blur.",
    location: "ReactorRoom",
    vocab: ["indicator", "light", "glow", "disk"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    providesLight: true,
  },
  {
    id: "DuctVioletIND",
    name: "violet indicator disk",
    description:
      "A matching metal disk has been mounted here, glowing with the same steady violet light as its twin elsewhere on the ship. It feels less like a signal and more like a heartbeat—low, constant, and disturbingly indifferent to whether you live or die.",
    initialDescription: "The disk is glowing with a warm, violet light.",
    sceneryDescription:
      "Set into the duct wall, a glowing violet disk casts a soft, earthy wash of light over the cramped metal.",
    location: "MaintenanceDuctThree",
    vocab: ["indicator", "light", "glow", "disk"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    providesLight: true,
  },
  {
    id: "AccessPORT",
    name: "access port",
    description:
      "An octagonal access port yawns open in the deck, its metal lip worn down by countless boots and tool carts. Beyond the edge, the passage drops straight into a lightless shaft. The air that drifts up from below is stale and cold, carrying the faint smell of oil, dust, and something older that the ventilation system gave up on filtering out a long time ago.",
    sceneryDescription:
      "The floor is broken by an octagonal access port, a clean-cut hole dropping away into a throat of darkness.",
    location: "MaintenanceDuctThree",
    vocab: ["access", "port", "lip", "mounting"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      enter:
        "You step toward the access port, lining yourself up with the darkness below. If you go down, you’d better be very sure you know the way back up.",
    },
  },
  {
    id: "SecurityPanel",
    name: "security keypad",
    description:
      "A compact security keypad has been slapped onto the duct wall with all the elegance of a patch over a leaking wound. Hardened putty or epoxy bulges around its edges, holding it in place at a crooked angle. A bundle of thick cables spills from the back of the unit, snake-trailing along the wall and floor until they disappear into the mounting around the access port. The keys themselves are worn, numerals 0 through 9 dimly backlit and waiting for someone who actually knows what they’re doing.",
    sceneryDescription:
      "A jury-rigged keypad leans crookedly on the wall, cables spilling from its backside and feeding into the hardware around the access port.",
    location: "MaintenanceDuctThree",
    vocab: ["security", "panel", "keypad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      take: "You try to pry the keypad free, but the adhesive holds fast. Someone really didn’t want this going anywhere.",
    },
  },
  {
    id: "epoxy",
    name: "epoxy around the keypad",
    description:
      "A thick ring of grayish epoxy or industrial putty has been smeared around the edges of the keypad. It’s hardened into an ugly collar of fossilized glue, ridged with fingerprints and tool marks. Whatever its chemical composition, the stuff looks like it’s more committed to this wall than you are to your own survival.",
    sceneryDescription:
      "Crusted epoxy holds the keypad to the wall like a calcified tumor, stubborn and ugly.",
    location: "MaintenanceDuctThree",
    vocab: ["epoxy", "putty"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      take: "You dig at the epoxy with your nails. It doesn’t even flake. Whatever this stuff is, it was meant to outlive the ship.",
      cut: "You scrape and gouge at the epoxy. Your tool barely scuffs the surface. It feels like trying to scratch concrete with a spoon.",
    },
  },
  {
    id: "cables",
    name: "cables",
    description:
      "A bundle of insulated cables spills from behind the keypad housing and runs along the wall in a messy, improvised line. The sheathes are scuffed and dirty, some stained with old fingerprints, others pressed flat where boots or knees have crushed them repeatedly. They vanish into the mounting around the access port, feeding power or data—or both—into whatever waits below.",
    sceneryDescription:
      "A trail of cables snakes from the keypad to the access port, looping along the wall like something that decided to live here.",
    location: "MaintenanceDuctThree",
    vocab: ["wires", "cables", "wire", "cable"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      take: "You tug on the cables. They bite back, anchored somewhere deep in the ship’s guts.",
      cut: "You hesitate. Severing random live cables in a confined metal tunnel feels like the kind of decision that makes you a short, tragic footnote in an accident report.",
    },
  },

  {
    id: "BCDome",
    name: "high dome",
    description:
      "Overhead, the chamber’s ceiling curves away into a high, shadow-drenched dome. The architecture is purely functional—no ornament, no pattern—just cold metal panels bolted together and painted in the kind of forgettable gray you only remember once the alarms start blaring. The peak of the dome is lost in darkness, broken only by the occasional glint where some tiny piece of hardware catches the light and then vanishes again. It feels less like a ceiling and more like a throat, waiting to swallow whatever happens down here.",
    sceneryDescription:
      "The chamber rises into a high, lightless dome, its peak swallowed in shadows that never quite let you see what’s up there.",
    location: "ReactorCore",
    vocab: ["dome"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "LADDER_MaintenanceDuctThree",
    name: "access ladder",
    description:
      "An industrial ladder is bolted to the wall by the access port, its rungs worn smooth where countless boots have climbed down into whatever waits below. The sides are painted in chipped hazard yellow, the color long since dulled by grime and hand oil. It drops away into the shaft and vanishes into the dark, a straight, narrow path into the ship’s interior.",
    sceneryDescription:
      "A metal ladder clings to the wall beside the access port, its rungs disappearing into the darkness below.",
    location: "MaintenanceDuctThree",
    vocab: ["access", "ladder"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      climb:
        "You grab the ladder, its rungs cold and slightly slick, and start moving into the dark below.",
    },
  },
  {
    id: "LADDER_BombChamber",
    name: "access ladder",
    description:
      "A single ladder rises from the deck to the very peak of the dome, a thin spine of metal stitched awkwardly onto the chamber’s curve. The rungs are close-set and unforgiving; a slip here would mean bouncing off steel and landing badly on something that is almost certainly explosive. Looking up, the ladder seems to narrow into infinity, like the ship never quite decided where it ends.",
    sceneryDescription:
      "From the floor of the bomb chamber, a ladder runs all the way up into the dome, a straight bolt of metal connecting ground to shadows.",
    location: "ReactorCore",
    vocab: ["access", "ladder"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      climb:
        "You wrap your hands around the cold rungs and begin the climb toward the dome, each step echoing too loudly in the hollow chamber.",
    },
  },
  {
    id: "DUCTWORK",
    name: "overhead grid and ductwork",
    description:
      "High overhead, a metal grid crisscrosses the dome like a web, supporting a tangle of ducts and bundled cables. Some of the conduits look new, their insulation clean and intact. Others sag, patched with tape or brackets that were clearly never part of the original design. The entire assembly creaks softly as the ship breathes, as if the infrastructure itself is growing tired of holding everything together.",
    sceneryDescription:
      "A grid of metal supports a dense cluster of ducts and cables above you, a sagging ceiling of mechanical veins.",
    location: "ReactorCore",
    vocab: ["grid", "ductwork", "ducts"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "OWindow",
    name: "observation window",
    description:
      "Set into one wall is a thick, slightly curved observation window made from some heavy, transparent composite. It frames a limited, almost claustrophobic view of the engine core beyond: an intense column of white light that pulses with a slow, mechanical heartbeat. The glare forces you to squint, and staring at it too long leaves ghost images burned into your vision. A spray of dried blood has been flung across the interior side of the window, turning parts of the view into a smeared, reddish haze.",
    sceneryDescription:
      "A thick observation window stares into the engine core, its view smeared by a fan of dried blood.",
    location: "ReactorCore",
    vocab: ["observation", "window"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 4,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isRadioactive: true,

    overrides: {
      search:
        "You press closer to the window, trying to see past the glare. Beyond the blood-streaked glass, a bright white column burns steadily in the core, impossible to look at directly.",
      attack:
        "You rap your knuckles against the window. The material doesn’t flex, doesn’t crack, doesn’t even sound hollow. If it fails, it won’t be because of anything you do.",
    },
  },
  {
    id: "OCORE",
    name: "engine core",
    description:
      "Beyond the armored glass, the engine core manifests only as glaring vertical columns of white light. They flicker and pulse in a rhythm that feels wrong for any human heartbeat, too slow and too precise. The surrounding machinery is only barely visible as dark silhouettes cut into the radiance. Whatever the exact mechanics, one thing is certain: there is enough energy behind that glow to erase you from existence without leaving anything meaningful behind.",
    sceneryDescription:
      "Through the thick window, you can sense the engine core as stark white columns of light, beating with cold, industrial patience.",
    location: "ReactorCore",
    vocab: ["engine", "core"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isRadioactive: true,
  },
  {
    id: "SplashOBlood",
    name: "splash of blood",
    description:
      "A jagged fan of dried blood decorates the wall near the observation window, droplets flung outward in a pattern that suggests speed, violence, and no time at all to react. The color has darkened to near black, but in the cracks where it has pooled it still clings with a sticky, almost fresh sheen. There’s no body here, no obvious sign of where it went—just this moment frozen on the wall.",
    sceneryDescription:
      "A spray of blood darkens the wall, radiating out in a frozen gesture of impact with no visible source.",
    location: "ReactorCore",
    vocab: ["splash", "blood", "spray", "jet"],
    itemClass: "liquid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "MainComputerArray",
    name: "main computer array",
    description:
      "A massive octagonal console dominates part of the chamber, rising almost ten feet from the deck. Every surface is colonized by technology: rows of contact plates, toggles, sliders, keys, tiny lever switches, and blinking indicator lights. Narrow readouts scroll data in alien shorthand you don’t recognize. It feels less like a user interface and more like a ritual altar for engineers, designed for people who speak in voltage and error codes instead of words.",
    sceneryDescription:
      "A towering octagonal computer array looms over the deck, bristling with controls and readouts you don’t understand.",
    location: "ReactorCore",
    vocab: [
      "main",
      "computer",
      "array",
      "gauges",
      "lights",
      "sliders",
      "buttons",
      "keys",
      "levers",
      "contacts",
      "readouts",
      "readout",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isSwitchable: true,
    isOn: false,
    providesLight: true,

    overrides: {
      use: "You rest your hands on the controls, waiting for familiarity to kick in. It doesn’t. If you ever knew how to operate this thing, the knowledge is gone with the rest of your missing memories.",
      switch:
        "You scan the array for a master power switch. If there is one, it’s buried under layers of procedure you don’t have access to.",
    },
  },

  {
    id: "Crate",
    name: "wooden crate",
    description:
      "A large wooden crate sits open on the deck, its splintered lid discarded somewhere out of sight. Inside, nestled in a foam cradle, is a sleek capsule-shaped device that could only be a bomb. Stenciled along the side of the crate in harsh black letters are the words: LOW YIELD SSM – HANDLE WITH EXTREME CARE. The paint is chipped and scuffed, but the message still feels uncomfortably fresh.",
    initialDescription:
      "A large wooden crate has been opened to reveal a massive bomb-like device inside.",
    sceneryDescription:
      "An open wooden crate squats near the center of the chamber, its interior occupied by a sinister capsule-shaped device and scarred warning stencils.",
    location: "ReactorCore",
    vocab: ["wooden", "crate", "large"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: true,
    capacity: 1,
    //contains: ["SingularityBomb"],

    overrides: {
      open: "The crate is already open; whatever protection it once offered has long since been surrendered.",
      close:
        "You can’t see the lid anywhere, and even if you found it, wrestling it back into place over that thing would be its own kind of nightmare.",
    },
  },
  {
    id: "SingularityBomb",
    name: "capsule-shaped device",
    description:
      "The device filling the crate is roughly coffin-sized, its smooth gunmetal surface broken only by precise, almost surgical seams. It looks more grown than manufactured, as if someone taught metal how to behave like bone. A small panel on its face houses an LCD readout and, just beneath that, a round electronic socket. Halfway down, another panel has been removed, exposing a dense cluster of colored wires that vanish into its interior. A single red LED near the socket flashes with impatient regularity, casting nervous pulses of light across the wiring.",
    sceneryDescription:
      "A coffin-sized capsule nestles in the crate, gunmetal skin traced with seams and lit by a single, angrily blinking red LED.",
    location: "ReactorCore",
    vocab: ["capsule-shaped", "device", "singularity", "SSM", "bomb"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    providesLight: true,
  },
  {
    id: "SBOMBSocket",
    name: "bomb socket",
    description:
      "A small, round metallic socket sits just beneath the LCD on the bomb’s face, about a quarter inch in diameter. The metal around it is subtly polished, as if a device has been plugged in and removed many times. It’s the kind of interface designed for exactly one purpose, and none of those purposes are likely to be gentle.",
    sceneryDescription:
      "A neat circular socket rests below the bomb’s display, patiently waiting for the right piece of hardware to complete the circuit.",
    location: "ReactorCore",
    vocab: ["socket"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 1,
  },
  {
    id: "BombLCD",
    name: "bomb LCD display",
    description:
      "A narrow LCD display is set into the bomb’s casing, its segmented numerals etched in harsh, sterile light. The numbers tick down in a way that feels less like a clock and more like a promise. Whatever algorithm drives the countdown doesn’t seem interested in your opinion.",
    sceneryDescription:
      "The bomb’s LCD glows with a cold, clinical light, ticking out a sequence of numbers that feels increasingly personal.",
    location: "ReactorCore",
    vocab: ["LCD", "display"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    providesLight: true,
  },
  {
    id: "BombPanel",
    name: "bomb access panel",
    description:
      "A rectangular panel on the front of the bomb has been removed, exposing the dense interior wiring. The opening is just wide enough for a hand and a bad idea. Colored wires—dozens of them—vanish into the darkness beyond, each one a potential answer or catastrophe.",
    sceneryDescription:
      "A section of the bomb’s casing has been removed, revealing a cramped opening choked with multicolored wires.",
    location: "ReactorCore",
    vocab: ["panel"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      open: "The panel is already off, and the bomb is already naked enough for your liking.",
      close:
        "There’s no obvious way to reattach the panel, and even if there were, you’d rather see what you’re about to ruin.",
    },
  },
  {
    id: "WIRES",
    name: "cluster of wires",
    description:
      "Inside the open panel, a dense cluster of wires runs through the bomb’s interior in a tangled, color-coded riot. Red, maroon, purple, mauve, lilac, brown, umber, burnt sienna, crimson, blue, azure, cyan, white, yellow, tan, grey, green, chartreuse, plum, orange, pink, black, khaki, maize, salmon, silver, gold—each thread disappears into the device, its path and function completely opaque. It’s like staring at the nervous system of a machine that really doesn’t want surgery.",
    sceneryDescription:
      "A snarled bouquet of multicolored wires hangs inside the bomb’s exposed cavity, each one begging you to choose very, very carefully.",
    location: "ReactorCore",
    vocab: ["wires", "cluster", "colored"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 3,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      cut: "You’ll need to pick a specific wire. The bomb doesn’t do ‘close enough’.",
    },
  },
  {
    id: "WedgedDOOR",
    name: "heavy double doors",
    description:
      "A pair of heavy metal doors has been crushed inward, their frames twisted until the panels buckled and jammed tight. Whatever hit them left a narrow, uneven space between the edges, just large enough to hint at darkness beyond. The metal bears the scars of stress and impact, faint ripples frozen mid-collapse.",
    sceneryDescription:
      "The corridor ends at a set of thick double doors, bent and wedged shut by some enormous force.",
    location: "EngCorridorTwo",
    vocab: ["heavy", "double", "doors", "wedged", "jammed", "buckled"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isOpenable: true,

    overrides: {
      open: "You lean into the seam and shove until your muscles tremble. The doors don’t even pretend to care.",
      close:
        "They’re already closed. That’s the whole problem—just not in any way that helps you.",
      attack:
        "You hammer at the metal, but it’s going to take far more than you to undo whatever bent these doors into their current shape.",
    },
  },
  {
    id: "SHUTTLE",
    name: "shuttlecraft",
    description:
      "The shuttle squats in the bay like half a flying saucer, its hull a rounded wedge of composite and armored plating. Three stubby landing pads flare out beneath it—two in the rear, one in the front—spreading its weight across the deck. Engine housings along the back bristle with vents and heat scoring, all dormant for now. There are no windows, no viewports, nothing to suggest it was ever meant to be comfortable. It’s simply a bullet, waiting to be fired.",
    sceneryDescription:
      "A blunt, windowless shuttle sits on three landing pads, its engines dark and its hull bearing the scars of old burns.",
    location: "ShuttleBay",
    vocab: ["shuttle", "shuttlecraft", "craft"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 20,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      enter:
        "You move toward the shuttle’s access point, the hull looming over you like a closed fist.",
    },
  },
  {
    id: "SHUTTLEREADER",
    name: "thumbpad",
    description:
      "A small biometric thumbpad juts from the shuttle’s hull near the entry seam. The sensor surface is dark and glossy, framed by a battered housing that’s seen more use than maintenance. It looks like the sort of system designed to respond only to authorized flesh—or anything that can convincingly pretend to be.",
    sceneryDescription:
      "A thumb scanner sits near the shuttle’s hatch, waiting for a familiar print it may never see again.",
    location: "ShuttleBay",
    vocab: ["thumbpad", "reader", "scanner", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      touch:
        "You press your thumb to the pad. An electronic buzz sounds, followed by a smooth, disinterested voice noting that the shuttle is assigned to Commander Warren Otts—and that you are not him.",
      push: "You place your thumb on the scanner. The system politely reminds you that Commander Warren Otts still outranks you, even in absentia.",
    },
  },
  {
    id: "THUMB",
    name: "severed thumb",
    description:
      "Someone has taken the trouble to remove a human thumb and keep it relatively intact. The skin is pale and waxy, the nail rimmed with grime. Dried blood crusts around the ragged end where it used to connect to the rest of the hand. It’s exactly the sort of thing a stubborn biometric lock might accept without asking too many questions.",
    sceneryDescription:
      "A severed thumb lies here, stiff and pale, as if its primary job now is to open doors its owner will never walk through.",
    location: "UNPLACED",
    vocab: ["severed", "thumb"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isContagious: true,
  },
  {
    id: "CoordFinder",
    name: "small rectangular readout",
    description:
      "A non-descript black device fits neatly in the palm of your hand, its only feature a narrow red readout on the front. A constant sequence of numbers scrolls across the display, glowing in a flat, unfriendly red. Whatever it’s tracking, it’s doing so with obsessive precision.",
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
  {
    id: "SeatCushion",
    name: "seat cushion",
    description:
      "A black seat cushion rests on one of the shuttle’s passenger benches, upholstered in a synthetic fiber that tries and fails to pass for comfort. A sturdy nylon tab protrudes from the front, clearly meant to be pulled. The cushion sits a little too neatly, like it’s hiding something the designers didn’t want found until the wrong moment.",
    sceneryDescription:
      "A black shuttle seat cushion sits perfectly in place, a nylon tab at the front inviting curious fingers.",
    location: "InsideShuttle",
    vocab: ["cushion", "seat"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      lift: "You hook your fingers under the cushion and heave it up, revealing a storage compartment hidden beneath the seat.",
      lower:
        "You press the cushion back into place, smoothing it down until the shuttle looks like it has nothing to hide again.",
    },
  },
  {
    id: "NylonTag",
    name: "nylon tag",
    description:
      "A tough black nylon tag protrudes from the front of the shuttle seat cushion. It’s been stitched and reinforced, designed to be yanked hard and often. The fabric is slightly polished from use, the kind of detail that tells you plenty of people pulled this before you ever got here.",
    sceneryDescription:
      "A reinforced nylon pull-tab is sewn into the seat cushion’s edge, practically begging to be tugged.",
    location: "InsideShuttle",
    vocab: ["nylon", "tag", "tab"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,

    overrides: {
      lift: "You grab the tab and pull, raising the seat cushion.",
      pull: "You yank the nylon tag, and the cushion comes up with it.",
      open: "You pull up on the tab and lift the cushion, exposing the compartment beneath.",
    },
  },
  {
    id: "SeatLocker",
    name: "storage compartment",
    description:
      "Hidden beneath the shuttle seat is a hollow storage compartment, lined with scuffed composite and faint dust rings where gear once sat. It’s just large enough to hide something important—and just small enough that whatever you put in there will rattle around every time the shuttle hits turbulence.",
    sceneryDescription:
      "Beneath the raised seat, a modest storage compartment waits for something to justify its existence.",
    location: "InsideShuttle",
    vocab: ["storage", "compartment", "seat"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 2,
    itemSize: 3,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: true,
    capacity: 5,
  },
  {
    id: "MatterTransmitter",
    name: "matter transmitter plate",
    description:
      "The machine has an emblem on it that says 'OMNI-Port - Matter Transceiver.' It looks like the metal plate is for sending and receiving.",
    sceneryDescription:
      "The aft section of the shuttle is devoted to a large mechanism of some kind which consists of a base with a sturdy column, which supports a large, oval, slightly curved metal plate, about six feet by four feet. Above the plate is another, smaller square metal plate mounted on the ceiling. The base and column are home to a complex series of electronics and wires. A panel is mounted to the unit, extending outward from just in front of the metal plate.  The panel is home to an LCD readout which displays six different values, and in front of that is a keypad for setting the values. Beside the keypad is a glowing green contact.",
    location: "InsideShuttle",
    vocab: ["matter", "transmitter", "device", "plate"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 20,
    isSurface: true,
    isOpenable: false,
    capacity: 1,
    meta: {
      onPlateOccupied:
        "There's already another item on the machine's transceiver plate.",
    },
  },
  {
    id: "MTManual",
    name: "dogeared manual",
    description:
      "A battered technical manual lies nearby, its corners bent and its cover permanently creased. The title stamped on the front reads: “Matter Transmission for the Mentally Deficient.” Someone in the design chain clearly had a sense of humor, or a grudge.",
    initialDescription:
      "Lying on the floor near the massive transmitter is a dogeared manual.",
    sceneryDescription:
      "A grimy instruction manual rests on the deck, promising to explain impossible technology in very patient terms.",
    location: "InsideShuttle",
    vocab: ["manual", "instructions", "book"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isLoggable: true,
    isReadable: true,
    readableTitle: `Matter Transmission Manual`,
    readableText:
      "You flip through the manual. It’s dense with diagrams, equations, and bureaucratic safety warnings, but one section has been underlined so aggressively the paper is nearly torn:\n\n" +
      "14.2 – INITIATING TRANSMISSION\n\n" +
      "Matter transmission, the text explains, can occur in one of two ways: objects can be transmitted to the device, or from the device to a remote location. To bring something to the transmitter, you simply enter the correct coordinates and push the green contact; if the target object is in range, it will be pulled onto the plate automatically.\n\n" +
      "To send something away, you place the object on the transmission plate first, set the desired coordinates, and touch the green contact. The manual politely stresses that invalid coordinates may result in the object being “lost forever,” which sounds suspiciously like the corporate term for “atomized into deep time.”\n\n" +
      "The shuttle bay or landing area outside is defined as coordinates 00, 00, 00. The six values correspond to six directions:\n\n" +
      "• Coordinate one: up\n" +
      "• Coordinate two: down\n" +
      "• Coordinate three: north\n" +
      "• Coordinate four: south\n" +
      "• Coordinate five: east\n" +
      "• Coordinate six: west\n\n" +
      "Each step along a given axis usually has a value of 5, although some distances—like long hallways—may double that. The examples are clinical and unsettling: go east, then north, then up a flight of stairs from the bay and you reach 50, 50, 50. Start at the bay, travel north, then west, then west again, then down three flights of stairs and north once more, and you end up at 015, 100, 010.\n\n" +
      "The manual strongly recommends testing new coordinates with objects “of little value” before sending anything or anyone you’d miss. It also notes that outgoing transmissions take priority over incoming ones: if there’s an object on the plate and another one waiting at the destination, the thing on the plate goes first. The plate must be clear to accept incoming matter.\n\n" +
      "The last line in the section is underlined three times: “Happy transmitting!” It doesn’t feel especially sincere.",
    isContainer: false,
  },
  {
    id: "TransmitterReadOut",
    name: "transmitter readout",
    description:
      "A dedicated LCD readout on the transmitter’s console casts a muted greenish glow. It displays six groups of numbers separated by commas—coordinates, if the manual is to be believed. The values shift occasionally, as if the system is quietly updating its understanding of where, exactly, ‘here’ is.",
    sceneryDescription:
      "An LCD panel on the transmitter quietly displays six glowing coordinate values, an unblinking summary of where the ship thinks you are.",
    location: "InsideShuttle",
    vocab: ["readout", "lcd", "display", "coordinants", "coordinates"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    providesLight: true,
  },
  {
    id: "MatterTransmitterButton",
    name: "green contact",
    description:
      "A circular green pad sits just below the transmitter’s keypad, its surface faintly illuminated from within. It doesn’t look like much, but given the hardware wrapped around it, pressing that contact is either the solution to a lot of problems—or the start of much worse ones.",
    sceneryDescription:
      "Just beneath the transmitter’s coordinate panel, a glowing green contact waits for a fingertip and bad judgment.",
    location: "InsideShuttle",
    vocab: ["button", "green", "contact"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    providesLight: true,

    overrides: {
      push: "You rest your finger on the green contact. For a heartbeat, nothing happens. Then deep inside the mechanism, something spools up with a rising electronic whine.",
    },
  },
];
