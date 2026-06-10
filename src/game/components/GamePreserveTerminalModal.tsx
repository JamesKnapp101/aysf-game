import { CrtModal } from "@game/components/CrtModal";
import { ROOM_NAME_TOKEN_END, ROOM_NAME_TOKEN_START } from "@game/constants";
import { appendLog } from "@game/engine/log";
import { movePlayerToRoom } from "@game/helpers/gameHelpers";
import { getRoomById } from "@game/helpers/itemHelpers";
import { applyPreserveRoomEntryEffects } from "@game/preserve/preserveEffects";
import { startGamePreserveRun } from "@game/preserve/preserveState";
import { useUIEffectsStore } from "@game/store/store";
import { buildTranscriptRoomDescription } from "@game/text/roomDescription";
import type { GamePreserveDifficulty, GameState } from "@game/types/gameTypes";
import React from "react";
import "../../styles/game-preserve-terminal.css";

type GamePreserveTerminalProps = {
  onClose: () => void;
  state: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
};

type DifficultyOption = {
  key: GamePreserveDifficulty;
  label: string;
  colorLabel: string;
  releaseHint: string;
};

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    key: "very-easy",
    label: "Very Easy",
    colorLabel: "Baby's First Kill",
    releaseHint: "Cut your teeth against a foe that won't wet your diaper.",
  },
  {
    key: "easy",
    label: "Easy",
    colorLabel: "Cakewalk",
    releaseHint:
      "Try something a little feistier on for size, while still keeping your diaper intact.",
  },
  {
    key: "moderate",
    label: "Moderate",
    colorLabel: "Rite of Passage",
    releaseHint: "Playtime is over, so buckle up.",
  },
  {
    key: "hard",
    label: "Hard",
    colorLabel: "True Grit",
    releaseHint: "Bragging rights must be earned.",
  },
  {
    key: "very-hard",
    label: "Very Hard",
    colorLabel: "Apex Predator",
    releaseHint: "Think you're ready for the most dangerous offering we offer?",
  },
];

function getDifficultyIndex(value: GamePreserveDifficulty): number {
  const idx = DIFFICULTY_OPTIONS.findIndex((option) => option.key === value);
  return idx >= 0 ? idx : 2;
}

