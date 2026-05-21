import {
  HAIRY_STATUS_MESSAGES,
  HORNY_STATUS_MESSAGES,
  PAIN_STATUS_MESSAGES,
  SMARTER_STATUS_MESSAGES,
  STRONGER_STATUS_MESSAGES,
} from "../text/messageMaps";
import type { GameState, StatusEffect } from "../types/gameTypes";
import { getCurrentRoom } from "./roomSelectors";

export type StatusEffectDiagnostic = {
  id: string;
  name: string;
  message: string;
  icon: StatusEffectIconId;
};

export type StatusEffectIconId =
  | "biohazard"
  | "bolt"
  | "bottle"
  | "brain"
  | "comb"
  | "cross"
  | "death-face"
  | "dna"
  | "droplet"
  | "eye"
  | "heart"
  | "no-eyes-smile"
  | "question-marks"
  | "radiation"
  | "space-bug"
  | "spiral"
  | "syndrome x"
  | "zzz";

const STATUS_EFFECT_LABELS: Record<
  string,
  { icon: StatusEffectIconId; name: string }
> = {
  bleeding: { icon: "cross", name: "Bleeding" },
  blind: { icon: "no-eyes-smile", name: "Blind" },
  death: { icon: "death-face", name: "Death" },
  dreaming: { icon: "zzz", name: "Dreaming" },
  drunk: { icon: "bottle", name: "Drunk" },
  "explosive follicle growth": {
    icon: "comb",
    name: "Explosive Follicle Growth",
  },
  innoculant: { icon: "dna", name: "Innoculant" },
  nanites: { icon: "space-bug", name: "Nanites" },
  "nightvision-active": { icon: "eye", name: "Night Vision" },
  none: { icon: "question-marks", name: "None" },
  pentatrosin: { icon: "biohazard", name: "Pentatrosin" },
  pheromoned: { icon: "heart", name: "Pheromoned" },
  possessed: { icon: "question-marks", name: "Possessed" },
  radiation: { icon: "radiation", name: "Radiation" },
  regenerationWoozies: { icon: "spiral", name: "Regeneration Woozies" },
  seritroxin: { icon: "biohazard", name: "Seritroxin" },
  smokeInhalation: { icon: "droplet", name: "Smoke Inhalation" },
  smarter: { icon: "brain", name: "Smarter" },
  stronger: { icon: "bolt", name: "Stronger" },
  supercontinent: { icon: "droplet", name: "Supercontinent" },
  hyperaroused: { icon: "droplet", name: "Hyperaroused" },
  trixophine: { icon: "spiral", name: "Trixophine" },
  vanitrax: { icon: "cross", name: "Vanitrax" },
  "syndrome x": { icon: "syndrome x", name: "Syndrome X" },
  xantophol: { icon: "zzz", name: "Xantophol" },
};

const FALLBACK_STATUS_EFFECT_MESSAGE =
  "No detailed diagnostic is available for this effect yet.";

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

function getFirstAndLastTurnStatusMessage(
  effect: StatusEffect,
  currentMove: number,
  messages: { first: string; last: string },
): string | null {
  if (effect.remainingTurns == null) return null;

  if (effect.startedAtMove === currentMove) {
    return messages.first;
  }

  if (effect.remainingTurns === 1) {
    return messages.last;
  }

  return null;
}

export function getSmarterStatusMessage(
  effect: StatusEffect,
  currentMove: number,
): string | null {
  return getFirstAndLastTurnStatusMessage(
    effect,
    currentMove,
    SMARTER_STATUS_MESSAGES,
  );
}

export function getStrongerStatusMessage(
  effect: StatusEffect,
  currentMove: number,
): string | null {
  return getFirstAndLastTurnStatusMessage(
    effect,
    currentMove,
    STRONGER_STATUS_MESSAGES,
  );
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
  const diagnostics = getStatusEffectDiagnostics(state);

  return diagnostics.length === 0
    ? "None."
    : diagnostics.map((diagnostic) => diagnostic.message).join("\n\n");
}

function getStatusEffectLabel(effect: StatusEffect) {
  return (
    STATUS_EFFECT_LABELS[effect.id] ?? {
      icon: "question-marks",
      name: effect.id,
    }
  );
}

function describeStatusEffect(
  state: GameState,
  statusEffect: StatusEffect,
): string | null {
  switch (statusEffect.id) {
    case "none":
      return null;
    case "death":
      return "You are dead. Without intervention, you will remain so.";
    case "drunk":
      return "You have been drinking alcohol. Was it too much?";
    case "radiation":
      return describeRadiationLevel(state);
    case "hyperaroused": {
      const remainingTurns = statusEffect.remainingTurns ?? 0;
      if (remainingTurns > 49) return "You're feeling a bit horny.";
      if (remainingTurns > 29) return "You are really, REALLY horny.";
      if (remainingTurns > 19)
        return "You're back to feeling just a bit horny.";
      if (remainingTurns > 2) return "The horniness is leaving you...";
      return null;
    }
    case "explosive follicle growth": {
      const remainingTurns = statusEffect.remainingTurns ?? 0;
      if (remainingTurns === 3) return "Your scalp is tingling.";
      if (remainingTurns === 2) {
        return "Your scalp has begun to itch, and has spread to the rest of your body.";
      }
      if (remainingTurns === 1) {
        return "Every follicle you have deeply itches, and hair is visibly sprouting.";
      }
      if (remainingTurns === 0) return "The itching subsides...";
      return null;
    }
    case "trixophine":
      return "Symptoms include euphoria, hallucination, and delirium.";
    case "vanitrax":
      return "You are on vanitrax.";
    case "seritroxin":
      return "You are on seritroxin.";
    case "pentatrosin":
      return "I don't think you were meant to take this...";
    case "xantophol":
      return "You are on xantophol.";
    case "regenerationWoozies":
      return "You feel a little discombobulated, with minor little aches and pains. Muscle ache? Gas? It doesn't seem serious.";
    case "smarter":
      return "Your mind...it's full of stars...";
    case "stronger":
      return "You STRONG.";
    case "supercontinent":
      return "Your bladder feels geologically stable.";
    case "nightvision-active": {
      const currentRoom = getCurrentRoom(state);
      return state.worldState.darkRooms[currentRoom.id]
        ? "You're wearing night vision goggles, which allow you to see in the darkness."
        : "You're wearing night vision goggles, but since there's plenty of light you're effectively blind.";
    }
    default:
      return null;
  }
}

export function getStatusEffectDiagnostics(
  state: GameState,
): StatusEffectDiagnostic[] {
  return (state.player.statusEffects ?? []).flatMap((statusEffect) => {
    if (statusEffect.id === "none") return [];

    const message =
      describeStatusEffect(state, statusEffect) ??
      FALLBACK_STATUS_EFFECT_MESSAGE;

    const label = getStatusEffectLabel(statusEffect);
    return [
      {
        id: statusEffect.id,
        name: label.name,
        message,
        icon: label.icon,
      },
    ];
  });
}
