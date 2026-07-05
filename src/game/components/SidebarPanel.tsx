import { CometTerminal } from "@game/components/CometTerminal";
import { LogTab } from "@game/components/LogTab";
import { ObjectivesTab } from "@game/components/ObjectivesTab";
import { QuantumTotePanel } from "@game/components/QuantumTotePanel";
import { SettingsTab } from "@game/components/SettingsTab";
import { getConversationAssistantNameForMode } from "../helpers/conversationModeHelpers";
import type { SidebarTabNotificationMap } from "../helpers/sidebarTabNotifications";
import { getItemsInInventory } from "../selectors/itemSelectors";
import type {
  CometPersonalityMode,
  CometTextSizeMode,
  ConversationMode,
  GameState,
  VisualEffectsMode,
} from "../types/gameTypes";
import React, { useEffect, useRef } from "react";
import { StatusTab } from "./StatusTab";

export type SidebarPanelTab =
  | "comet"
  | "inventory"
  | "status"
  | "objectives"
  | "log"
  | "hints"
  | "settings";

type SidebarPanelProps = {
  activeTab: SidebarPanelTab;
  cometInputRef?: React.RefObject<HTMLInputElement | null>;
  crtColor: string;
  isCometFocusOwner?: boolean;
  onCometPromptFocus?: () => void;
  setActiveTab: (tab: SidebarPanelTab) => void;
  setCrtColor: React.Dispatch<React.SetStateAction<string>>;
  setGameState?: (updater: (prev: GameState) => GameState) => void;
  state: GameState;
  tabNotifications?: SidebarTabNotificationMap;
};

function applyCRTColor(colorHex: string) {
  const root = document.documentElement;
  root.style.setProperty("--crt-color", colorHex);

  const r = parseInt(colorHex.slice(1, 3), 16);
  const g = parseInt(colorHex.slice(3, 5), 16);
  const b = parseInt(colorHex.slice(5, 7), 16);

  root.style.setProperty("--crt-color-rgb", `${r} ${g} ${b}`);
}