export function GamePreserveTerminalModal({
  onClose,
  state,
  setGameState,
}: GamePreserveTerminalProps) {
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const destinationRoomId = "GamePreserveEntrance";
  const selectedDifficulty = state.worldState.gamePreserve.selectedDifficulty;
  const selectedIndex = getDifficultyIndex(selectedDifficulty);
  const selectedOption = DIFFICULTY_OPTIONS[selectedIndex];
  const completedDifficulties =
    state.worldState.gamePreserve.completedDifficulties ?? {};
  const isDifficultyCompleted = (difficulty: GamePreserveDifficulty) =>
    completedDifficulties[difficulty] === true;
  const selectedCompleted = isDifficultyCompleted(selectedOption.key);

  React.useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  const setDifficulty = (index: number) => {
    const safeIndex = Math.max(
      0,
      Math.min(DIFFICULTY_OPTIONS.length - 1, index),
    );
    const nextDifficulty = DIFFICULTY_OPTIONS[safeIndex]?.key ?? "moderate";

    setGameState((prev) => ({
      ...prev,
      worldState: {
        ...prev.worldState,
        gamePreserve: {
          ...prev.worldState.gamePreserve,
          selectedDifficulty: nextDifficulty,
        },
      },
    }));
  };

  const beginHunt = () => {
    if (selectedCompleted) return;

    setGameState((prev) => {
      const wasVisitedBeforeTeleport = Boolean(
        (prev.worldState.visitedRooms ?? {})[destinationRoomId],
      );

      let next = startGamePreserveRun(prev);
      next = movePlayerToRoom(next, destinationRoomId);
      next = {
        ...next,
        worldState: {
          ...next.worldState,
          visitedRooms: {
            ...next.worldState.visitedRooms,
            [destinationRoomId]: true,
          },
        },
      };
      next = applyPreserveRoomEntryEffects(next, destinationRoomId);

      next = appendLog(
        next,
        [
          `The dial settles on ${selectedOption.label.toUpperCase()}.`,
          selectedOption.releaseHint,
          "The HUNT button lights beneath your thumb. A clean white flash swallows the room.",
        ].join("\n"),
      );

      const roomName = `${ROOM_NAME_TOKEN_START}${
        getRoomById(next, next.player.roomId)?.name
      }${ROOM_NAME_TOKEN_END}`;
      const roomTranscriptDesc = buildTranscriptRoomDescription(
        next,
        destinationRoomId,
        {
          isFirstVisit: !wasVisitedBeforeTeleport,
        },
      );

      next = appendLog(
        next,
        [roomName, roomTranscriptDesc].filter(Boolean).join("\n"),
      );

      if (!wasVisitedBeforeTeleport) {
        next = appendLog(
          next,
          `\nAs you reorient yourself, you hear an electronic chime, then a calm voice speaks:\n\n"Error encountered. Attempt to print Preserve Issued Rifle Failed."\n"Error encountered. Unable to print PIR. Substituting..."\n"Success. PIR replacement PIW successfully printed and provided to visitor."\n\nThis is followed by a different, cheery voice who declares:\n\n"Welcome! The game is on, and your selected game has been released! Your goal is to take it down, collect a trophy, then take that trophy to the Trophy Room! Acceptable trophies include anything containing the game's DNA, but you will be judged on style. Upon successfully submitting a valid trophy, you will be rewarded with a custom painting of your glorious conquest! Since the custom painting printer is currently offline, prizes may include items from the lost and found, or items collected from the preserve left behind by previous visitors who entered predators, but wound up prey! Just kidding! As long as you hold onto your Preserve Issued Rifle it is virtually impossible for you to die here, no matter how badly you fail! Good hunting!"\n\nSomewhere below the bluff, something alive and unhappy moves through the grass.`,
        );
      }

      return next;
    });

    useUIEffectsStore.getState().triggerTeleportFlash();
    onClose();
  };

  return (
    <CrtModal
      title="Game Preserve Control"
      onClose={onClose}
      width={1040}
      height={660}
      showHeader={false}
    >
      <div
        className="gpres-shell"
        role="document"
        aria-label="Game Preserve Control"
      >
        <div className="gpres-frameOuter">
          <div className="gpres-frameInner">
            <div className="gpres-scanlines" aria-hidden="true" />

            <header className="gpres-topbar">
              <div className="gpres-brandBlock">
                <div className="gpres-brandLine">
                  <span className="gpres-brandMain">Welcome</span>
                  <span className="gpres-brandPrefix">to the</span>
                  <span className="gpres-brandMain">Game Preserve</span>
                </div>
                <div className="gpres-systemName">Scratch That Id</div>
                <div className="gpres-subtitle">
                  They say the most dangerous game is man, but is it? Why not
                  test your mettle and find out? All game animals are 3D-printed
                  and given AI brains that were trained on the original animal,
                  eliminating most moral quandaries.
                </div>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                className="gpres-closeButton"
                onClick={onClose}
                aria-label="Close game preserve control"
              >
                X
              </button>
            </header>

            {/* <div className="gpres-toolbar" aria-hidden="true">
              <div className="gpres-toolbarChip">
                Profile {selectedOption.label}
              </div>
              <div className="gpres-toolbarChip">Transfer Ready</div>
              <div className="gpres-toolbarText">
                Route target: {destinationLabel}
              </div>
            </div> */}

            <div className="gpres-main">
              <section
                className="gpres-dialPanel"
                aria-labelledby="gpres-difficulty-heading"
              >
                <div className="gpres-panelHeader">
                  <div
                    className="gpres-panelLabel"
                    id="gpres-difficulty-heading"
                  >
                    Difficulty Dial
                  </div>
                  <div className="gpres-panelMeta">Pursuit Routing</div>
                </div>

                <div
                  className={[
                    "gpres-dialReadout",
                    selectedCompleted ? "isCompleted" : "",
                  ].join(" ")}
                >
                  <div className="gpres-readoutMain">
                    <span className="gpres-readoutLabel">
                      Selected Profile
                    </span>
                    <span className="gpres-dialValue">
                      {selectedOption.colorLabel}
                    </span>
                    <span className="gpres-dialHint">
                      {selectedOption.releaseHint}
                    </span>
                  </div>
                  {selectedCompleted && (
                    <span className="gpres-completedStamp">Completed</span>
                  )}
                </div>

                <div className="gpres-sliderBlock">
                  <div className="gpres-sliderMeta" aria-hidden="true">
                    <span>Low Pressure</span>
                    <span>High Pressure</span>
                  </div>

                  <input
                    className="gpres-slider"
                    type="range"
                    min={0}
                    max={DIFFICULTY_OPTIONS.length - 1}
                    step={1}
                    value={selectedIndex}
                    onChange={(event) =>
                      setDifficulty(Number(event.target.value))
                    }
                    aria-label="Preserve difficulty"
                  />
                </div>

                <div className="gpres-ticks">
                  {DIFFICULTY_OPTIONS.map((option, index) => {
                    const completed = isDifficultyCompleted(option.key);

                    return (
                      <button
                        key={option.key}
                        type="button"
                        className={[
                          "gpres-tick",
                          index === selectedIndex ? "isSelected" : "",
                          completed ? "isCompleted" : "",
                        ].join(" ")}
                        onClick={() => setDifficulty(index)}
                        disabled={completed}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section
                className="gpres-launchPanel"
                aria-label="Launch controls"
              >
                <div className="gpres-panelHeader">
                  <div className="gpres-panelLabel">Hunt Transfer</div>
                  <div className="gpres-panelMeta">Gate Synchronization</div>
                </div>

                <div className="gpres-transferCard">
                  <div className="gpres-transferRow">
                    <span className="gpres-transferLabel">Profile</span>
                    <span className="gpres-transferValue">
                      {selectedOption.label}
                    </span>
                  </div>
                  {/* <div className="gpres-transferRow">
                    <span className="gpres-transferLabel">Endpoint</span>
                    <span className="gpres-transferValue">
                      {destinationLabel}
                    </span>
                  </div> */}
                </div>

                <div className="gpres-launchCopy">
                  Do you enjoy nature but would also like to fight some of it?
                  We've got you covered! Whether you're a first-timer or an
                  experienced veteran, select the level of challenge you feel up
                  to today then just hit the big button. As soon as you do,
                  you'll be teleported to the preserve along with a Preserve
                  Issued Rifle (PIR) equipped with a scope, and an internal
                  3D-printer that regenerates spent ammo. DO NOT LOSE YOUR PIR.
                  An animal matched to your selected difficulty level will be
                  teleported into the preserve along with you and after that
                  it's anything goes! Your PIR is literally your only defense in
                  some cases so DO NOT LOSE YOUR PIR. The Game Preserve is not
                  responsible for visitors' loss of life, or limb if you lose
                  your PIR, or for any other reason.
                </div>

                <button
                  type="button"
                  className="gpres-huntButton"
                  onClick={beginHunt}
                  disabled={selectedCompleted}
                >
                  BEGIN
                </button>
              </section>
            </div>
          </div>
        </div>
      </div>
    </CrtModal>
  );
}
