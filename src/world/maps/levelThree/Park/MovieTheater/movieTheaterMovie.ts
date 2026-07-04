import type { GameState } from "@game/types/gameTypes";

export const MOVIE_THEATER_AUDITORIUM_ROOM_IDS = [
  "MovieTheaterA",
  "MovieTheaterB",
  "MovieTheaterC",
  "MovieTheaterD",
] as const;

export const MOVIE_THEATER_ROOM_IDS = [
  ...MOVIE_THEATER_AUDITORIUM_ROOM_IDS,
] as const;

type MovieTheaterAuditoriumRoomId =
  (typeof MOVIE_THEATER_AUDITORIUM_ROOM_IDS)[number];

type MovieSegment = {
  id: string;
  stages: string[];
};

type MovieBeat =
  | {
      kind: "stage";
      segment: MovieSegment;
      stageIndex: number;
    }
  | {
      kind: "transition";
      segment: MovieSegment;
    };

export const MOVIE_THEATER_MOVIE_SEGMENTS: MovieSegment[] = [
  {
    id: "intro",
    stages: [
      `"Hello citizens of the Aeneas, and welcome, once again, to another chapter of 'Our Journey Home' where we look at what we've achieved this past cycle, what we learned, to better understand where we are now. As always this is Mark Bench..."`,
      `"For those who don't know, I'm not a citizen like you folks, I'm an AI who works for the Mayor. My sole purpose is to create an ongoing record of our journey, which I do by creating dynamic end-of-rotation summaries slash breakdowns, a documentary of sorts, of this leg of the journey..."`,
      `"What you see is a mix of actual footage, and AI generated footage extrapolated from volumes of sensor data. A good example is the image of the Aeneas you see above you now; there's no camera traveling alongside us, it's a rendered construct based on everything known about the Aeneas, and the current space surrounding it, to present it in an accurate way..."`,
      `"Likewise, public footage collected during the rotation is dynamically integrated into the film, to give an accurate view of what life was like, then..."`,
    ],
  },
  {
    id: "celebrations",
    stages: [
      `"Let's kick things off with some celebrations! There were a few reasons to celebrate, this rotation..."`,
      `"Citizen Pefe Anderell celebrated his one hundred and nineteenth birthday! Happy birthday, Pefe!"\n\nA window appears over the audience, displaying a wheelchair that at first appears empty, but a closer look reveals a soiled, empty robe in the chair, and the old man's upside-down head resting in the chair where his lap once was.\n\n"...and many more! You don't look a day over a hundred!"`,
      `"Citizen Jom Ginzel-Chu and Citzen Rho Dindwick celebrated their thirtieth wedding anniversary, how about that?"\n\nThe window above switches to a split-screen image, where the left side shows a pair of pants and a shirt plastered to the floor over chunks of flesh, and the right side shows the body of a woman face down on the table in front of her, a gun in her lifeless hand and an expanding pool of blood around her head.\n\n"Such a cute couple! Here's to many more!"`,
      `"Citizen Cind-lee Ko turned nine!"\n\nThe overhead windows displays a girl's head laying back on the pillow in a hospital bed, eyes glazed, and lips pale. The blanket was pulled up under the girl's chin, but there's little beneath the blanket now, like her body shriveled, and collapsed.\n\n"Adorable!"`,
      `"And last but not least, Citizen Von Xi-Xed was promoted to the title of 'Acquisitions Supervisor,   an important promotion (show the dead version of him)`,
    ],
  },
  {
    id: "milestones",
    stages: [
      `"There have been some important milestones reached during this rotation as well, let's take a look...`,
      `"How much ground did we cover, so to speak? Well, the Aeneas traveled 47.3 trillion kilometers during this past rotation, putting us at an estimated 2.75 quadrillion kilometer distance from origin, and a 5.13 quadrillion kilometer distance from our destination..."`,
      `"As we make our way, the next celestial way point the Aeneas will pass through is BR110, or as it's commonly known, 'Bufo Clutch A', a massive nebula which we will arrive at 391 years from now..."`,
      `"An Aeneas First: Today marks the longest period of time since Genesis that the Aeneas has gone without running water!"\n\nA window overhead displays several people in security uniforms clustered outside the main entrance to the Water Treatment Plant, while a fourth uses a plasma torch on it, showering sparks everywhere...`,
      `"With still no official changing of personnel confirmed, this rotation is the longest recorded on record, still going 4 days 6 hours since the scheduled swap should have occurred..."\n\nThe display overhead switches to show empty corridors, empty control towers, and empty offices, save for the occasional scrap of torn, soiled clothing, or the stray limb.\n\n"Somebody get on that, am I right..?"`,
    ],
  },
  {
    id: "discoveries",
    stages: [
      `"Next, let's talk about discoveries! This rotation turned out to be quite exciting on the discovery front..."`,
      `"Let's talk about the elephant in the room: We encountered an uncharted nebula an estimated 391 years before we were due to encounter our next celestial waypoint, how exciting! You have to zoom out to see it, though...\n\nAbove, the image of the giant vessel shrinks as the view zooms out further and further until a huge russet colored nebula coalesces, with the unnerving appearance of a leaking scab. It then zooms in again until the Aeneas fills the air beneath the dome again.\n\nThis event was completely unexpected, and the nature of what the Mayor has designated SNN-9, or, the 'Shrew Nebula' is as of yet unknown. Stay tuned folks, things should get interesting!"`,
      `"In another Aeneas First we have also picked up a signal which has been determined to be some sort of intelligent communication! It originates from the Shrew Nebula, but in time an additional signal from a different source appeared, then another, and another. The new signal sources were smaller, fainter, but also much closer, just outside, or perhaps even in, the Aeneas. Wild!"`,
      `"An unfortunate discovery was also made, a mystery illness currently designated 'Syndrome X'"\n\nA window appears above, covering the image of the ship to display footage of rows and rows of people on gurneys, being tended to by nervous looking medical staff.\n\n"No word yet on the nature of it, but rest assured our best brains are on it!"`,
      `"A potential new lifeform? If so it will mark the fifth new alien species discovered, but either way the microscopic particles found to be the cause of the clustered pinholes seen around the ship are certainly new, but are they alive? And more importantly, are they safe?"\n\nThe holographic window above the audience cuts to shaky cam footage running down a hallway where the floor is smeared with blood, and some kind of slime. The camera turns to see a short, dark haired man, his eyes frightened. The light flickers, just for a second, but that second he was in darkness somehow transformed him into a melting stick figure, clothes draping off of him.\n\n"Stay tuned!"`,
      `"In record time, scientists created a new device called the 'Eegler Box' capable of receiving and measuring the mysterious signal that originated from the SNN-9 Shrew Nebula, the nature of which, they determined, was not a traditional communication signal but rather an example of 'quantum superposition encoding', where the signal exists in all possible states simultaneously. So far, though, even our best sensors haven't been able to receive the signal without also interfering with it, and each time they try, the signal frustratingly collapses into meaningless noise..."`,
    ],
  },
  {
    id: "noteworthy-events",
    stages: [
      `"There was some noteworthy news during this last rotation as well, let's take a closer look!"\n\nA window appears in the air over the audience, displaying footage of a man screaming against the backdrop of hydroponic plants while a massive spider the size of a dog climbs up the front of him...`,
      `"Kicking us off, it appears that the highly respected Water Treatment scientist Isosceles Onche has overridden the Water Treatment Plant's security code, and refuses to let anyone enter."\n\nA window appears above to show a sharply dressed older woman with a mane of platinum hair looking distraught, her eyes wild. She's got a sharp knife in her hand, which is white knuckled and smeared with blood. She is locked in the Water Treatment plant and watching security outside through a monitor.\n\n"From inside the plant, and with her credentials, she could in theory shut off the water to the entire Aeneas..."`,
      `"A strange occurrence in the Hydroponics facility caused quite a commotion when a common orb spider inexplicably grew to a size greater than it should be capable of."\n\nThe window overhead returns to the scene of the screaming man with the dog-sized spider crawling up his body, and the footage resumes. The man grabs one of the spider's legs to stop its advance and the spider almost casually bites his arm off at the elbow, leaving the dangling forearm still gripping its leg...\n\n"Zoology was contacted to come and deal with the creature, and I've no doubt they'll have it all sorted out soon!"`,
      `"The Aeneas Aquarium's octopus has experienced an unprecedented growth spurt, as visitors, and staff, were quick to notice..."\n\nThe image of several children standing in front of a huge pane of glass, pointing at what appears to be an unusually large octopus settled near a large, barnacle covered rock.\n\n"When the veterinary staff weighed the octopus it was determined that it had increased in size by fifty percent almost overnight, alarming its caretakers. It's gotten a clean bill of health, though it's being monitored, and isn't expected to have any issues in the short term, as long as it stops growing..."`,
    ],
  },
  {
    id: "in-memorium",
    stages: [
      `"Alas, not all the news was good. With every sunrise there is a sunset, so before we go let's take a moment to remember some that we've lost some along the way, too..."`,
      `"A heartfelt farewell to our citizens Xi-Xi Bo, Cind-lee Ko, Omark Boulos, Mistopher Breen, Joelson Dend, Mox Eegler, Shanny Fibsen..."`,
      `"...Volonope Fick, Inck Glassbool, Jom Ginzel-Chu, Ernwith Gob, Sillith LeSconce, Ga-Ga Liz-Sotte, Crenchford Mothworthy..."`,
      `"...Isosceles Onche, Rho Dindwick, Lil-Lily Tendwick, Dizzy Tsoukann, Gim Sanyi One, Gim Sanyi Two, Gim Sanyi Three..."`,
      `"...Edwardix Shen, Slandry Tex-Mex, Henk Umboltz, Greeg Umboltz, Matthias Venn, Buglous Wimbly, Woo-Zhangk Woo..."`,
      `""...Pefe Anderell, Orgrill Pinthwell, Grag Jen-Chwen, Daschent Dwong, Von Xi-Xed...`,
    ],
  },
  {
    id: "outro",
    stages: [
      `"Wow, that's a lot of names! What is that, everybody? Ha ha, I kid. And, with that, we've reached the end of Chapter 542, and counting!`,
      `"...and let me just say that you'll definitely want to return for Chapter 543! Without giving too much away quite a bit has occurred since rotation 542 technically ended, even though rotation 543 hasn't been populated yet, so all of that will be in the next installment! Don't miss it!"`,
      `"I for one am VERY curious to see how the next rotation will commence if there is no one left to orchestrate the transition, but I'm sure they'll manage it one way or another..."`,
      `"Until next time, this is Mark Bench wishing each and every one of you good health, good times, and a good Journey Home!"`,
    ],
  },
];

