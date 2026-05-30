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
    return "You feel totally normal.";
  }
  if (s > 1900) {
    return "You feel normal, why wouldn't you feel normal?";
  }
  if (s > 1700) {
    return "You feel normal, just a little off. It's normal to feel a little off, sometimes.";
  }
  if (s > 1500) {
    return "You feel normal, just a little off, as well as experiencing the occasional bright white spot in your field of vision that swims away.";
  }
  if (s > 1200) {
    return "You feel fine, except for those bright white spots that keep swimming around in the air in front of you, and a persistent feeling that something isn't quite right.";
  }
  if (s > 900) {
    return "The swimming white spots have been joined by an occasional humming sound that persists even when you plug your ears, but you feel okay, except for the unease and the light sweating.";
  }
  if (s > 700) {
    return "The white lights are beginning to form patterns, and the humming sound in your ears has been joined by what sounds like faint, indecipherable chattering. You still feel mostly okay except for the increasing sense of unease, increased sweating, and worsening muscle tics.";
  }
  if (s > 500) {
    return "The patterns in the swimming white lights shift at regular intervals, as the faint chattering grows louder, and more clear, but you can't understand it. You've developed a persistent sense that a presence is behind you, just out of your sight, as sweat runs down your face and neck, and the muscle tics intensify.";
  }
  if (s > 300) {
    return "The patterns in the white lights are repeating, you're sure of it, and the chattering is very clear now but it's not in your ears it's in your head, and not in any language you understand. Something is nearby, behind you, or maybe right in front of you but just out of phase, and is attempting to make some kind of connection, triggering the tics that now twitch in every muscle of your body.";
  }
  if (s > 150) {
    return "The sweat has dried up, leaving your mouth dry and your face hot. The patterns of white light have grown dimmer but the chatter in your head has grown stronger, and the presence how feels as though it's sharing your skin, its chattering filling your head. The connection it pushes to make is intrusive and unrelenting, and the constant overlapping tics make it feel as though the blood in your muscles is boiling.";
  }
  if (s > 100) {
    return "You're as dry as a bone, your throat raw. The swimming light patterns have disappeared but you get the sense they're still there, you just can't see them anymore. With each new thread of the connection formed you feel more and more like the presence is slipping into your body like it's some kind of suit. The chattering has grown softer but like the swimming lights, you sense that the intensity of it has if anything grown.";
  }
  if (s > 50) {
    return "Your body has grown hot, and parched. Your throat is raw and it hurts to try and swallow. The swimming lights are gone, and the chattering voice is, too. The presence is so close now that it's hard to tell who's who anymore as the last of the connection's threads form.";
  }
  if (s > 25) {
    return "Your body temperature has unexpectedly, abruptly dropped back into the normal range. With the lights and sounds having faded, you feel, at the moment, pretty normal.";
  }
  if (s > 0) {
    return "You feel totally normal. Maybe you feel even better than normal, as the last of the connection's threads form.";
  }

  return "It's inside, now. Don't think about it...";
}

function describeSyndromeXStatusEffect(state: GameState): string {
  const s = state.player.vitals?.theSickness;

  if (s === undefined || s > 1700) return "???";
  if (s > 1500) return "Mild photopsia";
  if (s > 1200) return "Photopsia, anxiety";
  if (s > 900) return "Photpsia, anxiety. Auditory hallucinations";
  if (s > 500) {
    return "Photopsia, anxiety. Auditory hallucinations. Muscle tics.";
  }
  if (s > 150) return "I think something's knocking...";
  if (s > 25) return "Whatever was knocking, it's coming in...";
  return "Benign";
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
    return "Your skin is hot and achy. Your head throbs, and you feel nauseous.";
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
    case "syndrome x":
      return describeSyndromeXStatusEffect(state);
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
