import type { Item } from "../../game/types/itemTypes";

export const levelFiveItems: Item[] = (
  [
    {
      id: "EngineRoomPanel",
      name: "radiation panel",
      description:
        "A squat, utilitarian status panel is bolted above the bulkhead doors. The only thing it bothers to show you is a pulsing radiation symbol, lit in deep, angry red. It doesn’t flicker, doesn’t blink out, just burns steadily as if the ship itself is quietly insisting: this is not a safe place to stand.",
      sceneryDescription:
        "A small panel above the doors burns steadily with a red radiation symbol, like an unblinking eye that knows exactly how doomed this space is.",
      location: "ReactorControlRoom",
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
      location: "ReactorControlRoom",
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
      id: "EngineRoomButton",
      name: "square red button",
      description:
        "A square red button sits recessed in a worn metal plate, its edges polished to a dull shine by nervous fingers over the years. It has that particular look shared by all important hardware: no markings, no explanations, just an implied promise that once you press it, the ship will remember you forever.",
      sceneryDescription:
        "A lone red button waits on a small panel, the sort of control that never exists for anything trivial.",
      location: "ReactorControlRoom",
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
      id: "EngVioletIND",
      name: "violet indicator disk",
      description:
        "A flat metal disk has been set flush with the bulkhead, its surface emitting a soft, uniform violet glow. The light isn’t bright enough to be useful, exactly, but it feels oddly calm, the way hospital lights feel calm right up until someone pulls a curtain and starts cutting.",
      initialDescription: "The disk is glowing with a warm, violet light.",
      sceneryDescription:
        "A small disk in the wall glows with a warm violet light, more mood lighting than warning—though on this ship those lines tend to blur.",
      location: "ReactorControlRoom",
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
        kind: "matter-transmitter",
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
  ] satisfies Item[]
).filter((item) => item.location !== "MaintenanceDuctThree");
