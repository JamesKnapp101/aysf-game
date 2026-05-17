import { moveItemToRoom } from "@game/helpers/itemHelpers";
import { provokePreserveAnimalWithWhistle } from "@game/preserve/preserveAnimals";
import { handleGamePreserveEmptyHandReturn } from "@game/preserve/preserveTrophies";
import { updatePreserveStructures } from "@game/preserve/preserveState";
import {
  isPreserveActorId,
  type PreserveActorId,
} from "@game/preserve/preserveTypes";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "../../game/types/itemTypes";
import type { ParsedCommand } from "../../game/types/parserTypes";

const PRESERVE_TREAT_IDS = [
  "ProcessedAnimalTreatOne",
  "ProcessedAnimalTreatTwo",
  "ProcessedAnimalTreatThree",
] as const;

const GAME_WHISTLE_DESCRIPTION =
  "A squat preserve-issued whistle with a knurled selector ring marked for different animal calls. The available options are 'boar', 'badger', 'bull', 'bear', and 'barry'.";

const GAME_WHISTLE_MODE_LABELS: Record<PreserveActorId, string> = {
  badger: "badger",
  boar: "boar",
  bull: "bull",
  bear: "bear",
  barry: "Barry",
};

function describeGameWhistle(state: GameState): string {
  const settings = state.itemState.itemSettings.GameWhistle;
  const mode = settings?.kind === "game-whistle" ? settings.mode : "bull";

  return `${GAME_WHISTLE_DESCRIPTION} The selector is currently set to ${GAME_WHISTLE_MODE_LABELS[mode]}.`;
}

function getGameWhistleCall(
  item: Item,
  mode: PreserveActorId,
): string | undefined {
  const calls = item.meta?.calls;
  if (!calls || typeof calls !== "object") return undefined;

  const call = (calls as Partial<Record<PreserveActorId, unknown>>)[mode];
  return typeof call === "string" && call.trim() ? call : undefined;
}

function setGameWhistle({
  state,
  cmd,
}: {
  cmd?: ParsedCommand;
  state: GameState;
}): {
  message: string;
  state: GameState;
} {
  const mode = cmd?.type === "action" ? cmd.indirect?.trim().toLowerCase() : "";
  if (!mode) {
    return { state, message: "Set the game whistle to what?" };
  }

  if (!isPreserveActorId(mode)) {
    return {
      state,
      message:
        "The selector has markings for badger, boar, bull, bear, and Barry.",
    };
  }

  return {
    state: {
      ...state,
      itemState: {
        ...state.itemState,
        itemSettings: {
          ...state.itemState.itemSettings,
          GameWhistle: { kind: "game-whistle", mode },
        },
      },
    },
    message: `You set the game whistle to ${mode}.`,
  };
}

function blowGameWhistle({
  state,
  item,
}: {
  item: Item;
  state: GameState;
}): {
  message: string;
  state: GameState;
} {
  const settings = state.itemState.itemSettings.GameWhistle;
  const mode = settings?.kind === "game-whistle" ? settings.mode : "bull";

  return provokePreserveAnimalWithWhistle(
    state,
    mode,
    getGameWhistleCall(item, mode),
  );
}

function touchGamePreserveTrophyDais({ state }: { state: GameState }): {
  message: string;
  state: GameState;
} {
  return handleGamePreserveEmptyHandReturn(state, state.player.roomId);
}

function dispensePreserveFeed({ state }: { state: GameState }): {
  message: string;
  state: GameState;
} {
  const run = state.worldState.gamePreserve.run;
  if (!run) {
    return {
      state,
      message: "The dispenser gives a dead mechanical click.",
    };
  }

  if (run.structures.feedDispenserChargesRemaining <= 0) {
    return {
      state,
      message: "The dispenser clacks, but the feed hopper is empty.",
    };
  }

  const treatId = PRESERVE_TREAT_IDS.find(
    (candidateId) =>
      state.itemState.itemRoomId[candidateId] === "GamePreserveStaging",
  );

  if (!treatId) {
    return {
      state,
      message: "The dispenser clacks, but nothing drops into the tray.",
    };
  }

  let next = updatePreserveStructures(state, (structures) => ({
    ...structures,
    feedDispenserChargesRemaining: Math.max(
      0,
      structures.feedDispenserChargesRemaining - 1,
    ),
  }));
  next = moveItemToRoom(next, treatId, "UnusedPen");

  return {
    state: next,
    message:
      "The dispenser rattles, then drops a dense processed animal treat into the tray.",
  };
}

