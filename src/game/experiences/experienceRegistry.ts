import { movePlayerToRoom } from "@game/helpers/gameHelpers";
import { collectTeaResult, queueGossipNotification } from "@game/rules/gossip";
import { updateItemLocation } from "@game/rules/items";
import { triggerScoreOnce } from "@game/rules/score";
import { addToInventory } from "@game/rules/state";
import { getCurrentScore } from "@game/selectors/scoreSelectors";
import type {
  ActiveExperience,
  ExperienceKind,
  GameState,
  JuicyTopic,
} from "@game/types/gameTypes";

type ExperienceStageContext = {
  activeExperience: ActiveExperience;
  experienceId: string;
  stage: ExperienceStageDefinition;
  stageIndex: number;
};

type ExperienceStageEventContext = ExperienceStageContext & {
  elapsedTurns: number;
  turnsRemaining: number;
};

type ExperienceStageEventDefinition = {
  atElapsedTurns?: number;
  atTurnsRemaining?: number;
  id: string;
  message?:
    | string
    | ((
        state: GameState,
        ctx: ExperienceStageEventContext,
      ) => string | undefined);
  overheardTea?: JuicyTopic[];
  run?: (state: GameState, ctx: ExperienceStageEventContext) => GameState;
  when?: (state: GameState, ctx: ExperienceStageEventContext) => boolean;
};

type ExperienceStageDefinition = {
  durationTurns: number;
  entryMessage?: string;
  enter?: (state: GameState, ctx: ExperienceStageContext) => GameState;
  events?: ExperienceStageEventDefinition[];
  roomId: string;
};

type ExperienceDefinition = {
  abortMessage?: string;
  complete?: (state: GameState) => GameState;
  completeMessage?: string;
  id: string;
  kind: ExperienceKind;
  stages: ExperienceStageDefinition[];
  startMessage?: string;
  transitionMessage?: string;
};

const HALVED_CORPSE_MEMORY_ROOM_ID = "HalvedCorpseMemory";
const LIL_LILLY_MEMORY_NPC_ID = "LilLillyCorridorThree";
const SPIN_INSTRUCTOR_MEMORY_ROOM_ID = "SpinInstructorSpinStageMemory";
const SPIN_INSTRUCTOR_MEMORY_ITEM_ID = "SpinInstructor";
const CRUSHED_WEIGHTLIFTER_MEMORY_ROOM_ID = "CrushedWeightlifterGymMemory";
const CRUSHED_WEIGHTLIFTER_MEMORY_ITEM_ID = "CrushedWeightlifter";
const CRUSHED_WEIGHTLIFTER_MEMORY_SPOTBOT_ITEM_ID =
  "CrushedWeightlifterMemorySpotBot";
const BAR_BASEMENT_HEAD_MEMORY_ROOM_ID = "BarBasementHeadMemory";
const BAR_BASEMENT_HEAD_MEMORY_ROOM_ID2 = "BarBasementHeadMemory2";
const BAR_VISION_QUEST_ROOM_ID = "BarVisionQuest";
const BAR_VISION_QUEST_PRIZE_ITEM_ID = "TShirtPrize";
const BAR_VISION_QUEST_SCORE_ID = "completed_vision_quest";

const NURSERY_MISHAP_GOSSIP: JuicyTopic = {
  id: "nursery mishap",
  title: "Lil-Lilly Tendwick made a costly mistake at the Aquarium",
  summary:
    "Lil-Lilly Tendwick apparently set the water temperature incorrectly at the aquarium's octopus nursery, with unfortunate results.",
  tags: [],
  type: "gossip",
};

function setRoomDarkness(
  state: GameState,
  roomId: string,
  isDark: boolean,
): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      darkRooms: {
        ...state.worldState.darkRooms,
        [roomId]: isDark,
      },
    },
  };
}

function completeBarVisionQuest(state: GameState): GameState {
  let next = triggerScoreOnce(state, BAR_VISION_QUEST_SCORE_ID);
  next = updateItemLocation(next, BAR_VISION_QUEST_PRIZE_ITEM_ID, "INVENTORY");
  next = addToInventory(next, BAR_VISION_QUEST_PRIZE_ITEM_ID);
  const score = getCurrentScore(next);
  return score === next.score ? next : { ...next, score };
}

