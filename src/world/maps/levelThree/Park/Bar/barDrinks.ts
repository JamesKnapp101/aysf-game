import { setItemDoses, updateItemLocation } from "@game/rules/items";
import { addToInventory, inventoryHas } from "@game/rules/state";
import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";

export const BAR_DRINK_EXIT_BLOCK_MESSAGE = `"Sorry, but you can't take drinks out of the bar, Mayor's orders!"`;
export const BAR_DRINK_LIMIT_MESSAGE = `"Sorry, only one drink per customer at a time!"`;
export const BAR_MODERN_DRINK_MESSAGE = `"Sorry, but the only recipe that survived from that era was the gin fizz"`;

export type BarDrinkMenuEntry = {
  aliases: string[];
  id: string;
  menuName: string;
  number: number;
};

const BAR_INTERIOR_ROOM_IDS = [
  "Bar",
  "BarLounge",
  "BarBathroom",
  "BarBasement",
] as const;

export const BAR_DRINK_EMPTY_CLEANUP = {
  location: "seeded",
  message: "The bartender whisks the empty glass away.",
  removeFromInventory: true,
  rooms: BAR_INTERIOR_ROOM_IDS,
};

export const barDrinkItems: Item[] = [
  {
    id: "BarWhiskeySweet",
    name: "Whiskey Sweet",
    description:
      "A small amber cocktail with a candied peel twisted over the rim.",
    location: "seeded",
    vocab: ["whiskey", "sweet", "whiskey sweet", "drink", "cocktail"],
    itemClass: "liquid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    doses: 1,
    overrides: {
      smell: `It smells kind of floral, with a whiff of citrus.`,
    },
    meta: {
      barDrink: true,
      consumable: {
        emptyCleanup: BAR_DRINK_EMPTY_CLEANUP,
        kind: "drink",
        perDose: [
          {
            type: "message",
            text: "You drink the Whiskey Sweet. It goes down warm with the flavor of honey and orange.",
          },
          { type: "status", id: "drunk", intensity: 12, duration: 18 },
        ],
        onEmpty: [{ type: "message", text: "That drink is finished." }],
      },
    },
  },
  {
    id: "BarDurianColada",
    name: "Durian Colada",
    description: "A pale tropical drink with a nose-wrinkling smell.",
    location: "seeded",
    vocab: ["durian", "colada", "durian colada", "drink", "cocktail"],
    itemClass: "liquid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    doses: 1,
    overrides: {
      smell: `You give the drink a sniff and the smell immediately triggers your gag reflex and a loud 'hork' sound. Ugh, it smells like an onion rotting inside of a used diaper!`,
    },
    meta: {
      barDrink: true,
      consumable: {
        emptyCleanup: BAR_DRINK_EMPTY_CLEANUP,
        kind: "drink",
        perDose: [
          {
            type: "message",
            text: "You plug your nose and drink the Durian Colada. The flavor isn't bad, creamy and tropical, and it's got a kick, too!",
          },
          { type: "status", id: "drunk", intensity: 18, duration: 22 },
        ],
        onEmpty: [{ type: "message", text: "That drink is finished." }],
      },
    },
  },
  {
    id: "BarBangaloreSling",
    name: "Bangalore Sling",
    description: "A deep ruby cocktail in a tall glass.",
    location: "seeded",
    vocab: ["bangalore", "sling", "bangalore sling", "drink", "cocktail"],
    itemClass: "liquid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    doses: 1,
    overrides: {
      smell: `It has a perfume smell, filled with galangal, ginger, and mint.`,
    },
    meta: {
      barDrink: true,
      consumable: {
        emptyCleanup: BAR_DRINK_EMPTY_CLEANUP,
        kind: "drink",
        perDose: [
          {
            type: "message",
            text: "You drink the Bangalore Sling. It is tart, and spicy, and quite strong!",
          },
          { type: "status", id: "drunk", intensity: 24, duration: 24 },
        ],
        onEmpty: [{ type: "message", text: "That drink is finished." }],
      },
    },
  },
  {
    id: "BarFischermeisterShot",
    name: "Fischermeister Shot",
    description:
      "A shot glass filled with a dark, syrupy liquid that smells of juniper, rosemary, and fermented fish.",
    location: "seeded",
    vocab: [
      "fischermeister",
      "fischermeister shot",
      "fischermeister bomb",
      "bomb",
      "drink",
      "shot",
    ],
    itemClass: "liquid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    doses: 1,
    overrides: {
      smell: `The combination of strong smells is weirdly intoxicating.`,
    },
    meta: {
      barDrink: true,
      consumable: {
        emptyCleanup: BAR_DRINK_EMPTY_CLEANUP,
        kind: "drink",
        perDose: [
          {
            type: "message",
            text: "You drink the Fischermeister shot in one gulp. The taste and the smell that flood your nose are strongly medicinal, with deeply fishy undercurrent, and a kick like a mule!",
          },
          { type: "status", id: "drunk", intensity: 34, duration: 28 },
        ],
        onEmpty: [{ type: "message", text: "That drink is finished." }],
      },
    },
  },
  {
    id: "BarHandStuffOnTheBeach",
    name: "Hand-stuff on the Beach",
    description:
      "A layered peach-orange cocktail floated with a layer of rumchata.",
    location: "seeded",
    vocab: [
      "hand-stuff",
      "hand stuff",
      "beach",
      "hand-stuff on the beach",
      "hand stuff on the beach",
      "drink",
      "cocktail",
    ],
    itemClass: "liquid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    doses: 1,
    overrides: {
      smell: `You're picking up vanilla and cinnamon.`,
    },
    meta: {
      barDrink: true,
      consumable: {
        emptyCleanup: BAR_DRINK_EMPTY_CLEANUP,
        kind: "drink",
        perDose: [
          {
            type: "message",
            text: "You drink the Hand-stuff on the Beach. It's fruity in the extreme, and super sweet.",
          },
          { type: "status", id: "drunk", intensity: 28, duration: 26 },
        ],
        onEmpty: [{ type: "message", text: "That drink is finished." }],
      },
    },
  },
  {
    id: "BarGinFizz",
    name: "Gin Fizz",
    description:
      "A cloudy, sparkling gin drink with a foamy cap and a clean citrus snap.",
    location: "seeded",
    vocab: ["gin", "fizz", "gin fizz", "drink", "cocktail"],
    itemClass: "liquid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    doses: 1,
    overrides: {
      smell: `It smells of citrus.`,
    },
    meta: {
      barDrink: true,
      consumable: {
        emptyCleanup: BAR_DRINK_EMPTY_CLEANUP,
        kind: "drink",
        perDose: [
          {
            type: "message",
            text: "You drink the Gin Fizz. It is bright, bubbly, and probably pretty good if you like gin, but you don't seem to.",
          },
          { type: "status", id: "drunk", intensity: 15, duration: 20 },
        ],
        onEmpty: [{ type: "message", text: "That drink is finished." }],
      },
    },
  },
];

