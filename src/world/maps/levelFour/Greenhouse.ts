import { updateItemLocation } from "@game/rules/items";
import { inventoryHas } from "@game/rules/state";
import type { ScriptedEvent } from "@game/types/eventTypes";
import type { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import { Room } from "@game/types/roomTypes";

export const GREENHOUSE_EXTERIOR_ROOM_ID = "Greenhouse";
export const GREENHOUSE_INTERIOR_ROOM_ID = "GreenhouseInterior";
export const GREENHOUSE_BEES_DEACTIVATED_TRIGGER_ID =
  "greenhouseBeesDeactivated";
export const GREENHOUSE_SWARM_DEATH_CAUSE = "greenhouse robo-bee swarm";
export const DEACTIVATED_BEE_ITEM_ID = "DeactivatedBee";
export const GREENHOUSE_BEE_SHUTDOWN_FREQUENCY = 168.88;

export type BeeSpecs = {
  id: string;
  errorCode: string;
  hiveId: string;
  lastPing: number;
  model: string;
  objective: "pollinate" | "recharge" | "return" | "pesticide";
  log: string;
  pingFrequencyMs: number;
  region: string;
  requiresShutdown: boolean;
  section: number;
  shutdownFrequencyMHz: number;
  status: string;
  swarmId: number;
  totalPayloadGrams: number;
  trips: number;
  uptime: number;
  version: string;
};

const GREENHOUSE_SWARM_DEATH_MESSAGE =
  "The moment you step inside the greenhouse, the buzzing becomes a solid wall. Thousands of tiny metal bodies pour over you, stingers hammering through your skin faster than you can swat them away. Your throat closes before you make it three steps.";

function isGreenhouseBeeSwarmDeactivated(state: GameState): boolean {
  return (
    state.worldState.conditionalTriggers[
      GREENHOUSE_BEES_DEACTIVATED_TRIGGER_ID
    ] === true
  );
}

export function areGreenhouseBeesSwarming(state: GameState): boolean {
  return !isGreenhouseBeeSwarmDeactivated(state);
}

export function deactivateGreenhouseBees(state: GameState): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      conditionalTriggers: {
        ...state.worldState.conditionalTriggers,
        [GREENHOUSE_BEES_DEACTIVATED_TRIGGER_ID]: true,
      },
    },
  };
}

export function handleGreenhouseRadioCall(
  state: GameState,
  ctx: { frequency: number },
):
  | {
      message: string;
      state: GameState;
    }
  | undefined {
  if (state.player.roomId !== GREENHOUSE_EXTERIOR_ROOM_ID) return undefined;
  if (!areGreenhouseBeesSwarming(state)) return undefined;
  if (Number(ctx.frequency.toFixed(3)) !== GREENHOUSE_BEE_SHUTDOWN_FREQUENCY) {
    return undefined;
  }

  return {
    state: deactivateGreenhouseBees(state),
    message:
      "Inside the greenhouse, the harsh electric buzzing stutters, breaks into ragged pulses, and then falls silent.",
  };
}

export function getGreenhouseMoveGuard(
  state: GameState,
  ctx: { destinationRoomId?: string },
) {
  if (
    ctx.destinationRoomId !== GREENHOUSE_INTERIOR_ROOM_ID ||
    !areGreenhouseBeesSwarming(state)
  ) {
    return undefined;
  }

  return {
    kind: "death" as const,
    deathCause: GREENHOUSE_SWARM_DEATH_CAUSE,
    deathMessage: GREENHOUSE_SWARM_DEATH_MESSAGE,
  };
}

function describeGreenhouseExterior(state: GameState): string {
  const swarmText = areGreenhouseBeesSwarming(state)
    ? "Through the greenhouse fabric you can see a restless, glittering swarm churning between the plant rows, and the whole structure hums with a harsh electric buzzing."
    : "";

  return [
    "You're standing outside of a large greenhouse with a ribbed hoop frame that spans the length of the wide open space.",
    swarmText,
    "[[SCENERY]]",
  ]
    .filter(Boolean)
    .join(" ");
}

function describeGreenhouseInterior(): string {
  return "You are standing inside a large greenhouse, the ribbed hoop frame arching high overhead beneath translucent fabric. It forms a long tunnel with a walkway down the center. [[SCENERY]]";
}

