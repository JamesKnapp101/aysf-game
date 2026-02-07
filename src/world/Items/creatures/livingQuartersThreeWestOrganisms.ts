import { flashlightOn } from "@game/helpers/gameHelpers";
import { TickContext } from "@game/types/context";
import { GameState } from "@game/types/gameTypes";
import { Item } from "@game/types/itemTypes";
import { Exit } from "@game/types/roomTypes";
import { getRandomOrganismAudioCue } from "src/world/Items/creatures/aviaryOrganisms";

export const livingQuartersThreeWestOrganismItems: Item[] = [
  {
    id: "gim-one",
    name: "organism-lq3-1",
    itemCategory: "animate",
    meta: {
      isAlive: true,
      canMove: true,
      vision: "dark",
      hostility: "hostile",
      homeRegion: [],
      memories: [],
      audioCue: ({ dirFromPlayer }: { dirFromPlayer: string }) =>
        `${getRandomOrganismAudioCue(dirFromPlayer)}`,
    },
    description: "You can't see it...",
    initialDescription: `From the upper corner of the room hangs a large, ornate wreath carved in one piece of polished crimson.`,
    describe: (state, item) => {
      const loc = state.itemState.itemRoomId?.[item.id] ?? item.location;
      if (flashlightOn(state) && loc === state.player.roomId) {
        return `From the upper corner of the room hangs a large, ornate wreath carved in one piece of polished crimson.`;
      }
      return `...you can't see it.`;
    },
    describeInitial: (state, item) => {
      const loc = state.itemState.itemRoomId?.[item.id] ?? item.location;
      if (flashlightOn(state) && loc === state.player.roomId) {
        return `From the upper corner of the room hangs a large, ornate wreath carved in one piece of polished crimson.`;
      }
      return `...you can't see it.`;
    },
    location: "LivingQuartersThreeWest",
    vocab: ["wreath", "ornate", "crimson"],
    itemClass: "solid",
    itemWeight: 8,
    itemSize: 2,
    overrides: {
      tick: ({
        state,
        item,
        rng,
        moveItemToRoom,
        getRoomExits,
        isRoomDark,
        getPlayerRoomId,
        triggerPlayerDeath,
      }: TickContext & {
        triggerPlayerDeath?: (deathMessage: string, cause: string) => void;
      }): GameState | void => {
        return organismLQOverrideTick(
          item,
          state,
          rng,
          moveItemToRoom,
          getRoomExits,
          isRoomDark,
          getPlayerRoomId,
          triggerPlayerDeath,
        );
      },
    },
  },
  {
    id: "gim-two",
    name: "organism-lq3-2",
    itemCategory: "animate",
    meta: {
      isAlive: true,
      canMove: true,
      vision: "dark",
      hostility: "hostile",
      homeRegion: [],
      memories: [],
      audioCue: ({ dirFromPlayer }: { dirFromPlayer: string }) =>
        `${getRandomOrganismAudioCue(dirFromPlayer)}`,
    },
    description: "You can't see it...",
    initialDescription: `Against the wall stands a squat, rectangular sculpture, polished and colored deep red.`,
    describe: (state, item) => {
      const loc = state.itemState.itemRoomId?.[item.id] ?? item.location;
      if (flashlightOn(state) && loc === state.player.roomId) {
        return `Against the wall stands a squat, rectangular sculpture, polished and colored deep red.`;
      }
      return `...you can't see it.`;
    },
    describeInitial: (state, item) => {
      const loc = state.itemState.itemRoomId?.[item.id] ?? item.location;
      if (flashlightOn(state) && loc === state.player.roomId) {
        return `Against the wall stands a squat, rectangular sculpture, polished and colored deep red.`;
      }
      return `...you can't see it.`;
    },
    location: "ThreeWestBath",
    vocab: ["squat", "rectangular", "sculpture", "red"],
    itemClass: "solid",
    itemWeight: 8,
    itemSize: 2,
    overrides: {
      tick: ({
        state,
        item,
        rng,
        moveItemToRoom,
        getRoomExits,
        isRoomDark,
        getPlayerRoomId,
        triggerPlayerDeath,
      }: TickContext & {
        triggerPlayerDeath?: (deathMessage: string, cause: string) => void;
      }): GameState | void => {
        return organismLQOverrideTick(
          item,
          state,
          rng,
          moveItemToRoom,
          getRoomExits,
          isRoomDark,
          getPlayerRoomId,
          triggerPlayerDeath,
        );
      },
    },
  },
  {
    id: "gim-three",
    name: "organism-lq3-3",
    itemCategory: "animate",
    meta: {
      isAlive: true,
      canMove: true,
      vision: "dark",
      hostility: "hostile",
      homeRegion: [],
      memories: [],
      audioCue: ({ dirFromPlayer }: { dirFromPlayer: string }) =>
        `${getRandomOrganismAudioCue(dirFromPlayer)}`,
    },
    description: "You can't see it, yo...",
    initialDescription: `In one corner stands a large sculpture or statue of some kind, made of a beautiful ruby red material. It has intricate folds and ripples, forming something vaguely triangular.`,
    describe: (state, item) => {
      const loc = state.itemState.itemRoomId?.[item.id] ?? item.location;
      if (flashlightOn(state) && loc === state.player.roomId) {
        return `In one corner stands a large sculpture or statue of some kind, made of a beautiful ruby red material. It has intricate folds and ripples, forming something vaguely triangular.`;
      }
      return `...you can't see it.`;
    },
    describeInitial: (state, item) => {
      const loc = state.itemState.itemRoomId?.[item.id] ?? item.location;
      if (flashlightOn(state) && loc === state.player.roomId) {
        return `In one corner stands a large sculpture or statue of some kind, made of a beautiful ruby red material. It has intricate folds and ripples, forming something vaguely triangular.`;
      }
      return `...you can't see it.`;
    },
    location: "ThreeWestBed",
    vocab: ["statue", "ruby", "triangular", "triangle"],
    itemClass: "solid",
    itemWeight: 8,
    itemSize: 2,
    overrides: {
      tick: ({
        state,
        item,
        rng,
        moveItemToRoom,
        getRoomExits,
        isRoomDark,
        getPlayerRoomId,
        triggerPlayerDeath,
      }: TickContext & {
        triggerPlayerDeath?: (deathMessage: string, cause: string) => void;
      }): GameState | void => {
        return organismLQOverrideTick(
          item,
          state,
          rng,
          moveItemToRoom,
          getRoomExits,
          isRoomDark,
          getPlayerRoomId,
          triggerPlayerDeath,
        );
      },
    },
  },
];

