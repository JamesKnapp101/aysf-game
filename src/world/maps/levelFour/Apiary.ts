import type { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import { Room } from "@game/types/roomTypes";
import {
  DEACTIVATED_BEE_ITEM_ID,
  type BeeSpecs,
} from "src/world/maps/levelFour/Greenhouse";

export const APIARY_ROOM_ID = "Apiary";
export const APIARY_TERMINAL_ITEM_ID = "ApiaryTerminal";
export const APIARY_TRAY_ITEM_ID = "ApiaryTray";

export function isDeactivatedBeeOnApiaryTray(state: GameState): boolean {
  return (
    state.itemState.surfaceContents[APIARY_TRAY_ITEM_ID]?.includes(
      DEACTIVATED_BEE_ITEM_ID,
    ) === true
  );
}

function isBeeSpecs(value: unknown): value is BeeSpecs {
  if (!value || typeof value !== "object") return false;

  const specs = value as Partial<Record<keyof BeeSpecs, unknown>>;
  const validObjectives: BeeSpecs["objective"][] = [
    "pollinate",
    "recharge",
    "return",
    "pesticide",
  ];

  return (
    typeof specs.errorCode === "string" &&
    typeof specs.hiveId === "string" &&
    typeof specs.id === "string" &&
    typeof specs.lastPing === "number" &&
    typeof specs.log === "string" &&
    typeof specs.model === "string" &&
    typeof specs.objective === "string" &&
    validObjectives.includes(specs.objective as BeeSpecs["objective"]) &&
    typeof specs.pingFrequencyMs === "number" &&
    typeof specs.region === "string" &&
    typeof specs.requiresShutdown === "boolean" &&
    typeof specs.section === "number" &&
    typeof specs.shutdownFrequencyMHz === "number" &&
    typeof specs.status === "string" &&
    typeof specs.swarmId === "number" &&
    typeof specs.totalPayloadGrams === "number" &&
    typeof specs.trips === "number" &&
    typeof specs.uptime === "number" &&
    typeof specs.version === "string"
  );
}

export function getApiaryTrayBeeSpecs(state: GameState): BeeSpecs | undefined {
  if (!isDeactivatedBeeOnApiaryTray(state)) return undefined;

  const bee = state.world.items.find(
    (item) => item.id === DEACTIVATED_BEE_ITEM_ID,
  );
  const specs = bee?.meta?.specs;

  return isBeeSpecs(specs) ? specs : undefined;
}

export const apiaryRooms: Room[] = [
  {
    id: APIARY_ROOM_ID,
    name: "Apiary",
    description: `This is a grassy apiary clearing outside the greenhouse. [[SCENERY]]`,
    exits: [{ direction: "east", toRoomId: "Greenhouse" }],
  },
];

export const apiaryItems: Item[] = [
  {
    id: "ApiaryWillows",
    name: "drooping willow trees",
    description:
      "Thin willow trees ring the clearing, their drooping branches stirring in the occasional artificial breeze.",
    sceneryDescription:
      "Thin, drooping willow trees surround the clearing, stirring in the occasional breeze.",
    location: APIARY_ROOM_ID,
    vocab: ["willow", "willows", "trees", "tree", "branches"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    meta: { sceneryDescriptionOrder: 10 },
  },
  {
    id: "ApiaryBeeCrates",
    name: "rectangular apiary crates",
    description:
      "Four large rectangular crates sit in the grass. Each one has rows of regular, thin horizontal slots cut down the sides, like vents for something very small to come and go.",
    sceneryDescription:
      "Within the grassy clearing are arranged four large rectangular crates, each with regular thin horizontal slots running down the sides.",
    location: APIARY_ROOM_ID,
    vocab: ["crates", "crate", "hives", "hive", "boxes", "slots"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    meta: { sceneryDescriptionOrder: 20 },
  },
  {
    id: "ApiaryPlatform",
    name: "raised apiary platform",
    description:
      "The platform is only slightly raised above the grass, just enough to keep the terminal dry and level.",
    sceneryDescription:
      "At the head of the crate arrangement is a slightly raised platform.",
    location: APIARY_ROOM_ID,
    vocab: ["platform", "raised platform"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    meta: { sceneryDescriptionOrder: 30 },
  },
  {
    id: APIARY_TERMINAL_ITEM_ID,
    name: "apiary control terminal",
    description:
      "The terminal is a weatherproof kiosk with a screen, keyboard, and thick industrial casing. It looks like it was built to monitor or command the robo-bee hives.",
    sceneryDescription:
      "On the platform stands a weatherproof computer terminal or kiosk with a screen and keyboard.",
    location: APIARY_ROOM_ID,
    vocab: [
      "apiary",
      "apiary terminal",
      "terminal",
      "computer",
      "kiosk",
      "screen",
      "keyboard",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    meta: {
      kind: "apiary-terminal",
      sceneryDescriptionOrder: 40,
    },
  },
  {
    id: APIARY_TRAY_ITEM_ID,
    name: "tiny terminal tray",
    description:
      "A tiny tray is mounted next to the terminal screen and keyboard, about the right size for something insect-small or sensor-small.",
    sceneryDescription:
      "A tiny tray is mounted beside the terminal's screen and keyboard.",
    location: APIARY_ROOM_ID,
    vocab: ["apiary", "tray", "tiny tray", "terminal tray"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    allowedContentsIds: [DEACTIVATED_BEE_ITEM_ID],
    isSurface: true,
    meta: { sceneryDescriptionOrder: 50 },
  },
];
