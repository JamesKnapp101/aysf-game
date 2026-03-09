import { triggerPlayerDeath } from "@game/helpers/gameHelpers";
import type { ActionResult } from "@game/types/actionsTypes";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import { hydroponicsRooms } from "src/world/maps/levelSix/Hydroponics";

export const HYDROPONICS_SPIDER_ITEM_ID = "spider";
export const HYDROPONICS_SPIDER_ROOM_IDS = new Set(
  hydroponicsRooms.map((room) => room.id),
);

export const HYDROPONICS_SPIDER_DOOR_MAX_HP = 3;
export const HYDROPONICS_SPIDER_REACHABILITY_MESSAGE =
  "You can't reach it from where you are.";
const HYDROPONICS_SPIDER_BLIND_SPOT_ROOM_IDS = new Set([
  "HydroponicsPlatformAdmin",
]);

const GAP_PEEK_MESSAGES = [
  "Through the narrow gap you can only make out webbing and a churn of shifting shadows deeper inside. Something in there goes still, as if it heard you.",
  "You peer through the gap again. The moving shadows resolve into long, deliberate adjustments in the webbing, and you get the distinct sense that whatever is in there has turned toward the door.",
  "You risk another look and catch a pale, swollen mass shifting behind the web. Several long limbs reposition at once, and a moment later you hear a long inhale followed by a wet, bubbling gurgle.",
];

const DOOR_ACID_MESSAGES = [
  "A jet of acid blasts through the gap and splashes across the damaged door with a violent hiss. Smoke curls up from the metal as the seam darkens and sags.",
  "Another gout of acid slams into the door, chewing deeper into the weakened metal. The frame shrieks as the seam widens another miserable inch.",
  "The next blast hits with enough force to eat straight through the ruined seam. The damaged door softens, buckles, and melts down the middle, opening the way into Hydroponics.",
];

const HYDROPONICS_TRACKING_MESSAGES = [
  "The massive spider's eight glossy eyes flick in your direction. It's spotted you.",
  "The spider shifts its position to face you, several long legs drawing tight against the webbing as it reorients.",
  "The spider rears back, its webbing creaking under the weight as it opens its mouthparts wide, preparing to spit.",
];

const GAP_FATAL_MESSAGE =
  "You lean in for one look too many. Something on the far side convulses, and a stream of acid lashes through the gap, splashing across your face and chest before you can recoil.";

const HYDROPONICS_FATAL_MESSAGE =
  "The giant spider rears and convulses. A pressurized stream of acid erupts from its mouthparts and catches you before you can move, burning straight through skin, muscle, and bone.";

function appendSpiderLog(state: GameState, text: string): GameState {
  return { ...state, log: [...state.log, text] };
}

function updateSpiderState(
  state: GameState,
  updates: Partial<GameState["worldState"]["hydroponicsSpider"]>,
): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      hydroponicsSpider: {
        ...state.worldState.hydroponicsSpider,
        ...updates,
      },
    },
  };
}

export function isHydroponicsSpiderRoom(roomId: string): boolean {
  return HYDROPONICS_SPIDER_ROOM_IDS.has(roomId);
}

export function isHydroponicsSpiderBlindSpot(roomId: string): boolean {
  return HYDROPONICS_SPIDER_BLIND_SPOT_ROOM_IDS.has(roomId);
}

export function isHydroponicsSpiderVisibleFromRoom(roomId: string): boolean {
  return isHydroponicsSpiderRoom(roomId) && !isHydroponicsSpiderBlindSpot(roomId);
}

export function getHydroponicsSpiderRoomId(state: GameState): string {
  return (
    state.itemState.itemRoomId[HYDROPONICS_SPIDER_ITEM_ID] ??
    "HydroponicsPlatformMid"
  );
}

export function canReachHydroponicsSpiderFromRoom(
  state: GameState,
  roomId: string,
): boolean {
  return roomId === getHydroponicsSpiderRoomId(state);
}

export function getVisibleHydroponicsSpider(
  state: GameState,
  roomId: string,
): Item | undefined {
  if (!isHydroponicsSpiderVisibleFromRoom(roomId)) return undefined;

  return state.world.items.find(
    (item) => item.id === HYDROPONICS_SPIDER_ITEM_ID,
  );
}