export const BAR_DRINK_MENU_ENTRIES: BarDrinkMenuEntry[] = [
  {
    aliases: ["whiskey sweet", "whiskey", "sweet"],
    id: "BarWhiskeySweet",
    menuName: "Whiskey Sweet",
    number: 1,
  },
  {
    aliases: ["durian colada", "durian", "colada"],
    id: "BarDurianColada",
    menuName: "Durian Colada",
    number: 2,
  },
  {
    aliases: ["bangalore sling", "bangalore", "sling"],
    id: "BarBangaloreSling",
    menuName: "Bangalore Sling",
    number: 3,
  },
  {
    aliases: ["fischermeister shot", "fischermeister", "bomb", "shot"],
    id: "BarFischermeisterShot",
    menuName: "Fischermeister shot",
    number: 4,
  },
  {
    aliases: [
      "hand-stuff on the beach",
      "hand stuff on the beach",
      "hand-stuff",
      "hand stuff",
      "beach",
    ],
    id: "BarHandStuffOnTheBeach",
    menuName: "Hand-stuff on the Beach",
    number: 5,
  },
  {
    aliases: ["gin fizz", "gin", "fizz"],
    id: "BarGinFizz",
    menuName: "Gin Fizz",
    number: 6,
  },
];

export const BAR_DRINK_MENU_TEXT = BAR_DRINK_MENU_ENTRIES.map(
  (entry) => `#${entry.number} ${entry.menuName}`,
).join("\n");