export function organismLQOverrideTick(
  item: Item,
  state: GameState,
  rng: () => number,
  moveItemToRoom: (itemId: string, roomId: string) => GameState,
  getRoomExits: (roomId: string) => Exit[],
  isRoomDark: (roomId: string) => boolean,
  getPlayerRoomId: () => string,
  triggerPlayerDeath?: (deathMessage: string, cause: string) => void,
): GameState | void {
  // Basic guards
  if (!item.meta?.isAlive) return;
  if (!item.meta?.canMove) return;

  const itemRoomId =
    state.itemState.itemRoomId[item.id] ?? item.location ?? undefined;
  if (!itemRoomId) return;

  const playerRoomId = getPlayerRoomId();
  const playerPrevRoomId: string | undefined = state.player.prevRoomId;

  const flashlightOn = (() => {
    if (!state.player.inventory.includes("flashlight")) return false;
    const fs = state.itemState.itemSettings["flashlight"];
    return Boolean(fs && "isOn" in fs && fs.isOn === true);
  })();

  const isRoomLit = (roomId: string) => {
    // Ambiently lit if not dark
    if (!isRoomDark(roomId)) return true;

    // Player + lit flashlight makes the *player's* room lit
    if (flashlightOn && roomId === playerRoomId) return true;

    return false;
  };

  // Rule 6: frozen in lit rooms
  if (isRoomLit(itemRoomId)) return;

  // Rule 1: decide whether to move
  const moveChance =
    typeof item.meta?.moveChance === "number" ? item.meta.moveChance : 0.5;
  const willMove = rng() < moveChance;

  let nextState = state;
  let nextRoomId = itemRoomId;

  if (willMove) {
    const exits = getRoomExits(itemRoomId);

    // Rule 2/4: can only move into a room that remains dark AND isn't the room
    // the player just left (no "sneaking past").
    const candidates = exits
      .map((e) => e.toRoomId)
      .filter((rid): rid is string => typeof rid === "string" && rid.length > 0)
      .filter((rid) => !isRoomLit(rid))
      .filter((rid) => (playerPrevRoomId ? rid !== playerPrevRoomId : true));

    // Rule 3: no valid dark moves => stay put
    if (candidates.length > 0) {
      const idx = Math.floor(rng() * candidates.length);
      const chosen =
        candidates[Math.max(0, Math.min(candidates.length - 1, idx))];

      // Rule 5: never voluntarily enter the player's lit room
      if (!(flashlightOn && chosen === playerRoomId)) {
        nextState = moveItemToRoom(item.id, chosen);
        nextRoomId = chosen;
      }
    }
  }

  // Rule 7: same dark room + no flashlight => death
  const nowPlayerRoomId = getPlayerRoomId();
  const sameRoom = nextRoomId === nowPlayerRoomId;
  const roomIsDark = isRoomDark(nowPlayerRoomId);

  if (sameRoom && roomIsDark && !flashlightOn) {
    triggerPlayerDeath?.(
      "Something stirs in the darkness—too close. You feel it before you understand it.",
      "organism",
    );
  }

  if (nextState !== state) return nextState;
}