export function isHydroponicsSpiderNoun(item: Item, noun: string): boolean {
  const lower = noun.trim().toLowerCase();
  if (!lower) return false;
  const tokens = lower.split(/\s+/).filter(Boolean);

  if (item.id.toLowerCase() === lower) return true;
  if (item.name.toLowerCase() === lower) return true;
  if (item.vocab.some((term) => term.toLowerCase() === lower)) return true;

  const nameTokens = new Set(
    item.name.toLowerCase().split(/\s+/).filter(Boolean),
  );
  if (tokens.every((token) => nameTokens.has(token))) return true;

  return item.vocab.some((term) => {
    const vocabTokens = new Set(
      term.toLowerCase().split(/\s+/).filter(Boolean),
    );
    return tokens.every((token) => vocabTokens.has(token));
  });
}

function getHydroponicsSpiderSceneryText(
  roomId: string,
  isAlive: boolean,
): string {
  switch (roomId) {
    case "HydroponicsPlatform":
      return isAlive
        ? "Through the grating you can see a spider which has somehow grown so large that its eight long legs now span the circumference of the platform, a good fifty meters, converging at its spiny carapace whose abdomen is swollen to the size of a parade float, straining at the seams. It hangs from layers of thick webbing, casting shadows across the floor beneath it."
        : "Below the grated opening, the spider's carcass sags deep into its own torn webbing, its burst abdomen split wide while millions of hand-sized spiders boil through the wreckage beneath it.";
    case "HydroponicsPlatformMid":
      return isAlive
        ? "A massive spider sprawls across the middle platform, its bloated abdomen half-cradled in a glistening cradle of webbing while its long legs rest over the metal grating."
        : "The massive spider lies collapsed across the middle platform, its abdomen burst open and slumped into a spreading mound of silk, scraps, and swarming young.";
    case "HydroponicsPlatformBottom":
      return isAlive
        ? "Above you, the web canopy bows under the weight of a massive spider suspended near the center, its silhouette shifting whenever the whole structure creaks."
        : "Above you, the web canopy sags around the spider's dead bulk, its ruptured abdomen hanging open while streams of hand-sized spiderlings pour through the torn silk.";
    case "UnderWebOne":
      return isAlive
        ? "Through the layered strands overhead, you can make out the massive spider near the canopy's center, one side of its body more visible through the sagging web."
        : "Through the layered strands overhead, the spider hangs dead near the canopy's center, dimly outlined through the silk while restless swarms spill from its burst abdomen.";
    case "UnderWebTwo":
      return isAlive
        ? "From this corner the massive spider is partly obscured by overlapping strands, but its swollen body is still visible above the web canopy's central dip."
        : "From this corner the spider is partly obscured by overlapping strands, but its dead bulk and the constant movement of swarming young are still visible above the canopy's central dip.";
    case "UnderWebThree":
      return isAlive
        ? "The webbing overhead thins just enough here for you to glimpse the massive spider looming beyond it, several legs braced against the silk near the middle."
        : "The webbing overhead thins just enough here for you to glimpse the spider hanging slack beyond it, several legs frozen where they last braced around a split, emptied abdomen.";
    case "UnderWebFour":
      return isAlive
        ? "Seen through the glistening lattice overhead, the massive spider hangs off-center from your angle, its body swaying faintly whenever the canopy flexes."
        : "Seen through the glistening lattice overhead, the spider hangs off-center from your angle, dead and ruptured while the canopy below it crawls with escaping young.";
    default:
      return isAlive
        ? "The massive spider is visible somewhere within the Hydroponics webbing."
        : "The massive spider's ruptured corpse is visible somewhere within the Hydroponics webbing, surrounded by swarming offspring.";
  }
}

