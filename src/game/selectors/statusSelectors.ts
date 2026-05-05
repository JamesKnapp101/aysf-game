import {
  HAIRY_STATUS_MESSAGES,
  HORNY_STATUS_MESSAGES,
  PAIN_STATUS_MESSAGES,
} from "../text/messageMaps";
import type { GameState, StatusEffect } from "../types/gameTypes";
import { getCurrentRoom } from "./roomSelectors";

export function getActiveStatusEffectIds(state: GameState): string[] {
  return state.player.statusEffects.map(
    (statusEffect: StatusEffect) => statusEffect.id,
  );
}

export function getStatusEffectById(
  state: GameState,
  effectId: string,
): StatusEffect[] {
  return state.player.statusEffects.filter(
    (status: StatusEffect) => status.id === effectId,
  );
}

export function getRadiationIntensity(state: GameState): number {
  const re =
    state.player.statusEffects.filter((status: StatusEffect) => {
      return status.id === "radiation";
    }) ?? [];
  if (re.length === 0) {
    return 0;
  }

  const r = re[0];
  return r.intensity;
}

export function getPainStatusMessage(remainingTurns: number): string | null {
  return PAIN_STATUS_MESSAGES[remainingTurns] ?? null;
}

export function getHornyStatusMessage(remainingTurns: number): string | null {
  return HORNY_STATUS_MESSAGES[remainingTurns] ?? null;
}

export function getHairyStatusMessage(remainingTurns: number): string | null {
  return HAIRY_STATUS_MESSAGES[remainingTurns] ?? null;
}

export function describeSicknessLevel(state: GameState): string {
  const s = state.player.vitals?.theSickness;

  if (s === undefined || s > 1975) {
    return "You don't seem to have contracted anything.";
  }
  if (s > 1900) {
    return "You feel a little bit tired, for some reason.";
  }
  if (s > 1700) {
    return "Something has you feeling just a little off, some kind of bug, maybe.";
  }
  if (s > 1500) {
    return "You seem to have come down with a case of the sniffles.";
  }
  if (s > 1200) {
    return "You seem to have come down with a cold or something.";
  }
  if (s > 900) {
    return "You seem to have come down with a bad cold or something.";
  }
  if (s > 700) {
    return "You seem to have come down with a severe cold or something.";
  }
  if (s > 500) {
    return "You've come down with some kind of illness that seems to be getting worse.";
  }
  if (s > 300) {
    return "You've come down with some kind of flu-like illness that is getting worse.";
  }
  if (s > 150) {
    return "You've contracted some kind of flu-like illness. Your condition is getting serious.";
  }
  if (s > 100) {
    return "You've contracted some kind of very serious illness. Your condition is getting critical.";
  }
  if (s > 50) {
    return "You've contracted some kind of deadly illness. Without medical attention of some kind, you're going to die.";
  }
  if (s > 25) {
    return "You've contracted a deadly illness and you are burning up with fever; without medication you won't have long to live.";
  }
  if (s > 0) {
    return "You've contracted a deadly illness which is entering its final stages; your tongue is swelling and you've developed an itching at the corners of the mouth and eyes.";
  }

  return "You've contracted a deadly illness which is entering its final stages...";
}

export function describeRadiationLevel(state: GameState): string {
  const re =
    state.player.statusEffects.filter((status: StatusEffect) => {
      return status.id === "radiation";
    }) ?? [];

  if (re.length === 0) {
    return "You have no signs of radiation exposure.";
  }

  const r = re[0];

  if (r.intensity <= 0) {
    return "You have no signs of radiation exposure.";
  }
  if (r.intensity < 10) {
    return "Your face and neck feel a little burned.";
  }
  if (r.intensity < 20) {
    return "Your face and neck feel a little burned and you feel a little tired.";
  }
  if (r.intensity < 30) {
    return "Your face and neck feel burned and you're starting to feel queasy.";
  }
  if (r.intensity < 40) {
    return "Your skin is starting to feel burned and itchy. You feel sick to your stomach.";
  }
  if (r.intensity < 50) {
    return "Your skin is starting to develop red blotches. You're starting to feel really sick.";
  }
  if (r.intensity < 60) {
    return "Your skin is starting to develop blisters. You feel really sick.";
  }
  if (r.intensity < 70) {
    return "Your skin is getting red and developing blisters. You feel weak and very nauseous.";
  }
  if (r.intensity < 80) {
    return "Your skin is blotchy and blistered and you're covered in sweat. Your hair is starting to fall out and you're sick to your stomach.";
  }
  if (r.intensity < 90) {
    return "Your skin is blotchy and blistered and sweat is pouring off you. Your hair is coming loose in clumps and you can barely keep from vomiting.";
  }
  return "Your skin is blotchy and blistered and sweat is pouring off you. Your hair is coming loose in clumps and you can barely keep from vomiting…";
}

