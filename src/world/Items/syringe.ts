// import { appendLog } from "../../game/engine";
// import { getItemById } from "../../game/selectors";
// import type { GameState, Item } from "../types";

// const DRUG_IDS = new Set<string>([
//   "GroovyCart",
//   "RadBGoneCart",
//   "DeathCart",
//   "NANOCart",
//   "InocCart",
//   "SleepyCart",
//   "PainKillerCart",
// ]);

// function isDrugCartridge(item: Item): boolean {
//   return DRUG_IDS.has(item.id);
// }

// function isCartridgeSpent(state: GameState, cartridgeId: string): boolean {
//   return !!state.spentCartridges[cartridgeId];
// }

// export function loadCartridgeIntoSyringe(
//   state: GameState,
//   cartridgeId: string
// ): GameState {
//   const item = getItemById(state, cartridgeId);
//   if (!item || !isDrugCartridge(item)) {
//     return appendLog(state, "You can't load that into the syringe.");
//   }

//   if (isCartridgeSpent(state, cartridgeId)) {
//     return appendLog(
//       state,
//       "That cartridge has already been used up. You can throw it away."
//     );
//   }

//   if (state.syringe.loadedCartridgeId) {
//     return appendLog(
//       state,
//       "There's already a cartridge loaded in the syringe."
//     );
//   }

//   // Must be in your inventory to load it
//   if (!state.inventory.includes(cartridgeId)) {
//     return appendLog(state, "You need to be holding the cartridge first.");
//   }

//   const next: GameState = {
//     ...state,
//     syringe: {
//       ...state.syringe,
//       loadedCartridgeId: cartridgeId,
//     },
//     // remove from inventory; it's now "inside" the syringe
//     inventory: state.inventory.filter((id) => id !== cartridgeId),
//   };

//   return appendLog(
//     next,
//     "You load the cartridge into the syringe, which clamps down on it with a soft hiss."
//   );
// }

// export function unloadCartridgeFromSyringe(state: GameState): GameState {
//   const loadedId = state.syringe.loadedCartridgeId;
//   if (!loadedId) {
//     return appendLog(state, "The syringe is empty.");
//   }

//   // Put it back in your inventory
//   const next: GameState = {
//     ...state,
//     syringe: { loadedCartridgeId: undefined },
//     inventory: state.inventory.includes(loadedId)
//       ? state.inventory
//       : [...state.inventory, loadedId],
//   };

//   return appendLog(
//     next,
//     "You release the cartridge from the syringe and take it back."
//   );
// }

// export function describeSyringe(state: GameState): string {
//   const loadedId = state.syringe.loadedCartridgeId;

//   if (!loadedId) {
//     return "The syringe is currently empty.";
//   }

//   const cart = getItemById(state, loadedId);
//   if (!cart) return "The syringe is currently loaded with something unknown.";

//   return `The syringe is loaded with ${cart.name}.`;
// }

// export function injectWithSyringe(
//   state: GameState,
//   targetId: string
// ): GameState {
//   // Must be holding the syringe
//   if (!state.inventory.includes("Syringe")) {
//     return appendLog(state, "You need to be holding the syringe to use it.");
//   }

//   const loadedId = state.syringe.loadedCartridgeId;
//   if (!loadedId) {
//     return appendLog(state, "The syringe is empty.");
//   }

//   if (isCartridgeSpent(state, loadedId)) {
//     return appendLog(
//       state,
//       "The loaded cartridge has been used up. You'll need a fresh one."
//     );
//   }

//   const cartridge = getItemById(state, loadedId);
//   if (!cartridge) {
//     return appendLog(state, "Something's wrong with the syringe's contents.");
//   }

//   // Apply puzzle-specific effect
//   let next = applyDrugEffect(state, cartridge, targetId);

//   // Mark cartridge as spent after use
//   next = {
//     ...next,
//     spentCartridges: {
//       ...next.spentCartridges,
//       [loadedId]: true,
//     },
//   };

//   return next;
// }

// function applyDrugEffect(
//   state: GameState,
//   cartridge: Item,
//   targetId: string
// ): GameState {
//   switch (cartridge.id) {
//     case "GroovyCart": {
//       // TRIXOPHINE
//       // TODO: implement whatever this is supposed to do.
//       return appendLog(
//         state,
//         "You inject the green serum. For now, nothing obvious happens. (Effect not implemented.)"
//       );
//     }

//     case "RadBGoneCart": {
//       // SERITROXIN
//       // TODO: maybe reduce radiation, unlock a puzzle, etc.
//       return appendLog(
//         state,
//         "You inject the red serum. For now, nothing obvious happens. (Effect not implemented.)"
//       );
//     }

//     case "DeathCart": {
//       // PENTATROSIN
//       // TODO: lethal effect / special puzzle logic.
//       return appendLog(
//         state,
//         "You inject the white serum. For now, nothing obvious happens. (Effect not implemented.)"
//       );
//     }

//     case "NANOCart": {
//       // TODO: nanotech effect
//       return appendLog(
//         state,
//         "You inject the silver serum. For now, nothing obvious happens. (Effect not implemented.)"
//       );
//     }

//     case "InocCart": {
//       // EXPERIMENTAL
//       return appendLog(
//         state,
//         "You inject the clear experimental serum. For now, nothing obvious happens. (Effect not implemented.)"
//       );
//     }

//     case "SleepyCart": {
//       // XANTOPHOL
//       return appendLog(
//         state,
//         "You inject the yellow serum. For now, nothing obvious happens. (Effect not implemented.)"
//       );
//     }

//     case "PainKillerCart": {
//       // VANITRAX
//       return appendLog(
//         state,
//         "You inject the amber serum. For now, nothing obvious happens. (Effect not implemented.)"
//       );
//     }

//     default:
//       return appendLog(
//         state,
//         "You inject the syringe's contents, but nothing seems to happen."
//       );
//   }
// }
// export const syringe: Item[] = [
//   {
//     id: "Syringe",
//     name: "syringe",
//     description:
//       "A heavy hypodermic syringe with a clamp for holding drug cartridges.",
//     initialDescription: "Lying amongst the mess is a large syringe.",
//     location: "MedicalStorage",
//     vocab: ["syringe", "hypodermic", "needle"],
//     itemClass: "solid",
//     itemCategory: "collectable",
//     itemWeight: 1,
//     itemSize: 1,
//     isWearable: false,
//     isReadable: false,
//     isContainer: true,
//   },
// ];
