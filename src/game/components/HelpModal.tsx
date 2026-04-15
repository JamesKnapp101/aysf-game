import React, { useCallback, useEffect, useRef, useState } from "react";
import "../../styles/help-modal.css";
import { CrtModal } from "./CrtModal";

type HelpModalProps = {
  onClose: () => void;
};

type HelpInterfaceSectionId =
  | "header"
  | "room"
  | "status"
  | "log"
  | "command"
  | "sidebarTabs"
  | "sidebarPanel";

type HelpInterfaceSection = {
  body: string;
  title: string;
};

const OPENING_PARAGRAPHS = [
  "This is a work of Interactive Fiction (IF) where you make the decisions as you attempt to solve a series of puzzles and hopefully prevent a terrible disaster. It's a mix of Science Fiction and Horror, so be aware there are some grody descriptions here and there. Feel free to explore and experiment; no puzzles are designed to cause hard or soft locks so you won't break the game, and while there are many ways to die, your character will never truly know the sweet release of death until you complete the game, which is itself currently not completed.",
  "The game is a work in progress, so be warned; there's plenty to do and I'm always expanding it, but if you explore long enough you'll find issues or unfinished areas. Do feel free to make suggestions or report issues.",
  "At its core, this is a web-based version of an IF game, in the spirit of the old Colossal Cave or Zork, but with a lot of bells and whistles, such as a pinned room description, a compass, and a sidebar that includes inventory, player vitals, logged messages, sampled DNA, and even an AI assistant that can answer questions about the game itself. It also acts as a sort of sidekick that you can ask about things you encounter in the game.",
  "The game also sometimes makes use of status effects that might alter the screen text, for example turning the interface wobbly when intoxicated. If you experience motion sickness with any of them, or they just annoy you, they can be turned off in the Settings tab of the sidebar.",
] as const;

const INTERFACE_SECTIONS: Record<HelpInterfaceSectionId, HelpInterfaceSection> =
  {
    header: {
      title: "Header Bar",
      body: "The header bar shows your current location along with your score, memory percentage, and move count. It stays visible so you can keep your bearings without opening another panel.",
    },
    room: {
      title: "Room Description Panel",
      body: "This pinned panel keeps the current room description visible at the top of the screen. It updates as you move and is meant to reduce the need to scroll back through the transcript.",
    },
    status: {
      title: "Compass / Flashlight / Audio Widget",
      body: "The compass lights up to show available exits. The surrounding indicators report situational info such as flashlight status and nearby audio cues, and the corner icons cover up, down, in, and out.",
    },
    log: {
      title: "Log Panel",
      body: "The log panel is the running transcript of what you typed and how the game responded. If you need to review clues, descriptions, or recent events, this is where to look first.",
    },
    command: {
      title: "Command Bar",
      body: "This is where you type commands at the > prompt. Most of the game is driven from here, including movement, interactions, puzzle solving, and the occasional terrible mistake.",
    },
    sidebarTabs: {
      title: "Sidebar Tabs",
      body: "The sidebar tabs switch between Comet, Inventory, Status, Log, DNA, and Settings. They give you quick access to information and tools without leaving the main game screen.",
    },
    sidebarPanel: {
      title: "Sidebar Panel",
      body: "The large panel beneath the tabs shows the contents of whichever tab is active. That might be Comet's chat window, your inventory, your vitals, saved log entries, DNA results, or settings.",
    },
  };