export const MOVIE_THEATER_TOTAL_MOVIE_TURNS =
  MOVIE_THEATER_MOVIE_SEGMENTS.reduce(
    (total, segment) => total + segment.stages.length + 1,
    0,
  );

export function isMovieTheaterAuditoriumRoom(
  roomId: string | undefined,
): roomId is MovieTheaterAuditoriumRoomId {
  return MOVIE_THEATER_AUDITORIUM_ROOM_IDS.includes(
    roomId as MovieTheaterAuditoriumRoomId,
  );
}

export function getMovieTheaterMovieLine(turn: number): string | undefined {
  const beat = getMovieTheaterMovieBeat(turn);
  if (!beat) return undefined;

  if (beat.kind === "transition") {
    return "The projected movie fades to black. For a moment, the whole theater goes dark.";
  }

  return `The movie narrator continues...\n[[MOVIE_STAGE]]${beat.segment.stages[beat.stageIndex]}[[/MOVIE_STAGE]]`;
}

export function isMovieTheaterTransitionTurn(turn: number): boolean {
  return getMovieTheaterMovieBeat(turn)?.kind === "transition";
}

export function tickMovieTheaterProjectionLighting(state: GameState): {
  state: GameState;
} {
  const shouldDarken = isMovieTheaterTransitionTurn(state.moves + 1);
  const darkRooms = { ...state.worldState.darkRooms };
  let changed = false;

  for (const roomId of MOVIE_THEATER_ROOM_IDS) {
    if (darkRooms[roomId] === shouldDarken) continue;
    darkRooms[roomId] = shouldDarken;
    changed = true;
  }

  if (!changed) return { state };

  return {
    state: {
      ...state,
      worldState: {
        ...state.worldState,
        darkRooms,
      },
    },
  };
}

function getMovieTheaterMovieBeat(turn: number): MovieBeat | undefined {
  if (MOVIE_THEATER_TOTAL_MOVIE_TURNS <= 0) return undefined;

  const wrappedTurn = turn % MOVIE_THEATER_TOTAL_MOVIE_TURNS;
  let cursor =
    wrappedTurn < 0
      ? wrappedTurn + MOVIE_THEATER_TOTAL_MOVIE_TURNS
      : wrappedTurn;

  for (const segment of MOVIE_THEATER_MOVIE_SEGMENTS) {
    if (cursor < segment.stages.length) {
      return {
        kind: "stage",
        segment,
        stageIndex: cursor,
      };
    }

    cursor -= segment.stages.length;

    if (cursor === 0) {
      return {
        kind: "transition",
        segment,
      };
    }

    cursor -= 1;
  }

  return undefined;
}
