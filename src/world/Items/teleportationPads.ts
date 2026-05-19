import type { Item } from "../../game/types/itemTypes";

type PowerSections = Record<string, boolean>;

const PAD_COLORS = [
  "green",
  "blue",
  "yellow",
  "violet",
  "orange",
  "white",
  "maroon",
] as const;

export function describePoweredTeleportPads(
  powerRestoredSections: PowerSections,
): string | null {
  const powered = PAD_COLORS.filter(
    (color) => powerRestoredSections[`teleport-pads-${color}`],
  );

  if (powered.length === 0) return null;

  const formatted =
    powered.length === 1
      ? powered[0]
      : powered.length === 2
        ? `${powered[0]} and ${powered[1]}`
        : `${powered.slice(0, -1).join(", ")}, and ${
            powered[powered.length - 1]
          }`;

  return `The ${formatted} disk${powered.length > 1 ? "s are" : " is"} lit with a sallow glow`;
}

export const teleportationPadItems: Item[] = [
  // GREEN TELEPORT RING
  {
    id: "GreenTPADTerminal",
    name: "glossy green disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    location: "TPADTerminal",
    vocab: ["green disk", "green", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      onPowered: `Each of the disks emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-green",
        ring: "green",
        order: 1,
        requires: ["greenbadge", "maroonbadge", "ultravioletbadge"],
      },
    },
  },
  {
    id: "GreenTPADParkCenter",
    name: "glossy green disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "Just off the paved area is a four foot by four foot square stepping stone, upon which is a slightly raised green disk ringed by a shiny metal band.",
    location: "ParkCenter",
    vocab: ["green", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      sceneryDescriptionOrder: 6,
      onPowered: `The disk emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-green",
        ring: "green",
        order: 2,
        requires: ["greenbadge", "maroonbadge", "ultravioletbadge"],
      },
    },
  },
  {
    id: "GreenTPADHydroponicsOne",
    name: "glossy green disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "In the grass near the hatch you see a four foot by four foot stepping stone, upon which is mounted a slightly raised green disk, made of a hard, glossy material.",
    location: "HydroponicsOne",
    vocab: ["green", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      onPowered: `The disk emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-green",
        ring: "green",
        order: 3,
        requires: ["greenbadge", "maroonbadge", "ultravioletbadge"],
      },
    },
  },
  // BLUE TELEPORT RING
  {
    id: "BlueTPADTerminal",
    name: "glossy blue disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    // Since there's several in the same room, have GREEN describe them all instead of five separate items listed, give the others a blank sceneryDescription
    location: "TPADTerminal",
    vocab: ["blue disk", "blue", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      teleport: {
        section: "teleport-pads-blue",
        ring: "blue",
        order: 1,
        requires: ["bluebadge", "maroonbadge", "ultravioletbadge"],
      },
    },
  },
  {
    id: "BlueTPADLab",
    name: "glossy blue disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "In one corner of the Lab you see a slightly raised blue disk, ringed by a shiny metal band.",
    location: "Lab",
    vocab: ["blue", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      onPowered: `The disk emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-blue",
        ring: "blue",
        order: 2,
        requires: ["bluebadge", "maroonbadge", "ultravioletbadge"],
      },
    },
  },
  {
    id: "BlueTPADRemoteMedicalOne",
    name: "glossy blue disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "In the corner you see a slightly raised blue disk, made of a hard, glossy material.",
    location: "RemoteMedicalOne",
    vocab: ["blue", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      onPowered: `The disk emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-blue",
        ring: "blue",
        order: 3,
        requires: ["bluebadge", "maroonbadge", "ultravioletbadge"],
      },
    },
  },
  // YELLOW TELEPORT RING
  {
    id: "YellowTPADTerminal",
    name: "glossy yellow disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    // Since there's several in the same room, have GREEN describe them all instead of five separate items listed, give the others a blank sceneryDescription
    location: "TPADTerminal",
    vocab: ["yellow disk", "yellow", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      teleport: {
        section: "teleport-pads-yellow",
        ring: "yellow",
        order: 1,
        requires: ["yellowbadge", "maroonbadge", "ultravioletbadge"],
      },
    },
  },
  {
    id: "YellowTPADPowerGrid",
    name: "glossy yellow disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "In one corner of the room you see a slightly raised yellow disk, ringed by a shiny metal band.",
    location: "PowerGrid",
    vocab: ["yellow", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      onPowered: `The disk emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-yellow",
        ring: "yellow",
        order: 2,
        requires: ["yellowbadge", "maroonbadge", "ultravioletbadge"],
      },
    },
  },
  {
    id: "YellowTPADRemotePowerStation",
    name: "glossy yellow disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "In the corner you see a slightly raised yellow disk, made of a hard, glossy material.",
    location: "RemotePowerStation",
    vocab: ["yellow", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      onPowered: `The disk emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-yellow",
        ring: "yellow",
        order: 3,
        requires: ["yellowbadge", "maroonbadge", "ultravioletbadge"],
      },
    },
  },
  // BROWN TELEPORT RING
  {
    id: "VioletTPADTerminal",
    name: "glossy violet disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    // Since there's several in the same room, have GREEN describe them all instead of five separate items listed, give the others a blank sceneryDescription
    location: "TPADTerminal",
    vocab: ["violet disk", "violet", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      teleport: {
        section: "teleport-pads-violet",
        ring: "violet",
        order: 1,
        requires: ["violetbadge", "maroonbadge", "ultravioletbadge"],
      },
    },
  },
  {
    id: "VioletTPADMainEngineering",
    name: "glossy violet disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "In one corner of the room you see a slightly raised violet disk, ringed by a shiny metal band.",
    location: "MainReactorPlatform",
    vocab: ["violet", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      onPowered: `The disk emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-violet",
        ring: "violet",
        order: 2,
        requires: ["violetbadge", "maroonbadge", "ultravioletbadge"],
      },
    },
  },
  {
    id: "VioletTPADMaintenanceDuct",
    name: "glossy violet disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "In the corner you see a slightly raised violet disk, made of a hard, glossy material.",
    location: "MaintenanceDuct",
    vocab: ["violet", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      onPowered: `The disk emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-violet",
        ring: "violet",
        order: 3,
        requires: ["violetbadge", "maroonbadge", "ultravioletbadge"],
      },
    },
  },
  // WHITE TELEPORT RING
  {
    id: "WhiteTPADTerminal",
    name: "glossy white disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    // Since there's several in the same room, have GREEN describe them all instead of five separate items listed, give the others a blank sceneryDescription
    location: "TPADTerminal",
    vocab: ["white disk", "white", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      teleport: {
        section: "teleport-pads-white",
        ring: "white",
        order: 1,
        requires: ["whitebadge", "maroonbadge", "ultravioletbadge"],
      },
    },
  },
  {
    id: "WhiteTPADCryoLab",
    name: "glossy white disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "In one corner of the room you see a slightly raised white disk, ringed by a shiny metal band.",
    location: "CryoLab",
    vocab: ["white", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      onPowered: `The disk emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-white",
        ring: "white",
        order: 2,
        requires: ["whitebadge", "maroonbadge", "ultravioletbadge"],
      },
    },
  },
  {
    id: "WhiteTPADGridC3",
    name: "glossy white disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "In the corner you see a slightly raised white disk, made of a hard, glossy material.",
    location: "GridC3",
    vocab: ["white", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      onPowered: `The disk emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-white",
        ring: "white",
        order: 3,
        requires: ["whitebadge", "maroonbadge", "ultravioletbadge"],
      },
    },
  },
  // GREY TELEPORT RING
  {
    id: "MaroonTPADTerminal",
    name: "glossy maroon disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    // Since there's several in the same room, have GREEN describe them all instead of five separate items listed, give the others a blank sceneryDescription
    location: "TPADTerminal",
    vocab: ["maroon disk", "maroon", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      teleport: {
        section: "teleport-pads-maroon",
        ring: "maroon",
        order: 1,
        requires: ["maroonbadge", "ultravioletbadge"],
      },
    },
  },
  {
    id: "MaroonTPADBridge",
    name: "glossy maroon disk",
    description:
      "It's a flat, smooth disk, ringed with a shiny metallic band. It looks sturdy enough to stand on.",
    sceneryDescription:
      "In one corner of the room you see a slightly raised maroon disk, ringed by a shiny metal band.",
    location: "Bridge",
    vocab: ["maroon", "disk", "pad"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1,
    itemSize: 1,
    isSurface: true,
    meta: {
      onPowered: `The disk emits a soft, serene glow.`,
      teleport: {
        section: "teleport-pads-maroon",
        ring: "maroon",
        order: 2,
        requires: ["maroonbadge", "ultravioletbadge"],
      },
    },
  },
];