const EXPERIENCE_DEFINITIONS: Record<string, ExperienceDefinition> = {
  fallen_corpse_memory: {
    abortMessage:
      "You seize the edge of the memory and pull yourself free. The stairwell snaps back into place around you.",
    completeMessage: `"Shit, we're here," the man says, looking down.\n\nYou look down as well in time to see the floor rush up to meet you, then the memory collapses in a white flash, and the stairwell snaps back into place around you.`,
    id: "fallen_corpse_memory",
    kind: "memory",
    stages: [{ durationTurns: 3, roomId: "FallenCorpseMemory" }],
    startMessage: `As the barrel drifts to the corpse's head the device emits a beep, then a tiny voice.\n\n"Subject deceased, extractor activated. Initiate tissue sample liquification..."\n\nA translucent beam flares from the scanner, making the skull light up from the inside like a flashbulb and leaving a lingering, eggy smell in the air.\n\n"Viable topology found. Reconstructing memory..."\n\nThe stairwell peels away as the memory takes hold...`,
  },
  halved_corpse_memory: {
    abortMessage:
      "You seize the edge of the memory and pull yourself free. The hallway snaps back into place around you.",
    completeMessage: `In the dark, Lil-Lilly makes it only a few steps before something inside the room whips past you and you hear a wet crunch from near the doorway, a strangled cry cut short, then a second later the lights snap back on again. When your eyes adjust you can see the woman's torso laying in the hallway outside the door. It all happened in an instant. The memory collapses in a white flash and the hallway snaps back into place around you.`,
    id: "halved_corpse_memory",
    kind: "memory",
    stages: [
      {
        durationTurns: 3,
        enter: (state) => {
          let next = setRoomDarkness(
            state,
            HALVED_CORPSE_MEMORY_ROOM_ID,
            false,
          );
          next = updateItemLocation(
            next,
            LIL_LILLY_MEMORY_NPC_ID,
            HALVED_CORPSE_MEMORY_ROOM_ID,
          );
          return next;
        },
        events: [
          {
            atElapsedTurns: 1,
            id: "gossip",
            message: `\n"Just go," the man says, not moving from the doorway. "For your own safety, I'm begging you."\n\n"Is that a threat?" the woman asks, incredulous.\n\n"A warning," he says. "Lil, we're all in grave danger, leave now."\n\nThe woman's eyes narrow.\n\n"What are you hiding in there?" she asks.\n\n"Leave!" the man barks. "Just go, or...I'll tell Zoology you're the one who set the wrong temperature in the octopus nursery."\n\nThe woman's face turns pale, and her eyes begin to glisten.\n\n"That was an accident," she says, before backtracking. "I mean, I don't know what you're talking about."`,
            overheardTea: [NURSERY_MISHAP_GOSSIP],
          },
          {
            atElapsedTurns: 2,
            id: "blackout",
            message: `\nThe lights go out with a hard electrical snap. For one frozen second the living area is only afterimage and startled breathing. Somewhere close, you hear Lil-Lilly whisper to herself.\n\n"What is that?"\n\nYou hear her stumble for the doorway.`,
            run: (state) => {
              let next = setRoomDarkness(
                state,
                HALVED_CORPSE_MEMORY_ROOM_ID,
                true,
              );
              next = updateItemLocation(
                next,
                LIL_LILLY_MEMORY_NPC_ID,
                "NOWHERE",
              );
              return next;
            },
          },
        ],
        roomId: HALVED_CORPSE_MEMORY_ROOM_ID,
      },
    ],
    startMessage: `As the barrel drifts to the corpse's head the device emits a beep, then a tiny voice.\n\n"Subject deceased, extractor activated. Initiate tissue sample liquification..."\n\nA translucent beam flares from the scanner, making the skull light up from the inside like a flashbulb and leaving a lingering, eggy smell in the air.\n\n"Viable topology found. Reconstructing memory..."\n\nThe hallway peels away as the memory takes hold...`,
  },
  spin_corpse_memory: {
    abortMessage:
      "You seize the edge of the memory and pull yourself free. The gymnasium snaps back into place around you, and you're back up on the spin stage.",
    completeMessage: `As the instructor sits locked onto the electric bike with her eyes bulging, a thin thread of smoke begins to snake upward from the top of her head then the memory collapses in a white flash, and the gymnasium snaps back into place around you.`,
    id: "spin_corpse_memory",
    kind: "memory",
    stages: [
      {
        durationTurns: 3,
        enter: (state) =>
          updateItemLocation(
            state,
            SPIN_INSTRUCTOR_MEMORY_ITEM_ID,
            SPIN_INSTRUCTOR_MEMORY_ROOM_ID,
          ),
        roomId: SPIN_INSTRUCTOR_MEMORY_ROOM_ID,
        events: [
          {
            atElapsedTurns: 2,
            id: "incident-flashback",
            message: `\n\nA loud boom sounds, sending vibrations through the floor! You hear the clang of heavy weights slamming down on the mat, and screams, followed by a voice cutting in over a loudspeaker.\n\n"Warning," it states. "Electrical failure."\n\n"What was that?" someone shouts.`,
          },
        ],
      },
    ],
    startMessage: `As the barrel drifts to the corpse's head the device emits a beep, then a tiny voice.\n\n"Subject deceased, extractor activated. Initiate tissue sample liquification..."\n\nA translucent beam flares from the scanner, making the skull light up from the inside like a flashbulb and leaving a lingering, eggy smell in the air.\n\n"Viable topology found. Reconstructing memory..."\n\nThe stage, and the rest of the gymnasium, peel away as the memory takes hold...`,
  },
  barbell_corpse_memory: {
    abortMessage:
      "You seize the edge of the memory and pull yourself free. The gymnasium snaps back into place around you, and you're back among the racks of weights.",
    completeMessage: `"Sh-shit!" the man grunts, and his eyes turn scared.\n\nHis left leg buckles, just a little, but enough to bring everything down. His body folds, landing hard on his back with the barbell close behind. The bar crushes his ribcage as the huge weights crash down onto the floor, causing his eyes and neck veins to bulge.\n\n"You good, bro?" the robot asks, then the memory collapses in a white flash, and the gymnasium snaps back into place around you.`,
    id: "barbell_corpse_memory",
    kind: "memory",
    stages: [
      {
        durationTurns: 4,
        enter: (state) => {
          let next = updateItemLocation(
            state,
            CRUSHED_WEIGHTLIFTER_MEMORY_ITEM_ID,
            CRUSHED_WEIGHTLIFTER_MEMORY_ROOM_ID,
          );
          next = updateItemLocation(
            next,
            CRUSHED_WEIGHTLIFTER_MEMORY_SPOTBOT_ITEM_ID,
            CRUSHED_WEIGHTLIFTER_MEMORY_ROOM_ID,
          );
          return next;
        },
        events: [
          {
            atElapsedTurns: 1,
            id: "spotbot-check-one",
            message: `A loud boom from somewhere causes the floor to shake, and the many racks of weights to rattle. The lurch is just enough to put the man off his balance, and he quickly adjusts, keeping the massive weight over his head.\n\n"You got this, bro?" the robot asks.\n\nThe man nods, but keeps the barbell locked overhead, jaw clenched, breath coming in hard bursts, and you notice a pinhole in the back of his neck that has leaked a single drop of blood, tracing a red line down his sweaty back. In the background, you hear a commotion of some sort.`,
          },
          {
            atElapsedTurns: 2,
            id: "spotbot-check-two",
            message: `"Can't...move..." the man gasps, his eyes growing concerned as the commotion intensifies.\n\n"That's right, push it bro!" the robot says.\n\nThe man's arms and legs begin to shake, the bar wavering just enough to make the plates clink.\n\n"Something's messed up..." he implores the robot. "Get...Eegler..."`,
          },
          {
            atElapsedTurns: 3,
            id: "spotbot-check-three",
            message: `"Still with me, bro?" the robot asks.\n\nThe man is at the end of his rope now, face purple, veins bulging out as he fights to keep his balance.\n\n"Never...got to kill...Barry..." he laments.`,
          },
        ],
        roomId: CRUSHED_WEIGHTLIFTER_MEMORY_ROOM_ID,
      },
    ],
    startMessage: `As the barrel drifts to the corpse's head the device emits a beep, then a tiny voice.\n\n"Subject deceased, extractor activated. Initiate tissue sample liquification..."\n\nA translucent beam flares from the scanner, making the skull light up from the inside like a flashbulb and leaving a lingering, eggy smell in the air.\n\n"Viable topology found. Reconstructing memory..."\n\nThe racks of weights, and the rest of the gymnasium, peel away as the memory takes hold...`,
  },
  bar_basement_head_memory: {
    abortMessage:
      "You seize the edge of the memory and pull yourself free. The cellar snaps back into place around you.",
    completeMessage: `The man moves to the edge of the hatch above and goes up on his toes, gripping the edge for balance as he sticks his head up into the light. At that same moment something moves in the darkness, a fluid motion, a presence that slinks past you in order to reach the man. It touches him, and then his body is gone somehow. Wet, empty clothes slop down onto the floor where he stood, followed by his head, which lands with a thud and rolls to one side. The head's eyes twinkle, briefly, then the bar cellar snaps back into place around you.`,
    id: "bar_basement_head_memory",
    kind: "memory",
    stages: [
      {
        durationTurns: 3,
        events: [
          {
            atElapsedTurns: 1,
            id: "bar-bathroom",
            message: `"No rush," the robot bartender calls through the door from the bar, "but when you've finished tending to your biological needs, can you fetch me something from the basement, please?"\n\nThe young man calls back through the door.\n\n"You got it Sam!"`,
          },
          {
            atElapsedTurns: 2,
            id: "bar-bathroom-hide",
            message: `The lights go out for just a second, flickering when they come back on, and the young man looks over his shoulder before removing something from his pocket, then leaning over to hide whatever it is way back underneath the sink, presumably for later retrieval by either himself, or someone else.`,
          },
        ],
        roomId: BAR_BASEMENT_HEAD_MEMORY_ROOM_ID,
      },
      {
        durationTurns: 3,
        events: [
          {
            atElapsedTurns: 1,
            id: "bar-call",
            message: `"Just one okay?" the man calls up toward the open hatch. The bar's music is muffled overhead, all bass thump and laughter through the floorboards.\n\n"One would be perfect, thank you!" the bartender robot calls back down.\n\nThe man then begins scanning the rows of boxes, looking for something.`,
          },
          {
            atElapsedTurns: 2,
            id: "cellar-darkness",
            message: `A light near the stairs flickers, then dies. In the sudden dark, glass clinks softly somewhere deeper in the cellar.`,
          },
        ],
        roomId: BAR_BASEMENT_HEAD_MEMORY_ROOM_ID2,
      },
    ],
    startMessage: `As the barrel drifts to the head the device emits a beep, then a tiny voice.\n\n"Subject deceased, extractor activated. Initiate tissue sample liquification..."\n\nA translucent beam flares from the scanner, making the skull light up from the inside like a flashbulb and leaving a lingering, eggy smell in the air.\n\n"Viable topology found. Reconstructing memory..."\n\nThe cellar peels away as the memory takes hold...`,
    transitionMessage: `The bathroom flickers, then fades away in cascading chunks as a new reality warps into place around you...`,
  },
  vision_quest: {
    abortMessage:
      "You find the edge of the vision and pull. The impossible bar folds shut, and the real one snaps back into place around you.",
    complete: completeBarVisionQuest,
    completeMessage:
      "With that, the scene twists, the forest warping around you until it scatters, leaving you back in the bar.",
    id: "vision_quest",
    kind: "vision",
    stages: [
      {
        durationTurns: 9,
        events: [
          {
            atElapsedTurns: 1,
            id: "intro",
            message: `You find yourself standing in a small clearing in a forest at night, lit only from an unknown source above while beyond that cone of light is darkness all around. A few paces away stands a middle aged man with long hair dressed in denim shorts, a salmon colored polo shirt, and a fishing hat. He's looking up at the sky, holding a beer can in a foam cozy.\n\nYou wait for a moment, not sure where you are or how you got here, or where 'here' even is, before you plaintively call out.\n\n"Hello?"\n\nAfter a beat, the man turns and sees you standing there.\n\n"Oh," the man says. "Somebody's here. Sorry, it's been a while."\n\n"Who are you?" you ask.\n\n"Some call me 'The Master of Drink'," he says.\n\n"Where are we?" you ask. "What is this place?"\n\n"This?" the man asks. "This is all a figment of your mind, none of it is real. This is a place within your own mind, which you've only just now unlocked."\n\n"You mean like a vision quest?" You ask.\n\nThe man shakes his head.\n\n"No," he says. "A vision quest is an ancient Native American rite of passage where young people would fast for days at a sacred site in hopes of seeing a vision that will help them determine their role in life, and their community. You are just super drunk."\n\n"Oh," you say. "Will I have a vision?"\n\n"You might," the man says, "I mean, you really are some kind of drunk alright. If you do though, don't worry! You might not see me, but I'll be right there with you..!"`,
          },
          {
            atElapsedTurns: 2,
            id: "first-toast",
            message: `Abruptly, you are no longer standing in the forest but falling through the air toward the surface of deep red water with floating chunks of clear ice. You splash down into the liquid (which surprisingly tastes sweet and has a pleasant perfume smell) and the cold grips you, as towering bergs of ice drift to either side of you. In front of you is a sheer wall of clear glass that looms above you, the edge far too high to reach.\n\nSuddenly, a massive shape appears on the horizon and begins to rise up, a wavy black expanse that reveals itself to be the titanic head of a giant man with mocha colored skin and a handsome face. The giant wears a colorful silk shirt, the first few buttons open to showcase a chest covered in thick curly hair. He doesn't acknowledge you at all, or even seem to notice you as he reaches toward you with one enormous hand.\n\nThe hand collides with the glass wall, the huge lines and wrinkles pressing against the outside as the surface sloshes, and the ice chunks shift position.\n\n"Cheers, guru!" a voice calls from above, deep and slow, and the giant smiles, revealing white teeth.\n\nBefore you know it the glass silo, including the icy liquid, and you, is lifted high into the air.\n\n"Wait!" you call, even as the liquid begins to shift, and you're pulled along with it.\n\nThe giant man's giant lips loom closer, blotting out the light until all you can see is the yawning chasm beyond it. Before you can call out again, you are pulled along as the liquid, along with the big ice chunks, begins rushing toward the humid blackness.\n\nYou are powerless to stop yourself as you pitch over the edge of bone white teeth and go tumbling down into the darkness.`,
          },
          {
            atElapsedTurns: 3,
            id: "second-toast",
            message: `You plunge down into icy amber liquid, narrowly missing a huge chunk of floating ice, then swim back to the surface again. You open your eyes for a half second then clamp them shut again as it burns like you were pepper-sprayed, until you break the surface and suck in a breath so full of whiskey fumes that it makes your head spin. Whatever it is you're bobbing around in it's sticky, and very sweet.\n\nAs you're rocked by waves you manage to pry your eyes open again in time to see a shadow fall over you. Above, you see the underside of a bushy white mustache large enough to fill the sky, and behind that, a wrinkled lip with rows of deep smoker's lines.\n\n"Bottom's up..." a deep, rumbling voice intones.\n\nYou feel an updraft that intensifies along with the sensation of being pulled along by the rushing liquid, then falling, legs and arms peddling...`,
          },
          {
            atElapsedTurns: 4,
            id: "third-toast",
            message: `"Salud..!" a booming voice cries from above as you tumble down toward an ocean of cool pastel blues, while a huge uptake pipe extends high above into the air until it meets a looming pair of plump, pursed lips clamped around it big enough to fill the sky. You steady into a controlled fall as you plummet down, fast enough to close the distance even as the surface below drops away from you at a rapid pace.\n\nYou belly flop down into the sea of blue, but almost as soon as you manage to swim back up to the surface, you feel yourself being pulled back down by some sort of ferocious undercurrent. You keep your head above the surface just long enough to see that you're caught in a whirlpool before getting sucked down into the deep. You get dragged along, then clip the bottom of the giant pipe as you get sucked into it and drawn back up.\n\nYou shoot out the other end of the pipe and try to orient yourself but before you can you hear a booming, guttural 'gulp' and are pulled down into the dark depths again.`,
          },
          {
            atElapsedTurns: 5,
            id: "fourth-toast",
            message: `The next time you break the surface you find yourself in a tepid lake of fizzy liquid that has a piney, juniper smell along with a whiff of citrus. The liquid is enclosed in a large circular container of some sort, the surface about a foot from the edge, and you swim to the closest spot you can grab on.\n\nYou pull yourself up and see that there are a series of other circular containers like the one you're currently in, red on the outside, white on the inside, each filled to near the brim with the same liquid, positioned around you in all directions. Before you can make anything of that, you see a huge white sphere come sailing in your direction. It casts a shadow that passes over several of the other containers on its way to yours.\n\nYou plunge down under the liquid just as the giant ball splashes down above you, knocking against the side of the container with a deep drumming sound. From somewhere up in the sky you hear the sounds of cheers, but deep, and slowed down.\n\n"Gin Fizz Pong!" one of them cries, and as you break the surface the ball is lifted away again before the entire container is lifted up into the air, until the contents, yourself included, are poured into dark a cavernous pit...`,
          },
          {
            atElapsedTurns: 6,
            id: "fifth-toast",
            message: `You smell what's coming before the reality of it hits you, as you fall through the air once more, this time through a cloud of thick odor. The first whiff hits you so hard that you almost dry heave; the stink of rotting onion, mixed with the reek of a used diaper left in a parking lot. You plug your nose as you plunge into a pool of creamy pale yellow, then surface, wiping your face so you can open your eyes again.\n\nYou're bobbing in a somewhat thick, creamy substance and the smell is unbearable, even breathing through your mouth. Since it ended up getting in your mouth, you're glad that it at least tastes a lot better than it smells. When you look up, you see another giant figure looming over you, this time an Asian woman with graying hair and red cheeks. The head lowers, blotting out the light until the nose casts a dark shadow that consumes you completely. You hold your breath as a strong updraft intensifies, but fails to pull you out of the liquid before subsiding.\n\nThe nose pulls away, replaced by an all consuming, smiling mouth.\n\n"Kanpai!" the giant bellows, the mouth opening as the liquid slides down toward the deep chasm of the titan's throat, taking you with it.`,
          },
          {
            atElapsedTurns: 7,
            id: "sixth-toast",
            message: `You splash down into a bath of thick, syrupy liquid that is very dark brown in color, and immediately wish you were back in the diaper-smelling juice. The smell isn't more offensive, although there is a strong undercurrent of fish, in fact the mix of pine and herbs might be pleasant if it wasn't so strong it made it hard to breathe.\n\n"Prosit!" a voice booms from above, thick and slow.\n\nYou wipe your eyes and squint upwards in time to see a huge hand grip the glass tub you're floating in, then you're rocketed up into the air further and further the entire tub tilting further and further until at ninety degrees it stops abruptly. The inertia sends the brown liquid, and you in it, flying through the air and directly into a gaping, waiting mouth below. The liquid splashes down in the dark and you're carried down further.\n\n"Drink, drink, drink!" more voices join in from above, fading as you continue to sink.\n\nSuddenly you hear a deep gurgle from somewhere below, and you're no longer being pulled down.\n\n"Dude, don't puke," a deep voice wails from above. "Dude don't puke!"\n\nA massive air bubble pushes past you, and then you're being pushed back up, faster and faster.\n\n"Dude!"\n\nYou feel yourself blasted through the air in a stream of fluid, a frothy, chunky mix of too many drinks and fast food french fries, the faces of the surrounding giants gaping in horror...`,
          },
          {
            atElapsedTurns: 8,
            id: "outro",
            message: `All at once, you find yourself standing back in the dark forest where you started, where the man in the fishing hat is back to gazing at the stars. You check yourself over frantically but you're completely dry, and totally clean again, like none of it ever happened. At the sound of it, the man notices you and turns.\n\n"Hey, you're back," he says. "How'd it go? Was it cool?"\n\n"It was...something," you say.\n\n"Well, something's better than nothing, I guess," the man says amicably.\n\n"I guess," you say.\n\n"Well, what were you expecting?" he asks.\n\n"I don't know," you say. "Just more, I guess."\n\nThe man thinks about it for a minute, then nods.\n\n"Let me see what I can do," he says.\n\n"Really?" you ask. "Thanks!"\n\n"I said I'll see what I can do," the man says, holding up one hand.`,
          },
        ],
        roomId: BAR_VISION_QUEST_ROOM_ID,
      },
    ],
    startMessage:
      "The final drink joins the others and acts as the final component in some sort of reaction that you feel rush up into your head like the froth from a freshly popped beer can, and something behind your eyes unlocks with a soft little click. The bar lights smear sideways, the music bends into a spiral, and the world around you twists into something else entirely...",
  },
};

