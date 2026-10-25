import { useEffect, useState, useSyncExternalStore } from "react";
import {
  GOSSIP_REACTIONS,
  GOSSIP_SPINNER_DURATION_MS,
  GOSSIP_SPINNER_FRAME_MS,
} from "./gossipReactions";

const motionQuery = "(prefers-reduced-motion: reduce)";
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function subscribeToMotionPreference(onChange: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function prefersReducedMotion() {
  return window.matchMedia(motionQuery).matches;
}

function scramble(reaction: string, revealed = 0) {
  return Array.from(reaction, (letter, index) =>
    index < revealed || letter === "!"
      ? letter
      : letters[Math.floor(Math.random() * letters.length)],
  ).join("");
}

function ReactionWord({ animate, effectsEnabled }: { animate: boolean; effectsEnabled: boolean }) {
  const reducedMotion = useSyncExternalStore(subscribeToMotionPreference, prefersReducedMotion, () => true);
  const [reaction] = useState(() => animate
    ? GOSSIP_REACTIONS[Math.floor(Math.random() * GOSSIP_REACTIONS.length)]
    : "");
  const shouldAnimate = animate && effectsEnabled && !reducedMotion;
  const [frame, setFrame] = useState(() => ({
    text: shouldAnimate ? scramble(reaction) : reaction,
    spinning: shouldAnimate,
  }));

  // Once motion is disabled, keep this transmission resolved until a new share.
  if (!shouldAnimate && frame.spinning) {
    setFrame({ text: reaction, spinning: false });
  }

  useEffect(() => {
    if (!shouldAnimate || !frame.spinning) return;
    let elapsed = 0;
    const timer = window.setInterval(() => {
      elapsed += GOSSIP_SPINNER_FRAME_MS;
      const finished = elapsed >= GOSSIP_SPINNER_DURATION_MS;
      // Start with a short scramble, then decode from left to right.
      const revealed = Math.floor(Math.max(0, (elapsed / GOSSIP_SPINNER_DURATION_MS - 0.2) / 0.8) * reaction.length);
      setFrame({ text: finished ? reaction : scramble(reaction, revealed), spinning: !finished });
      if (finished) window.clearInterval(timer);
    }, GOSSIP_SPINNER_FRAME_MS);
    return () => window.clearInterval(timer);
  }, [reaction, shouldAnimate, frame.spinning]);

  const spinning = shouldAnimate && frame.spinning;
  return (
    <div className="information-exchange-reaction" data-spinning={spinning}>
      <span aria-hidden="true">{spinning ? frame.text : reaction}</span>
      <span className="information-exchange-sr-only" role="status" aria-live="polite" aria-atomic="true">
        {spinning ? "Receiving gossip" : reaction}
      </span>
    </div>
  );
}

export function GossipReactionDisplay({ sharedIds, effectsEnabled }: {
  sharedIds: string[];
  effectsEnabled: boolean;
}) {
  const [initialIds] = useState(() => new Set(sharedIds));
  const hasNewShare = sharedIds.some(id => !initialIds.has(id));
  // A new accepted ID remounts only this visual. Rejected/repeated submissions and
  // ordinary game renders leave the current word and animation undisturbed.
  return <ReactionWord key={JSON.stringify(sharedIds)} animate={hasNewShare} effectsEnabled={effectsEnabled} />;
}
