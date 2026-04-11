import type { Item } from "../../game/types/itemTypes";

export const levelThreeItems: Item[] = [
  {
    id: "MensLockers",
    name: "array of small lockers",
    description:
      "There are sixteen of them in total, each one can be locked with a key.",
    sceneryDescription:
      "Against the far wall is a grid of small lockers, four across and four down.",
    location: "MensShower",
    vocab: ["lockers", "locker"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
  },
  {
    id: "WomensLockers",
    name: "array of small lockers",
    description:
      "There are sixteen of them in total, each one can be locked with a key.",
    sceneryDescription:
      "Against the far wall is a grid of small lockers, four across and four down.",
    location: "WomensShower",
    vocab: ["lockers", "locker"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
  },
  {
    id: "MensLockerKey5",
    name: "blue locker key, labeled '5'",
    description:
      "It's a small key with a blue rubber grip. The grip has the number '5' pressed into it.",
    location: "INVENTORY",
    vocab: ["key", "locker key", "five", "5"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    meta: {
      lockerType: "men",
      lockerIndex: 5,
      kind: "key",
    },
  },
  {
    id: "WomensLockerKey12",
    name: "white locker key, labeled '12'",
    description:
      "It's a small key with a white rubber grip. The grip has the number '12' pressed into it.",
    location: "INVENTORY",
    vocab: ["key", "locker key", "twelve", "12"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    meta: {
      lockerType: "women",
      lockerIndex: 12,
      kind: "key",
    },
  },
  {
    id: "TAPE3AE",
    name: "warning tape",
    description:
      "A strip of yellow plastic tape stretches across the corridor, about three inches wide, glossy where the light hits the creases. Bold black letters repeat the same message over and over along its length.",
    sceneryDescription:
      "The warning tape sags a little between its anchor points, forming a flimsy barrier that feels more psychological than physical. The black lettering—BIOHAZARD - DO NOT ENTER—has bled slightly into the plastic, as if even the ink is leaching something unpleasant.",
    location: "LevelThreeCorridorOne",
    vocab: ["warning", "tape", "yellow", "black"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isContainer: false,
  },
  {
    id: "STICKER",
    name: "skull sticker",
    description:
      "A small sticker of a stylized skull, its edges curling where the adhesive has dried out. The design looks like a band logo—too polished to be random graffiti.",
    sceneryDescription:
      "Someone slapped the sticker onto the wall at casual reach height. The skull grins out in stark white and black, framed by cracked laminate and tiny bubbles where air got trapped underneath. It’s the one touch of personality in a corridor otherwise designed by a safety committee.",
    location: "LevelThreeCorridorOne",
    vocab: ["skull", "sticker"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "BlackBlood",
    name: "black fluid",
    description:
      "Something dark and viscous has sprayed across the walls and floor. At first glance it looks like dried blood, but it’s too dark—almost ink-black, with a faint oily sheen.",
    sceneryDescription:
      "The black fluid clings in streaks and spatters, thick enough in places to form glossy ridges. Under the light it reflects a muddy rainbow, like engine oil left too long in the pan. Whatever it is, it dried in motion, frozen mid-drip in thin, ropey threads.",
    location: "LevelThreeCorridorTwo",
    vocab: ["substance", "fluid", "black", "blood", "liquid"],
    itemClass: "liquid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "TAPE3BE",
    name: "warning tape",
    description:
      "A strip of yellow warning tape hangs crookedly, scarred by several long rakes as if something with claws tore through it without slowing down. The bold black lettering is still just legible.",
    sceneryDescription:
      "The tape is shredded in places, dangling in thin tatters where claws or something like them gouged straight through. BIOHAZARD - DO NOT ENTER repeats between small biohazard symbols, but the message is undercut by the obvious fact that someone—or something—ignored it completely.",
    location: "LevelThreeCorridorTwo",
    vocab: ["warning", "tape", "yellow", "black"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isContainer: false,
  },
  {
    id: "DOLL",
    name: "tattered doll",
    description:
      "A child’s doll made to look like a little girl, molded from rubbery plastic and dressed in soot-stained clothes. One arm is missing, leaving a smooth, rounded stump at the shoulder.",
    sceneryDescription:
      "The doll’s glassy eyes stare past you, scuffed and scratched but still stubbornly bright. Ash has settled into the creases of its dress and around the joint seams, giving it the look of something recently exhumed rather than merely dropped. The missing arm only adds to the impression that someone loved it hard enough to break it.",
    location: "LevelThreeCubby",
    vocab: ["doll"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "PHONE1EBed",
    name: "phone",
    description:
      "A sleek bedside handset integrated into the ship’s messaging system. The small touch-sensitive keypad glows faintly, its icons worn a little from use.",
    sceneryDescription:
      "The phone sits in a recessed cradle built into the bedside console, a thin cable vanishing into the wall. Finger-smudges dull the surface around the keypad, hinting at late-night calls and conversations that used to matter.",
    location: "OneEastBed",
    vocab: ["phone", "handset", "headset"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "PHONE2EBed",
    name: "phone",
    description:
      "A standard-issue cabin phone, all clean lines and matte plastic. The touchpad is set flush with the surface, each contact point lighting under your fingertip.",
    sceneryDescription:
      "This handset looks newer than some of the others—less scratched, less abused. It rests perfectly aligned on its base, the kind of detail that suggests an owner who liked things orderly, right up until order stopped mattering.",
    location: "OneWestBed",
    vocab: ["phone", "handset", "headset"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "PHONE2WBed",
    name: "phone",
    description:
      "A shipboard handset with a few scuffs along the edge and a faint ring of discoloration where something once sat on top of it.",
    sceneryDescription:
      "The phone here looks like it’s doubled as a coaster, paperweight, and occasional projectile. Tiny nicks pockmark the casing, and a thin hairline crack runs along one corner of the touchpad, but the status light still pulses steadily.",
    location: "TwoWestBed",
    vocab: ["phone", "handset", "headset"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "PHONE4EBed",
    name: "phone",
    description:
      "A slim, angular handset with a brushed metal finish around the edges, more stylish than the standard issue but clearly built on the same hardware.",
    sceneryDescription:
      "Someone customized this unit—there’s a faint engraving around the bezel and a tiny sticker tucked under the clear shell near the base. The keypad glows with a soft blue tone instead of the usual white, giving it a quietly upgraded feel.",
    location: "FourEastBed",
    vocab: ["phone", "handset", "headset"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "PHONE6WBed",
    name: "phone",
    description:
      "A cigarette-scarred bedside phone, with a small burn mark along one edge where something hot was set too close.",
    sceneryDescription:
      "The handset has a little crescent of melted plastic near the base, as if someone parked a smoldering cigar too close more than once. The keypad still lights, but one corner of the display shows a permanent afterimage, like a ghost of some old notification.",
    location: "SixWestBed",
    vocab: ["phone", "handset", "headset"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "PHONE7WBed",
    name: "phone",
    description:
      "A compact shipboard phone, decorated with a small sticker half-peeled on the underside where someone thought no one would notice.",
    sceneryDescription:
      "The handset’s casing is scratched around the edges from being grabbed in a hurry, but the controls are clean and carefully wiped down. On the underside, a tiny cartoon decal peeks out from where the plastic has started to curl away.",
    location: "SevenWestBed",
    vocab: ["phone", "handset", "headset"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "PHONEBathEntrance",
    name: "phone",
    description:
      "A wall-mounted handset near the bathroom entrance, positioned for emergencies or arguments that couldn’t wait.",
    sceneryDescription:
      "This one is bolted to the bulkhead, with a slightly longer cord to reach the doorway. The plastic around the cradle is scuffed, as if it’s been grabbed mid-stride more than once, the kind of phone you answered on your way to somewhere else.",
    location: "BathroomEntrance",
    vocab: ["phone", "handset", "headset"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "OneEastAreaRug",
    name: "area rug",
    description:
      "A small area rug cut from shag-style carpeting, its fibers a chaotic blend of brown, olive green, and black. It looks partially stuck to the floor, but the bottom right corner lifts just enough to tempt you.",
    sceneryDescription:
      "The rug sits near the entryway like a half-hearted welcome mat. The shag pile has been stomped flat in the center and frayed at the edges, especially at the bottom right corner where the fibers are bent from being tugged up more than once.",
    location: "LivingQuartersOneEast",
    vocab: ["area", "rug", "shag"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 3,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: true,
  },
  {
    id: "Guitar",
    name: "electric guitar",
    description:
      "A '57 Higgenbottom Quantumcaster with Wakashi pickups and a whammy bar. You’re not entirely sure what any of that entails, but it screams top of the line. The body has a sleek black finish, offset by chrome machine heads and a bridge polished to a mirror shine.",
    sceneryDescription:
      "The guitar rests in a stand like a shrine piece, cable coiled neatly beside it. Light runs along the curves of the body in a smooth, uninterrupted line, catching on the chrome hardware in sharp, bright sparks. It looks like the kind of instrument that expects to be amplified in front of too many people.",
    location: "OneEastBed",
    vocab: ["electric", "guitar", "axe"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 10,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "OneWestDEBRIS_LQ2E",
    name: "debris",
    description:
      "Shattered plastic, splintered composites, and twisted metal fragments are scattered everywhere. Whatever was here before didn’t survive the outburst.",
    sceneryDescription:
      "The living area looks like it lost an argument with a wrecking ball. Desk pieces, panel shards, and anonymous chunks of hardware are piled up in drifts, smashed into splinters too small to easily identify.",
    location: "LivingQuartersOneWest",
    vocab: ["debris", "desk", "glass", "plastic", "components"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 3,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "OneWestDEBRIS_Bath",
    name: "debris",
    description:
      "Fragments of fixtures and shattered polyglass litter the bathroom floor, mixed with smaller pieces of electronics that clearly don’t belong in a bathroom.",
    sceneryDescription:
      "The debris is clustered around the sink and mirror, as if someone hit them hard enough to explode both into the room. Bits of wiring and casing glitter among the ceramic shards, like someone smashed an appliance in here too for good measure.",
    location: "OneWestBath",
    vocab: ["debris", "shards", "glass", "plastic", "components"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 4,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "OneWestDEBRIS_Bed",
    name: "debris",
    description:
      "Splintered furniture and broken casing pieces are strewn across the sleeping area, as if someone ripped through the room with zero interest in subtlety.",
    sceneryDescription:
      "Around the bed, the debris forms a chaotic halo of broken slats, cracked paneling, and bent brackets. It feels less like damage from an accident and more like the aftermath of something that very specifically wanted the room destroyed.",
    location: "OneWestBed",
    vocab: ["debris", "splinters", "glass", "plastic", "components"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 4,
    itemSize: 3,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "OneWestSTEREO",
    name: "electronics",
    description:
      "A jumbled heap of circuitry, cracked display panels, and warped housings. It might once have been a television, a stereo, or an all-in-one entertainment center.",
    sceneryDescription:
      "The tangle of electronics is too broken to identify cleanly. Heat has bubbled the plastic in places, while sharp metal fins and half-melted connectors jut out at odd angles. You can almost imagine which piece went where, but whatever it played isn’t playing anymore.",
    location: "LivingQuartersOneWest",
    vocab: ["television", "tv", "stereo", "entertainment", "center"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 6,
    itemSize: 3,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "CLAWMARKS_LQ2E",
    name: "claw marks",
    description:
      "Long gouges rake across the wall and furniture, deep enough to expose the internal structure beneath the finish.",
    sceneryDescription:
      "The marks are ragged but deliberate, parallel lines carved in sets of four and five. Judging from the depth of the grooves and their spacing, whatever made them had claws both very long and very sharp, and absolutely no respect for interior design.",
    location: "LivingQuartersOneWest",
    vocab: ["claw", "marks", "tears", "mark"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "CLAWMARKS_Bath",
    name: "claw marks",
    description:
      "Several deep scratches score the bathroom door and tiles, as if something tried very hard to get in—or out.",
    sceneryDescription:
      "The gouges on the bathroom surfaces are unpleasantly specific. Claws have ripped through synthetic wood, plaster, even a bit of ceramic, leaving white and gray scars against the smooth finishes. Some marks curve mid-swipe, suggesting whatever it was changed its mind mid-attack.",
    location: "OneWestBath",
    vocab: ["claw", "marks", "tears", "scratches"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "CLAWMARKS_Bed",
    name: "claw marks",
    description:
      "The bedframe and wall near the headboard are torn with long, brutal rakes that cut through fabric, padding, and into the structure beneath.",
    sceneryDescription:
      "The claw marks here look fresh, edges still sharp and un-softened by time. They radiate outward from where a sleeper’s throat or chest might have been, which is a thought you immediately wish you hadn’t had.",
    location: "OneWestBed",
    vocab: ["claw", "marks", "tears", "gouges"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "CLAWMARKS_L3C2",
    name: "claw marks",
    description:
      "Deep gouges run along the corridor wall, angled in the direction of travel. They look like something large used the bulkhead as a scratching post while sprinting past.",
    sceneryDescription:
      "The marks in the corridor cut straight through paint and panel, exposing dull metal underneath. Chunks of material have been torn free entirely, leaving small, jagged craters where claws bit in and refused to let go the first time.",
    location: "LevelThreeCorridorTwo",
    vocab: ["claw", "marks", "tears", "gouges"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "OneWestMATTRESS",
    name: "distressed mattress",
    description:
      "The mattress has been split open, its stuffing spilled out in uneven heaps. Springs poke through the torn fabric like exposed bone.",
    sceneryDescription:
      "The top layer hangs in ragged flaps, revealing clumps of synthetic fill and metal coils bent into awkward angles. Whatever did this wasn’t just trying to find something—it was making a point.",
    location: "OneWestBed",
    vocab: ["mattress"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 15,
    itemSize: 6,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "PLANTS_LQ2W",
    name: "plants and flowers",
    description:
      "The room is crowded with potted plants: tall, spindly ones reaching for the ceiling, squat leafy ones overflowing their containers, and cascades of trailing vines. Blossoms of blue, white, violet, and red punctuate the green.",
    sceneryDescription:
      "Every flat surface has been conscripted into supporting plant life. Ivy creeps along one wall, its tendrils wrapping themselves around conduit and vents. The air smells faintly of damp soil and something floral that doesn’t exist anywhere in nature but here.",
    location: "LivingQuartersTwoWest",
    vocab: ["plants", "pots", "flowers"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 6,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "PLANTS_2WBed",
    name: "plants and flowers",
    description:
      "A cluster of potted plants crowds the sleeping area—short ferns, a tall narrow tree, and a stubborn vine that has started using the bedframe as a trellis.",
    sceneryDescription:
      "Here in the sleeping nook the plants feel more personal: a small forest grown up around the bed, turning it into a kind of improvised greenhouse bunk. Fallen petals and stray leaves speckle the sheets, a quiet, living mess left behind.",
    location: "TwoWestBed",
    vocab: ["plants", "pots", "flowers", "vines"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 8,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "KibbleBOX",
    name: "box of cat kibbles",
    description:
      "A cardboard box of cat kibble, bright branding plastered across the front with a glossy, overexcited feline promising optimal joy per bite.",
    sceneryDescription:
      "The box is a little dented at the corners, with a tear along the top where it’s been opened and re-folded instead of properly closed. A few stray crumbs of kibble rattle inside when you move it, and there’s a faint, unmistakable smell of processed meat and artificial fish.",
    location: "UNKNOWN",
    vocab: ["box", "cat", "kibbles", "kibble", "food"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 3,
    itemSize: 2,
    isWearable: false,
    isContainer: true,
    isOpenable: true,
    capacity: 10,

    doses: 25,
  },
  {
    id: "FISHBOWL",
    name: "fish bowl",
    description:
      "A large, spherical fish bowl made from a clear glass-like polymer. The surface curves the room around it into gentle distortions.",
    sceneryDescription:
      "The bowl sits on its stand like a tiny, empty planet. Faint mineral rings cling just above the bottom where the water level used to be, and a few stray flakes of gravel glitter in the curve. Whatever lived here has moved on, one way or another.",
    location: "LivingQuartersOneEast",
    vocab: ["fish", "bowl", "fishbowl"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 4,
    itemSize: 3,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 5,
    meta: {
      container: {
        holds: ["solid", "liquid"],
      },
    },
  },

  {
    id: "URN",
    name: "urn",
    description: "A big old test urn.",
    sceneryDescription: "A ceramic urn sits in one corner.",
    location: "LivingQuartersOneEast",
    vocab: ["urn"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 4,
    itemSize: 3,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 5,
    meta: {
      container: {
        holds: ["solid", "liquid"],
      },
    },
  },

  {
    id: "DRUGTIN",
    name: "small tin box",
    description:
      "A small, silvery tin box, smooth-sided with a hinged lid. Fingerprints have dulled the shine in irregular patches.",
    sceneryDescription:
      "The box has that particular rattle that says there’s something small and important inside. The lid is scuffed around the edge where nails and tools have pried it open more times than the manufacturer intended.",
    location: "", //"SixWestCloset",
    vocab: ["small", "tin", "box"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: true,
    capacity: 3,
  },
  {
    id: "nylons",
    name: "nylons",
    description:
      "A pair of nylons with a wide hole torn open along one thigh where some heavy impact landed.",
    sceneryDescription:
      "The fabric around the tear has laddered into thin white runs, radiating outward like cracks in glass. The nylons are still clinging to their owner in places, making the damage look both recent and personal.",
    location: "LivingQuartersSevenWest",
    vocab: ["nylons", "nylon", "stockings", "stocking"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "EDSBLOOD_LQ7W",
    name: "blood trail",
    description:
      "A pattern of dark blood stains the floor, smeared and spattered as if whoever left it wasn’t walking cleanly anymore.",
    sceneryDescription:
      "The blood looks like it was running freely for a while—broad smears broken by heavier droplets where the person stumbled or leaned. It leads away from the worst of the scene, but whoever it belonged to isn’t here to explain how the story ends.",
    location: "LivingQuartersSevenWest",
    vocab: ["blood", "trail", "spots", "spatters"],
    itemClass: "liquid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "EDSBLOOD_7WBed",
    name: "blood trail",
    description:
      "Blood has soaked into the bedding and dripped onto the floor, forming irregular spots and streaks around the bed.",
    sceneryDescription:
      "On and around the mattress, the blood is thicker and more chaotic, as if the worst of whatever happened started—or ended—here. Dark stains have dried to a rusty crust in the fabric, with thinner rivulets reaching for the edge and dripping to the floor below.",
    location: "SevenWestBed",
    vocab: ["blood", "trail", "spots", "spatters"],
    itemClass: "liquid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "POEM",
    name: "poem",
    description:
      "A neatly written poem in small, precise, all-caps handwriting, squeezed onto a single piece of paper.",
    sceneryDescription:
      "The letters are uniform and meticulous, each line spaced with mechanical care. Whoever wrote this wasn’t just killing time—they were trying to impose some kind of order on a universe that refused to cooperate.",
    location: "UNKNOWN",
    vocab: ["piece", "paper", "poem"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: true,
    isContainer: false,
    isLoggable: true,
    readableTitle: `Random Poem`,
    readableText:
      "They went to the Moon and to Venus and Mars,\n" +
      "And they went to Europa and Io,\n" +
      "They went out to Pluto and on to the stars\n" +
      "Till they couldn't arrive out of cryo, so\n" +
      "They built us an ark just like Noah before them\n" +
      "And filled it with what was worth bringing,\n" +
      "Fitting creatures and men everywhere they could store them,\n" +
      "Then plotted a course ripe for flinging,\n" +
      "They built us the best of the best they could fashion\n" +
      "Then wished us Godspeed and good luck,\n" +
      "The greatest achievement of humankind's passion,\n" +
      "The Deus Ex Machina sucks.\n\n" +
      "Our ship has got everything, so you could say,\n" +
      "It's got restaurants, theatres and games,\n" +
      "But its whistles and bells at the end of the day,\n" +
      "Get indelibly worn on your brain,\n" +
      "When you are drifting, a ship is a ship,\n" +
      "A prison's a prison - it means that you're stuck,\n" +
      "Even heaven gets dull on a long enough trip;\n" +
      "The Deus Ex Machina sucks.\n",
  },
  {
    id: "ParkPlaque",
    name: "bronze plaque",
    description:
      "A polished bronze plaque mounted at eye level, the words “WELCOME TO VIVARIUM PARK” engraved into its surface in heavy, confident lettering.",
    sceneryDescription:
      "The plaque catches the ambient light with a soft, warm sheen, every stroke of the letters burnished smooth by years of incidental contact. Small scratches and scuffs surround the mounting bolts, hinting at how often people have leaned on it, tapped it for luck, or just used it as a landmark before moving on.",
    location: "ParkEntrance",
    vocab: ["bronze", "plaque", "park"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 3,
    itemSize: 2,
    isWearable: false,
    isContainer: false,
  },
  {
    id: "JACQUZZI",
    name: "jacuzzi",
    description:
      "A large, deep jacuzzi sunk into the floor, its surface a broad oval of tepid, gently rippling water.",
    sceneryDescription:
      "The jacuzzi is lined with smooth composite panels designed to look like stone, interrupted by small, circular jets around the perimeter. A faint haze of steam clings just above the water, carrying the leftover scent of mineral additives and cleaning chemicals. The water itself has that lukewarm, overused feel—too cool to be inviting, too warm to be natural.",
    location: "Spa",
    vocab: ["jacuzzi", "bath", "hot", "tub"],
    itemClass: "liquid",
    itemCategory: "scenery",
    itemWeight: 500,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 20,
  },
  {
    id: "portholeSpa",
    name: "porthole",
    description:
      "A round porthole set into the cedar door at about head height, its glass slightly fogged by the humid air of the spa.",
    lookThroughDescription:
      "Through the fogged porthole you can just make out the dark sauna beyond. Weak light from the spa slips in far enough to catch the edges of simple benches and the deep claw marks that gouge the wood inside.",
    sceneryDescription:
      "The porthole’s metal frame bites cleanly into the wood, sealing the glass in a neat circle. Condensation beads and slowly crawls down the inside surface, blurring whatever lies beyond into soft shapes and diffuse light. It’s just wide enough to make you want to look through, and just small enough to make you feel like you’re spying.",
    location: "Spa",
    vocab: ["porthole", "window", "glass"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "portholeSauna",
    name: "porthole",
    description:
      "A circular glass porthole set into the sauna door, clouded by layers of steam and heat.",
    lookThroughDescription:
      "Through the clouded glass you can see the brighter spa beyond in softened shapes: white tile, the broad central jacuzzi, and light diffused by drifting steam.",
    sceneryDescription:
      "From the sauna side, the porthole is mostly a glowing blur. The glass is hot to the touch, a thin barrier between the dense, wet heat inside and the cooler corridor beyond. Occasional droplets of condensation run down in lazy, crooked paths, distorting the view even further.",
    location: "Sauna",
    vocab: ["porthole", "window", "glass"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "portholePortal",
    name: "porthole",
    description:
      "A small round porthole looking out from the portal area, offering a controlled view of the spa complex.",
    lookThroughDescription:
      "Through the clear porthole you get a tidy view into the spa complex beyond: bright tile, softened moisture, and the calm, overdesigned look of a place built for relaxation that has clearly failed at it.",
    sceneryDescription:
      "Here the porthole feels less decorative and more intentional: a sanctioned line-of-sight into the spa environment. The glass is clearer on this side, ringed by a reinforced frame that suggests monitoring or access control was once someone’s full-time job.",
    location: "portal",
    vocab: ["porthole", "window", "glass"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "OILS",
    name: "smell of oil",
    description:
      "There are no bottles of massage oil left out, just the lingering smell—sweet, herbal, and faintly medicinal.",
    sceneryDescription:
      "The room carries a ghost of its former purpose: a thin trace of warmed oils and aromatics soaked into the walls and upholstery. It smells like eucalyptus, lavender, and something sharper underneath, a scent that promises relief for muscles and absolutely nothing for the nervous system.",
    location: "Massage",
    vocab: ["smell", "oil", "oils", "scent"],
    itemClass: "gas",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "massagetable",
    name: "massage table",
    description:
      "A six-foot-long massage table with a collapsible extension at one end and a padded headrest at the other, complete with a face-sized opening in the center.",
    sceneryDescription:
      "The table is upholstered in easy-clean synthetic leather that’s just a shade too neutral to have been chosen by a human. Slight discolorations mark where oil and sweat have been wiped away countless times, leaving only subtle ghosts in the padding. The face cradle hangs open like a second, smaller void, waiting for someone to put their weight and trust into it.",
    location: "Massage",
    vocab: ["massage", "table", "padded", "leather"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 40,
    itemSize: 6,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 1,
  },
  {
    id: "massagecheckin",
    name: "white board",
    description:
      "A wall-mounted whiteboard near the spa desk, its surface smudged with the faint ghosts of erased names and appointment times.",
    sceneryDescription:
      "Old marker ink has stained the board in a permanent haze of rectangles and crossed-out lines. You can still make out fragments of phrases—“10:30 DEEP TISSUE,” “NO SHOW,” a few initials—but whatever schedule it once enforced has dissolved into noise.",
    location: "Spa",
    vocab: ["white", "board", "whiteboard", "check-in", "checkin"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 3,
    isWearable: false,
    isReadable: true,
    isLoggable: true,
    readableTitle: `Faded Massage Check-In Whiteboard`,
    readableText:
      "The board is mostly wiped clean, but you can pick out a few lingering traces:\n" +
      "10:30  DT / K.D.\n" +
      "11:15  ST / CXL\n" +
      "12:00  HOT STONE / WAITLIST\n",
    isContainer: false,
  },
  {
    id: "saunacorpsepurse",
    name: "waterproof purse",
    description:
      "A compact waterproof purse made from rubberized fabric, designed to survive steam, splashes, and bad decisions.",
    sceneryDescription:
      "The purse’s matte surface beads condensation instead of absorbing it, tiny droplets of moisture clinging and slowly rolling off. A sealed zipper runs along the top, and a translucent ID window on the side has fogged from the sauna’s heat, blurring whatever card is pressed against it.",
    location: "Sauna",
    vocab: ["waterproof", "purse", "bag"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: true,
    capacity: 4,
  },

  {
    id: "parksouthparkbench",
    name: "park bench",
    description:
      "A curved wooden park bench built from varnished boards set into a wrought iron frame.",
    sceneryDescription:
      "The boards gleam with an aging coat of varnish, their surfaces worn smooth in the middle where countless people have sat, waited, and stared at nothing in particular. The wrought iron arms and legs curl into decorative flourishes that were probably meant to make the place feel less like a station and more like a park, at least on paper.",
    location: "ParkSouth",
    vocab: ["bench", "park", "park bench"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 2,
  },
  {
    id: "DistMarquee",
    name: "marquee",
    description:
      "A block-letter marquee above the theater entrance, currently displaying the name of whatever was playing when everything stopped.",
    sceneryDescription:
      "Interchangeable black plastic letters slot into white tracks, forming the movie title in a rigid, mechanical font. A few letters are slightly crooked, either from haste or boredom, but together they still manage to project that old familiar promise: step inside, forget everything outside.",
    location: "ParkWest",
    vocab: ["marquee", "block", "lettering"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 15,
    itemSize: 5,
    isWearable: false,
    isReadable: true,
    readableText: "NOW PLAYING: DISTURBANCE IN THE VOID",
    isContainer: false,
  },
  {
    id: "parkwestparkbench",
    name: "park bench",
    description:
      "A curved wooden park bench, its varnished boards set into a dark wrought iron frame. A woman’s corpse sits on it, her glazed eyes still fixed in the direction of the obelisk.",
    sceneryDescription:
      "The bench itself is sturdy and almost comfortable-looking, but the occupant ruins the effect. The woman’s body is slumped slightly to one side, hands loose in her lap, hair frozen mid-fall. Her eyes are fixed on the obelisk with an intensity that hasn’t left just because she has.",
    location: "ParkWest",
    vocab: ["bench", "park", "park bench"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 35,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 2,
  },
  {
    id: "note",
    name: "small piece of white paper",
    description:
      "A small piece of white paper, creased twice and softened at the edges as if it’s been folded and unfolded more than once.",
    sceneryDescription:
      "The paper is thin, the kind you get from cheap notepads or institutional printers. A faint indentation pattern hints at writing even before you unfold it, the ghost of letters pressed hard enough to leave their mark.",
    location: "UNKNOWN",
    vocab: ["note", "paper", "piece", "piece of paper"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: true,
    isContainer: false,
    isLoggable: true,
    readableTitle: `Rendezvous Note`,
    readableText: "MEET ME BY THE TREE\n" + "DON'T TELL ANYONE\n" + "- K\n",
  },
  {
    id: "DistMarquee2",
    name: "marquee",
    description:
      "Another theater marquee, this one facing north, its block letters spelling out a title for an audience that isn’t coming.",
    sceneryDescription:
      "The white backing panels are slightly yellowed from age and recycled air, but the black letters stand out sharp and clear. Someone took care to center the title perfectly, like that mattered more than anything else going on at the time.",
    location: "ParkNorth",
    vocab: ["marquee", "block", "lettering"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 15,
    itemSize: 5,
    isWearable: false,
    isReadable: true,
    readableText: "COMING SOON: STATIC IN THE BLOOD",
    isContainer: false,
  },
  {
    id: "parknorthparkbench",
    name: "park bench",
    description:
      "A curved wooden park bench, built from varnished planks in a heavy wrought iron frame.",
    sceneryDescription:
      "This bench is unoccupied, the boards showing only the shallow dents and scuffs of normal use. A small scatter of dust and grit in the corner where the seat meets the back is the only sign that time has passed without anyone bothering to clean up.",
    location: "ParkNorth",
    vocab: ["bench", "park", "park bench"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 2,
  },
  {
    id: "TREE",
    name: "tree",
    description:
      "A tall, healthy-looking tree, its trunk straight and strong, its crown of leaves a vivid, almost artificial green high above you.",
    sceneryDescription:
      "The tree stands at the center of its little patch of curated soil like it knows it’s the main event. Its bark is smooth in places where people have reached out to touch it, rough and ridged in others where nobody quite dared. The leaves shimmer faintly in the filtered air currents, their color so bright it almost looks digitally enhanced.",
    location: "ParkTree",
    vocab: ["tree"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 200,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "STUMP",
    name: "tree stump",
    description:
      "The freshly cut stump of a tree, angled slightly where the trunk was removed with a single, very clean cut.",
    sceneryDescription:
      "The stump’s exposed wood is pale and raw, rings of growth laid bare like a cross-section of time. A faint dusting of sawdust lingers in the cracks where bark meets earth, as if whoever did the cutting hadn’t bothered to sweep up after erasing something that had taken decades to grow.",
    location: "UNKNOWN",
    vocab: ["tree", "stump"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 80,
    itemSize: 6,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "dias",
    name: "dias",
    description:
      "A circular raised dais made from the same tan brick used for the Park’s footpaths, serving as the base for a massive granite obelisk.",
    sceneryDescription:
      "The dais rises only a step above the surrounding paths, but the change in elevation is enough to give the obelisk an extra sense of importance. The bricks are laid in a tight radial pattern converging on the monument, their edges slightly rounded by countless footsteps circling and approaching and circling again.",
    location: "ParkCenter",
    vocab: ["dias", "platform", "base"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 300,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "obelisk",
    name: "obelisk",
    description:
      "A large, polished granite obelisk, perfectly smooth on all sides. It stands about eight feet high above the dais, four feet by four feet at the base, its top foot tapering inward to a point in darker stone. Near the base, a plaque is carved directly into the granite with a short inscription.",
    sceneryDescription:
      "The obelisk feels engineered more than sculpted, its planes so precise they almost look rendered. The darker stone at the peak catches the light in a way the rest of it doesn’t, drawing the eye upward before dropping it back down to the carved words near the base: SEEK AND YE SHALL FIND. The letters are deep and crisp, as if someone expected them to be read for a very, very long time.",
    location: "ParkCenter",
    vocab: ["obelisk", "monument", "stone"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 500,
    itemSize: 10,
    isWearable: false,
    isReadable: true,
    readableText: "SEEK AND YE SHALL FIND",
    isContainer: false,
  },
  {
    id: "GreenDoorway",
    name: "doorway",
    description:
      "A wide doorway framed in dull metal. Just beyond, you can see a flight of steps leading up into deeper shadow.",
    sceneryDescription:
      "The doorway feels like a mouth cut into the wall, the edges scuffed where countless shoulders and packages have brushed past. The steps beyond rise at a shallow angle, the first few visible, the rest swallowed by dim light and whatever waits upstairs.",
    location: "MovieEntrance",
    vocab: ["doorway", "steps", "stairs"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 4,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "GreenDoor",
    name: "green door",
    description:
      "The metal door has been physically bent inward and is marred with deep claw marks, as if something wanted in badly enough to ignore metallurgy.",
    sceneryDescription:
      "The door’s green paint is scraped and flaked away in long arcs, exposing bright metal beneath. The panel itself is warped, buckled around the frame in a way that suggests brute force rather than tools. The claw marks stand out clearly—long, parallel gouges that dig into the steel like it was soft pine.",
    location: "MovieEntrance",
    vocab: ["green", "twisted", "bent", "door"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 60,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      open: "The door’s already been “opened” the hard way. You’re not going to improve the situation with your bare hands.",
      examine:
        "Up close, the buckling around the frame is even worse. Whatever bent this wasn’t subtle, and it definitely wasn’t human.",
    },
  },
  {
    id: "DistMarquee3",
    name: "marquee",
    description:
      "A theater marquee juts out over the entrance, the face of it filled with block lettering for the last movie that ever mattered here.",
    sceneryDescription:
      "The lightbox hums faintly, its translucent panels stained with the ghosts of older titles. Black plastic letters slot into narrow tracks, forming a title in clean, utilitarian capitals. A couple of characters are crooked, giving the whole thing a slightly drunk tilt.",
    location: "MovieEntrance",
    vocab: ["marquee", "block", "lettering"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 15,
    itemSize: 5,
    isWearable: false,
    isReadable: true,
    readableText: "NOW PLAYING: JEFFY AND PIPPY: STRAIGHT UP THE WALL",
    isContainer: false,
  },
  {
    id: "bloodytrail",
    name: "trail of blood",
    description:
      "A dried trail of blood snakes across the floor. There are no footprints, just smeared and pooled patches, as if something was carried instead of walking on its own.",
    sceneryDescription:
      "The blood has turned a dark, rusted brown, clinging to the floor in uneven streaks and blotches. In places it’s smeared wide, as if a weight shifted mid-carry; in others it pools in small, round stains where something dripped steadily for a while. The lack of footprints makes it worse—whoever bled like this wasn’t ambulatory.",
    location: "Projection",
    vocab: ["blood", "trail", "dried"],
    itemClass: "liquid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      smell:
        "Up close it has that stale, metallic tang that blood gets when it’s had time to oxidize and disappoint everyone involved.",
      taste:
        "You lean in like you’re actually going to taste it, then decide you like being alive too much. Good call.",
    },
  },
  {
    id: "clawsmarks",
    name: "claw marks",
    description:
      "Deep claw marks rip through the surfaces here, grouped in sets of six. The claws must have been long and extremely sharp to leave gouges like that.",
    sceneryDescription:
      "The gouges bite straight through paint and panel, exposing raw material underneath in six-fingered arcs. Some lines overlap where the creature—or creatures—changed direction mid-swipe, leaving tangled clusters of scars. The geometry doesn’t match anything you’d find in a friendly field guide.",
    location: "Projection",
    vocab: ["claw", "marks", "gouges"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      examine:
        "You trace the air above the gouges with your fingers. Whatever made these didn’t bother negotiating first.",
    },
  },
  {
    id: "brokenchairs",
    name: "wooden debris",
    description:
      "Splintered wood and twisted hardware litter the floor. At one point it was a chair; now it’s kindling.",
    sceneryDescription:
      "Jagged lengths of varnished wood jut out at random angles, some still attached to bent metal brackets and torn upholstery. The way the pieces are scattered suggests violence, not simple decay—someone or something hit the chair hard enough to turn it into abstract art.",
    location: "Projection",
    vocab: ["wooden", "chair", "debris", "splinters"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 3,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      siton:
        "You could try to sit in the debris pile, but mostly you’d just collect splinters and regrets.",
    },
  },
  {
    id: "MovieCartrage",
    name: "slim cartridge",
    description:
      "A slim movie cartridge about the size of a business card and almost as thin. A label on one side bears a stylized logo: “Jeffey and Pippy: Stright Up The Wall.” The cartridge has been bent almost in half.",
    sceneryDescription:
      "The cartridge’s casing is a smooth, matte plastic, now creased with a sharp kink where someone folded it past its tolerance. The printed logo is bright and cartoonish, all exaggerated fonts and cheerful colors that feel wildly out of place here.",
    location: "projector",
    vocab: ["slim", "cartridge", "movie", "fred"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: true,
    isContainer: false,
    readableText: "Jeffey and Pippy: Stright Up The Wall",
    overrides: {
      take: "You pick up the bent cartridge.",
    },
  },
  {
    id: "glasspartition",
    name: "glass partition",
    description:
      "A thick glass partition looks into a cramped ticket booth. The booth itself is empty.",
    sceneryDescription:
      "Faint scratches and smear marks trace arcs across the glass at hand level, where bored patrons once leaned or drummed their fingers. Beyond it sits an abandoned chair, a dead terminal, and the lingering memory of someone who used to ask, “Next?” all day.",
    location: "MovieTheatreOne",
    vocab: ["glass", "partition", "window", "booth"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 4,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },

  {
    id: "PatioTablesChairs",
    name: "patio furniture",
    description:
      "A scattering of wrought-iron patio tables and chairs occupies the space outside the restaurant.",
    sceneryDescription:
      "The furniture is all curls and scrollwork, black-painted iron that has weathered into a patchy mix of matte and shine. Chairs are pushed back at odd angles as if their owners stood up mid-conversation and never came back. A few tabletops still bear the circular scars of long-gone drinks.",
    location: "RestaurantEntrance",
    vocab: ["patio", "table", "tables", "chair", "chairs", "furniture"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 50,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 6,

    overrides: {
      siton:
        "You settle into one of the wrought-iron chairs. It creaks slightly, but otherwise pretends nothing’s wrong.",
    },
  },

  {
    id: "EATERYSIGN",
    name: "rustic sign",
    description:
      "A weathered, rustic-looking sign hangs over the entrance, the lettering clearly done by hand.",
    sceneryDescription:
      "The sign is carved from a single slab of wood, its edges rough-hewn and uneven. Hand-painted letters announce the restaurant’s name in a style that’s trying hard to be charming and just about gets there. Faint cracks radiate out from the mounting bolts, like the sign has been quietly protesting its workload for years.",
    location: "RestaurantEntrance",
    vocab: ["rustic", "sign", "wooden", "eatery"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 3,
    isWearable: false,
    isReadable: true,
    readableText: "THE EATERY AT HUB SQUARE",
    isContainer: false,
  },
  {
    id: "EATERYDOOR",
    name: "glass door",
    description:
      "A glass-fronted automatic door forms the main entrance to the restaurant.",
    sceneryDescription:
      "The door panels are mostly clear, smudged here and there with old fingerprints and the faint streaks of hurried cleaning. A thin sensor strip runs along the top, its status light dark now. The whole assembly looks poised to glide open at the slightest approach, but nothing moves.",
    location: "RestaurantEntrance",
    vocab: ["glass", "door", "automatic"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 40,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      open: "You give the door a shove. Without power, it fights you like a stubborn elevator, but it’ll move if you really insist.",
    },
  },
  {
    id: "ROOF",
    name: "roof",
    description:
      "The restaurant’s roof extends out in a shallow overhang, sheltering the entrance and patio.",
    sceneryDescription:
      "From underneath, the roof is a grid of support beams and panels, painted a soft neutral color that tries not to draw attention to itself. Recessed lights stare down like tired eyes, several of them dark, leaving uneven pools of illumination on the ground below.",
    location: "RestaurantEntrance",
    vocab: ["roof", "overhang", "awning"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 200,
    itemSize: 10,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "EATERYDOOR2",
    name: "glass door",
    description:
      "From this side, the automatic glass door looks like a transparent wall, separating the restaurant from the outside world.",
    sceneryDescription:
      "The interior light reflects faintly off the glass, layering ghost images of tables and chairs over the view of the Park beyond. The motion sensors are dead, but the door still sits there with the silent confidence of machinery that expects people to keep coming through.",
    location: "Restaurant",
    vocab: ["glass", "door", "automatic"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 40,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      open: "From this side, you can muscle the door along its track with a bit of effort. Automatic doesn’t mean impossible.",
    },
  },
  {
    id: "oldmeals",
    name: "half-eaten meals",
    description:
      "Plates of steak, lobster, and other high-end dishes sit abandoned on the tables, half-eaten and long since gone cold.",
    sceneryDescription:
      "The food has congealed into unappetizing sculptures: steaks with cooled fat gleaming like varnish, lobster shells cracked and drying, side dishes collapsed into unidentifiable piles. Cutlery lies where it was dropped, some forks still tangled in bites that never made it to anyone’s mouth.",
    location: "Restaurant",
    vocab: [
      "half-eaten",
      "meal",
      "meals",
      "plate",
      "plates",
      "food",
      "steak",
      "lobster",
      "natto",
      "dinner",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 6,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      smell:
        "It smells like cold grease, seafood, and the kind of money that assumed it had all the time in the world.",
      taste:
        "You consider sampling the long-dead surf and turf. Then you remember you still like living. Hard pass.",
    },
  },
  {
    id: "ambiance",
    name: "chandelier",
    description:
      "A large chandelier hangs high overhead, its lights flickering uncertainly.",
    sceneryDescription:
      "The chandelier is a branching web of metal arms and faux-crystal droplets, the kind of fixture designed to impress people into ordering the expensive wine. Several bulbs are out, and the remaining ones flicker in an uneven rhythm, turning the room into a slow strobe of fine dining gone wrong.",
    location: "Restaurant",
    vocab: ["lighting", "lights", "chandelier", "hanging"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    providesLight: true,
    overrides: {
      examine:
        "You watch the chandelier flicker for a moment. It’s like the room is trying to blink something out of its eyes and failing.",
    },
  },
  {
    id: "forksnknives",
    name: "silverware",
    description:
      "Scattered silverware litters the tables and floor. Spoons, forks, and blunt butter knives are everywhere; anything sharp enough to be useful seems to have been taken.",
    sceneryDescription:
      "Cutlery glints dully in the ambient light—curved spoons, three- and four-tined forks, and stubby knives more suited to butter than self-defense. The absence of serrated blades is obvious once you start looking, like someone methodically swept through and collected every genuine weapon in the room.",
    location: "Restaurant",
    vocab: [
      "silverware",
      "knife",
      "knives",
      "fork",
      "forks",
      "spoon",
      "spoons",
      "cutlery",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 3,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      take: "You sift through the mess again. Still just spoons, forks, and butter knives—nothing that’ll help you in a real fight.",
    },
  },
  {
    id: "silkflowers",
    name: "silk flowers",
    description:
      "Arrangements of silk flowers sit in small vases on several tables. For fakes, they’re surprisingly convincing—and they even seem to smell faintly floral.",
    sceneryDescription:
      "The petals have just enough irregularity to pass for real at a glance, though up close the weave of the fabric gives them away. A faint, artificial scent clings to them, the kind of chemically engineered fragrance that promises springtime and delivers a headache.",
    location: "Restaurant",
    vocab: ["silk", "flowers", "bouquet", "arrangement"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 2,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      smell:
        "They smell like a focus group’s idea of flowers—technically pleasant, practically suspicious.",
    },
  },
  {
    id: "candles",
    name: "candles",
    description:
      "Once-burning candles sit in holders along the tables, all burned down to stubs and gone cold.",
    sceneryDescription:
      "Wax has run in frozen rivers down the sides of the holders, pooling in hardened drips on the tablecloths. The remaining wicks are nothing but blackened nubs, each one the endpoint of a flame that went out without anyone bothering to relight it.",
    location: "Restaurant",
    vocab: ["candle", "candles"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 2,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      light:
        "You don’t have anything handy to light them with. Even if you did, they’re barely more than charred memories at this point.",
    },
  },
  {
    id: "TablesNChairs",
    name: "tables and chairs",
    description:
      "The dining room’s tables and chairs are all in disarray, some overturned, some skewed as if their occupants left in a hurry.",
    sceneryDescription:
      "Upset chairs lie on their sides or backs, legs pointing at accusatory angles. Tablecloths are tugged askew, plates and glasses skewing the symmetry. A few chairs are still perfectly aligned as if their owners were the only ones who got up calmly.",
    location: "Restaurant",
    vocab: ["table", "tables", "chair", "chairs", "furniture"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "GlassOfWine",
    name: "wine glass",
    description:
      "A delicate wine glass sits near the edge of a table, still holding a small amount of dark red wine.",
    sceneryDescription:
      "The glass is thin-stemmed and expensive-looking, the bowl stained in a slow curl where the wine has dried along the inside. What’s left of the liquid clings to the bottom, a few millimeters of almost-black red that catches the light like a blood sample no one ever sent to the lab.",
    location: "Restaurant",
    vocab: ["glass", "wine", "wine glass"],
    itemClass: "liquid",
    itemCategory: "fluid",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 1,

    overrides: {
      smell:
        "It still smells faintly of red wine—oak, fruit, and just enough alcohol to make bad decisions seem reasonable.",
      taste:
        "You consider taking a sip from the abandoned glass. Then you remember how long it’s been sitting here and decide you’re not that thirsty.",
    },
  },
  {
    id: "FridgeDoor",
    name: "steel door",
    description:
      "A heavy steel door marks the entrance to a walk-in fridge. A solid-looking padlock hangs from the latch.",
    sceneryDescription:
      "The door is all business: thick insulated metal with a recessed handle and a rubber gasket sealing it against the cold inside. The padlock on the latch is big enough to belong on a storage crate, its body scarred by years of use and more than a few frustrated attempts to bypass it.",
    location: "Kitchen",
    vocab: ["steel", "fridge", "refridgerator", "refrigerator", "door"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 80,
    itemSize: 6,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      open: "The door doesn’t budge. As long as that padlock is in place, the fridge is just an especially unfriendly wall.",
    },
  },
  {
    id: "strayCrap",
    name: "stray food",
    description:
      "Stray bits of food are scattered across the kitchen floor: dried pasta, flour dust, stale crumbs. None of it is remotely useful anymore.",
    sceneryDescription:
      "The floor is a map of recent chaos—smears of sauce, broken bits of bread, a dusting of flour that turns footprints into ghostly negatives. A few strands of pasta have fused themselves to the tiles, fossilized mid-spill.",
    location: "Kitchen",
    vocab: ["stray", "pasta", "flour", "bread", "crumbs", "pieces", "food"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      taste:
        "If you’re seriously thinking about eating floor pasta, things are worse than you thought.",
    },
  },
  {
    id: "BigASSPadlock",
    name: "heavy padlock",
    description:
      "A large, heavy padlock secures the fridge door, its hardened shackle threaded through a steel hasp.",
    sceneryDescription:
      "The padlock is the kind of over-engineered hardware you buy when you don’t trust people or the universe. The metal is scarred and pitted, but the keyway is clean, suggesting it’s been used regularly. If there’s a combination etched anywhere, it’s not on the outside.",
    location: "Kitchen",
    vocab: ["heavy", "padlock", "lock"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 3,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      open: "Without a key or some very creative problem solving, that padlock isn’t going anywhere.",
      take: "You tug on the padlock, but it’s firmly attached to both the hasp and the problem of your life right now.",
    },
  },
  {
    id: "PHONENUMBERS",
    name: "plastic plaque",
    description:
      "A small plastic plaque mounted near the sink lists a series of important phone numbers in tiny, utilitarian print.",
    sceneryDescription:
      "The plaque is slightly yellowed around the edges, its printed lines protected under a thin layer of clear laminate. The numbers themselves are arranged in neat rows, padded with dots to keep them aligned, like someone thought order would make emergencies easier to navigate.",
    location: "BathroomEntrance",
    vocab: ["plaque", "numbers", "phone", "sink"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: true,
    isContainer: false,
    isLoggable: true,
    readableTitle: `Phone Numbers Found in Restaurant`,
    readableText:
      "Police..............9111\n" +
      "Poison Control......0000\n" +
      "Emergency...........8111\n",
  },
  {
    id: "CRAPPERBOOTS",
    name: "combat boots",
    description:
      "From where you’re standing, all you can see of the stall’s occupant is a pair of black leather combat boots planted on the floor.",
    sceneryDescription:
      "The boots are scuffed and creased, the laces tucked in rather than tied, as if their owner expected to get in and out quickly. They haven’t moved in a while. That’s either very good or very bad, and you already know which way to bet.",
    location: "MensRoom",
    vocab: ["combat", "boots", "occupant", "feet"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 4,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      examine:
        "You stare at the boots a little too long, waiting for the slightest twitch. Nothing. That might be the worst answer.",
    },
  },
  {
    id: "MSTALLDOOR",
    name: "stall door",
    description:
      "A standard metal bathroom stall door, mounted on squeaky hinges and secured by an indifferent latch.",
    sceneryDescription:
      "The paint is chipped around the edges and near the lock, revealing dull metal beneath. Graffiti blooms across the inside surface in a mix of marker, etching, and sheer boredom, most of it now unreadable under layers of half-hearted scrubbing.",
    location: "MensRoom",
    vocab: ["stall", "door"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      knock:
        "You give the door a tentative knock. The boots inside don’t react. That’s not comforting.",
      open: "You could open it, sure. The real question is whether you’re ready for what’s on the other side.",
    },
  },
  {
    id: "URINAL",
    name: "urinal",
    description: "A porcelain wall-mounted urinal, clinically utilitarian.",
    sceneryDescription:
      "The fixture is as anonymous as plumbing gets: clean white porcelain, a chrome flush valve, and a faint smell of disinfectant that never quite erases what happens here. Hairline scratches and tiny chips along the rim suggest it’s seen better decades.",
    location: "MensRoom",
    vocab: ["urinal", "pisser"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 3,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      smell:
        "It smells like every public restroom you’ve ever regretted visiting, plus a hint of industrial cleaner doing its best.",
    },
  },
  {
    id: "TIRLET",
    name: "washlet",
    description:
      "A standard washlet-style toilet. A man’s corpse is currently seated on it, head bowed, as if he simply never bothered to stand up again.",
    sceneryDescription:
      "The washlet’s smooth curves and control panel look almost luxurious, which doesn’t help the overall impression. The man slumped on it is dressed, boots planted solidly on the floor, posture suggesting he was interrupted mid-thought and never got a chance to finish it.",
    location: "UNKNOWN",
    vocab: ["washlet", "toilet", "can", "shitter", "head"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 30,
    itemSize: 4,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      smell:
        "You get about half a breath in before deciding you’ve learned everything you need to know about the situation.",
    },
  },
  {
    id: "MSTALL",
    name: "bathroom stall",
    description:
      "A single-occupant bathroom stall, clean enough and clearly well-used. From the gap at the bottom, you can see a pair of black combat boots planted inside. You might be able to look underneath for a better view.",
    sceneryDescription:
      "Partitions form a narrow, private box around the toilet, the gap at the bottom offering just enough visibility to be unsettling. The floor inside looks clean, but there’s a subtle scuff pattern near the door where people have turned in place a thousand times before settling in.",
    location: "MensRoom",
    vocab: ["bathroom", "stall"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 4,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 1,

    overrides: {
      lookunder:
        "You lean down and peer under the stall. The boots are attached to a body that is very much done with this whole experience.",
    },
  },
  {
    id: "WSTALL",
    name: "bathroom stall",
    description:
      "A closed bathroom stall, the door drawn shut. The air around it feels still in a way that has nothing to do with ventilation.",
    sceneryDescription:
      "The stall partitions are the same dull, off-white as the rest of the restroom, but there’s a certain tension in how the door hangs closed. Scratches around the latch hint at nervous hands and second thoughts. You can’t see much from here, but you can feel that the story on the other side is not a happy one.",
    location: "WomensRoom",
    vocab: ["bathroom", "stall"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 4,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 1,

    overrides: {
      open: "You could force the stall open if you wanted. The real question is whether you want the mental image that comes with it.",
    },
  },
  {
    id: "WSTALLDOOR",
    name: "stall door",
    description: "A standard bathroom stall door, closed and latched.",
    sceneryDescription:
      "The door’s paint is a little more intact than in the men’s room, but there are still the telltale shoe scuffs near the bottom and the faint outline of old stickers and notes long since peeled away. The latch is turned fully to the locked position and shows no sign of moving on its own.",
    location: "WomensRoom",
    vocab: ["stall", "door"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      knock:
        "You rap gently on the stall door. Nothing answers, which somehow manages to be worse than a response.",
    },
  },
  {
    id: "GYMDOORS",
    name: "double doors",
    description:
      "A set of aluminum-framed double doors with large panes of plexiglass. They look like automatic doors, the kind that should slide open at your approach…but right now they just stare back at you.",
    sceneryDescription:
      "From this side, the double doors form a dull reflection of the corridor behind you. The aluminum frames are scuffed at hip and shoulder height where people have been shoving them open for years. A thin sensor bar runs across the top, dark and lifeless, leaving the doors feeling oddly stubborn and inert.",
    location: "GymEntrance",
    vocab: ["aluminum", "plexiglass", "double", "doors", "door"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 50,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "GYMDOORS2",
    name: "double doors",
    description:
      "From inside the gym, the aluminum and plexiglass double doors look like a transparent barrier between sweat and the wider world. They still appear to be automatic, even if nothing’s moving.",
    sceneryDescription:
      "The doors show a faint ghost of your reflection against the dim hallway outside. Fingerprints and palm smears cloud the lower sections, the accumulated evidence of people pushing their way through when the sensors didn’t kick in fast enough.",
    location: "Gym",
    vocab: ["aluminum", "plexiglass", "double", "doors", "door"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 50,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "GymWeightMachines",
    name: "weight machines",
    description:
      "A row of sleek, cable-driven weight machines stands along one wall, all adjustable seats and gleaming stacks of plates.",
    sceneryDescription:
      "Each machine is a small monument to controlled suffering: padded benches, chrome grips polished by a thousand anxious hands, and weight stacks marked off in neat increments. The selector pins sit frozen where their last users left them, mid-routine forever.",
    location: "Gym",
    vocab: ["weight", "weights", "machine", "machines", "stack", "stacks"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 200,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "GymTreadmills",
    name: "treadmills",
    description:
      "Several treadmills are lined up in a neat row, their belts still and their status displays dark.",
    sceneryDescription:
      "The treadmills face a blank stretch of wall that probably once showed inspirational media feeds. Rubber belts sit motionless, slightly dusty, and the handrails bear the faint prints of people who thought today would be the day they turned things around.",
    location: "Gym",
    vocab: ["treadmill", "treadmills", "track", "tracks", "runner", "belt"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 150,
    itemSize: 7,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "GymEllipticals",
    name: "elliptical machines",
    description:
      "A cluster of elliptical machines waits in silence, their oversized footpads and swinging handles frozen mid-stride.",
    sceneryDescription:
      "The ellipticals look like skeletal insects caught in the act of running. Foot platforms hang in offset positions, hand grips extended as if reaching for someone who never quite got there. Their consoles display nothing but dust and faint outlines where glowing numbers used to be.",
    location: "Gym",
    vocab: ["elliptical", "ellipticals", "trainer", "trainers", "machine"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 160,
    itemSize: 7,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "GymStairSteppers",
    name: "stair steppers",
    description:
      "Several stair steppers stand near the back wall, their pedals waiting for someone to climb in place and go nowhere.",
    sceneryDescription:
      "The machines resemble truncated towers with heavy pedals mounted on pistons. Scuffed footprints on the steps mark how many people tried to outrun their own biology by walking upstairs without ever changing floors.",
    location: "Gym",
    vocab: ["stair", "stepper", "steppers", "climber", "climbers"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 140,
    itemSize: 6,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "GymBikes",
    name: "stationary bicycles",
    description:
      "A group of stationary bicycles faces an empty stretch of floor, as if waiting for an instructor who is never going to show.",
    sceneryDescription:
      "The bikes are all minimalist frames and molded seats, the pedals strapped and ready. Some resistance knobs are cranked up, others nearly slack, suggesting a wide range of optimism levels. None of them creak or whir now; they just watch the silence.",
    location: "Gym",
    vocab: ["stationary", "bike", "bicycle", "bikes", "bicycles"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 6,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "GymFreeWeights",
    name: "free weights",
    description:
      "A rack of free weights lines one corner, dumbbells and plates organized by size with almost military precision.",
    sceneryDescription:
      "Rubber-coated dumbbells sit in ascending order, their white weight markings still sharp. A low bench bears the imprint of countless backs and sweat-darkened patches in the vinyl. A few plates lie abandoned on the floor, like someone dropped them mid-set and never came back.",
    location: "Gym",
    vocab: ["free", "weights", "dumbbells", "plates", "bench", "benches"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 250,
    itemSize: 7,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
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
  {
    id: "LIBSIGN",
    name: "engraved sign",
    description: "A stone sign with the word LIBRARY engraved into it.",
    sceneryDescription:
      "The sign is carved directly into a slab of pale stone, the letters cut deep and painted a dark, fade-resistant pigment. Tiny chips and weathering marks soften the edges, but the word itself is still clear and unmistakable.",
    location: "LibraryEntrance",
    vocab: ["engraved", "stone", "sign", "library"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 50,
    itemSize: 4,
    isWearable: false,
    isReadable: true,
    isContainer: false,
    readableText: "LIBRARY",
  },
  {
    id: "TerminalNorth",
    name: "computer terminal",
    description:
      "A strange, diamond-shaped computer terminal that still manages to suggest a human form. Symmetrical plates cover its surface, hiding the underlying electronics. Tiny lights dot its shell, all of them dark.",
    sceneryDescription:
      "The terminal stands upright like a sarcophagus designed by someone who hated right angles. Its faceted plates fit together with unnerving precision, leaving no obvious seams. Rows of pinprick LEDs are set into the surface in geometric patterns, currently lifeless, as if the whole thing is holding its breath.",
    location: "LibraryTerminalNorth",
    vocab: ["computer", "terminal", "library", "sarcophagus"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 200,
    itemSize: 6,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "TerminalSouth",
    name: "computer terminal",
    description:
      "Another diamond-shaped computer terminal, its armored plates and dark LEDs arranged to give an almost human silhouette.",
    sceneryDescription:
      "This unit’s plating is just as symmetrical, but bears different scuff marks and hairline scratches, like it’s seen a slightly rougher crowd. The suggestion of a chest, shoulders, and head is subtle but deliberate—someone wanted users to feel like they were standing in front of a person, not a box.",
    location: "LibraryTerminalSouth",
    vocab: ["computer", "terminal", "library", "sarcophagus"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 200,
    itemSize: 6,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "Terminal",
    name: "computer terminal",
    description:
      "A diamond-shaped computer terminal whose overall profile evokes a human figure. Symmetrical plates cover the structure and a grid of tiny lights dots the exterior, all shut down for now.",
    sceneryDescription:
      "The terminal stands in mute symmetry, its angled plates casting sharp shadows. Up close, you can just make out the faint outlines of access panels and maintenance seams, expertly concealed in the design. The dark LEDs give it the unsettling look of a face with a thousand closed eyes.",
    location: "LibraryTerminal",
    vocab: ["computer", "terminal", "library"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 200,
    itemSize: 6,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "SCALE",
    name: "digital scale",
    description:
      "A slim, digital scale with a flat, glass platform and a narrow display strip along the front edge.",
    sceneryDescription:
      "The scale sits close to the wall like it’s trying not to be noticed. Dust gathers in a faint rectangle where feet used to land, and the digital display is blank, reflecting your face in a warped strip of dark glass.",
    location: "MainMedical",
    vocab: ["digital", "scale"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 3,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 1,
  },
  {
    id: "MainMedicalBlood",
    name: "blood",
    description: "That’s a lot of blood. Whatever happened here wasn’t minor.",
    sceneryDescription:
      "Thick streaks and pooled patches of blood darken the floor, some of it smeared as if someone slipped or was dragged. The edges have dried to a dark, almost black color, while the thicker sections still glisten faintly under the room’s harsh lighting.",
    location: "MainMedical",
    vocab: ["blood", "streaks", "pool", "pools"],
    itemClass: "liquid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "BloodPressureThingy",
    name: "blood pressure machine",
    description:
      "A compact blood pressure unit with a Velcro arm band and a small black pump bulb connected by rubber tubing.",
    sceneryDescription:
      "The cuff lies in a loose loop, the tubing coiled neatly beside the main unit. The display is dark, but faint fingerprints and smudges around the buttons suggest it saw heavy use not that long ago.",
    location: "MainMedical",
    vocab: ["blood", "pressure", "blood-pressure", "machine"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "MedCorridorStreaksMC1",
    name: "blood streaks",
    description:
      "Long streaks of blood mar the corridor floor, as if something heavy was dragged along it.",
    sceneryDescription:
      "In this stretch of corridor, the streaks are uneven—thicker in some places, smeared thin in others, like the burden shifted or snagged. Tiny spatter marks radiate outward where whatever it was jolted or hit an obstruction.",
    location: "MedicalCorridorOne",
    vocab: ["blood", "streaks", "smears", "trail"],
    itemClass: "liquid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "MedCorridorStreaksMC2",
    name: "blood streaks",
    description:
      "More blood streaks continue through this corridor section, extending the same grim trail.",
    sceneryDescription:
      "Here the smears run closer to the wall, as if whoever was moving the body—or whatever it was—started to lean, losing strength or control. The streaks thin out toward the far end, but they never quite stop.",
    location: "MedicalCorridorTwo",
    vocab: ["blood", "streaks", "smears", "trail"],
    itemClass: "liquid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "bedbarracade",
    name: "bedframes",
    description:
      "Several metal bedframes have been dragged into the corridor and stacked into a rough barricade. It looks like you can still squeeze around it if you’re determined.",
    sceneryDescription:
      "The beds have been flipped on their sides and jammed together, legs jutting at odd angles, rails locked in a crude lattice. Sheets and straps hang from the frames like ghostly streamers, and the whole structure looks like it was assembled in a hurry under bad circumstances.",
    location: "MedicalCorridorTwo",
    vocab: ["beds", "bed", "frames", "bedframes", "barricade", "barracade"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 200,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "BedsOne",
    name: "beds",
    description:
      "The beds were definitely occupied at some point. Now some are overturned, most have their sheets and blankets torn away, and many are spattered with dried blood.",
    sceneryDescription:
      "Thin medical mattresses lie at crooked angles, some half off their frames, others collapsed completely. The remaining linens are twisted and stained, tugged into knots that suggest more panic than orderly care. Rust-red blotches mark where things went badly for someone lying here.",
    location: "PatientCareOne",
    vocab: ["bed", "beds"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 150,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "PapersOne",
    name: "strewn papers",
    description:
      "Patient charts and medical forms are scattered across the floor and beds in loose, chaotic drifts.",
    sceneryDescription:
      "Most of the pages are standard forms: vitals, symptom logs, dosage schedules. Names and numbers blur together, but the common thread is clear—too many beds filled too quickly with people who were all sick with something no one fully understood.",
    location: "PatientCareOne",
    vocab: ["strewn", "papers", "charts", "forms"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 2,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "bedbarracade2",
    name: "bedframes",
    description:
      "More bedframes have been arranged into a makeshift barricade here. It feels less like a barrier and more like a last line in the sand.",
    sceneryDescription:
      "This barricade is tighter, more deliberate: frame locked against frame, wheels braced against the floor, headboards wedged to absorb impact. If there was a last stand anywhere in this wing, it was probably here.",
    location: "PatientCareTwo",
    vocab: ["beds", "bed", "frames", "bedframes", "barricade", "barracade"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 200,
    itemSize: 8,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "ComaDude",
    name: "young man",
    description:
      "A young man lies motionless on the bed. His complexion is very pale, and dark circles smudge the skin under his closed eyes. A respirator tube runs down his throat, taped in place.",
    sceneryDescription:
      "A young man lies motionless on the bed. He looks like someone paused halfway between life and whatever comes next. The steady rise and fall of his chest is almost imperceptible under the thin hospital gown, leaving most of the movement to the machinery—the subtle hiss of air, the faint tremor of tubing with each mechanical breath.",
    location: "PatientCareTwo",
    vocab: ["coma", "victim", "edward", "young", "man", "kid", "boy", "body"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 70,
    itemSize: 4,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "VitalSigns",
    name: "vital signs monitor",
    description:
      "A vital signs monitor tracks the young man’s heartbeat, brainwaves, and a range of other metrics. The readings are low, but not flat.",
    sceneryDescription:
      "The display shows jagged green lines crawling across dark glass, each one a fragile promise that he’s still technically alive. Numbers flicker in quiet columns: heart rate, oxygen saturation, blood pressure, all hovering at the edge of acceptable.",
    location: "PatientCareTwo",
    vocab: ["vital", "signs", "monitor"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 20,
    itemSize: 3,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "OperatingTable",
    name: "operating table",
    description:
      "An adjustable operating table with a thin, firm mattress. A man’s body rests on it, covered from the waist down with a thin blue blanket.",
    sceneryDescription:
      "The table’s segmented sections are locked flat, its side rails hanging open and unused. The body on it lies very still, the sheet pulled up just far enough to suggest modesty and concealment, but not nearly enough to make the scene look peaceful.",
    location: "OR",
    vocab: ["operating", "table", "surgical", "bed"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 100,
    itemSize: 6,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 1,
  },
  {
    id: "ORBlanket",
    name: "blue, bloodstained blanket",
    description:
      "A thin blue blanket, spattered along one end with dried blood.",
    sceneryDescription:
      "The blanket’s fabric is the cheap, institutional kind that never quite feels warm, patterned with small squares to hide wear. The blood spatter runs in an uneven arc across one corner, a rust-colored constellation that says more than any chart ever could.",
    location: "OR",
    vocab: ["blue", "bloodstained", "blanket"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "SlugTank",
    name: "specimen tank",
    description:
      "A large specimen tank, roughly six feet by eight and a few feet deep. Cloudy water sloshes gently inside when you move, but you don’t see anything obvious drifting in it. A brass plaque is mounted on the front of the tank.",
    sceneryDescription:
      "The tank’s thick panels are built from reinforced transparent material, currently fogged and stained by whatever chemical mix is in there. The water has an unhealthy, milky tinge, and faint sediment drifts like ghostly snow. Hoses and cables disappear into the base, humming quietly with a life that outlived its original occupant.",
    location: "XenobiologyLab",
    vocab: ["specimen", "tank", "water", "tube", "tub"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 300,
    itemSize: 9,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 50,

    overrides: {
      take: "The tank is bolted into the deck and weighs more than your entire body. You’re not going anywhere with it.",
      enter:
        "You could climb in there and marinate in cloudy preservative fluid, but that’s probably overcommitting to the whole ‘research subject’ theme.",
    },
  },
  {
    id: "SlugLabel",
    name: "brass plaque",
    description:
      "A small brass plaque mounted on the front of the specimen tank. The etched text looks scientific and faintly smug.",
    sceneryDescription:
      "The plaque is polished to a dull shine, the engraved letters darkened to stand out against the metal. A faint patina is beginning to creep in around the edges, giving it a quietly ancient, museum-piece vibe.",
    location: "XenobiologyLab",
    vocab: ["brass", "plaque", "label", "slug"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: true,
    isContainer: false,
    readableText:
      ' - HOLOTHUROIDEA ADDUCO -\n                     "Brain Slug"',
  },
  {
    id: "BirdCage",
    name: "large wire cage",
    description:
      "A large wire cage that looks like a cross between a bird cage and a small aviary. A simple perch juts out inside, and the floor is covered in clay granules. Whatever warped this part of the ship buckled several of the bars, leaving a significant gap in one section. The cage now appears empty. A bronze plaque is mounted on the front.",
    sceneryDescription:
      "The bent bars give the cage a twisted, off-kilter shape, like it’s been partially melted and then forced back into service. The interior perch is scuffed where something with claws or talons used to land. The clay granules on the floor are raked into shallow furrows, the last footprints of something that apparently took the express route out.",
    location: "XenobiologyLab",
    vocab: ["large", "wire", "cage", "bird", "aviary"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 80,
    itemSize: 6,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 10,
    //contains: ["granules", "BirdLabel"],
    overrides: {
      take: "You try to lift the cage and get about an inch off the ground before your spine files a formal complaint.",
      enter:
        "You could probably squeeze inside through the warped bars, but being in something else’s broken cage feels like tempting fate.",
    },
  },
  {
    id: "granules",
    name: "clay granules",
    description:
      "The floor of the cage is covered in small clay granules, the sort used to soak up droppings and spills. Whatever lived here used this as its bathroom, but someone cleaned it recently; nothing unsavory remains.",
    sceneryDescription:
      "The granules form a lumpy, uneven layer that crunches softly under any weight. Here and there, faint discolorations mark places that were cleaned in a hurry, leaving a patchwork of slightly darker specks.",
    location: "XenobiologyLab",
    vocab: ["clay", "granules", "litter", "pellets"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 5,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
  {
    id: "BirdLabel",
    name: "bronze plaque",
    description:
      "A neat bronze plaque affixed to the front of the cage, bearing a scientific name and a much more honest nickname.",
    sceneryDescription:
      "The bronze has darkened slightly with age and handling, but the lettering is still crisp. Someone took pride in cataloging whatever used to live here, right up until it stopped wanting to be cataloged.",
    location: "XenobiologyLab",
    vocab: ["bronze", "plaque", "label", "screecher"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: true,
    isContainer: false,
    readableText:
      ' - XENOPSEPHOTUS WALLICUS -\n                     "Screecher"',
  },
  {
    id: "GlassCage",
    name: "broken glass cage",
    description:
      "A four-foot cube terrarium made of transparent plexiglass. Fine sand covers the interior, with an arrangement of rocks in one corner forming a crude little outcrop. The top is perforated with small air holes and fitted with a single access hatch, which now hangs by one hinge. A copper plaque is mounted on the front.",
    sceneryDescription:
      "Cracks spider across one side of the plexiglass, turning the interior into a fractured reflection of whatever passes by. The sand inside bears shallow troughs and collapsed pits, as if something used to burrow and then decided to upgrade its living arrangements. The hanging hatch sways slightly at the slightest vibration, ticking against the frame in a nervous little rhythm.",
    location: "XenobiologyLab",
    vocab: ["broken", "glass", "cage", "terrarium", "tank"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 60,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: true,
    capacity: 10,
    //contains: ["SpiderLabel"],
    overrides: {
      open: "You nudge the hanging hatch and it swings wider with a creak, the remaining hinge protesting but holding—for now.",
      take: "The terrarium is heavy and awkward, and the web of fractures suggests carrying it around would end badly for both of you.",
    },
  },
  {
    id: "SpiderLabel",
    name: "copper plaque",
    description:
      "A copper plaque set into the front of the terrarium, etched with a taxonomic tag and a much more unsettling common name.",
    sceneryDescription:
      "The copper has taken on a dull, reddish patina, but the text remains legible. The combination of Latin and ominous nickname feels like something out of a field guide for people with terrible survival instincts.",
    location: "XenobiologyLab",
    vocab: ["copper", "plaque", "label", "spider"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: true,
    isContainer: false,
    readableText: ' - ARACHNIDA PSIONICA -\n              "Mind Spider"',
  },
  {
    id: "RemoteBlueIND",
    name: "indicator light",
    description:
      "A small, circular indicator set flush into the wall. The entire disk glows with a soft, serene blue light.",
    sceneryDescription:
      "The light doesn’t flicker or pulse; it just burns steadily, casting a cool halo across the nearby bulkhead. It’s the kind of glow that makes everything else in the room look a little more artificial by comparison.",
    location: "UNKNOWN",
    vocab: ["indicator", "light", "blue", "glow"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    providesLight: true,
    overrides: {
      take: "It’s recessed into the wall and wired into the ship. You’d need tools, time, and fewer scruples about electrical fires.",
    },
  },
  {
    id: "LabBlueIND",
    name: "indicator light",
    description:
      "Another circular indicator disk, glowing with the same calm blue radiance.",
    sceneryDescription:
      "The glow paints the surrounding surfaces in a faint azure wash, smoothing out sharp edges and making harsh lab fixtures look almost gentle. Almost.",
    location: "UNKNOWN",
    vocab: ["indicator", "light", "blue", "glow"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    providesLight: true,
    overrides: {
      take: "Like the others, this light is part of the ship, not a souvenir.",
    },
  },
  {
    id: "LabTable",
    name: "table",
    description:
      "A sturdy lab bench, its surface crowded with faint stains and circular outlines where containers once sat. At the moment, the most prominent occupant is a large specimen jar.",
    sceneryDescription:
      "The bench is built from heavy composite material, resistant to most things you’d be foolish enough to spill on it. The edges are chipped from years of bumped knees and dropped equipment, and faint chemical smells cling to it like bad memories.",
    location: "Lab",
    vocab: ["table", "bench", "lab", "lab bench"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 80,
    itemSize: 5,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 10,
    //contains: ["Jar"],
  },
  {
    id: "Jar",
    name: "specimen jar",
    description:
      "A large specimen jar made of thick glass, filled with a viscous, transparent fluid. Suspended in the liquid, with a few thin wires trailing from it, is a strange organic sample. The wires run up into the underside of the lid, disappearing from view. Mounted under the lid is a small blacklight that bathes the sample in a dim, eerie glow.",
    sceneryDescription:
      "The jar sits like a captive world in miniature, the fluid inside refracting the blacklight into sickly streaks of violet-blue. The organic sample floats in the center, never quite still, twisting with lazy, unsettling grace whenever the jar is jostled.",
    location: "Lab",
    vocab: ["specimen", "jar", "glass", "container"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 3,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false, // sealed; you don't casually pop it open
    capacity: 3,
    //contains: ["Fluid", "VampireTooth"],
    providesLight: true,
    overrides: {
      open: "The lid is sealed tight, with wiring and seals you’re not eager to tamper with in a room full of sharp instruments.",
    },
  },
  {
    id: "Fluid",
    name: "preservative fluid",
    description:
      "A thick, transparent fluid that keeps the specimen suspended.",
    sceneryDescription:
      "The liquid is denser than water, moving slowly in syrupy waves when the jar is disturbed. It refracts the blacklight in peculiar ways, turning the sample’s silhouette into something even less reassuring.",
    location: "Lab",
    vocab: ["fluid", "preservative", "liquid"],
    itemClass: "liquid",
    itemCategory: "scenery",
    itemWeight: 3,
    itemSize: 2,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    overrides: {
      taste:
        "You’d have to get it out of the jar first, which is step one on the ‘grow extra limbs in all the wrong places’ plan. Hard pass.",
    },
  },
  {
    id: "VampireTooth",
    name: "organic sample",
    description:
      "The organic sample is hard to make out clearly through the lighting and the fluid. At first glance it looks like a reptilian arm or leg, but the shape is wrong. It’s about a foot long, sheathed in mottled, semi-translucent skin. The upper portion is roughly three inches across before it begins to taper. About midway down there’s a prominent joint that bends slightly, ending in a single long, translucent claw. A dark slit opens at the tip of that claw.",
    sceneryDescription:
      "Held in suspension, the thing resembles a cross between a talon and a biological syringe. As the jar shifts, the joint flexes just enough to suggest how it might move on its own, and the slit at the tip seems perfectly positioned for delivering something you definitely don’t want in your bloodstream.",
    location: "Lab",
    vocab: ["organic", "sample", "tooth", "alien", "claw", "specimen"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 3,
    itemSize: 3,
    isWearable: false,
    isReadable: false,
    isContainer: false,
  },
];