function getExperienceDefinition(
  experienceId: string,
): ExperienceDefinition | undefined {
  return EXPERIENCE_DEFINITIONS[experienceId];
}

function getSafeRoomId(state: GameState, roomId: string): string {
  return state.world.rooms.some((room) => room.id === roomId)
    ? roomId
    : "PowerGrid";
}

function setActiveExperience(
  state: GameState,
  activeExperience: ActiveExperience | undefined,
): GameState {
  return {
    ...state,
    worldState: {
      ...state.worldState,
      activeExperience,
    },
  };
}

function getExperienceEventKey(
  activeExperience: ActiveExperience,
  event: ExperienceStageEventDefinition,
): string {
  return `${activeExperience.currentStageIndex}:${event.id}`;
}

function getExperienceStageContext(
  activeExperience: ActiveExperience,
  stage: ExperienceStageDefinition,
): ExperienceStageContext {
  return {
    activeExperience,
    experienceId: activeExperience.experienceId,
    stage,
    stageIndex: activeExperience.currentStageIndex,
  };
}

function enterExperienceStage(
  state: GameState,
  activeExperience: ActiveExperience,
  stage: ExperienceStageDefinition,
): GameState {
  if (!stage.enter) return state;
  return stage.enter(state, getExperienceStageContext(activeExperience, stage));
}