export const SidebarPanel: React.FC<SidebarPanelProps> = ({
  activeTab,
  cometInputRef,
  crtColor,
  isCometFocusOwner = false,
  onCometPromptFocus = () => undefined,
  setActiveTab,
  setCrtColor,
  setGameState = () => undefined,
  state,
  tabNotifications = {},
}) => {
  const inventoryItems = getItemsInInventory(state);
  const internalCometInputRef = useRef<HTMLInputElement | null>(null);
  const activeCometInputRef = cometInputRef ?? internalCometInputRef;
  const conversationMode = state.uiState.conversationMode ?? "ai";
  const conversationAssistantName =
    getConversationAssistantNameForMode(conversationMode);
  const cometPersonality = state.uiState.cometPersonality ?? "default";
  const cometTextSize = state.uiState.cometTextSize ?? "smaller";
  const visualEffectsMode = state.uiState.visualEffectsMode ?? "full";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      applyCRTColor(crtColor);
    } catch {
      // ignore
    }
  }, [crtColor]);

  const handleCometPersonalityChange = (
    cometPersonality: CometPersonalityMode,
  ) => {
    setGameState((prev) => ({
      ...prev,
      uiState: {
        ...prev.uiState,
        cometPersonality,
      },
    }));
  };

  const handleConversationModeChange = (conversationMode: ConversationMode) => {
    setGameState((prev) => ({
      ...prev,
      uiState: {
        ...prev.uiState,
        conversationMode,
      },
    }));
  };

  const handleCometTextSizeChange = (cometTextSize: CometTextSizeMode) => {
    setGameState((prev) => ({
      ...prev,
      uiState: {
        ...prev.uiState,
        cometTextSize,
      },
    }));
  };

  const handleVisualEffectsModeChange = (
    visualEffectsMode: VisualEffectsMode,
  ) => {
    setGameState((prev) => ({
      ...prev,
      uiState: {
        ...prev.uiState,
        visualEffectsMode,
      },
    }));
  };

  const getTabClassName = (
    tab: SidebarPanelTab,
    extraClassName = "",
  ): string => {
    const isActive = activeTab === tab;
    const hasNotification =
      !isActive &&
      (tab === "inventory" ||
        tab === "status" ||
        tab === "objectives" ||
        tab === "log") &&
      tabNotifications[tab] === true;

    return [
      "game-tab",
      extraClassName,
      isActive ? "game-tab-active" : "",
      hasNotification ? "game-tab-notified" : "",
    ]
      .filter(Boolean)
      .join(" ");
  };

  const getTabAriaLabel = (tab: SidebarPanelTab, label: string): string => {
    const hasNotification =
      activeTab !== tab &&
      (tab === "inventory" ||
        tab === "status" ||
        tab === "objectives" ||
        tab === "log") &&
      tabNotifications[tab] === true;

    return hasNotification ? `${label} updated` : label;
  };

  return (
    <aside className="game-sidebar">
      <div className="game-sidebar-tabsArea">
        <div className="game-tabs">
          <button
            type="button"
            className={getTabClassName("comet", "game-tab-comet")}
            onClick={() => setActiveTab("comet")}
          >
            <span className="game-tab-cometText">
              {conversationAssistantName}
            </span>
            <span className="game-tab-cometStatus" aria-hidden="true">
              <span className="game-tab-cometDot is-on" />
              <span className="game-tab-cometDot is-on" />
            </span>
          </button>
          <button
            type="button"
            aria-label={getTabAriaLabel("inventory", "Inventory")}
            className={getTabClassName("inventory")}
            data-notification={
              activeTab !== "inventory" && tabNotifications.inventory
                ? "true"
                : undefined
            }
            onClick={() => setActiveTab("inventory")}
          >
            Inventory
          </button>
          <button
            type="button"
            aria-label={getTabAriaLabel("status", "Status")}
            className={getTabClassName("status")}
            data-notification={
              activeTab !== "status" && tabNotifications.status
                ? "true"
                : undefined
            }
            onClick={() => setActiveTab("status")}
          >
            Status
          </button>
          <button
            type="button"
            aria-label={getTabAriaLabel("objectives", "Objectives")}
            className={getTabClassName("objectives")}
            data-notification={
              activeTab !== "objectives" && tabNotifications.objectives
                ? "true"
                : undefined
            }
            onClick={() => setActiveTab("objectives")}
          >
            Objectives
          </button>
          <button
            type="button"
            aria-label={getTabAriaLabel("log", "Log")}
            className={getTabClassName("log")}
            data-notification={
              activeTab !== "log" && tabNotifications.log ? "true" : undefined
            }
            onClick={() => setActiveTab("log")}
          >
            Log
          </button>
          <button
            type="button"
            className={getTabClassName("settings")}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
        </div>

        <div
          className={
            "game-sidebar-content" +
            (activeTab === "comet" ? " game-sidebar-content--comet" : "")
          }
        >
          {activeTab === "comet" && (
            <CometTerminal
              forceLink={true}
              forceOnline={true}
              inputRef={activeCometInputRef}
              isFocusOwner={isCometFocusOwner}
              onPromptFocus={onCometPromptFocus}
              setGameState={setGameState}
              state={state}
              variant="sidebar"
            />
          )}

          {activeTab === "inventory" && (
            <QuantumTotePanel state={state} inventoryItems={inventoryItems} />
          )}

          {activeTab === "status" && <StatusTab gameState={state} />}
          {activeTab === "objectives" && <ObjectivesTab gameState={state} />}
          {activeTab === "log" && <LogTab gameState={state} />}

          {activeTab === "settings" && (
            <SettingsTab
              cometPersonality={cometPersonality}
              cometTextSize={cometTextSize}
              conversationMode={conversationMode}
              crtColor={crtColor}
              onCometPersonalityChange={handleCometPersonalityChange}
              onCometTextSizeChange={handleCometTextSizeChange}
              onConversationModeChange={handleConversationModeChange}
              onVisualEffectsModeChange={handleVisualEffectsModeChange}
              setCrtColor={setCrtColor}
              visualEffectsMode={visualEffectsMode}
            />
          )}
        </div>
      </div>
    </aside>
  );
};
