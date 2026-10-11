import { formatConversationAssistantText } from "../helpers/conversationModeHelpers";
import type { ConversationMode } from "../types/gameTypes";

export type HelpInterfaceSectionId =
  | "header"
  | "room"
  | "status"
  | "log"
  | "command"
  | "sidebarTabs"
  | "sidebarPanel";

export type HelpInterfaceSection = {
  body: string;
  title: string;
};

export const OPENING_PARAGRAPHS = [
  "This is a work of Interactive Fiction (IF) where you make the decisions as you attempt to solve a series of puzzles and hopefully prevent a terrible disaster. It's a mix of Science Fiction and Horror, so be aware there are some grody descriptions here and there. Feel free to explore and experiment; no puzzles are designed to cause hard or soft locks so you won't break the game, and while there are many ways to die, your character will never truly know the sweet release of death until you complete the game, which is itself currently not completed.",
  "The game is a work in progress, so be warned; there's plenty to do and I'm always expanding it, but if you explore long enough you'll find issues or unfinished areas. Feel free to make suggestions or report issues.",
  "At its core, this is a web-based version of an IF game, in the spirit of the old Colossal Cave or Zork. It has a lot of bells and whistles, like a pinned room description, a compass, and a sidebar that includes inventory, player vitals, logged messages, sampled DNA, and even an AI assistant that can answer questions, but underneath it all is a text driven adventure.",
  "The game also sometimes makes use of status effects that might alter the screen text, for example turning the interface wobbly when intoxicated. If you experience motion sickness with any of them, or they just annoy you, they can be turned off in the Settings tab of the sidebar.",
] as const;

export const INTERFACE_SECTIONS: Record<HelpInterfaceSectionId, HelpInterfaceSection> =
  {
    header: {
      title: "Header Bar",
      body: "The header bar shows your current location along with your score, memory percentage, and move count.",
    },
    room: {
      title: "Room Description Panel",
      body: "This pinned panel keeps the current room description visible at the top of the screen. It updates as you move and is meant to reduce the need to scroll back through the transcript, or refresh by using the 'look' command. This description stays current with any items taken or dropped.",
    },
    status: {
      title: "Compass / Temp / Flashlight / Audio Widget",
      body: "The compass lights up to show available exits, with the corner icons representing up, down, in, and out. Below that is an external temperature reading for the room, followed by a flashlight indicator that will show whether you're carrying a flashlight, if it's lit, and how much charge it has. At the bottom is an audio indicator that will light up when something nearby is making noise.",
    },
    log: {
      title: "Log Panel",
      body: "The log panel is the running transcript of what you typed and how the game responded. If you need to review clues, descriptions, or recent events, you can scroll back through the history here.",
    },
    command: {
      title: "Command Bar",
      body: "This is where you type commands at the > prompt. Most of the game is driven from here, including movement, interactions, puzzle solving, and the occasional terrible mistake.",
    },
    sidebarTabs: {
      title: "Sidebar Tabs",
      body: "The sidebar tabs switch between Comet, Inventory, Status, Log, and Settings. They give you quick access to information and tools without leaving the main game screen.\n\nComet Tab: This is an AI powered assistant that can answer questions about the game itself, and also act as a sidekick of sorts that you can ask about things you encounter in the game world.\nInventory Tab: You start the game with a 'Quantum Tote', a sci-fi gadget that is a slim tablet whose screen is a portal to a pocket dimension where you can effectively store infinite items, so no inventory juggling.\nStatus Tab: This tab tracks the player's vitals; health, oxygen, temperature, radiation, and brainwaves. These stats are all plugged in and can be affected by things in game. You can also see a summary diagnosis here.\nLog Tab: To prevent inventory clutter, things like notes, journals, etc. have their contents logged and the original item discarded. Gossip also gets logged here, and DNA samples have their own section after Gossip.\nSettings Tab: Here you can change things like the CRT color, the Comet assistant's personality, text size, etc.",
    },
    sidebarPanel: {
      title: "Sidebar Panel",
      body: "The large panel beneath the tabs shows the contents of whichever tab is active. That might be Comet's chat window, your inventory, your vitals, saved log entries, gossip, DNA results, or settings.",
    },
  };