function shouldRunExperienceEvent(
  state: GameState,
  event: ExperienceStageEventDefinition,
  ctx: ExperienceStageEventContext,
): boolean {
  const hasElapsedTrigger = typeof event.atElapsedTurns === "number";
  const hasRemainingTrigger = typeof event.atTurnsRemaining === "number";
  const hasBuiltInTrigger = hasElapsedTrigger || hasRemainingTrigger;

  if (!hasBuiltInTrigger && !event.when) return false;
  if (hasElapsedTrigger && ctx.elapsedTurns !== event.atElapsedTurns) {
    return false;
  }
  if (hasRemainingTrigger && ctx.turnsRemaining !== event.atTurnsRemaining) {
    return false;
  }
  if (event.when && !event.when(state, ctx)) return false;

  return true;
}

function getExperienceEventMessage(
  state: GameState,
  event: ExperienceStageEventDefinition,
  ctx: ExperienceStageEventContext,
): string | undefined {
  if (typeof event.message === "function") return event.message(state, ctx);
  return event.message;
}

function markExperienceEventFired(
  state: GameState,
  eventKey: string,
): GameState {
  const activeExperience = state.worldState.activeExperience;
  if (!activeExperience) return state;

  return setActiveExperience(state, {
    ...activeExperience,
    firedEventIds: {
      ...activeExperience.firedEventIds,
      [eventKey]: true,
    },
  });
}

