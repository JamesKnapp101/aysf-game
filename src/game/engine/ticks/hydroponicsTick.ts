import { appendLog } from "@game/engine/handleCommand";
import { triggerPlayerDeath } from "@game/helpers/gameHelpers";
import { GameState } from "@game/types/gameTypes";
import { tickHydroponicsSpiderThreat } from "src/world/Items/creatures/giantSpider";
import { tickHydroponicsCocoonPuzzle } from "src/world/maps/levelSix/hydroponicsPuzzle";

export function tickHydroponics(state: GameState): GameState {
  const spiderIsAlive = state.worldState.hydroponicsSpider.isAlive;
  let next = state;

  if (spiderIsAlive) {
    const rangeRoomIds = Object.keys(Moan);

    const turn = state.worldState.hydroponicsSpider.turnsSinceLastBreath % 6;
    const nextTurn = (turn + 1) % 6;

    const isMoanTurn = turn >= 3;

    const nextRoomAudioLevel = { ...state.worldState.roomAudioLevel };
    for (const roomId of rangeRoomIds) {
      const level = isMoanTurn ? (Moan[roomId]?.[turn]?.audioLevel ?? 0) : 0;
      nextRoomAudioLevel[roomId] = level;
    }

    next = {
      ...state,
      worldState: {
        ...state.worldState,
        hydroponicsSpider: {
          ...state.worldState.hydroponicsSpider,
          turnsSinceLastBreath: nextTurn,
        },
        roomAudioLevel: nextRoomAudioLevel,
      },
    };

    // Only emit text when the player is actually in range, and only during moan turns.
    if (isMoanTurn && rangeRoomIds.includes(state.player.roomId)) {
      const moanMessage = `\n${
        Moan[state.player.roomId]?.[turn]?.moanMsg ??
        "A long, low moan reverberates through the air."
      }`;
      next = appendLog(next, moanMessage);
    }

    const spiderTick = tickHydroponicsSpiderThreat(next);
    if (spiderTick.deathMessage) {
      return triggerPlayerDeath(
        spiderTick.state,
        spiderTick.deathMessage,
        spiderTick.deathCause ?? "hydroponics spider acid",
      );
    }
    next = spiderTick.state;
  }

  const cocoonTick = tickHydroponicsCocoonPuzzle(next);
  if (cocoonTick.deathMessage) {
    return triggerPlayerDeath(
      cocoonTick.state,
      cocoonTick.deathMessage,
      cocoonTick.deathCause ?? "hydroponics cocoon trap",
    );
  }

  return cocoonTick.state;
}

type MoanSetting = {
  audioLevel: number;
  moanMsg: string;
};

type MoanCfg = {
  [key: string]: {
    [key: number]: MoanSetting;
  };
};

