import type { InformationExchangeDefinition } from "@game/types/npcTypes";

export const NAILBOT_PAYMENT_TRIGGER = "NailBotVoucherRedeemed";

export const nailBotExchange: InformationExchangeDefinition = {
  paymentTrigger: NAILBOT_PAYMENT_TRIGGER,
  refusals: [
    `The robot swivels its head just enough to glance in your direction.\n\n"Nice outfit," it says. "Do you have an appointment, coupon, or voucher?"`,
    `"There have been some openings, what with so many clients being dead," the robot muses, "but you still need either an appointment, coupon, or voucher."`,
    `The robot arches one digital eyebrow.\n\n"I don't suppose you have an appointment, a coupon, or a voucher?"`,
    `"Sorry, dear," the robot says. "I don't make the rules. I can't do any work without an appointment, a coupon, or a voucher."`,
  ],
  greeting: `The robot snatches the voucher away then peers down at it for a moment.\n\n"Excellent!" it beams, now turning its full attention to you. "Now, how can I spoil you today? Mani? Pedi? Happy ending? Ha ha just kidding, can you imagine if I was like that? I don't suppose you've got any juicy gossip? It's been so quiet since everybody died, I'm desperate for some tea."`,
  responses: {
    "horny clone":
      "See, I knew there was something going on there. Those three are supposed to be all androgynous and whatnot, but I knew there was something off about that green one. That one peeks through cracks.",
    "nursery mishap":
      "That is honestly terrible. That's why I stick to nails, it's not just because I'm a robot specifically designed and built to be a nail technician, I couldn't handle the stress. It's never life and death here, you know? I could accidentally sever your whole hand and they could just grow you a new one in the tissue vats ha ha just kidding.",
    "steam room coverup":
      "See, this is why you guys are all dead now. You haven't even gotten to the new world yet and you're already trying to blow it.",
    gossip_hiding_robot:
      "That poor robot could really use somebody to talk to. Try that whistle when you get to the warehouse, he'll come out.",
  },
  fallbackResponse: "Well, well, isn't that a fresh little scandal!",
  secretTransition:
    "I can not thank you enough, I swear after such a dry spell this was an oasis in the desert. Now, fair's fair, so let me tell you a little something you didn't know, and I've even got a little something you'll need, to go with it.",
};
