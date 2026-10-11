import {
  ACTION_ROWS,
  CONVERSATION_EXAMPLES,
  INTERFACE_SECTIONS,
  MOVEMENT_COMMANDS,
  OPENING_PARAGRAPHS,
  getHelpAssistantText,
  type HelpInterfaceSectionId,
} from "../text/help";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "../../styles/help-modal.css";
import {
  formatConversationAssistantText,
  getConversationAssistantNameForMode,
} from "@game/helpers/conversationModeHelpers";
import type { ConversationMode } from "@game/types/gameTypes";
import { CrtModal } from "./CrtModal";

type HelpModalProps = {
  conversationMode: ConversationMode;
  onClose: () => void;
};

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

function renderSectionBody(body: string) {
  const blocks = body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length > 1) {
      return (
        <ul
          key={`block-${index}`}
          className="help-diagram-tooltipList"
          role="list"
        >
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={`block-${index}`} className="help-diagram-tooltipBody">
        {block}
      </p>
    );
  });
}

export function HelpModal({ conversationMode, onClose }: HelpModalProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeSection, setActiveSection] =
    useState<HelpInterfaceSectionId | null>(null);
  const assistantName = getConversationAssistantNameForMode(conversationMode);

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
                label="Compass / Temp / Flashlight / Audio"
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
                  {renderSectionBody(
                    formatConversationAssistantText(
                      selectedSection.body,
                      conversationMode,
                    ),
                  )}
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
            <h2 className="help-section-title">
              {assistantName === "Comet" ? "AI Assistant" : "Library Assistant"}
            </h2>
            <p className="help-paragraph">
              {getHelpAssistantText(conversationMode)}
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
