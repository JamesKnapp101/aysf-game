import type { Item } from "@game/types/itemTypes";

export const movieLobbyItems: Item[] = [
  {
    id: "MovieLobbyCarpetAndTrim",
    name: "maroon carpet",
    description:
      "The low-pile maroon carpet is spotless, with vacuum tracks still combed into it. The cream walls and dark wood trim make the whole lobby feel deliberately, aggressively respectable.",
    sceneryDescription:
      "The floor is wall-to-wall low-pile maroon carpet, spotless, with vacuum tracks still visible.",
    location: "MovieTheaterLobby",
    vocab: ["carpet", "maroon carpet", "walls", "trim", "vacuum tracks"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 300,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "MovieLobbyTicketCounter",
    name: "ticket counter",
    description:
      "The ticket counter sits to the south, ringed by globe lights that are dark at the moment. No one is behind the glass, and the little microphone grille has the blank patience of an unattended machine.",
    sceneryDescription:
      "There is a ticket counter to the south surrounded by globe lights, but the lights are dark at the moment and no one appears to be manning it.",
    location: "MovieTheaterLobby",
    vocab: [
      "counter",
      "ticket",
      "ticket counter",
      "booth",
      "glass",
      "globe lights",
      "lights",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 150,
    itemSize: 7,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "MovieLobbyNoSmokingSign",
    name: "no smoking sign",
    description:
      "Somebody must have really had a problem with it. It doesn't say anything about not smoking in the theater.",
    sceneryDescription:
      "A large posted sign reads 'Absolutely No Smoking in the Bathroom.'",
    location: "MovieTheaterLobby",
    vocab: ["sign", "posted sign", "no smoking", "bathroom sign", "smoking"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 2,
    itemSize: 2,
    isReadable: true,
    readableText: "ABSOLUTELY NO SMOKING IN THE BATHROOM",
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "MovieLobbyAuditoriumDoors",
    name: "auditorium doors",
    description:
      "The wide double doors to the north are framed by heavy wine colored drapes.",
    sceneryDescription:
      "To the north a set of heavy, wine colored drapes hang to either side of a pair of wide double doors, over which hangs a sign written in fancy script: 'WELCOME TO THE MOVPHITHEATER'.",
    location: "MovieTheaterLobby",
    vocab: [
      "doors",
      "double doors",
      "auditorium doors",
      "drapes",
      "curtains",
      "welcome sign",
      "movphitheater",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 160,
    itemSize: 8,
    isReadable: true,
    readableText: "WELCOME TO THE MOVPHITHEATER",
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
  {
    id: "MovieLobbyWayfindingSigns",
    name: "wayfinding signs",
    description:
      "One sign points west to the toilets. Another on the east wall marks the projector room and adds 'Employees Only' underneath, a phrase whose power has not survived the empty lobby.",
    sceneryDescription:
      "A sign next to a doorway to the west reads 'TOILETS', and there is a door on the east wall with a sign reading 'PROJECTOR ROOM' and underneath that, 'Employees Only'.",
    location: "MovieTheaterLobby",
    vocab: [
      "signs",
      "wayfinding",
      "toilets",
      "projector",
      "projector room",
      "employees only",
      "bathroom",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 2,
    itemSize: 2,
    isReadable: true,
    readableText: "TOILETS\nPROJECTOR ROOM\nEmployees Only",
    meta: {
      sceneryDescriptionOrder: 5,
    },
  },
  {
    id: "MovieLobbyPedalTrashBin",
    name: "pedal trash bin",
    description:
      "It's a brushed metal pedal bin with a tight-fitting lid and a little foot lever at the base.",
    sceneryDescription:
      "A brushed metal pedal trash bin sits neatly beside the auditorium doors.",
    location: "MovieTheaterLobby",
    vocab: [
      "bin",
      "trash",
      "trash bin",
      "trashcan",
      "trash can",
      "garbage",
      "garbage can",
      "pedal bin",
      "pedal trash bin",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 12,
    itemSize: 4,
    isContainer: true,
    isOpenable: true,
    capacity: 6,
    meta: {
      contentsAccessibleWhenClosed: false,
      contentsAccessMessage:
        "The lid is closed. You'll need to open the trash bin first.",
      sceneryDescriptionOrder: 6,
    },
  },
];