const MOVEMENT_COMMANDS = [
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

const ACTION_ROWS = [
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

const CONVERSATION_EXAMPLES = [
  "ask robot why it's missing a limb",
  "ask robot where I can find an anodized flange",
  "tell robot about the explosion",
  "tell robot to pick up the metal drum",
] as const;

type DiagramButtonProps = {
  activeSection: HelpInterfaceSectionId | null;
  className: string;
  id: HelpInterfaceSectionId;
  label: string;
  lines?: number;
  onSelect: (id: HelpInterfaceSectionId) => void;
  subtitle?: string;
};

function DiagramButton({
  activeSection,
  className,
  id,
  label,
  lines = 0,
  onSelect,
  subtitle,
}: DiagramButtonProps) {
  return (
    <button
      type="button"
      className={[
        "help-diagram-panel",
        className,
        activeSection === id ? "is-active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onSelect(id)}
      aria-pressed={activeSection === id}
    >
      <span className="help-diagram-panelTitle">{label}</span>
      {subtitle ? (
        <span className="help-diagram-panelSubtitle">{subtitle}</span>
      ) : null}
      {lines > 0 ? (
        <span className="help-diagram-placeholder" aria-hidden="true">
          {Array.from({ length: lines }, (_, index) => (
            <span key={`${id}-line-${index}`} className="help-diagram-line" />
          ))}
        </span>
      ) : null}
    </button>
  );
}

export function HelpModal({ onClose }: HelpModalProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeSection, setActiveSection] =
    useState<HelpInterfaceSectionId | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    scrollRef.current?.focus();
  }, []);

  const onScrollKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const el = scrollRef.current;
      if (!el) return;

      const line = 28;
      const page = Math.max(140, Math.floor(el.clientHeight * 0.85));

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          el.scrollBy({ top: line, behavior: "auto" });
          break;
        case "ArrowUp":
          e.preventDefault();
          el.scrollBy({ top: -line, behavior: "auto" });
          break;
        case "PageDown":
          e.preventDefault();
          el.scrollBy({ top: page, behavior: "auto" });
          break;
        case "PageUp":
          e.preventDefault();
          el.scrollBy({ top: -page, behavior: "auto" });
          break;
        case "Home":
          e.preventDefault();
          el.scrollTo({ top: 0, behavior: "auto" });
          break;
        case "End":
          e.preventDefault();
          el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    },
    [onClose],
  );

  const selectedSection = activeSection
    ? INTERFACE_SECTIONS[activeSection]
    : null;

  return (
    <CrtModal title="Help" onClose={onClose} width={1120} height={780}>
      <div className="help-modal crt-modal-fill crt-modal-fill-flex">
        <div
          className="help-modal-scroll"
          ref={scrollRef}
          tabIndex={0}
          onKeyDown={onScrollKeyDown}
        >
          <section className="help-section">
            <h2 className="help-section-title">WELCOME!</h2>
            {OPENING_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph} className="help-paragraph">
                {paragraph}
              </p>
            ))}
          </section>

          <section className="help-section">
            <h2 className="help-section-title">The Game Interface</h2>
            <p className="help-paragraph help-paragraph--hint">
              Click any labeled section of the layout diagram to see a tooltip
              explaining what it does.
            </p>

            <div
              className="help-diagram"
              aria-label="Simplified interface layout"
            >
              <DiagramButton
                activeSection={activeSection}
                className="help-diagram-panel--header"
                id="header"
                label="Header Bar"
                onSelect={setActiveSection}
                subtitle="Location | Score | Memory | Moves"
              />

              <DiagramButton
                activeSection={activeSection}
                className="help-diagram-panel--room"
                id="room"
                label="Room Description Panel"
                lines={5}
                onSelect={setActiveSection}
              />

              <DiagramButton
                activeSection={activeSection}
                className="help-diagram-panel--status"
                id="status"
                label="Compass / Flashlight / Audio"
                onSelect={setActiveSection}
                subtitle="Exit compass and situational readout"
              />

              <DiagramButton
                activeSection={activeSection}
                className="help-diagram-panel--log"
                id="log"
                label="Log Panel"
                lines={7}
                onSelect={setActiveSection}
              />

              <DiagramButton
                activeSection={activeSection}
                className="help-diagram-panel--command"
                id="command"
                label="Command Bar"
                onSelect={setActiveSection}
                subtitle="> type commands here"
              />

              <div className="help-diagram-sidebar">
                <button
                  type="button"
                  className={[
                    "help-diagram-panel",
                    "help-diagram-panel--sidebarTabs",
                    activeSection === "sidebarTabs" ? "is-active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setActiveSection("sidebarTabs")}
                  aria-pressed={activeSection === "sidebarTabs"}
                >
                  <span className="help-diagram-panelTitle">Sidebar Tabs</span>
                </button>

                <DiagramButton
                  activeSection={activeSection}
                  className="help-diagram-panel--sidebarPanel"
                  id="sidebarPanel"
                  label="Sidebar Panel"
                  lines={6}
                  onSelect={setActiveSection}
                  subtitle="Shows the active tab's contents"
                />
              </div>
            </div>

            <div
              className="help-diagram-tooltip"
              role="status"
              aria-live="polite"
            >
              {selectedSection ? (
                <>
                  <div className="help-diagram-tooltipTitle">
                    {selectedSection.title}
                  </div>
                  <p className="help-diagram-tooltipBody">
                    {selectedSection.body}
                  </p>
                </>
              ) : (
                <p className="help-diagram-tooltipBody">
                  Click a section in the diagram to inspect that part of the
                  interface.
                </p>
              )}
            </div>
          </section>

          <section className="help-section">
            <h2 className="help-section-title">Commands</h2>
            <p className="help-paragraph">
              The command bar at the bottom of the screen, at the command prompt
              &quot;&gt;&quot;, is where you'll enter the in-game commands to
              navigate the world, find interesting items, solve interesting
              puzzles, and die in interesting ways.
            </p>
          </section>

          <section className="help-section">
            <h2 className="help-section-title">AI Assistant</h2>
            <p className="help-paragraph">
              You start the game with a handy AI assistant named Comet, which
              has its own chat window and chat bar. You can ask Comet anything
              you want and it will do its best to answer, providing useful
              information and helping to guide you in times of trouble. Comet
              has a default personality, which can be changed in the Settings
              tab.
            </p>
          </section>

          <section className="help-section">
            <h2 className="help-section-title">Movement</h2>
            <p className="help-paragraph">
              Move throughout the game world by using the following commands:
            </p>

            <div className="help-chipGrid">
              {MOVEMENT_COMMANDS.map((command) => (
                <div key={command} className="help-chip">
                  {command}
                </div>
              ))}
            </div>

            <p className="help-paragraph">
              The compass in the upper-right section of the screen will indicate
              your current options by lighting up the compass needles. The icons
              in the four corners of the compass act the same way, and they
              represent the directions up, down, in, and out.
            </p>
          </section>

          <section className="help-section">
            <h2 className="help-section-title">Actions</h2>
            <p className="help-paragraph">
              The most common actions you'll find yourself using include:
            </p>

            <div
              className="help-commandGrid"
              role="list"
              aria-label="Common actions"
            >
              {ACTION_ROWS.map((row) => (
                <React.Fragment key={row.command}>
                  <div className="help-commandName" role="listitem">
                    {row.command}
                  </div>
                  <div className="help-commandDescription">
                    {row.description}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </section>

          <section className="help-section">
            <h2 className="help-section-title">Conversation</h2>
            <p className="help-paragraph">
              Conversation with NPCs comes in two forms: asking, and telling.
              The format is:
            </p>

            <div className="help-exampleBlock">
              <code>ask &lt;npc&gt;</code>
              <code>tell &lt;npc&gt;</code>
            </div>

            <p className="help-paragraph">
              Followed by what you want to ask or tell. For example:
            </p>

            <div className="help-exampleBlock">
              {CONVERSATION_EXAMPLES.map((example) => (
                <code key={example}>{example}</code>
              ))}
            </div>
          </section>
        </div>

        <div className="help-modal-footer">
          <span className="help-modal-hint">
            Click the interface diagram for tooltips. Use Arrow keys or PgUp /
            PgDn to scroll. Press ESC to close.
          </span>
        </div>
      </div>
    </CrtModal>
  );
}
