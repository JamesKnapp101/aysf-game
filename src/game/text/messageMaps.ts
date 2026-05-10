export function pickRandomFromMsgArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const PAIN_STATUS_MESSAGES: Record<number, string> = {
  16: "You feel some minor, shooting pains in your joints and muscles...",
  9: "You feel another twinge of stabbing pain in your muscles. There is some minor discomfort in your gut somewhere...",
  3: "You feel your body starting to relax. The pains are going away.",
  0: "Whatever was causing it, the pain seems to be gone now.",
};

export const HORNY_STATUS_MESSAGES: Record<number, string> = {
  68: "Hm, whatever was in that chewable has got you feeling a little hot and bothered...",
  49: "Whoo, there was definitely something in that chewable! Hot fire down below..!",
  29: "Wait, the chewable is letting up a little...you feel a little less antsy in your pantsy, but not by much.",
  19: "You feel manageably horny.",
  0: "Okay, whew! Your motor has stopped revving, at least to that weird degree...",
};

export const HAIRY_STATUS_MESSAGES: Record<number, string> = {
  4: "You are overcome by a strange sensation, as your scalp begins to tingle, then your eyebrows.",
  3: "The tingling turns to an itch as it spreads from your scalp, then down your chest, arms, and legs, even your crotch!",
  2: "The itch peaks, becoming almost unbearable as hair begins to visibly push from every follicle you have.",
  1: "Finally, all at once, the itching stops. You can feel hair on your scalp now, and stubble on your face. Even your body hair is back, and more lush than ever!",
};

export const SMARTER_STATUS_MESSAGES = {
  first:
    "You feel a strange tingle that travels up your spine and into your head, then all at once you feel your mind expand, opening new levels of thought and understanding...",
  last:
    "Your newfound enlightenment warbles at the edges, then collapses, shrinking back to its original size. Man, that did not last long!",
} as const;

export const STRONGER_STATUS_MESSAGES = {
  first:
    "You feel a warmth flooding through you, swelling in your chest, then down your core, arms, and legs. You feel a deep sensation as if every muscle in your body is getting the most satisfying stretch of its life as your body swells, shoulders broadening, and muscles hardening. It stops short of turning you into a hulk, but within seconds you've transformed into a very muscular man. You've never felt so strong in your life!",
  last:
    "You feel a twitch in your shoulder, then your thighs, then your biceps, then everywhere until all of your newfound muscle shrinks back to where it started.",
} as const;