export const Moan: MoanCfg = {
  StairWellSeven: {
    3: {
      audioLevel: 0,
      moanMsg: `From somewhere up above, a faint moan begins to fill the air. It sounds like it's coming from far away.`,
    },
    4: {
      audioLevel: 1,
      moanMsg: `The moan rises in pitch, reverberating faintly in the stairwell.`,
    },
    5: {
      audioLevel: 0,
      moanMsg: `The far off moan subsides, and the stairwell is silent again.`,
    },
  },
  StairSeven: {
    3: {
      audioLevel: 1,
      moanMsg: `From somewhere up above, a faint moan begins to fill the air.`,
    },
    4: {
      audioLevel: 2,
      moanMsg: `The low moan rises in pitch, reverberating faintly in the stairwell.`,
    },
    5: {
      audioLevel: 1,
      moanMsg: `The faint sound peters out, and goes quiet.`,
    },
  },
  StairSix: {
    3: {
      audioLevel: 2,
      moanMsg: `From behind the door you hear a long, haunting moan that begins to grow louder.`,
    },
    4: {
      audioLevel: 3,
      moanMsg: `The moan rises in pitch from somewhere behind the door, reverberating faintly in the stairwell.`,
    },
    5: {
      audioLevel: 2,
      moanMsg: `The sound from behind the door loses steam, and fades into silence.`,
    },
  },
  StairFive: {
    3: {
      audioLevel: 1,
      moanMsg: `From somewhere below you, a faint moan begins to fill the air.`,
    },
    4: {
      audioLevel: 2,
      moanMsg: `The moan rises in pitch, reverberating faintly in the stairwell.`,
    },
    5: {
      audioLevel: 1,
      moanMsg: `The sound reaches a peak then begins to fade.`,
    },
  },
  StairFour: {
    3: {
      audioLevel: 0,
      moanMsg: `From somewhere below, a faint moan begin to fill the stairwell.`,
    },
    4: {
      audioLevel: 2,
      moanMsg: `The faint moan rises in pitch, reverberating faintly in the stairwell.`,
    },
    5: { audioLevel: 0, moanMsg: `The faint sound fades.` },
  },
  LevelSixStairAccess: {
    3: {
      audioLevel: 2,
      moanMsg: `A hollow moan starts reverberating down the corridor from the west.`,
    },
    4: {
      audioLevel: 4,
      moanMsg: `The low moan rises in pitch, making the walls faintly vibrate.`,
    },
    5: {
      audioLevel: 2,
      moanMsg: `The sound reaches a peak and then begins to fade.`,
    },
  },
  LevelSixCorridorBend: {
    3: {
      audioLevel: 3,
      moanMsg: `A hollow moan starts reverberating down the corridor, coming from the west.`,
    },
    4: {
      audioLevel: 5,
      moanMsg: `The moan rises in pitch, echoing down the corridor from the west.`,
    },
    5: {
      audioLevel: 3,
      moanMsg: `The sound from the end of the corridor begins to fade.`,
    },
  },
  LevelSixCorridorEnd: {
    3: {
      audioLevel: 4,
      moanMsg: `A loud, hollow moan begins to sound from through the gap in the damaged door.`,
    },
    4: {
      audioLevel: 6,
      moanMsg: `The moan rises in pitch, causing the doorframe to vibrate as it spills through the gap.`,
    },
    5: {
      audioLevel: 4,
      moanMsg: `The vibrations subside as the sound begins to fade.`,
    },
  },
  HydroponicsPlatform: {
    3: {
      audioLevel: 6,
      moanMsg: `A loud, deep moan begins to reverberate from somewhere down below.`,
    },
    4: {
      audioLevel: 8,
      moanMsg: `The eerie moan from below gets louder, causing leaves to shake.`,
    },
    5: {
      audioLevel: 6,
      moanMsg: `After reaching a crechendo the sound begins to fade, twigs and leaves twirling down from above.`,
    },
  },
  HydroponicsPlatformMid: {
    3: {
      audioLevel: 7,
      moanMsg: `A low, eerie moan sounds as the massive spider stirs, several of its long spindly legs shifting position, groping for purchase.`,
    },
    4: {
      audioLevel: 9,
      moanMsg: `The sound continues as air rushes through the giant's yawning spiracles, causing the webbing around the swollen abdomen to billow, and shimmer.`,
    },
    5: {
      audioLevel: 7,
      moanMsg: `The moan begins to fade as the weight of the huge creature pushes out the last of the air, shaking strands of web until the spiracles are forced shut.`,
    },
  },
  HydroponicsPlatformBottom: {
    3: {
      audioLevel: 6,
      moanMsg: `The web canopy above you stirs as a haunting moan begins to sound, and movement from above causes the entire structure to creak, and squeal.`,
    },
    4: {
      audioLevel: 8,
      moanMsg: `The canopy continues to ripple and vibrate as the sound reaches a peak.`,
    },
    5: {
      audioLevel: 6,
      moanMsg: `The rippling and vibrations subside as the moan runs out of air, and the air grows quiet again.`,
    },
  },
  UnderWebOne: {
    3: {
      audioLevel: 6,
      moanMsg: `The web canopy above you stirs as a haunting moan begins to sound, and movement from above causes the entire structure to creak, and squeal.`,
    },
    4: {
      audioLevel: 8,
      moanMsg: `The canopy continues to ripple and vibrate as the sound reaches a peak.`,
    },
    5: {
      audioLevel: 6,
      moanMsg: `The rippling and vibrations subside as the moan runs out of air, and the air grows quiet again.`,
    },
  },
  UnderWebTwo: {
    3: {
      audioLevel: 6,
      moanMsg: `The web canopy above you stirs as a haunting moan begins to sound, and movement from above causes the entire structure to creak, and squeal.`,
    },
    4: {
      audioLevel: 8,
      moanMsg: `The canopy continues to ripple and vibrate as the sound reaches a peak.`,
    },
    5: {
      audioLevel: 6,
      moanMsg: `The rippling and vibrations subside as the moan runs out of air, and the air grows quiet again.`,
    },
  },
  UnderWebThree: {
    3: {
      audioLevel: 6,
      moanMsg: `The web canopy above you stirs as a haunting moan begins to sound, and movement from above causes the entire structure to creak, and squeal.`,
    },
    4: {
      audioLevel: 8,
      moanMsg: `The canopy continues to ripple and vibrate as the sound reaches a peak.`,
    },
    5: {
      audioLevel: 6,
      moanMsg: `The rippling and vibrations subside as the moan runs out of air, and the air grows quiet again.`,
    },
  },
  UnderWebFour: {
    3: {
      audioLevel: 6,
      moanMsg: `The web canopy above you stirs as a haunting moan begins to sound, and movement from above causes the entire structure to creak, and squeal.`,
    },
    4: {
      audioLevel: 8,
      moanMsg: `The canopy continues to ripple and vibrate as the sound reaches a peak.`,
    },
    5: {
      audioLevel: 6,
      moanMsg: `The rippling and vibrations subside as the moan runs out of air, and the air grows quiet again.`,
    },
  },
};