function getHydroponicsSpiderExamineText(
  roomId: string,
  isAlive: boolean,
): string {
  switch (roomId) {
    case "HydroponicsPlatform":
      return isAlive
        ? "From up here you can look down onto the creature's distended body where it sags in the webbing below. The spider looks enormous even at this angle, but what stands out most is how labored it seems, as if every breath costs it effort."
        : "From up here you can see the spider's huge body slumped into the wrecked webbing below. Its abdomen has burst wide open, spraying scraps of leathery flesh through the silk while millions of hand-sized young continue to spill and swarm over the dead carcass.";
    case "HydroponicsPlatformMid":
      return isAlive
        ? "Up close, the creature is equal parts hideous and pitiable. Its abdomen is swollen to painful proportions, the webbing around it trembling whenever air rasps through its spiracles, and its long, slender legs look barely strong enough to manage the burden."
        : "Up close, the spider is unmistakably dead. Its abdomen has ruptured down the side, spilling a slick ruin of tissue and spiderlings into the collapsed silk while its long legs remain locked in a final curl.";
    case "HydroponicsPlatformBottom":
      return isAlive
        ? "From directly underneath, the spider is mostly a looming mass above the translucent canopy, its weight bowing the silk into a pale, glistening ceiling. Every movement sends small ripples through the web over your head."
        : "From directly underneath, the spider is a dead, ruptured mass above the translucent canopy. The web still hangs heavy over the open space, but the quiet is gone; countless hand-sized spiderlings stream through the torn silk in every direction.";
    case "UnderWebOne":
      return isAlive
        ? "From this angle you only get a partial view through the webbing, but it is more than enough. The spider's body hangs near the center of the canopy, and the occasional flex of one long leg makes the surrounding strands shiver."
        : "From this angle you only get a partial view through the webbing, but it is enough to see the spider hanging dead near the center of the canopy. Its abdomen has split apart, and the surrounding strands twitch now only because waves of young keep pouring through them.";
    case "UnderWebTwo":
      return isAlive
        ? "The overlapping silk here obscures the spider in pieces: a pale swell of abdomen, a dark jointed leg, a faint shift deeper in the canopy. The fragmented view somehow makes it worse."
        : "The overlapping silk here breaks the spider into grisly fragments: the torn curve of its abdomen behind one sheet of web, a folded leg behind another, and constant movement wherever the young spill through.";
    case "UnderWebThree":
      return isAlive
        ? "The spider is visible through a thinner patch of web from here, close enough that you can track the slow rise and fall of its huge abdomen and the deliberate tension in its legs."
        : "The spider is visible through a thinner patch of web from here, close enough to make out the full, ugly shape now hanging completely still. The abdomen has erupted open, leaving a wet cavity that still births out endless young.";
    case "UnderWebFour":
      return isAlive
        ? "From this side the spider appears slightly askew in the canopy, suspended in a slanted nest of silk. It sways faintly whenever the web flexes, but the movement never looks healthy or natural."
        : "From this side the spider appears slightly askew in the canopy, dead in its slanted nest of silk. The only motion comes from the millions of young swarming over the burst abdomen and racing through the shifting web.";
    default:
      return isAlive
        ? "The spider is immense, bloated, and miserable-looking."
        : "The spider is immense, ruptured, and very dead, with swarming young still pouring from its burst abdomen.";
  }
}

export function lookThroughSpiderGap(state: GameState): ActionResult {
  const spider = state.worldState.hydroponicsSpider;

  if (!spider.isAlive) {
    return {
      state,
      message:
        "Beyond the gap, the web-choked chamber is still. Whatever once moved in there is no longer interested in you.",
      consumesTurn: false,
    };
  }

  if (
    spider.doorHealth <= 0 ||
    state.worldState.conditionalTriggers.HydroponicsDoorUnblocked
  ) {
    return {
      state,
      message:
        "The damaged door has already given way, melted down the middle into a blackened opening. Beyond it, the webbed Hydroponics platform lies exposed.",
      consumesTurn: false,
    };
  }

  if (spider.pendingAcidTarget === "door" && spider.sensitivity >= 3) {
    return {
      state: updateSpiderState(state, {
        pendingAcidTarget: "gapPlayer",
      }),
      message: "",
      consumesTurn: true,
    };
  }

  const nextSensitivity = Math.min(3, spider.sensitivity + 1);
  const nextState = updateSpiderState(state, {
    sensitivity: nextSensitivity,
    pendingAcidTarget:
      nextSensitivity >= 3 ? "door" : (spider.pendingAcidTarget ?? "none"),
  });

  return {
    state: nextState,
    message: GAP_PEEK_MESSAGES[nextSensitivity - 1] ?? GAP_PEEK_MESSAGES[2],
    consumesTurn: false,
  };
}