export function describeBodyTemperatureLevel(state: GameState): string {
  const t = state.player.vitals.temperature ?? 98.6;

  if (t <= 89) {
    return "Your body has lost critical heat. You’re slipping toward hypothermia-induced unconsciousness.";
  }
  if (t < 92) {
    return "You’re shivering uncontrollably, fingers numb and clumsy. Thinking becomes slow and muddled.";
  }
  if (t < 95) {
    return "You’re shaking and disoriented. Your muscles ache from cold, and breathing feels shallow.";
  }
  if (t < 97) {
    return "You feel chilled to the core, skin cold and pale. You can’t seem to get warm.";
  }
  if (t < 99.5) {
    return "Your temperature feels normal.";
  }
  if (t < 101.5) {
    return "You feel warm and slightly flushed, with a dull ache behind the eyes.";
  }
  if (t < 103) {
    return "Your skin is hot and sweaty. Your head throbs, and you feel nauseous.";
  }
  if (t < 105) {
    return "Your body is overheating. You feel dizzy and weak, struggling to stay focused.";
  }
  if (t < 107) {
    return "Your fever is dangerously high. Every movement sends a pulse of pain through your skull.";
  }
  if (t < 110) {
    return "You are burning up, vision flickering at the edges. Your body is shutting down.";
  }

  return "Your core temperature is catastrophically elevated. Systems are failing. Death is imminent.";
}

export function describeCurrentEffects(state: GameState): string {
  const statusEffects = state.player.statusEffects ?? [];

  let effectsMsg = "";
  for (const statusEffect of statusEffects) {
    const effectId = statusEffect.id;
    switch (effectId) {
      case "death":
        effectsMsg +=
          "You are dead. Without intervention, you will remain so.\n";
        break;
      case "drunk":
        effectsMsg += "You are feeling a little tipsy from the alcohol.\n\n";
        break;
      case "superhorny":
        {
          const remainingTurns = statusEffect.remainingTurns ?? 0;
          if (remainingTurns > 49) {
            effectsMsg += "You're feeling a bit horny.\n";
          } else if (remainingTurns > 29) {
            effectsMsg += "You are really, REALLY horny.\n";
          } else if (remainingTurns > 19) {
            effectsMsg += "You're back to feeling just a bit horny.";
          } else if (remainingTurns > 2) {
            effectsMsg += "The horniness is leaving you...";
          }
        }
        break;
      case "explosive follicle growth":
        {
          const remainingTurns = statusEffect.remainingTurns ?? 0;
          if (remainingTurns === 3) {
            effectsMsg += "Your scalp is tingling.\n";
          } else if (remainingTurns === 2) {
            effectsMsg +=
              "Your scalp has begun to itch, and has spread to the rest of your body.\n";
          } else if (remainingTurns === 1) {
            effectsMsg +=
              "Every follicle you have deeply itches, and hair is visibly sprouting.";
          } else if (remainingTurns === 0) {
            effectsMsg += "The itching subsides...";
          }
        }
        break;
      case "trixophine":
        effectsMsg +=
          "Whatever was in that green serum has you fibbity FYING and rig-rig-riggety WRECKED! Colors are talking to you, sounds smell like tastes, the whole nine yards.\n";
        break;
      case "vanitrax":
        effectsMsg += "You are on vanitrax.\n";
        break;
      case "seritroxin":
        effectsMsg += "You are on seritroxin.\n";
        break;
      case "pentatrosin":
        effectsMsg += "You are on pentatrosin.\n";
        break;
      case "xantophol":
        effectsMsg += "You are on xantophol.\n";
        break;
      case "regenerationWoozies":
        effectsMsg +=
          "You feel a little discombobulated, with minor little aches and pains. Muscle ache? Gas? It doesn't seem serious.\n";
        break;
      case "nightvision-active":
        {
          const currentRoom = getCurrentRoom(state);
          if (state.worldState.darkRooms[currentRoom.id]) {
            effectsMsg +=
              "You're wearing night vision goggles, which allow you to see in the darkness.";
          } else {
            effectsMsg +=
              "You're wearing night vision goggles, but since there's plenty of light you're effectively blind.";
          }
        }
        break;
      default:
        break;
    }
  }
  return effectsMsg === "" ? "None." : effectsMsg;
}
