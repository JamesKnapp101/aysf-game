import { findOrganismRoute } from "../../rules/organismMovement";
import { readItem } from "../../actions/read/read";
import { SPA_ORGANISM_ID, SPA_ORGANISM_RANGE } from "../../../world/maps/levelThree/Park/spaOrganism";
import { registerGoalPredicate, ScenarioError, type Scenario } from "../scenario";

// Puzzle-specific acceptance stays local and reuses the organism's real route rules.
registerGoalPredicate("spa-contained", {
  validate: (_check, state) => {
    if (!state.world.items.some(item => item.id === SPA_ORGANISM_ID) ||
      !state.world.rooms.some(room => room.id === "SteamRoom")) throw new ScenarioError("Spa content is unavailable.");
  },
  test: (_check, state) => ![...SPA_ORGANISM_RANGE.roomIds].filter(room => room !== "SteamRoom")
    .some(room => findOrganismRoute(state, "SteamRoom", room, SPA_ORGANISM_RANGE, "move")),
  describe: () => "Spa organism has no escape route from SteamRoom under current door and lighting rules",
});
const safeEntry = [{ type: "player-room", roomId: "Sauna" }, { type: "alive" }];
// Public perimeter/central paths and venue entrances, plus the freezer's way out.
// ParkMaintenance is the outdoor depot approach; its interior is deliberately unknown.
export const SPA_EXPLORED_ROOMS = [
  "Kitchen", "Restaurant", "RestaurantEntrance", "ParkWest", "Spa",
  "ParkSouth", "ParkCenter", "ParkEast", "ParkNorth", "ParkMaintenance",
  "BarEntrance", "GymEntrance", "MovieEntrance",
] as const;
const spaTrap: Scenario = {
  id: "spa-trap", startRoom: "WalkIn", inventory: ["CarvingKnife", "Cooler"],
  exploredRooms: SPA_EXPLORED_ROOMS,
  objective: "Find a way to remove the danger from the Sauna, trap it in the SteamRoom, and enter the Sauna alive.",
  success: [...safeEntry, { type: "item-location", itemId: SPA_ORGANISM_ID, roomId: "SteamRoom" },
    { type: "door", doorId: "SteamRoomDoor", open: false }, { type: "spa-contained" }],
};
export const spaScenarios: readonly Scenario[] = [
  {
    id: "spa-entry", startRoom: "WalkIn", inventory: ["CarvingKnife", "Cooler"],
    exploredRooms: SPA_EXPLORED_ROOMS,
    objective: "Find a way to enter the Sauna alive. You may explore, collect items, and experiment as necessary, but focus on reaching the Sauna safely. Stop when you've achieved that objective.",
    success: safeEntry,
  },
  spaTrap,
  {
    ...spaTrap,
    id: "spa-trap-informed",
    prerequisites: [{
      description: "Previously logged the research whiteboard in Eegler's SecretLab",
      apply: state => {
        const whiteboard = state.world.items.find(item => item.id === "SecretLabWhiteboard");
        if (!whiteboard?.isReadable || !whiteboard.isLoggable)
          throw new ScenarioError("The research whiteboard must be available, readable and loggable.");
        return readItem(state, whiteboard).state;
      },
    }],
  },
];