export function tickHydroponicsSpiderThreat(state: GameState): GameState {
  const spider = state.worldState.hydroponicsSpider;
  if (!spider.isAlive) return state;

  const inHydroponics = isHydroponicsSpiderRoom(state.player.roomId);
  const exposedToSpider =
    inHydroponics && !isHydroponicsSpiderBlindSpot(state.player.roomId);

  if (exposedToSpider) {
    if (spider.lastTrackedHydroponicsRoomId !== state.player.roomId) {
      return updateSpiderState(state, {
        sensitivity: 0,
        pendingAcidTarget: "none",
        lastTrackedHydroponicsRoomId: state.player.roomId,
      });
    }
  } else if (spider.lastTrackedHydroponicsRoomId) {
    return updateSpiderState(state, {
      sensitivity: 0,
      pendingAcidTarget: "none",
      lastTrackedHydroponicsRoomId: undefined,
    });
  }

  if (
    spider.pendingAcidTarget === "player" ||
    spider.pendingAcidTarget === "gapPlayer"
  ) {
    const armedState = updateSpiderState(state, {
      pendingAcidTarget: "none",
      sensitivity: Math.max(0, spider.sensitivity - 1),
    });
    return triggerPlayerDeath(
      armedState,
      spider.pendingAcidTarget === "gapPlayer"
        ? GAP_FATAL_MESSAGE
        : HYDROPONICS_FATAL_MESSAGE,
      "hydroponics spider acid",
    );
  }

  if (spider.pendingAcidTarget === "door") {
    const nextDoorHealth = Math.max(0, spider.doorHealth - 1);
    let next = updateSpiderState(state, {
      pendingAcidTarget: "none",
      sensitivity: Math.max(0, spider.sensitivity - 1),
      doorHealth: nextDoorHealth,
    });

    if (nextDoorHealth <= 0) {
      next = {
        ...next,
        worldState: {
          ...next.worldState,
          conditionalTriggers: {
            ...next.worldState.conditionalTriggers,
            HydroponicsDoorUnblocked: true,
          },
        },
      };
    }

    const damageIndex = HYDROPONICS_SPIDER_DOOR_MAX_HP - nextDoorHealth - 1;
    return appendSpiderLog(
      next,
      DOOR_ACID_MESSAGES[damageIndex] ?? DOOR_ACID_MESSAGES[2],
    );
  }

  const nextSensitivity = exposedToSpider
    ? Math.min(3, spider.sensitivity + 1)
    : Math.max(0, spider.sensitivity - 1);

  const nextPendingAcidTarget =
    !spider.pendingAcidTarget || spider.pendingAcidTarget === "none"
      ? exposedToSpider && nextSensitivity >= 3
        ? "player"
        : "none"
      : spider.pendingAcidTarget;

  if (
    nextSensitivity === spider.sensitivity &&
    nextPendingAcidTarget === spider.pendingAcidTarget
  ) {
    return state;
  }

  let next = updateSpiderState(state, {
    sensitivity: nextSensitivity,
    pendingAcidTarget: nextPendingAcidTarget,
    lastTrackedHydroponicsRoomId: exposedToSpider
      ? state.player.roomId
      : spider.lastTrackedHydroponicsRoomId,
  });

  if (exposedToSpider && nextSensitivity > spider.sensitivity) {
    const warning =
      HYDROPONICS_TRACKING_MESSAGES[nextSensitivity - 1] ??
      HYDROPONICS_TRACKING_MESSAGES[2];
    next = appendSpiderLog(next, warning);
  }

  return next;
}

export const giantSpiderItems: Item[] = [
  {
    id: HYDROPONICS_SPIDER_ITEM_ID,
    name: "massive spider",
    itemCategory: "scenery",
    meta: {
      isAlive: true,
      canMove: false,
      vision: "dark",
      hostility: "neutral",
      homeRegion: [...HYDROPONICS_SPIDER_ROOM_IDS],
      memories: [],
      sceneryDescriptionOrder: 99,
    },
    description:
      "The creature is equal parts hideous and pitiable, its abdomen swollen to painful proportions and its long, slender legs barely able to move.",
    location: "HydroponicsPlatformMid",
    vocab: ["spider", "giant spider", "massive spider"],
    itemClass: "solid",
    itemWeight: 200,
    itemSize: 200,
    describe: (state) =>
      getHydroponicsSpiderExamineText(
        state.player.roomId,
        state.worldState.hydroponicsSpider.isAlive,
      ),
    describeScenery: (state, _item, ctx) =>
      getHydroponicsSpiderSceneryText(
        ctx.roomId,
        state.worldState.hydroponicsSpider.isAlive,
      ),
    overrides: {
      tick: () => {},
    },
  },
];
