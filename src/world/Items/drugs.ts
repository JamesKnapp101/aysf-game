import { removeFromAllBuckets } from "@game/rules/state";
import { isSerumCartridge } from "@game/selectors/containerSelectors";
import type { GameState } from "../../game/types/gameTypes";
import type { Item } from "../../game/types/itemTypes";

function loadSyringeCartridge({
  insertedItem,
  state,
}: {
  insertedItem: Item;
  state: GameState;
}) {
  if (!isSerumCartridge(insertedItem)) {
    return "The syringe clamp is designed for standardized drug cartridges, not that.";
  }

  if (state.itemState.syringe.loadedCartridgeId) {
    return "The syringe is already loaded.";
  }

  return {
    state: {
      ...state,
      player: {
        ...state.player,
        inventory: removeFromAllBuckets(state.player.inventory, insertedItem.id),
      },
      itemState: {
        ...state.itemState,
        syringe: {
          ...state.itemState.syringe,
          loadedCartridgeId: insertedItem.id,
        },
      },
    },
  };
}

export const drugItems: Item[] = [
  {
    id: "Syringe",
    name: "a medical syringe",
    description:
      "A heavy hypodermic syringe with a spring-clamp assembly for holding drug cartridges.",
    initialDescription:
      "Lying amidst the clutter is a large hypodermic syringe.",
    location: "none",
    vocab: ["syringe", "hypodermic", "needle"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: true,
    isOpenable: false,
    capacity: 1,

    allowedContentsIds: [
      "GroovyCart",
      "RadBGoneCart",
      "DeathCart",
      "NANOCart",
      "InocCart",
      "SleepyCart",
      "PainKillerCart",
    ],
    overrides: {
      insert: loadSyringeCartridge,
    },
  },
  {
    id: "GroovyCart",
    name: "green serum cartridge",
    description:
      "A translucent cartridge filled with green serum, labeled ‘TRIXOPHINE’.",
    location: "DRUGTIN",
    vocab: ["green", "serum", "cartridge", "trixophine"],
    itemClass: "liquid",
    itemCategory: "fluid",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isSyringeCartridge: true,
    injectionEffectId: "trixophine",
    doses: 3,
  },
  {
    id: "RadBGoneCart",
    name: "red serum cartridge",
    description:
      "A translucent cartridge filled with red serum, labeled ‘SERITROXIN’.",
    location: "LevelThreeSecretRoom",
    vocab: ["red", "serum", "cartridge", "seritroxin"],
    itemClass: "liquid",
    itemCategory: "fluid",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isSyringeCartridge: true,
    injectionRemoveEffectId: "radiation",
    doses: 1,
    scoreId: "obtained_radiation_cure",
  },
  {
    id: "DeathCart",
    name: "white serum cartridge",
    description:
      "A translucent cartridge filled with white serum, labeled ‘PENTATROSIN’.",
    initialDescription:
      "A cylindrical cartridge filled with white serum sits on one of the beds.",
    location: "UNKNOWN", // TODO: set correct room id
    vocab: ["white", "serum", "cartridge", "pentatrosin"],
    itemClass: "liquid",
    itemCategory: "fluid",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isSyringeCartridge: true,
    doses: 5,
  },
  {
    id: "NANOCart",
    name: "silver serum cartridge",
    description: "A translucent cartridge filled with silver serum, unlabeled.",
    initialDescription: "A cylindrical cartridge lies on one of the tables.",
    location: "RemoteMedicalTwo",
    vocab: ["silver", "serum", "cartridge"],
    itemClass: "liquid",
    itemCategory: "fluid",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isSyringeCartridge: true,
    doses: 1,
  },
  {
    id: "InocCart",
    name: "clear serum cartridge",
    description:
      "A translucent cartridge filled with clear serum, labeled ‘EXPERIMENTAL’.",
    initialDescription: "A cylindrical cartridge sits on one of the tables.",
    location: "UNKNOWN", // TODO
    vocab: ["clear", "serum", "cartridge", "experimental"],
    itemClass: "liquid",
    itemCategory: "fluid",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isSyringeCartridge: true,
    doses: 1,
    scoreId: "obtained_innoculant",
  },
  {
    id: "SleepyCart",
    name: "yellow serum cartridge",
    description:
      "A translucent cartridge filled with yellow serum, labeled ‘XANTOPHOL’.",
    initialDescription: "A small yellow-serum cartridge rests on a shelf.",
    location: "Lab",
    vocab: ["yellow", "serum", "cartridge", "xantophol"],
    itemClass: "liquid",
    itemCategory: "fluid",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isSyringeCartridge: true,
    doses: 3,
  },
  {
    id: "PainKillerCart",
    name: "amber serum cartridge",
    description:
      "A translucent cartridge filled with amber serum, labeled ‘VANITRAX’.",
    initialDescription: "A small amber-serum cartridge rests on a shelf.",
    location: "PatientCareTwo",
    vocab: ["amber", "serum", "cartridge", "vanitrax"],
    itemClass: "liquid",
    itemCategory: "fluid",
    itemWeight: 1,
    itemSize: 1,
    isWearable: false,
    isReadable: false,
    isContainer: false,
    isSyringeCartridge: true,
    doses: 5,
  },
];
