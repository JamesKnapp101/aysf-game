import { updateItemLocation } from "@game/rules/items";
import { addToInventory, removeFromAllBuckets } from "@game/rules/state";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import type { ParsedCommand } from "@game/types/parserTypes";
import { BAR_MEMORY_BOX_ID, MANI_PEDI_VOUCHER_ID } from "./barBartenderRewards";
import { BAR_CONTRABAND_ID, FAKE_ID_ID } from "./barConstants";
import { barDrinkItems } from "./barDrinks";
import { applyAdhesiveToBull, FREE_DRINK_TICKET_ID } from "./barMechanicalBull";
import { BAR_SNAP_OUT_CHEWABLE_ID, consumeSnapOutChewable } from "./barSnapOut";

function openBarContrabandPackage(state: GameState): {
  state: GameState;
  message: string;
} {
  let next: GameState = {
    ...state,
    player: {
      ...state.player,
      inventory: removeFromAllBuckets(
        state.player.inventory,
        BAR_CONTRABAND_ID,
      ),
    },
  };

  next = updateItemLocation(next, BAR_CONTRABAND_ID, "NOWHERE");
  next = updateItemLocation(next, FAKE_ID_ID, "INVENTORY");
  next = addToInventory(next, FAKE_ID_ID);

  return {
    state: next,
    message: "You unwrap the package, and discard the paper",
  };
}

export const barSeededItems: Item[] = [
  {
    id: BAR_CONTRABAND_ID,
    name: "small wrapped package",
    description:
      "It's a small package of some sort, no bigger than a deck of cards, wrapped tightly in paper. Written on the paper in ink is the name 'Volonope'.",
    location: "seeded",
    vocab: ["package", "packet", "paper"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1000,
    itemSize: 20,
    isOpenable: true,
    overrides: {
      open: ({ state }: { state: GameState }) =>
        openBarContrabandPackage(state),
    },
  },
  {
    id: FAKE_ID_ID,
    name: "fake ID",
    description:
      "It's a fake ID, a good fake, but still a fake. The information on it is for Volonope Fick. It has her current living quarters on level two, Rotation K",
    location: "seeded",
    vocab: ["fake", "id", "Volonope id"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1000,
    itemSize: 20,
  },
  {
    id: "AllPurposeAdhesive",
    name: "tube of 'Crazy Goo'",
    description: "The tube is labeled 'Crazy Goo'",
    initialDescription: "A small tube of adhesive sits on the shelf.",
    location: "seeded",
    vocab: ["adhesive", "glue", "tube", "crazy", "goo", "crazy goo"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isUseable: true,
    overrides: {
      use: ({
        state,
        item,
        cmd,
      }: {
        state: GameState;
        item: Item;
        cmd?: ParsedCommand;
      }) => applyAdhesiveToBull(state, item, cmd),
    },
  },
  {
    id: MANI_PEDI_VOUCHER_ID,
    name: "nail salon voucher",
    description:
      "It says if you present it at Keratin Kindness you get a free mani-pedi, and the offer doesn't expire.",
    location: "seeded",
    vocab: ["voucher", "gift card"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
  },
  {
    id: FREE_DRINK_TICKET_ID,
    name: "free drink ticket",
    description:
      "It says if you present it at a bar called 'The Loosened Tongue' then you get a free drink, and the offer doesn't expire.",
    location: "seeded",
    vocab: ["free", "drink", "ticket"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
  },
  ...barDrinkItems,
  {
    id: "TShirtPrize",
    name: "prize t-shirt",
    description:
      "It's a good quality cotton t-shirt, cream colored, and sporting the words 'I Got So Drunk I Became Delirious and Hallucinated Being Thrown Into Six Different Drinks Before Getting Swallowed Alive And On The Last One I Even Got Thrown Up Again, And All I Got Was This Lousy, But Good Quality, T-Shirt That Appeared In My Inventory When I Woke Up Completely Sober'.",
    readableText:
      "I Got So Drunk I Became Delirious and Hallucinated Being Thrown Into Six Different Drinks\nBefore Getting Swallowed Alive And On The Last One I Even Got Thrown Up Again,\nAnd All I Got Was This Lousy, But Good Quality, T-Shirt That Appeared In My Inventory\nWhen I Woke Up Completely Sober",
    location: "seeded",
    vocab: ["t-shirt", "prize", "gift", "shirt"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isReadable: true,
    isWearable: true,
    clothingSlot: "torso",
  },
  {
    id: BAR_MEMORY_BOX_ID,
    name: "small metal box",
    description:
      "A small metal box with a snug lid. It is empty for now, but it feels like it was meant to matter.",
    location: "NOWHERE",
    vocab: ["box", "small box", "metal box", "small metal box", "memory box"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 2,
    itemSize: 2,
    isContainer: true,
    isOpenable: true,
    capacity: 10,
  },
  {
    id: BAR_SNAP_OUT_CHEWABLE_ID,
    name: "Snap out of It! chewable",
    description:
      "It's a small, brick-shaped chewable in a breezy white wrapper that promises to get you seeing clear again.",
    location: "NOWHERE",
    vocab: ["snap", "snap out of it", "chewable", "gummy", "tablet", "brick"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    doses: 0,
    meta: {
      consumable: {
        kind: "drug",
        onEmpty: [{ type: "message", text: "That's the last of it." }],
      },
    },
    overrides: {
      eat: ({ state, item }: { state: GameState; item: Item }) =>
        consumeSnapOutChewable(state, item),
    },
  },
];