const MODERN_DRINK_NAMES = [
  "amaretto sour",
  "aperol spritz",
  "beer",
  "black russian",
  "bloody mary",
  "champagne",
  "cosmo",
  "cosmopolitan",
  "daiquiri",
  "dark and stormy",
  "espresso martini",
  "fuzzy navel",
  "gimlet",
  "gin and tonic",
  "g&t",
  "hot toddy",
  "irish coffee",
  "long island",
  "long island iced tea",
  "mai tai",
  "manhattan",
  "margarita",
  "martini",
  "mint julep",
  "mojito",
  "moscow mule",
  "negroni",
  "old fashioned",
  "paloma",
  "pina colada",
  "rum and coke",
  "sazerac",
  "screwdriver",
  "sex on the beach",
  "sidecar",
  "tequila sunrise",
  "tom collins",
  "vodka",
  "vodka tonic",
  "whiskey sour",
  "white russian",
  "wine",
];

function normalizeDrinkRequest(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => {
      const ignoredWords = [
        "a",
        "an",
        "the",
        "please",
        "drink",
        "cocktail",
        "number",
        "no",
      ];
      return !ignoredWords.includes(token);
    })
    .join(" ");
}

function resolveBarDrinkMenuEntry(
  request: string,
): BarDrinkMenuEntry | undefined {
  const normalizedRequest = normalizeDrinkRequest(request);
  if (!normalizedRequest) return undefined;

  const numberMatch = BAR_DRINK_MENU_ENTRIES.find(
    (entry) => String(entry.number) === normalizedRequest,
  );
  if (numberMatch) return numberMatch;

  return BAR_DRINK_MENU_ENTRIES.find((entry) =>
    [entry.menuName, ...entry.aliases].some(
      (alias) => normalizeDrinkRequest(alias) === normalizedRequest,
    ),
  );
}

function isModernDrinkRequest(request: string): boolean {
  const normalizedRequest = normalizeDrinkRequest(request);
  if (!normalizedRequest || resolveBarDrinkMenuEntry(request)) return false;

  return MODERN_DRINK_NAMES.some((drinkName) => {
    const normalizedDrink = normalizeDrinkRequest(drinkName);
    return (
      normalizedRequest === normalizedDrink ||
      normalizedRequest.includes(normalizedDrink)
    );
  });
}

export function isBarInteriorRoom(roomId: string): boolean {
  return BAR_INTERIOR_ROOM_IDS.includes(
    roomId as (typeof BAR_INTERIOR_ROOM_IDS)[number],
  );
}

export function playerHasBarDrink(state: GameState): boolean {
  return BAR_DRINK_MENU_ENTRIES.some((entry) =>
    inventoryHas(state.player.inventory, entry.id),
  );
}

export function shouldBlockLeavingBarWithDrink(
  state: GameState,
  destinationRoomId: string,
): boolean {
  return (
    isBarInteriorRoom(state.player.roomId) &&
    !isBarInteriorRoom(destinationRoomId) &&
    playerHasBarDrink(state)
  );
}

export function orderBarDrink(
  state: GameState,
  request: string,
): { state: GameState; message: string } {
  if (state.player.roomId !== "Bar") {
    return { state, message: "The bartender isn't here." };
  }

  if (playerHasBarDrink(state)) {
    return { state, message: BAR_DRINK_LIMIT_MESSAGE };
  }

  const entry = resolveBarDrinkMenuEntry(request);
  if (!entry) {
    return {
      state,
      message: isModernDrinkRequest(request)
        ? BAR_MODERN_DRINK_MESSAGE
        : `"Sorry, I don't see that one on the menu."`,
    };
  }

  let next = updateItemLocation(state, entry.id, "INVENTORY");
  next = setItemDoses(next, entry.id, 1);
  next = addToInventory(next, entry.id);

  return {
    state: next,
    message: `The bartender makes a ${entry.menuName} with crisp mechanical precision, then serves it to you.`,
  };
}
