import type { WorldChunk } from "../types";

export const LEVEL_SEVEN: WorldChunk = {
  rooms: [
    {
      id: "LevelSevenCorridorBend",
      name: "Level Seven Corridor Bend",
      description:
        "The long, straight corridor ends here, and bends to the south. To the west is a blank white door with a light mounted over it which is currently dark. A flat white light illuminates this area, and you can see the white walls, ceiling, and floor are covered with blood splatters and sprays. Down the hall to the south you can see some scoring on the floor, like something was burned. There are several holes in the northern wall that look like they might be bullet holes.",
      exits: [
        { direction: "east", toRoomId: "LevelSevenStairAccess" },
        { direction: "west", toRoomId: "CryoLab" },
        { direction: "south", toRoomId: "LevelSevenCorridor" },
      ],
    },
    {
      id: "LevelSevenCorridor",
      name: "Level Seven Corridor",
      description:
        "This is a long stretch of lonely corridor that looks like it saw a good deal of violence recently; blood spots can be seen here and there over the walls and floor, and you count several dings on the walls that might have been caused by gunshots. There is a large, burnt area where the floor tiles were blown away, suggesting some kind of explosive went off here. To the south a doorway opens into a large, dimly lit area. There is a panel over the doorway which is just barely glowing with a sallow, ghostly green light.",
      exits: [
        { direction: "north", toRoomId: "LevelSevenCorridorBend" },
        { direction: "south", toRoomId: "Stasis" },
      ],
    },
    {
      id: "CryoLab",
      name: "Cryonics Laboratory",
      description:
        "This is a laboratory of some kind, consisting mostly of a large open area cluttered with equipment that you don't recognize. The northern portion of the room is dominated by a series of ten or so metal chambers resting side by side at about chest level. Each chamber has a glass window on its face providing a view inside, and each also has two armholes to which are connected thick rubbery black gloves to allow physical access. The chambers seem to all contain some kind of delicate-looking medical instruments along with different types of organic samples. Along the eastern wall are a series of what look like large pressurized cannisters which extend floor to ceiling. Piping extends from the top of each cannister, along the corners of the ceiling, and are distributed around the room mainly in the direction of the strange chambers. The southern part of the lab is devoted to a large array of computer equipment and workstations, which are all currently dark. Positioned in one corner is a slightly raised white disk, four feet in diameter, made of some kind of glassy substance.",
      exits: [{ direction: "east", toRoomId: "LevelSevenCorridorBend" }],
    },
    {
      id: "Stasis",
      name: "Stasis Cold Storage",
      description:
        "This chamber is completely empty. It looks like the entryway to a dark section of the ship, visible through a doorway to the south. It's not totally dark, but you can see the lighting is very dim.",
      exits: [
        { direction: "north", toRoomId: "LevelSevenCorridor" },
        { direction: "south", toRoomId: "GridA1" },
      ],
    },

    // Row 1: A1–E1
    {
      id: "GridA1",
      name: "Stasis Grid A1",
      description:
        "This is a tall, wide corridor bend extending east and south, with a doorway north leading back to the stasis storage entrance. This area is huge, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'A1'.",
      exits: [
        { direction: "east", toRoomId: "GridB1" },
        { direction: "south", toRoomId: "GridA2" },
        { direction: "north", toRoomId: "Stasis" },
      ],
    },
    {
      id: "GridB1",
      name: "Stasis Grid B1",
      description:
        "This is a tall, wide corridor junction extending south, east, and west, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'B1'.",
      exits: [
        { direction: "east", toRoomId: "GridC1" },
        { direction: "west", toRoomId: "GridA1" },
        { direction: "south", toRoomId: "GridB2" },
      ],
    },
    {
      id: "GridC1",
      name: "Stasis Grid C1",
      description:
        "This is a tall, wide corridor junction extending south, east, and west, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'C1'.",
      exits: [
        { direction: "west", toRoomId: "GridB1" },
        { direction: "south", toRoomId: "GridC2" },
        { direction: "east", toRoomId: "GridD1" },
      ],
    },
    {
      id: "GridD1",
      name: "Stasis Grid D1",
      description:
        "This is a tall, wide corridor junction extending south, east, and west, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'D1'.",
      exits: [
        { direction: "west", toRoomId: "GridC1" },
        { direction: "south", toRoomId: "GridD2" },
        { direction: "east", toRoomId: "GridE1" },
      ],
    },
    {
      id: "GridE1",
      name: "Stasis Grid E1",
      description:
        "This is a tall, wide corridor junction extending south and west, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'E1'.",
      exits: [
        { direction: "west", toRoomId: "GridD1" },
        { direction: "south", toRoomId: "GridE2" },
      ],
    },

    // Row 2: A2–E2
    {
      id: "GridA2",
      name: "Stasis Grid A2",
      description:
        "This is a tall, wide corridor junction extending north, south, and east, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'A2'.",
      exits: [
        { direction: "east", toRoomId: "GridB2" },
        { direction: "south", toRoomId: "GridA3" },
        { direction: "north", toRoomId: "GridA1" },
      ],
    },
    {
      id: "GridB2",
      name: "Stasis Grid B2",
      description:
        "This is a tall, wide corridor junction extending north, south, east, and west, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'B2'.",
      exits: [
        { direction: "east", toRoomId: "GridC2" },
        { direction: "west", toRoomId: "GridA2" },
        { direction: "south", toRoomId: "GridB3" },
        { direction: "north", toRoomId: "GridB1" },
      ],
    },
    {
      id: "GridC2",
      name: "Stasis Grid C2",
      description:
        "This is a tall, wide corridor junction extending north, south, east, and west, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'C2'.",
      exits: [
        { direction: "west", toRoomId: "GridB2" },
        { direction: "south", toRoomId: "GridC3" },
        { direction: "north", toRoomId: "GridC1" },
        { direction: "east", toRoomId: "GridD2" },
      ],
    },
    {
      id: "GridD2",
      name: "Stasis Grid D2",
      description:
        "This is a tall, wide corridor junction extending north, south, east, and west, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'D2'.",
      exits: [
        { direction: "east", toRoomId: "GridE2" },
        { direction: "west", toRoomId: "GridC2" },
        { direction: "south", toRoomId: "GridD3" },
        { direction: "north", toRoomId: "GridD1" },
      ],
    },
    {
      id: "GridE2",
      name: "Stasis Grid E2",
      description:
        "This is a tall, wide corridor junction extending north, south, and west, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'E2'.",
      exits: [
        { direction: "west", toRoomId: "GridD2" },
        { direction: "south", toRoomId: "GridE3" },
        { direction: "north", toRoomId: "GridE1" },
      ],
    },

    // Row 3: A3–E3
    {
      id: "GridA3",
      name: "Stasis Grid A3",
      description:
        "This is a tall, wide corridor junction extending north, south, and east, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'A3'.",
      exits: [
        { direction: "east", toRoomId: "GridB3" },
        { direction: "north", toRoomId: "GridA2" },
        { direction: "south", toRoomId: "GridA4" },
      ],
    },
    {
      id: "GridB3",
      name: "Stasis Grid B3",
      description:
        "This is a tall, wide corridor junction extending north, south, east, and west, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'B3'.",
      exits: [
        { direction: "east", toRoomId: "GridC3" },
        { direction: "west", toRoomId: "GridA3" },
        { direction: "north", toRoomId: "GridB2" },
        { direction: "south", toRoomId: "GridB4" },
      ],
    },
    {
      id: "GridC3",
      name: "Stasis Grid C3",
      description:
        "This is a tall, wide corridor junction extending north, south, east, and west, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'C3', and just in front of that is a slightly raised white disk, four feet in diameter, made of some kind of glassy substance.",
      exits: [
        { direction: "west", toRoomId: "GridB3" },
        { direction: "north", toRoomId: "GridC2" },
        { direction: "east", toRoomId: "GridD3" },
        { direction: "south", toRoomId: "GridC4" },
      ],
    },
    {
      id: "GridD3",
      name: "Stasis Grid D3",
      description:
        "This is a tall, wide corridor junction extending north, south, east, and west, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'D3'.",
      exits: [
        { direction: "east", toRoomId: "GridE3" },
        { direction: "west", toRoomId: "GridC3" },
        { direction: "north", toRoomId: "GridD2" },
        { direction: "south", toRoomId: "GridD4" },
      ],
    },
    {
      id: "GridE3",
      name: "Stasis Grid E3",
      description:
        "This is a tall, wide corridor junction extending north, south, and west, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'E3'.",
      exits: [
        { direction: "west", toRoomId: "GridD3" },
        { direction: "north", toRoomId: "GridE2" },
        { direction: "south", toRoomId: "GridE4" },
      ],
    },

    // Row 4: A4–E4
    {
      id: "GridA4",
      name: "Stasis Grid A4",
      description:
        "This is a tall, wide corridor junction extending north, south, and east, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'A4'.",
      exits: [
        { direction: "east", toRoomId: "GridB4" },
        { direction: "north", toRoomId: "GridA3" },
        { direction: "south", toRoomId: "GridA5" },
      ],
    },
    {
      id: "GridB4",
      name: "Stasis Grid B4",
      description:
        "This is a tall, wide corridor junction extending north, south, east, and west, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'B4'.",
      exits: [
        { direction: "east", toRoomId: "GridC4" },
        { direction: "west", toRoomId: "GridA4" },
        { direction: "north", toRoomId: "GridB3" },
        { direction: "south", toRoomId: "GridB5" },
      ],
    },
    {
      id: "GridC4",
      name: "Stasis Grid C4",
      description:
        "This is a tall, wide corridor junction extending north, south, east, and west, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'C4'.",
      exits: [
        { direction: "west", toRoomId: "GridB4" },
        { direction: "north", toRoomId: "GridC3" },
        { direction: "south", toRoomId: "GridC5" },
        { direction: "east", toRoomId: "GridD4" },
      ],
    },
    {
      id: "GridD4",
      name: "Stasis Grid D4",
      description:
        "This is a tall, wide corridor junction extending north, south, east, and west, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'D4'.",
      exits: [
        { direction: "east", toRoomId: "GridE4" },
        { direction: "west", toRoomId: "GridC4" },
        { direction: "north", toRoomId: "GridD3" },
        { direction: "south", toRoomId: "GridD5" },
      ],
    },
    {
      id: "GridE4",
      name: "Stasis Grid E4",
      description:
        "This is a tall, wide corridor junction extending north, south, and west, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'E4'.",
      exits: [
        { direction: "west", toRoomId: "GridD4" },
        { direction: "north", toRoomId: "GridE3" },
        { direction: "south", toRoomId: "GridE5" },
      ],
    },

    // Row 5: A5–E5
    {
      id: "GridA5",
      name: "Stasis Grid A5",
      description:
        "This is a tall, wide corridor junction extending north and east, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'A5'.",
      exits: [
        { direction: "east", toRoomId: "GridB5" },
        { direction: "north", toRoomId: "GridA4" },
      ],
    },
    {
      id: "GridB5",
      name: "Stasis Grid B5",
      description:
        "This is a tall, wide corridor junction extending north, east, and west, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'B5'.",
      exits: [
        { direction: "east", toRoomId: "GridC5" },
        { direction: "west", toRoomId: "GridA5" },
        { direction: "north", toRoomId: "GridB4" },
      ],
    },
    {
      id: "GridC5",
      name: "Stasis Grid C5",
      description:
        "This is a tall, wide corridor junction extending north, east, and west, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'C5'.",
      exits: [
        { direction: "west", toRoomId: "GridB5" },
        { direction: "north", toRoomId: "GridC4" },
        { direction: "east", toRoomId: "GridD5" },
      ],
    },
    {
      id: "GridD5",
      name: "Stasis Grid D5",
      description:
        "This is a tall, wide corridor junction extending north, east, and west, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'D5'.",
      exits: [
        { direction: "east", toRoomId: "GridE5" },
        { direction: "west", toRoomId: "GridC5" },
        { direction: "north", toRoomId: "GridD4" },
      ],
    },
    {
      id: "GridE5",
      name: "Stasis Grid E5",
      description:
        "This is a tall, wide corridor junction extending north and west, with a high ceiling that is lost in the gloom above you. The area is packed almost entirely full of coffin-sized chambers standing on end. Each chamber looks to be electronically sealed, and has a small LCD display panel attached to its face, near the top. They are stacked side by side along both sides of each corridor, then another row is stacked on top of those, then another, and another...they are stacked upward quite a ways, and you don't know how deep they're stacked but there must be hundreds of them. The display panels each emit a muted, ghostly green glow in the relative darkness, creating a grid of hundreds of glowing points peeking eerily out of the gloom. Painted on the floor in large stencil is the indicator 'E5'.",
      exits: [
        { direction: "west", toRoomId: "GridD5" },
        { direction: "north", toRoomId: "GridE4" },
      ],
    },
  ],

  items: [],
  doors: [],
};