export const gamePreserveStructureItems: Item[] = [
  {
    id: "GPWaterholePrints",
    name: "muddy animal prints",
    description:
      "You can't identify them all but the longer you look, the more different types you find. Different sized hooves, different sized paws, different sized claws, it looks like quite the menagerie has passed through here, at one time or another.",
    sceneryDescription:
      "All around the edge of the water hole you can see the prints of several different animals pressed into the mud; hooves and paws of all sorts, including a few human palm prints from previous visitors. ",
    location: "Waterhole",
    vocab: ["prints", "tracks", "animal"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "GPThicketTallGrass",
    name: "tall grass",
    description:
      "It's off to the west. You should be able to reach it if you take the path.",
    sceneryDescription: "tall grass off to the west, ",
    location: "Thicket",
    vocab: ["tall", "grass"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "GPThicketWaterhole",
    name: "waterhole",
    description:
      "It's off to the east. You should be able to reach it if you take the path.",
    sceneryDescription: "and borders a water hole to the east. ",
    location: "Thicket",
    vocab: ["water", "hole", "waterhole"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "GPThicketThicket",
    name: "thicket",
    description:
      "The brush is very entrenched. You'll never break through, but you should be able to finagle your way through.",
    sceneryDescription:
      "Twisted branches crowd together overhead and at knee level, making navigation trickier, and slower, but it might provide some protection against some animals.",
    location: "Thicket",
    vocab: ["thicket", "brush", "branches", "thorns"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "GPTallGrassGrass",
    name: "tall grass",
    description:
      "The surface of the water is still, but it's murky enough that it's tough to know if it's really empty.",
    sceneryDescription:
      "of shoulder-high grass that grows in dense yellow-green strands topped with large, drooping seed heads. ",
    location: "TallGrass",
    vocab: ["grass", "tall", "seed", "head"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "GPRidgeWaterhole",
    name: "ridge water view",
    description:
      "The surface of the water is still, but it's murky enough that it's tough to know if it's really empty.",
    sceneryDescription:
      "It looks down into a large water hole whose surface is still and reflects the cloudless sky above. ",
    location: "RockyRidge",
    vocab: ["water", "hole", "waterhole"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "GPRidgePath",
    name: "ridge path",
    description:
      "The path is steep enough that is isn't likely to be graceful, but you should be able to get down there though if you want to return you'll probably have to go the long way around.",
    sceneryDescription:
      "The footing is better than it looked at first, if you take your time, and from the edge you can see a steep, gravelly path that plunges toward the water below. You're sure you can make you're way down it, but not sure you won't end up in the water, and very sure you'll never get back up the same way.",
    location: "RockyRidge",
    vocab: ["path", "slope", "trail"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "GPTowerTopSavanna",
    name: "savanna view",
    description:
      "You can see an open savanna off to the west, dotted only by the occasional spiky shrub, or small, sparse tree. An occasional breeze ripples through the tawny grass.",
    sceneryDescription:
      "From here you can see a tawny-grassed savanna off to the west, ",
    location: "ObservationTowerTop",
    vocab: ["savanna", "tawny"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "GPTowerTopRidge",
    name: "ridge view",
    description:
      "The rocky ridge overlooks a large, open water hole, and you can make out a narrow path down a steep slope that stops at the water's edge.",
    sceneryDescription: "and a rocky ridge that juts out to the east. ",
    location: "ObservationTowerTop",
    vocab: ["rocky", "ridge"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "GPTowerTopTallGrass",
    name: "grass view",
    description:
      "The tall grass looks like it stands at least as tall as you, and covers a wide area. It's impossible to tell if there's anything in there.",
    sceneryDescription:
      "Past the savanna to the south is a field of tall grass that moves eastward ",
    location: "ObservationTowerTop",
    vocab: ["tall", "grass"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "GPTowerTopThicket",
    name: "thicket view",
    description:
      "The thicket looks pretty dense. You think you could navigate it, but certain animals might have trouble getting through it.",
    sceneryDescription: "before merging with a huge patch of brush thicket, ",
    location: "ObservationTowerTop",
    vocab: ["dense", "thicket"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
  {
    id: "GPTowerTopWaterhole",
    name: "waterhole view",
    description:
      "The water looks deep enough to submerge in, and could help avoid animals that can't swim, assuming you can.",
    sceneryDescription:
      "and east of that is a large open water hole that sits beneath the ridge, ",
    location: "ObservationTowerTop",
    vocab: ["water", "hole", "waterhole", "water hole"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 5,
    },
  },
  {
    id: "GPTowerTopMudflats",
    name: "mudflats view",
    description:
      "The water hole meets a mud flat at the southern edge, with what looks like deep, clay-like mud that might help cover your scent in a pinch.",
    sceneryDescription: "turning to mud flats south of that. ",
    location: "ObservationTowerTop",
    vocab: ["mud", "flats", "flat"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 6,
    },
  },
  {
    id: "GPTowerTopWall",
    name: "wall view",
    description:
      "The wall must have been part of a larger structure at some point. You can see that it partially covers an old drainage pipe.",
    sceneryDescription:
      "Far to the southwest you can see the remains of a stone wall that has been mostly removed, leaving behind a single, crumbling section,",
    location: "ObservationTowerTop",
    vocab: ["wall", "stone", "crumbling", "drainage", "pipe"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 7,
    },
  },
  {
    id: "GPTowerTopOak",
    name: "oak view",
    description:
      "It looks like it's been dead for a while, with patches of bark missing and a deep, decaying knot in the big trunk.",
    sceneryDescription:
      "and off to the southeast, past the mudflats, is a large, dead oak tree that leans at a steep angle. ",
    location: "ObservationTowerTop",
    vocab: ["tree", "oak", "dead"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 8,
    },
  },
  {
    id: "GPTowerTopPen",
    name: "pen view",
    description:
      "The pen looks like it could hold some pretty large animals, though it's empty now. You can make out some kind of machine or dispenser standing next to it.",
    sceneryDescription:
      "In the middle of it all is what looks to be an old, empty animal pen of concrete, with iron bars.",
    location: "ObservationTowerTop",
    vocab: ["pen", "empty", "animal"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 9,
    },
  },
  {
    id: "GPTowerTower",
    name: "tower",
    description:
      "The tower looks weathered but sturdy, though under a closer look the 'weathering' appears to be cosmetic.",
    sceneryDescription:
      "a weathered observation tower rises up above the preserve on iron stilts and cross-bracing. ",
    location: "ObservationTower",
    vocab: ["observation", "tower", "stilts", "iron", "cross-bracing"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "ObservationTowerLadder",
    name: "tower ladder",
    description:
      "A narrow steel ladder rises through the observation tower's upper hatch.",
    sceneryDescription:
      "A wooden ladder is bolted to the tower frame that leads high up to ",
    location: "ObservationTower",
    vocab: ["tower", "ladder", "hatch", "rungs"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      kind: "game-preserve-climb-ladder",
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "GPTowerWatchtop",
    name: "watch top",
    description:
      "You can see the open entrance from here but the angle is too steep to see what's inside.",
    sceneryDescription:
      "an enclosed watch top with a ridged roof. You can't see into the enclosure from down here, but it looks like it should offer a view of the entire preserve.",
    location: "ObservationTower",
    vocab: ["watch", "top", "enclosure"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "GPSavannaSavanna",
    name: "savanna",
    description:
      "The grass is tawny in color and crunches slightly under your feet.",
    sceneryDescription:
      "Occasional wind moves through the savanna in long rippling bands, leaving very little cover if something spots you out here. A path leading south eventually enters a field of tall grass, while the preserve entrance is to the northeast, ",
    location: "OpenSavanna",
    vocab: ["savanna", "grass"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "GPSavannaTower",
    name: "savanna tower",
    description: "You can see the base of the ladder off to the east.",
    sceneryDescription:
      "and the base of the observation tower off to the east.",
    location: "OpenSavanna",
    vocab: ["tower", "observation", "ladder"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
  {
    id: "GPSavannaShrubs",
    name: "savanna shrubs",
    description:
      "The shrubs look drought resistant, standing alone in wide swaths of grass.",
    sceneryDescription: "odd spiky shrub, ",
    location: "OpenSavanna",
    vocab: ["spiky", "shrubs", "shrub"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "GPSavannaTrees",
    name: "savanna trees",
    description:
      "The trees aren't very large, and are mostly trunk and branches, with fans of leaves only at the top.",
    sceneryDescription:
      "as well as three small, sparse trees placed apart from each other. ",
    location: "OpenSavanna",
    vocab: ["tree", "trees"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "GPEntraceSavanna",
    name: "savanna",
    description:
      "Off to the southeast you can see an open savanna, with low grass and the occasional spiky shrub.",
    sceneryDescription: " where the land falls away into managed savanna, ",
    location: "GamePreserveEntrance",
    vocab: ["savanna", "grasslands"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "GPEntraceTallGrass",
    name: "thicket",
    description:
      "Off to the southwest is a huge patch of tall grass that waves in the occasional breeze.",
    sceneryDescription:
      " and rougher terrain beyond. From here the view is partially blocked by tall grass",
    location: "GamePreserveEntrance",
    vocab: ["tall", "grass"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "GPEntraceThicket",
    name: "thicket",
    description:
      "Off to the south you can see a sprawling patch of dense thicket.",
    sceneryDescription: "and dense thicket off to the south",
    location: "GamePreserveEntrance",
    vocab: ["dense", "thicket"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "GPEntraceTower",
    name: "thicket",
    description:
      "The tower is pretty high, with a wooden ladder leading up to it.",
    sceneryDescription:
      "but you can see a tall observation tower reaching up to the south as well that might offer a better look.",
    location: "GamePreserveEntrance",
    vocab: ["observation", "tower"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 120,
    itemSize: 8,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
  {
    id: "RuinedWallSpan",
    name: "cracked wall span",
    description:
      "The wall's central span is fractured through and barely holding together.",
    sceneryDescription:
      "The cracked masonry is one clean impact away from folding outward into the drainage cut below. For now it still stands, but only just.",
    location: "RuinedWall",
    vocab: ["wall", "span", "cracked", "masonry", "barrier"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 900,
    itemSize: 9,
    meta: {
      kind: "game-preserve-ruined-wall",
    },
  },
  {
    id: "FeedDispenser",
    name: "feed dispenser",
    description:
      "A battered feed dispenser is bolted to the pen wall, with a shallow retrieval tray at the bottom.",
    sceneryDescription:
      "The dispenser still has power. Its casing is dented and scratched, but the tray and release slot look functional enough to spit out rationed treats.",
    location: "UnusedPen",
    vocab: ["feed", "dispenser", "tray", "slot"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 60,
    itemSize: 5,
    isUseable: true,
    meta: {
      kind: "game-preserve-feed-dispenser",
    },
    overrides: {
      use: dispensePreserveFeed,
    },
  },
  {
    id: "GameWhistle",
    name: "game whistle",
    description: GAME_WHISTLE_DESCRIPTION,
    describe: describeGameWhistle,
    location: "GamePreserveEntrance",
    vocab: ["game", "preserve", "whistle", "call"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isSettable: true,
    meta: {
      kind: "game-whistle",
      calls: {
        boar: "Snort! Skreee!",
        badger: "Screech! Screeeeeech!",
        bull: "Mooooo! Hrrrrooooo!",
        bear: "Roooar! Rooooooar!",
        barry: "Yo, Barry! Baaaaarry!",
      } satisfies Record<PreserveActorId, string>,
    },
    overrides: {
      blow: blowGameWhistle,
      set: setGameWhistle,
    },
  },
  {
    id: "BoarTusk",
    name: "boar tusk",
    description:
      "A curved boar tusk, broken off near the root and still sharp enough to make poor decisions with.",
    location: "GamePreserveStaging",
    vocab: ["boar", "tusk", "boar tusk", "trophy"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    meta: {
      kind: "game-preserve-trophy",
      animalId: "boar",
    },
  },
  {
    id: "BadgerClaw",
    name: "badger claw",
    description:
      "A thick badger claw with a dirty black curve and enough edge left to worry you.",
    location: "GamePreserveStaging",
    vocab: ["badger", "claw", "badger claw", "trophy"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    meta: {
      kind: "game-preserve-trophy",
      animalId: "badger",
    },
  },
  {
    id: "BrokenHorn",
    name: "broken bull horn",
    description:
      "A heavy black horn snapped raggedly away from its base. Its broken end is chalky with pale bone.",
    location: "GamePreserveStaging",
    vocab: ["broken", "horn", "bull", "bull horn", "broken horn", "trophy"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 3,
    itemSize: 2,
    meta: {
      kind: "game-preserve-trophy",
      animalId: "bull",
    },
  },
  {
    id: "BearViscera",
    name: "chunk of bear viscera",
    description:
      "A wet, unpleasant chunk of printed bear viscera. It is absolutely biological enough for a machine to be impressed.",
    location: "GamePreserveStaging",
    vocab: ["bear", "viscera", "chunk", "guts", "bear viscera", "trophy"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 1,
    meta: {
      kind: "game-preserve-trophy",
      animalId: "bear",
    },
  },
  {
    id: "BarryHair",
    name: "lock of Barry's hair",
    description:
      "A small lock of dark wavy hair. It is technically a trophy, which is a sentence nobody should enjoy.",
    location: "GamePreserveStaging",
    vocab: ["barry", "hair", "lock", "lock of hair", "barry hair", "trophy"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    meta: {
      kind: "game-preserve-trophy",
      animalId: "barry",
    },
  },
  {
    id: "GamePrize",
    name: "test prize",
    description:
      "A placeholder game preserve prize, stamped TEST REWARD in practical block letters.",
    initialDescription:
      "A small test prize rests nearby, freshly delivered by the preserve's reward system.",
    location: "GamePreserveStaging",
    vocab: ["game", "prize", "test", "reward", "test prize"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    meta: {
      kind: "game-preserve-prize",
    },
  },
  {
    id: "GamePreserveTrophyDais",
    name: "circular stone ceremonial dais",
    description:
      'A circular stone ceremonial dais sits in the center of the trophy room, its top polished smooth by years of staged triumph. An engraving around the rim reads: "PLACE YOUR TROPHY UPON THE DIAS - ELSE TOUCH IT WITH YOUR EMPTY HAND".',
    sceneryDescription:
      'A circular stone ceremonial dais waits in the center of the room, broad and flat enough to receive a trophy. An engraving around its rim reads: "PLACE YOUR TROPHY UPON THE DIAS - ELSE TOUCH IT WITH YOUR EMPTY HAND".',
    location: "TrophyRoom",
    vocab: [
      "circular",
      "stone",
      "ceremonial",
      "dais",
      "dias",
      "engraving",
      "platform",
      "pedestal",
      "altar",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1000,
    itemSize: 8,
    isSurface: true,
    meta: {
      kind: "game-preserve-trophy-dais",
    },
    overrides: {
      touch: touchGamePreserveTrophyDais,
    },
  },
  {
    id: "ProcessedAnimalTreatOne",
    name: "processed animal treat",
    description:
      "A dense, oily processed treat pellet designed to keep a printed predator interested.",
    location: "GamePreserveStaging",
    vocab: ["processed", "animal", "treat", "pellet", "food"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    meta: {
      kind: "game-preserve-treat",
    },
  },
  {
    id: "ProcessedAnimalTreatTwo",
    name: "processed animal treat",
    description:
      "A dense, oily processed treat pellet designed to keep a printed predator interested.",
    location: "GamePreserveStaging",
    vocab: ["processed", "animal", "treat", "pellet", "food"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    meta: {
      kind: "game-preserve-treat",
    },
  },
  {
    id: "ProcessedAnimalTreatThree",
    name: "processed animal treat",
    description:
      "A dense, oily processed treat pellet designed to keep a printed predator interested.",
    location: "GamePreserveStaging",
    vocab: ["processed", "animal", "treat", "pellet", "food"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    meta: {
      kind: "game-preserve-treat",
    },
  },
  {
    id: "DeadOakTree",
    name: "dead oak",
    description:
      "The dead oak is massive, bleached, and visibly rotten through the upper trunk.",
    sceneryDescription:
      "Even from the ground you can see the tree's weakness where the trunk has gone soft and split. The lower limbs are still sturdy enough to climb, but the whole thing looks temporary.",
    location: "DeadOak",
    vocab: ["dead", "oak", "tree", "trunk", "limbs", "branches"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 1000,
    itemSize: 9,
    meta: {
      kind: "game-preserve-dead-oak",
    },
  },
];
