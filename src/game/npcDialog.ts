import { normalize } from "@game/rules/scope";
import { YOU_FIRST_CONTACT_ID } from "@game/npcRegistry";
import type { NpcDialog, NpcDialogEntry } from "@game/types/npcTypes";

const RADIO_ASK_ALIASES: Record<string, string[]> = {
  bug: ["spider", "husk", "itsy bitsy spider"],
  ["what fuck"]: ["what hell"],
  ["where we are"]: ["where are we"],
  ["dark"]: ["darkness", "dark areas", "dark rooms"],
  ["name"]: ["his name", "for name"],
  ["himself"]: ["where are you", "where he is"],
  ["what to do"]: ["what should I do", "what I should do", "what do I do"],
  ["supervisor"]: ["control room supervisor", "power supervisor"],
  ["steel door"]: ["heavy door", "polished door", "polished steel door"],
  ["moan"]: [
    "wail",
    "weird sound",
    "weird noise",
    "stairwell noise",
    "stairwell sound",
  ],
  pass: ["park pass"],
};

export function resolveAskTopic(raw: string) {
  const t = normalize(raw);
  // if t is already a canonical topic, return it
  if (RADIO_ASK_ALIASES[t]) return t;
  // otherwise check aliases to find the canonical topic
  for (const topicKey of Object.keys(RADIO_ASK_ALIASES)) {
    if (RADIO_ASK_ALIASES[topicKey].includes(t)) return topicKey;
  }
  return t;
}

export function getNpcAskReply(dialog: NpcDialogEntry, topic: string) {
  const key = resolveAskTopic(topic);
  return dialog.ask[key];
}

export const NPC_DIALOG: NpcDialog = {
  [YOU_FIRST_CONTACT_ID]: {
    ask: {
      ["what fuck"]: `"I don't know man...but I'm pretty sure that if we don't get things back on track...we are effed in the A..."`,
      ["where we are"]: `"My memory is totally fried...some kind of facility (cough) but I know this place, I know where we are I just can't place it..."`,
      ["reactor"]: `"It's unstable...you can reset it...but first...you need to get the power on..."`,
      ["power"]: `"Something must have overloaded...the Control Room Supervisor should have...the reset key..."`,
      ["reset key"]: `"Yeah it's like a manual override...it should cut everything over (cough) you just need to find it..."`,
      ["plumbus"]: `"Yeah, I don't know man...I think it's just a regular old plumbus..."`,
      ["name"]: `My name's Mox (cough) at least...I think it is (cough) ...I'm ninety percent sure my name is (cough) Mox...`,
      ["dark"]: `Yeah stay out of the dark (cough)...I don't know what it is but there's some kind of organism in here with us...it won't come into the light (cough)...`,
      ["organism"]: `Well, I say that (cough)...I don't know what it is...but if it touches you...you're a dead man (cough)...`,
      ["himself"]: `I managed to get onto the floor where the reactor is (cough)...I was (cough) searching the warehouse when (cough)...collapsed...I'm pinned under (cough) a shit ton of crates...I don't think I'm gonna make it...`,
      ["what happened"]: `No idea (cough) it was like this when I woke up...(cough) whatever happened it wiped out most everybody...it's like a (cough) freakin' graveyard in here...`,
      ["me"]: `I wish I knew more (cough)...I woke up just like you (cough cough)...we're not the first...I think we're supposed to (cough) fix this...`,
      ["what to do"]: `Don't bother coming to the...reactor (cough) until you get the...power back on (cough) ...the lights went out down here, you gotta get them back (cough) on. Some floors...need a security badge...(cough) but there's housing on the (cough) third floor...should be clear...start there...`,
      ["bug"]: `I found one of those, too (cough)...right near where I woke up...whatever it is (cough)...I don't think it's a real bug...it's mechanical (cough) with some kind of biological (cough) payload...`,
      ["key"]: `Any key in particular..?`,
      ["supervisor"]: `I don't remember his name (cough) but he'd have the key...you gotta find him, or (cough) at least his body...(cough) check his quarters, too...`,
      ["moan"]: `Oh crap, are you in the stairwell (cough)? I heard that too, creepy as hell... (cough) (cough)...I never figured out what was making it...`,
    },
    tell: {
      ["bug"]: `"Shit, no way (cough)...I found one when I woke up too..."`,
      ["steel door"]: `"Huh, I don't know man (cough), it sounds like it won't open for a reason..."`,
    },
    ping: [
      `"Hey...you still there..?`,
      `"You still there, man..?`,
      `"Hey...can you still hear me..?`,
    ],
    signOff: `(cough) (cough) ...looks like you're gonna be on your own from here out...(cough) wish I could help you more...(cough) good luck, man...`,
  },
  RangerBot: {
    ask: {
      ["hours"]: `The park is available around the clock, the only requirement being a valid park pass.`,
      ["pass"]: `If you don't have a valid park pass, you can request one from Park Services. Current wait time is estimated to be: *Infinite Number*`,
    },
    tell: {},
  },
};