function greenhouseBeeClueCanBeSeeded(state: GameState): boolean {
  if (!areGreenhouseBeesSwarming(state)) return false;
  if (inventoryHas(state.player.inventory, DEACTIVATED_BEE_ITEM_ID)) {
    return false;
  }

  const bee = state.world.items.find(
    (item) => item.id === DEACTIVATED_BEE_ITEM_ID,
  );
  if (!bee) return false;

  const currentLocation =
    state.itemState.itemRoomId[DEACTIVATED_BEE_ITEM_ID] ?? bee.location;

  return (
    currentLocation === "seeded" ||
    currentLocation === GREENHOUSE_EXTERIOR_ROOM_ID
  );
}

function seedGreenhouseBeeClue(state: GameState): GameState {
  if (!greenhouseBeeClueCanBeSeeded(state)) return state;

  return updateItemLocation(
    state,
    DEACTIVATED_BEE_ITEM_ID,
    GREENHOUSE_EXTERIOR_ROOM_ID,
  );
}

export const greenhouseRooms: Room[] = [
  {
    id: GREENHOUSE_EXTERIOR_ROOM_ID,
    name: "Greenhouse: Exterior",
    description:
      "You're standing outside of a large greenhouse with a ribbed hoop frame that spans the length of the wide open space. [[SCENERY]]",
    describe: (state) => describeGreenhouseExterior(state),
    exits: [
      { direction: "west", toRoomId: "Apiary" },
      { direction: "south", toRoomId: "BotanicalOne" },
      { direction: "southwest", toRoomId: "FungalCave" },
      { direction: "in", toRoomId: GREENHOUSE_INTERIOR_ROOM_ID },
    ],
  },
  {
    id: GREENHOUSE_INTERIOR_ROOM_ID,
    name: "Greenhouse: Interior",
    description: describeGreenhouseInterior(),
    describe: () => describeGreenhouseInterior(),
    exits: [{ direction: "out", toRoomId: GREENHOUSE_EXTERIOR_ROOM_ID }],
  },
];

