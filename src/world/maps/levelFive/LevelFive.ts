import { engineeringOrganismItems } from "src/world/Items/creatures/engineeringOrganisms";
import type { WorldChunk } from "../../../game/types/gameTypes";
import { levelFiveDoors } from "../../doors/levelFiveDoors";
import { levelFiveItems } from "../../Items/levelFiveMisc";
import { resolveLevelFiveSpillLight } from "./levelFiveLighting";
import { reactorAdditionItems } from "./reactorItems";
import {
  describeTiltedPlatformPerch,
  describeTiltingPlatform,
  PLATFORM_PERCH_ROOM_ID,
  reactorPlatformItems,
} from "./reactorPlatform";
import {
  getReactorCoreTemperatureF,
  VIRTUAL_MANAGER_OFFICE_ROOM_ID,
  VIRTUAL_OFFICE_ROOM_ID,
} from "./reactorSystems";
import { waterTreatmentRooms } from "./WaterTreatment";

export const LEVEL_FIVE: WorldChunk = {
  items: [
    ...levelFiveItems,
    ...engineeringOrganismItems,
    ...reactorPlatformItems,
    ...reactorAdditionItems,
  ],
  doors: [...levelFiveDoors],
  teleportPads: [],
  rooms: [
    {
      id: "ReactorCore",
      name: "Reactor Core",
      description:
        "The Reactor Core is a dense chamber of heat-shielded machinery wrapped around a column of violent white energy. A reactor terminal and industrial key receptacle stand beside the little elevator, while wired virtual-reality goggles hang from the wall.",
      describe: (state) =>
        `The Reactor Core is a dense chamber of heat-shielded machinery wrapped around a column of violent white energy. The room is ${getReactorCoreTemperatureF(state)} degrees Fahrenheit, and even the metal seems to radiate heat. A reactor terminal and industrial key receptacle stand beside the little elevator, while wired virtual-reality goggles hang from the wall.`,
      meta: { excludeFromTransmitterMap: true },
      exits: [{ direction: "up", toRoomId: "ReactorControlRoom" }],
    },
    {
      id: "ReactorControlRoom",
      name: "Reactor Control Room",
      description:
        "The control room is a warm 82 degrees Fahrenheit. Banks of monitors curve around a twenty-five-unit Reactor Lobe array, the giant Reactor Lobe Consensus board is visible beyond the control glass, and a little elevator waits to descend into the core.",
      meta: { excludeFromTransmitterMap: true },
      exits: [
        { direction: "down", toRoomId: "ReactorCore" },
        { direction: "east", toRoomId: "HeatCoolantExchangePlatform" },
      ],
    },
    {
      id: "HeatCoolantExchangePlatform",
      name: "Heat/Coolant Exchange Platform",
      description:
        "Thick insulated pipes crowd the walls around this lower platform, knocking and ticking as coolant and reactor heat fight through separate conduits. A red-and-blue coolant control panel is mounted among them. The reactor control room lies west, a maintenance ladder climbs toward observation, and the hydraulic shaft opens to the north.",
      meta: { excludeFromTransmitterMap: true },
      describe: (state) =>
        `Thick insulated pipes crowd the walls around this lower platform, knocking and ticking as coolant and reactor heat fight through separate conduits. A red-and-blue coolant control panel is mounted among them. The reactor control room lies west, a maintenance ladder climbs toward observation, and the hydraulic shaft opens to the north. ${describeTiltingPlatform(state)}`,
      exits: [
        { direction: "west", toRoomId: "ReactorControlRoom" },
        { direction: "north", toRoomId: "WasteProcessingPlatform" },
        { direction: "up", toRoomId: "ObservationPlatform" },
      ],
    },
    {
      id: "WasteProcessingPlatform",
      name: "Waste Processing Platform",
      description:
        "This lower platform is hemmed in by dented separation tanks and residue-streaked pipes. Lobe storage is to the east, a maintenance ladder climbs to the supply deck, and the hydraulic shaft opens south.",
      meta: { excludeFromTransmitterMap: true },
      describe: (state) =>
        `This lower platform is hemmed in by dented separation tanks and residue-streaked pipes. Lobe storage is to the east, a maintenance ladder climbs to the supply deck, and the hydraulic shaft opens south. ${describeTiltingPlatform(state)}`,
      exits: [
        { direction: "south", toRoomId: "HeatCoolantExchangePlatform" },
        { direction: "east", toRoomId: "LobeStoragePlatform" },
        { direction: "up", toRoomId: "SupplyPlatform" },
      ],
    },
    {
      id: "LobeStoragePlatform",
      name: "Lobe Storage Platform",
      description:
        "A ruptured metal chamber dominates this lower platform. It once stored backup Reactor Lobes, but an internal explosion destroyed most and corrupted the rest. Impact scars point toward the Reactor Platform and the rafters above Observation. Waste processing is west and the readings station is south.",
      meta: { excludeFromTransmitterMap: true },
      exits: [
        { direction: "west", toRoomId: "WasteProcessingPlatform" },
        { direction: "south", toRoomId: "ReadingsPlatform" },
      ],
    },
    {
      id: "ReadingsPlatform",
      name: "Readings Platform",
      description:
        "A narrow bank of diagnostic consoles overlooks the machinery from this lower platform. Their dead screens reflect the hydraulic shaft to the west and lobe storage to the north.",
      meta: { excludeFromTransmitterMap: true },
      describe: (state) =>
        `A narrow bank of diagnostic consoles overlooks the machinery from this lower platform. Their dead screens reflect the hydraulic shaft to the west and lobe storage to the north. ${describeTiltingPlatform(state)}`,
      exits: [{ direction: "north", toRoomId: "LobeStoragePlatform" }],
    },
    {
      id: PLATFORM_PERCH_ROOM_ID,
      name: "Atop the Tilted Platform",
      description:
        "You are perched near the raised edge of the damaged hydraulic platform, level with the overhead scaffolding. The deck drops away at a severe angle beneath you, leaving down as the only safe route off.",
      describe: (state) => describeTiltedPlatformPerch(state),
      meta: { excludeFromTransmitterMap: true },
      exits: [{ direction: "down", toRoomId: "WasteProcessingPlatform" }],
    },
    {
      id: "SupplyPlatform",
      name: "Supply Platform",
      description:
        "Crates, hose reels, secured tool cabinets, and a yellow radiation equipment locker crowd the upper supply deck. Maintenance lies east, a sealed maintenance-ladder lid sits in the deck, and the damaged hydraulic platform spans the gap south.",
      describe: (state) =>
        `Crates, hose reels, secured tool cabinets, and a yellow radiation equipment locker crowd the upper supply deck. Maintenance lies east, a sealed maintenance-ladder lid sits in the deck, and the damaged hydraulic platform spans the gap south. ${describeTiltingPlatform(state)}`,
      exits: [
        { direction: "east", toRoomId: "MaintenancePlatform" },
        { direction: "south", toRoomId: "ObservationPlatform" },
        { direction: "down", toRoomId: "WasteProcessingPlatform" },
      ],
    },
    {
      id: "MaintenancePlatform",
      name: "Maintenance Platform",
      description:
        "An upper maintenance deck runs between the supply area to the west and the main reactor platform to the south. Open equipment housings expose bundles of dead wiring and scorched control boards.",
      exits: [
        { direction: "west", toRoomId: "SupplyPlatform" },
        { direction: "south", toRoomId: "ReactorPlatform" },
      ],
    },
    {
      id: "ObservationPlatform",
      name: "Observation Platform",
      description:
        "This upper platform overlooks the lower machinery through a guardrail warped by some tremendous impact. The main reactor platform is east, a sealed maintenance-ladder lid sits near the guardrail, and the damaged hydraulic platform spans the gap north.",
      describe: (state) =>
        `This upper platform overlooks the lower machinery through a guardrail warped by some tremendous impact. The main reactor platform is east, a sealed maintenance-ladder lid sits near the guardrail, and the damaged hydraulic platform spans the gap north. ${describeTiltingPlatform(state)}`,
      exits: [
        { direction: "north", toRoomId: "SupplyPlatform" },
        { direction: "east", toRoomId: "ReactorPlatform" },
        { direction: "down", toRoomId: "HeatCoolantExchangePlatform" },
      ],
    },
    {
      id: "ReactorPlatform",
      name: "Reactor Platform",
      description:
        "A broad upper platform is packed with machinery, mainframes, monitors, and interlaced pipes. The giant Reactor Lobe Consensus board hangs above it, and a defunct lobe with a cracked housing lies where an explosion flung it from below. Engineering Corridor Two continues east, the observation deck lies west, and maintenance equipment crowds the platform to the north.",
      exits: [
        { direction: "north", toRoomId: "MaintenancePlatform" },
        { direction: "west", toRoomId: "ObservationPlatform" },
        { direction: "east", toRoomId: "EngCorridorTwo" },
      ],
    },
    {
      id: VIRTUAL_OFFICE_ROOM_ID,
      name: "Virtual Office: Lemster's Office",
      description:
        "Fluorescent panels bleach a cramped office buried under impossible stacks of virtual paperwork. This is the workspace of Lemster Krolmborg, Aeneas Virtual Employee 12,847,395,061. An open doorway leads east to his manager's office, whose desk has been positioned for uninterrupted glaring.",
      meta: { excludeFromTransmitterMap: true },
      exits: [{ direction: "east", toRoomId: VIRTUAL_MANAGER_OFFICE_ROOM_ID }],
    },
    {
      id: VIRTUAL_MANAGER_OFFICE_ROOM_ID,
      name: "Virtual Office: Manager's Office",
      description:
        "A severe glass-and-chrome office overlooks Lemster's workspace through the open doorway west. Motivational slogans crawl across every wall, all variations on teamwork, shared pain, and driving harder.",
      meta: { excludeFromTransmitterMap: true },
      exits: [{ direction: "west", toRoomId: VIRTUAL_OFFICE_ROOM_ID }],
    },
    {
      id: "EngCorridorOne",
      name: "Engineering Corridor One",
      ambientLightLevel: "very-dim",
      resolveAmbientLightLevel: (state) =>
        resolveLevelFiveSpillLight(state, "very-dim"),
      description:
        "This is the main corridor leading into the engineering section. It forms an 'L' here and bends south, and also heads back to the east. Only a faint wash of light reaches in from the stairwell.",
      exits: [
        { direction: "south", toRoomId: "EngCorridorTwo" },
        { direction: "east", toRoomId: "LevelFiveStairAccess" },
        { direction: "north", toRoomId: "ShuttleBay" },
      ],
    },
    {
      id: "EngCorridorTwo",
      name: "Engineering Corridor Two",
      description:
        "This is the main corridor providing access to the engineering section. It heads back to the north, and continues south as well. To the west is a doorway providing access to what looks like the main engineering section. To the east is a set of heavy double doors which have been buckled and jammed in place due to some kind of impact; there's a space between the doors that is not nearly wide enough to crawl through, and you can't see much through it.",
      exits: [
        { direction: "north", toRoomId: "EngCorridorOne" },
        { direction: "east", toRoomId: "Warehouse" },
        { direction: "west", toRoomId: "ReactorPlatform" },
        { direction: "south", toRoomId: "WaterTreatment" },
      ],
    },
    {
      id: "ShuttleBay",
      name: "Shuttle Bay",
      description:
        "This is a wide, open area which acts as a landing bay for the large shuttlecraft which dominates it. The bay itself is mostly empty, the floor painted with green and white lines dividing it into zones. The shuttle itself is not that large; from out here it looks like it might be capable of carrying maybe six people. It's shaped like a half-moon, wide in the back where the engines are mounted, then tapering to a near point along the edge. It is mounted on three short landing pads, and pointed in the direction of a set of large bay doors. There is a door leading into the craft to the north.",
      exits: [
        { direction: "south", toRoomId: "EngCorridorOne" },
        { direction: "west", toRoomId: "InsideShuttle" },
      ],
    },
    {
      id: "InsideShuttle",
      name: "Inside Shuttle",
      description:
        "This is the somewhat cramped interior of one of the ship's shuttlecrafts. A dim overhead light illuminates the interior to reveal a series of cushioned seats along the north and south sides. One such seat cushion has a nylon tab extending from it, and below that the word 'STORAGE' is stenciled in white letters. There is a featureless door to the east which looks like it leads to the cockpit.",
      exits: [{ direction: "east", toRoomId: "ShuttleBay" }],
    },
    {
      id: "Warehouse",
      name: "Warehouse",
      description:
        "This is a large, open area filled with a series of tall metal shelving, many of which have now twisted on their brackets and are leaning against one another like huge, scattered dominoes, their contents scattered throughout the rows and aisles. The place is a complete mess; computer devices, machine parts, and all manner of junk and debris are scattered everywhere. Some of the metal shelving has come crashing down onto the floor, where it lies scattered amongst the flotsam.",
      exits: [{ direction: "west", toRoomId: "EngCorridorTwo" }],
    },
    ...waterTreatmentRooms,
  ],
};