function runExperienceStageEvents(
  state: GameState,
  stage: ExperienceStageDefinition,
): { message?: string; state: GameState } {
  let next = state;
  const messages: string[] = [];

  for (const event of stage.events ?? []) {
    const activeExperience = next.worldState.activeExperience;
    if (!activeExperience) break;

    const eventKey = getExperienceEventKey(activeExperience, event);
    if (activeExperience.firedEventIds?.[eventKey]) continue;

    const ctx: ExperienceStageEventContext = {
      ...getExperienceStageContext(activeExperience, stage),
      elapsedTurns: stage.durationTurns - activeExperience.turnsRemaining,
      turnsRemaining: activeExperience.turnsRemaining,
    };

    if (!shouldRunExperienceEvent(next, event, ctx)) continue;

    if (event.run) next = event.run(next, ctx);
    if (event.overheardTea?.length) {
      const teaResult = collectTeaResult(next, event.overheardTea);
      next = queueGossipNotification(teaResult.state, teaResult.obtainedNewTea);
    }

    const message = getExperienceEventMessage(next, event, ctx);
    if (message?.trim()) messages.push(message.trim());

    next = markExperienceEventFired(next, eventKey);
  }

  return {
    state: next,
    message: messages.length > 0 ? messages.join("\n\n") : undefined,
  };
}