export const greenhouseItems: Item[] = [
  {
    id: "GreenhouseExteriorFabric",
    name: "translucent greenhouse fabric",
    description:
      "The greenhouse fabric is thick, translucent, and stretched tight across the curved ribs. You can make out plants, color, and irrigation lines through it, but not much detail.",
    sceneryDescription:
      "Through the translucent fabric you can make out rows and rows of green plants with splotches of color scattered throughout, along with irrigation piping.",
    location: GREENHOUSE_EXTERIOR_ROOM_ID,
    vocab: ["fabric", "greenhouse fabric", "translucent fabric", "covering"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    meta: { sceneryDescriptionOrder: 10 },
  },
  {
    id: "GreenhouseExteriorDoor",
    name: "greenhouse door",
    description:
      "A simple greenhouse door hangs in a reinforced section of the frame. It leads inside.",
    sceneryDescription:
      "There's a door on one side of the greenhouse that you could use to get inside.",
    location: GREENHOUSE_EXTERIOR_ROOM_ID,
    vocab: ["door", "greenhouse door", "inside"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    meta: { sceneryDescriptionOrder: 20 },
  },
  {
    id: "GreenhouseExteriorPaths",
    name: "greenhouse paths",
    description:
      "The paths are pressed flat through the grass by maintenance traffic. One leads west toward the apiary, another southwest toward the cave, and another south toward the botanical entrance.",
    sceneryDescription:
      "A dirt path leads west, the dark entrance to a cave waits off to the southwest, and the area's exit is back south.",
    location: GREENHOUSE_EXTERIOR_ROOM_ID,
    vocab: ["path", "paths", "dirt path", "grass", "exit"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    meta: { sceneryDescriptionOrder: 30 },
  },
  {
    id: "GreenhouseInteriorPlanters",
    name: "greenhouse planters",
    description:
      "The planters are arranged in long rows on either side of the center walkway, packed with bushy green vegetation and flashes of different colored flowers.",
    sceneryDescription:
      "To either side of the walkway are rows and rows of planters, bushy with green vegetation and scattered with a jumble of different wildflowers.",
    location: GREENHOUSE_INTERIOR_ROOM_ID,
    vocab: ["planters", "plants", "vegetation", "flowers", "wildflowers"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    meta: { sceneryDescriptionOrder: 10 },
  },
  {
    id: "GreenhouseInteriorIrrigation",
    name: "irrigation pipes",
    description:
      "The irrigation pipes run the length of the greenhouse over the rows of plants, with sprayers pointed downward. None of them are running right now.",
    sceneryDescription:
      "Irrigation pipes run the length of the greenhouse over the plant rows, sprayers pointed downward, though none are running at the moment.",
    location: GREENHOUSE_INTERIOR_ROOM_ID,
    vocab: ["irrigation", "pipes", "sprayers", "sprayer", "water"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    meta: { sceneryDescriptionOrder: 20 },
  },
  {
    id: "GreenhouseInteriorAir",
    name: "humid greenhouse air",
    description:
      "The air is humid and earthy, carrying the organic smell of damp soil, crushed leaves, and wildflowers.",
    sceneryDescription:
      "The air is humid here, earthy and organic, with the mixed smell of wet soil and wildflowers.",
    location: GREENHOUSE_INTERIOR_ROOM_ID,
    vocab: ["air", "smell", "humidity", "humid air", "soil"],
    itemClass: "gas",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    meta: { sceneryDescriptionOrder: 30 },
  },
  {
    id: "GreenhouseBeePiles",
    name: "piles of deactivated robo-bees",
    description:
      "Thousands of tiny robo-bees lie heaped along the walkway and caught in the planters, their wings still and their metal bodies dull.",
    describeScenery: (state) =>
      isGreenhouseBeeSwarmDeactivated(state)
        ? "Piles of deactivated robo-bees are scattered everywhere: heaped along the walkway, dusted across the soil, and caught in the leaves like dead glitter."
        : "",
    location: GREENHOUSE_INTERIOR_ROOM_ID,
    vocab: ["bees", "bee", "robo-bees", "robot bees", "piles", "swarm"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    meta: { sceneryDescriptionOrder: 40 },
  },
  {
    id: "GreenhouseWorkerBody",
    name: "a dead greenhouse worker",
    description:
      "The young man is dressed in a dirt-covered green jumpsuit. His back is arched, his hands are clawed, and his mouth is pulled into a frozen grimace. His face is swollen enough to squeeze his eyes shut, and his skin is covered in tiny red dots or hives.",
    sceneryDescription:
      "Lying prone on the floor near the far end of the walkway is the body of a young man in a dirt-covered green jumpsuit, his swollen face squeezed shut and his skin covered in tiny red dots.",
    location: GREENHOUSE_INTERIOR_ROOM_ID,
    vocab: ["body", "worker", "man", "corpse", "jumpsuit"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 0,
    meta: { sceneryDescriptionOrder: 50 },
  },
  {
    id: DEACTIVATED_BEE_ITEM_ID,
    name: "deactivated robo-bee",
    description:
      "At a glance it looks like a normal bumblebee, but a closer inspection reveals that it's actually made up of tiny robotics. It's a machine.",
    initialDescription:
      "Lying in the grass is what appears to be a dead bumblebee.",
    location: "seeded",
    vocab: ["bee", "robo-bee", "bumblebee"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    meta: {
      specs: {
        errorCode: "AG4E",
        hiveId: "H02",
        lastPing: 19234234234234,
        model: "POL-ES991",
        pingFrequencyMs: 550,
        region: "L",
        requiresShutdown: false,
        section: 7,
        shutdownFrequencyMHz: 168.88,
        status: "Idle",
        swarmId: 400190,
        totalPayloadGrams: 3.105,
        trips: 207,
        uptime: 19282322231123,
        version: "5.23.01",
        id: "GX-7M4Q-K91F-ZT2C-0V8A-H6NP-B3RD-XW55",
        objective: "pollinate",
        log: "POS: C-14, X: 18.42m, Y: 03.77m, Z: 2.18m EVENT: struck by unknown object",
      } satisfies BeeSpecs,
    },
  },
];

export const greenhouseScriptedEvents: ScriptedEvent[] = [
  {
    id: "greenhouse_seed_deactivated_bee",
    once: false,
    when: (state, ctx) =>
      ctx.kind === "onEnterRoom" &&
      ctx.roomId === GREENHOUSE_EXTERIOR_ROOM_ID &&
      greenhouseBeeClueCanBeSeeded(state),
    run: (state) => seedGreenhouseBeeClue(state),
  },
];