export const TRIXOPHINE_MESSAGES: string[] = [
  `Your cat walks into the room and marches up to you. "If you see the dog," it hisses, "tell that bitch I'm looking for her!" It storms out of the room.`,
  `You notice movement out of the corner of your eye, and turn in time to see a small spider monkey scamper over to you. "You have to help me!" it whispers, "The captain is secretly spiking the mess hall's chili con carne with refined dopamine milked from his secret army of monkey slaves! If the plan succeeds, then—" It glances over its shoulder. "...they found me, I have to go!" The monkey scampers away.`,
  `You notice something move and turn just in time to see two gorillas wearing speedos walk into the room holding hands. They stop when they see you. "Sorry," the one on the left says, "we didn't know you were in here." They turn and leave the way they came in.`,
  `Your dog walks into the room and marches up to you. "If you see the cat," it growls, "tell that pussy I'm looking for him!" It storms out of the room.`,
  `A spider monkey comes running into the room, its eyes wild. It shakes its little fists in the air. "It's monkeys... it's all monkeys!!" it rants, eyes clenched shut and teeth bared, "the mess hall dinner rolls are made of monkeeeeys!" It tears out of the room, wailing.`,
  `Your junior prom date walks into the room and marches up to you. "Look, I admitted to you that I stuffed... the least you can do is admit it too!" Stuffed? You try and remember... did you stuff? Do you stuff? Maybe you're stuffed right now... You glance down for a second to check and when you look up, no one is there.`,
  `A hot dog wearing a bow tie peeks its head in. "Psst! Hey, don't tell that bitch where I am!" It backs out of the room.`,
  `A hot dog bun wearing a corsage peeks its head in. "Excuse me, I don't suppose you've seen a... er, never mind." It backs out of the room.`,
  `A voice chimes in over the intercom: "Listen up! I am stinking drunk, and I don't care who knows it! You want to report it, FINE. I'm the captain, you can report it to me. I assure you I will look into it. By the way, YOUR eyes look a little red... what have you been into? Whatever it is, I want in; report to my ready room immediately and I'll have 12ccs of whatever you're having. Actually make mine a double. That's an order, soldier. Chop chop. Over and out."`,
  `A voice chimes in over the intercom: "Listen up! This is the captain and I've finally had it with the lot of you! I've decided to end it all by way of excessive pepito ingestion. I am not to be disturbed for the next 72 hours. Over."`,
  `You hear a soft *pop* and look down to see that some kind of small flowering plant has sprouted up out of the deck.`,
  `A voice whispers softly in your ear: "Don't give up... I know you're confused, but you can do it... you can save us all..."`,
  `You notice movement out of the corner of your eye, and turn in time to see a small spider monkey scamper over to you. "You have to help me!" it whispers, "The captain is using my genitals as a transmitter to beam secret messages to a trans-dimensional race of alien pod people! I—" It glances over its shoulder. "...they found me, I have to go!" The monkey scampers away.`,
  `You notice movement out of the corner of your eye, and turn in time to see a small spider monkey scamper over to you. "You have to help me!" it whispers, "The captain has poisoned the ship's water supply with a secretly developed chemical extracted from vegetarian monkey milk! If the plan succeeds, then—" It glances over its shoulder. "...they found me, I have to go!" The monkey scampers away.`,
  `You notice movement out of the corner of your eye, and turn in time to see a small spider monkey scamper over to you. "You have to help me!" it whispers, "The captain has been secretly replaced with a human-like android created by a secret faction of rebel supermodel clones! If the plan succeeds, then—" It glances over its shoulder. "...they found me, I have to go!" The monkey scampers away.`,
  `You notice movement out of the corner of your eye, and turn in time to see a small spider monkey scamper over to you. "You have to help me!" it whispers, "The captain is secretly hoarding a stockpile of concentrated monkey dander which illegally acquired alien technology will convert into a quantum singularity! If the plan succeeds, then—" It glances over its shoulder. "...they found me, I have to go!" The monkey scampers away.`,
  `You feel dizzy for a moment, and begin to reel... You regain your balance and clench your eyes shut. For just a moment you get a very clear vision of a person with two thumbs ringing a doorbell, then it fades.`,
  `...It suddenly occurs to you: why don't people have tails? When you think about it, most mammals have tails... don't they? Why not people? The least we could have gotten was some kind of bright blue or red ass like those baboons have...`,
  `You burst into laughter, causing milk to squirt out of your nose! ...Wait a minute, you weren't drinking milk... wait a minute, the milk is gone... woah.`,
  `You burst into a fit of giggling for no apparent reason.`,
  `You catch movement out of the corner of your eye, and turn to see a group of people standing there... their skin is red, their hair is red, their nails and teeth are red and they're dressed all in red... they're just acting normally, though... it's like they don't know that they're red...`,
  `You never really noticed it before, but the surface of your hand is REALLY interesting... If the little blue veins down by your wrist were tributaries and the heel of your palm were a mountain range, then the palm of your hand would be like this huge valley with canals branching out everywhere, just like on Mars... In fact, maybe it is like Mars... For all you know there could be a tiny race of hand martians living in the canals of your palms RIGHT THIS SECOND. You wonder how they handle sweat, or even worse, showers... Wait a minute... what were you thinking about again?`,
  `Man, you just feel so... FUNKY.`,
  `A little leprechaun appears in midair. He is facing the wall and urinating a rainbow in the corner. When he finishes, he shakes (causing little four-leaf clovers to drop), zips, tips his hat to you, and disappears.`,
  `A voice chimes in over the intercom: "Attention, this is the captain. Apparently a small spider monkey has infiltrated the ship and is currently approaching people at random with the intent to undermine my command. If you encounter this monkey, ignore it, and report it immediately. Repeat: do not listen to the monkey. That is all."`,
];