export function startExperience(
  state: GameState,
  experienceId: string,
  opts: { sourceId?: string } = {},
): { message: string; state: GameState } {
  if (state.worldState.activeExperience) {
    return {
      state,
      message:
        "The scanner emits a confused buzz. Something is already holding your attention.",
    };
  }

  const definition = getExperienceDefinition(experienceId);
  const firstStage = definition?.stages[0];

  if (!definition || !firstStage) {
    return {
      state,
      message:
        "The scanner searches for a memory, but there is not enough viable cerebral material to extract anything.",
    };
  }

  const activeExperience: ActiveExperience = {
    currentStageIndex: 0,
    experienceId,
    kind: definition.kind,
    returnRoomId: state.player.roomId,
    sourceId: opts.sourceId,
    startedAtMove: state.moves,
    turnsRemaining: firstStage.durationTurns,
  };

  let next = movePlayerToRoom(state, firstStage.roomId, {
    fromRoomId: state.player.roomId,
    via: definition.kind,
  });
  next = setActiveExperience(next, activeExperience);
  next = enterExperienceStage(next, activeExperience, firstStage);

  return {
    state: next,
    message:
      definition.startMessage ??
      firstStage.entryMessage ??
      "The world drops away around you.",
  };
}

export function abortActiveExperience(state: GameState): {
  message: string;
  state: GameState;
} {
  const activeExperience = state.worldState.activeExperience;

  if (!activeExperience) {
    return { state, message: "Abort what, Major Tom?" };
  }

  const definition = getExperienceDefinition(activeExperience.experienceId);
  const returnRoomId = getSafeRoomId(state, activeExperience.returnRoomId);

  let next = setActiveExperience(state, undefined);
  next = movePlayerToRoom(next, returnRoomId, {
    fromRoomId: state.player.roomId,
    via: "abort",
  });

  return {
    state: next,
    message:
      definition?.abortMessage ??
      "You force the experience to end, and the real world rushes back.",
  };
}

