import type { GameState } from "@game/types/gameTypes";
import type { Item } from "@game/types/itemTypes";
import type { ScriptedEvent } from "@game/types/eventTypes";
import type { ParsedCommand } from "@game/types/parserTypes";
import { resolveItemByNoun } from "@game/rules/scope";

export const gymReservations = [
  { name: "Rhomboid Onche", locker: "M1", reservation: "Sauna (0600)" },
  { name: "Bil-Billy Tendwick", locker: "M2", reservation: "Steam Room (1800)" },
  { name: "Oobert Gu", locker: "M4", reservation: "Spin class (0100)" },
  { name: "Rhimberly Swinth", locker: "W3", reservation: "Steam Room (1800)" },
  { name: "Henk Umboltz", locker: "M5", reservation: "Personal training Weights (1600)" },
  { name: "Freeny Salk", locker: "M8", reservation: "Sauna (0400)" },
  { name: "Wen-Tenly Brinks", locker: "M9", reservation: "Steam Room (2200)" },
  { name: "Hash Mendritch", locker: "M11", reservation: "Personal training Cardio (0900)" },
  { name: "Oola Gu", locker: "W12", reservation: "Spin class (0300)" },
  { name: "Isosceles Onche", locker: "W13", reservation: "Isolation Tank (0200)" },
];

export function formatGymReservations(rows = gymReservations): string {
  const table = [["Name", "Locker number", "Reservation"], ...rows.map(row =>
    [row.name, row.locker, row.reservation])];
  const widths = table[0].map((_, column) => Math.max(...table.map(row => row[column].length)));
  const format = (row: string[]) => row.map((cell, column) => cell.padEnd(widths[column])).join(" | ").trimEnd();
  return [format(table[0]), widths.map(width => "-".repeat(width)).join("-+-"),
    ...table.slice(1).map(format)].join("\n");
}

function setBarPosture(state: GameState, sitting: boolean): GameState {
  return { ...state, worldState: { ...state.worldState, conditionalTriggers: {
    ...state.worldState.conditionalTriggers, GymSittingAtBar: sitting,
  } } };
}

function sitAtBar({ state }: { state: GameState }) {
  return { state: setBarPosture(state, true), message: "You sit at the bar." };
}

export const gymAmenityEvents: ScriptedEvent[] = [{
  id: "gym_leave_bar_seat", once: false,
  when: (state) => state.player.roomId !== "Gym" && state.worldState.conditionalTriggers.GymSittingAtBar === true,
  run: state => setBarPosture(state, false),
}];

export function handleGymAmenityCommand(state: GameState, cmd: ParsedCommand) {
  if (state.player.roomId !== "Gym" || cmd.type !== "action") return undefined;
  if ((cmd.verb === "stand" || cmd.verb === "take") && cmd.direct === "up" && !cmd.indirect) {
    return { state: setBarPosture(state, false), message:
      state.worldState.conditionalTriggers.GymSittingAtBar ? "You stand up." : "You're already standing." };
  }
  if (cmd.verb === "sign" && ["in", "up", "name"].includes(cmd.direct ?? cmd.preposition ?? "")) {
    return { state, message: "The tablet isn't responding at the minute." };
  }
  if (["order", "buy", "purchase"].includes(cmd.verb) &&
      /^(?:(?:a|an|the) )?(?:(?:insta-roid|juice|protein) )?(?:shake|smoothie|drink|juice)$/.test(cmd.direct ?? "") &&
      (!cmd.indirect || ["bar", "juice bar", "smoothie bar"].includes(cmd.indirect))) {
    return { state, message: "The bar isn't being tended at the moment." };
  }
  if (cmd.verb === "sit" && cmd.preposition === "at" &&
      resolveItemByNoun(state, cmd.indirect ?? "")?.id === "GymJuiceBar") return sitAtBar({ state });
  // Reading uses the same transcript table as examination; no reader overlay is needed.
  if (cmd.verb === "read" && resolveItemByNoun(state, cmd.direct ?? "")?.id === "GymSignupSheet") {
    return { state, message: formatGymReservations() };
  }
  return undefined;
}

export const gymAmenityItems: Item[] = [
  {
    id: "GymJuiceBar", name: "juice and smoothie bar",
    description: "There's blenders, ice, and all kind of ingredients back there but it's all locked down and there's nobody back there.",
    sceneryDescription: "Along the far wall is a juice and smoothie bar with rows of empty stools. A banner over the bar promotes an 'Insta-roid Shake' that promises to 'Get you the most out of your workout', though the bar appears to be shut down now.",
    location: "Gym", vocab: ["bar", "juice bar", "smoothie bar"],
    itemClass: "solid", itemCategory: "scenery", itemWeight: 0, itemSize: 10,
    meta: { sceneryOrder: 6.2, sceneryDescriptionOrder: 6.2 }, overrides: { siton: sitAtBar },
  },
  {
    id: "GymShakeBanner", name: "Insta-roid Shake banner",
    description: "Try the new Insta-roid Shake and get the MOST out of your WORKOUT!",
    location: "Gym", vocab: ["banner", "shake banner", "insta-roid"],
    itemClass: "solid", itemCategory: "scenery", itemWeight: 0, itemSize: 3,
  },
  {
    id: "GymBarStools", name: "bar stools", description: "Rows of empty stools line the shut-down juice bar.",
    location: "Gym", vocab: ["stool", "stools", "bar stool"],
    itemClass: "solid", itemCategory: "scenery", itemWeight: 0, itemSize: 3,
    overrides: { siton: sitAtBar },
  },
  {
    id: "GymSignupSheet", name: "digital sign-up sheet", description: "A digital sign-up sheet on a tablet.",
    describe: () => formatGymReservations(),
    sceneryDescription: "A tablet beside the bar displays a digital sign-up sheet for gym reservations.",
    location: "Gym", vocab: ["sheet", "signup sheet", "sign up sheet", "sign-up sheet", "tablet", "signup"],
    itemClass: "solid", itemCategory: "scenery", itemWeight: 0, itemSize: 2,
    meta: { sceneryOrder: 6.3, sceneryDescriptionOrder: 6.3 },
  },
];
