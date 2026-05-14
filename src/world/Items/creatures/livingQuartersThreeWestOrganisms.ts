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
    initialDescription: `In one corner of the room sits a strange, glassy black sculpture that resembles a figure on its back, writhing in pain.`,
    describe: (state, item) => {
      const loc = state.itemState.itemRoomId?.[item.id] ?? item.location;
      if (flashlightOn(state) && loc === state.player.roomId) {
        return `The limbs are gangly and the head is shriveled, but it definitely looks like a person writhing on their back. The surface of it is covered in fine ripples and grooves.`;
      }
      return `...you can't see it.`;
    },
    describeInitial: (state, item) => {
      const loc = state.itemState.itemRoomId?.[item.id] ?? item.location;
      if (flashlightOn(state) && loc === state.player.roomId) {
        return `In one corner of the room sits a strange, glassy black sculpture that resembles a figure on its back, writhing in pain.`;
      }
      return `...you can't see it.`;
    },
    location: "LivingQuartersThreeWest",
    vocab: ["strange", "prone", "black", "glassy", "sculpture"],
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
    initialDescription: `Against one wall sits a mannequin made from something black and glassy. It's positioned as if it were seated, leaning back, its right hand curled like it was holding something.`,
    describe: (state, item) => {
      const loc = state.itemState.itemRoomId?.[item.id] ?? item.location;
      if (flashlightOn(state) && loc === state.player.roomId) {
        return `It gives the impression of a misshapen figure seated at an invisible table, and the right hand is positioned like it was holding something that's since been removed. The surface of the figure is a network of very fine ridges and valleys.`;
      }
      return `...you can't see it.`;
    },
    describeInitial: (state, item) => {
      const loc = state.itemState.itemRoomId?.[item.id] ?? item.location;
      if (flashlightOn(state) && loc === state.player.roomId) {
        return `Against one wall sits a mannequin made from something black and glassy. It's positioned as if it were seated, leaning back, its right hand curled like it was holding something.`;
      }
      return `...you can't see it.`;
    },
    location: "ThreeWestBath",
    vocab: ["mannequin", "seated", "black", "glassy"],
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
    initialDescription: `On the other side of the room stands a glossy black statue that resembles a pair of legs ending at the waist, leaning forward and running.`,
    describe: (state, item) => {
      const loc = state.itemState.itemRoomId?.[item.id] ?? item.location;
      if (flashlightOn(state) && loc === state.player.roomId) {
        return `It looks like a statue that got broken, or was cut, in half. The legs are spindly, and covered in tiny, intricate ripples and folds.`;
      }
      return `...you can't see it.`;
    },
    describeInitial: (state, item) => {
      const loc = state.itemState.itemRoomId?.[item.id] ?? item.location;
      if (flashlightOn(state) && loc === state.player.roomId) {
        return `On the other side of the room stands a glossy black statue that resembles a pair of legs ending at the waist, leaning forward and running.`;
      }
      return `...you can't see it.`;
    },
    location: "ThreeWestBed",
    vocab: ["statue", "black", "glassy", "legs"],
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

  const playerFlashlightOn = flashlightOn(state);

  const isRoomLit = (roomId: string) => {
    // Ambiently lit if not dark
    if (!isRoomDark(roomId)) return true;

    // Player + lit flashlight makes the *player's* room lit
    if (playerFlashlightOn && roomId === playerRoomId) return true;

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
      if (!(playerFlashlightOn && chosen === playerRoomId)) {
        nextState = moveItemToRoom(item.id, chosen);
        nextRoomId = chosen;
      }
    }
  }

  // Rule 7: same dark room + no flashlight => death
  const nowPlayerRoomId = getPlayerRoomId();
  const sameRoom = nextRoomId === nowPlayerRoomId;
  const roomIsDark = isRoomDark(nowPlayerRoomId);

  if (sameRoom && roomIsDark && !playerFlashlightOn) {
    triggerPlayerDeath?.(
      "In the dark, something touches you and your body goes rigid. You feel the sensation of something cold and sticky brushing over your bare skin, then a tingle, then everything gets washed away with stark, bright light. You stare into the blinding white void for only a second before being all at once replaced by sudden, final darkness.",
      "organism",
    );
    return;
  }

  if (nextState !== state) return nextState;
}