export function tickActiveExperience(state: GameState): {
  message?: string;
  state: GameState;
} {
  const activeExperience = state.worldState.activeExperience;
  if (!activeExperience) return { state };

  if (activeExperience.startedAtMove === state.moves) {
    return { state };
  }

  const definition = getExperienceDefinition(activeExperience.experienceId);
  if (!definition) {
    const returnRoomId = getSafeRoomId(state, activeExperience.returnRoomId);
    let next = setActiveExperience(state, undefined);
    next = movePlayerToRoom(next, returnRoomId, {
      fromRoomId: state.player.roomId,
      via: "experience",
    });
    return {
      state: next,
      message:
        "The experience loses coherence and drops you back into yourself.",
    };
  }

  const currentStage = definition.stages[activeExperience.currentStageIndex];
  if (!currentStage) {
    const returnRoomId = getSafeRoomId(state, activeExperience.returnRoomId);
    let next = setActiveExperience(state, undefined);
    next = movePlayerToRoom(next, returnRoomId, {
      fromRoomId: state.player.roomId,
      via: "experience",
    });
    return {
      state: next,
      message:
        "The experience loses coherence and drops you back into yourself.",
    };
  }

  const turnsRemaining = activeExperience.turnsRemaining - 1;
  if (turnsRemaining > 0) {
    const nextActiveExperience = {
      ...activeExperience,
      turnsRemaining,
    };
    const next = setActiveExperience(state, nextActiveExperience);
    return runExperienceStageEvents(next, currentStage);
  }

  const nextStageIndex = activeExperience.currentStageIndex + 1;
  const nextStage = definition.stages[nextStageIndex];

  if (nextStage) {
    const nextActiveExperience = {
      ...activeExperience,
      currentStageIndex: nextStageIndex,
      turnsRemaining: nextStage.durationTurns,
    };
    let next = movePlayerToRoom(state, nextStage.roomId, {
      fromRoomId: state.player.roomId,
      via: definition.kind,
    });
    next = setActiveExperience(next, nextActiveExperience);
    next = enterExperienceStage(next, nextActiveExperience, nextStage);

    return {
      state: next,
      message:
        definition.transitionMessage ??
        nextStage.entryMessage ??
        "The experience shifts around you.",
    };
  }

  const returnRoomId = getSafeRoomId(state, activeExperience.returnRoomId);
  let next = setActiveExperience(state, undefined);
  next = movePlayerToRoom(next, returnRoomId, {
    fromRoomId: state.player.roomId,
    via: definition.kind,
  });
  if (definition.complete) next = definition.complete(next);

  return {
    state: next,
    message:
      definition.completeMessage ??
      "The experience ends, and the real world rushes back.",
  };
}
