import { DNAResult } from "@game/rules/dnaReader";

export const DNA_DATABASE: Record<string, DNAResult> = {
  FallenCorpse: {
    id: "bottomStairwellBody",
    title: `Discovered at Bottom of Stairwell`,
    loggedAtTurn: 0,
    causeOfDeath: `Blunt force head trauma`,
    name: "John Doe",
    gender: "Male",
    age: 34,
    occupation: "Scientist",
    info: "That boy ain't right.",
  },
  StairSixBody: {
    id: "StairwellSixBody",
    title: `Discovered on level six stairwell landing`,
    loggedAtTurn: 0,
    causeOfDeath: `Severe liquefactive necrosis`,
    name: "Joelson Dend",
    gender: "Male",
    age: 27,
    occupation: "3D Printer Technician",
    info: "Joelson Dend is a reliable citizen, and is in good standing with a respectable social score.\nHe has worked at the 3D Printing Facility for over twenty rotations with no major incidents.\nMinor social infractions include: Public Intoxication. Unwanted Sexual Advances. Unwanted Sexual Demotions. Public Discussion of Urination.\n",
  },
  HeadlessCorpse: {
    id: "headlessHydroponicsCorpse",
    title: `Discovered on level six near Hydroponics`,
    loggedAtTurn: 0,
    causeOfDeath: `Decapitation`,
    name: "John Doe",
    gender: "Male",
    age: 34,
    occupation: "Scientist",
    info: "That boy ain't right.",
  },
};