export const MOVEMENT_COMMANDS = [
  "north, n",
  "south, s",
  "east, e",
  "west, w",
  "northeast, ne",
  "northwest, nw",
  "southeast, se",
  "southwest, sw",
  "up, u",
  "down, d",
  "in",
  "out",
] as const;

export const ACTION_ROWS = [
  {
    command: "get, take",
    description: "Collect an item and add it to your inventory.",
  },
  {
    command: "drop",
    description:
      "Remove an item from your inventory and leave it in the current room.",
  },
  {
    command: "examine, x",
    description:
      "Take a closer look at something, sometimes revealing new details.",
  },
  {
    command: "search",
    description:
      "For things like bodies or bureaus, search may turn up hidden items.",
  },
  {
    command: "put",
    description: "Put an item in a container, or on a surface.",
  },
  { command: "turn", description: "Turn a dial or key." },
  { command: "turn on/off", description: "Turn an electronic item on or off." },
  {
    command: "read",
    description:
      "Read the contents of notes, journals, and other written material.",
  },
  { command: "open", description: "Open a door or container." },
  { command: "close", description: "Close a door or container." },
  {
    command: "use",
    description: "A contextual use command for items that support it.",
  },
  {
    command: "stand on",
    description: "Stand on a surface, usually a teleportation disk.",
  },
  {
    command: "fill",
    description: "Fill a container with something, generally water.",
  },
  { command: "empty", description: "Empty a container of its contents." },
  { command: "eat", description: "Eat an item, if it can be eaten." },
  { command: "drink", description: "Drink a liquid." },
  {
    command: "inject",
    description:
      "In case you ever need to inject something with something else.",
  },
  {
    command: "wear",
    description:
      "Put on clothing if you get tired of being naked. Some of it may even be useful.",
  },
  {
    command: "wait, z",
    description: "Let a turn elapse with no other action.",
  },
] as const;

export const CONVERSATION_EXAMPLES = [
  "ask robot why it's missing a limb",
  "ask robot where I can find an anodized flange",
  "tell robot about the explosion",
  "tell robot to pick up the metal drum",
] as const;
export function getHelpAssistantText(mode: ConversationMode): string {
  return mode === "authored"
    ? "You start the game with a handy library assistant named Sibyl, which has its own chat window and chat bar. You can ask Sibyl anything you want and it will answer from the indexed library and authored fallback text, providing useful information and helping to guide you in times of trouble."
    : "You start the game with a handy AI assistant named Comet, which has its own chat window and chat bar. You can ask Comet anything you want and it will do its best to answer, providing useful information and helping to guide you in times of trouble. Comet has a default personality, which can be changed in the Settings tab.";
}

export function buildHelpText(mode: ConversationMode): string {
  return [
    "WELCOME!",
    ...OPENING_PARAGRAPHS,
    "The Game Interface",
    ...Object.values(INTERFACE_SECTIONS).map(section =>
      `${section.title}\n${formatConversationAssistantText(section.body, mode)}`,
    ),
    mode === "authored" ? "Library Assistant" : "AI Assistant",
    getHelpAssistantText(mode),
    "Movement",
    MOVEMENT_COMMANDS.join("; "),
    "Actions",
    ...ACTION_ROWS.map(row => `${row.command}: ${row.description}`),
    "Conversation",
    "Conversation with NPCs comes in two forms: asking, and telling. The format is:",
    "ask <npc>\ntell <npc>",
    "Followed by what you want to ask or tell. For example:",
    ...CONVERSATION_EXAMPLES,
  ].join("\n\n");
}
