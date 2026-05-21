import type { Item } from "@game/types/itemTypes";

export const movieAuditoriumItems: Item[] = [
  {
    id: "MovieTheaterASeats",
    name: "reclining seats",
    description:
      "The cushioned seats are arranged in curved, tiered rows and upholstered in soft leather. Each chair reclines far enough to make the dome overhead feel like the whole point of the room.",
    sceneryDescription:
      "Rows of reclining, cushioned seats are arranged in curved, tiered rows. The chairs are upholstered in soft leather, and positioned for a perfect view of the light show playing out above.",
    location: "MovieTheaterA",
    vocab: ["seat", "seats", "chair", "chairs", "recliner", "reclining"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 300,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "MovieTheaterAShipProjection",
    name: "projected vessel",
    description:
      "From here the projected vessel narrows to a distant tip, its city-sized body hanging in a void so deep it makes the theater ceiling feel gone.",
    sceneryDescription:
      "From this position you see one side of some kind of massive vessel the size of a city hanging suspended in the void above, a vast horizontal curve that narrows to a tip.",
    location: "MovieTheaterA",
    vocab: ["vessel", "ship", "projection", "movie", "void", "light show"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "MovieTheaterASlimyClothes",
    name: "slimy clothes",
    description:
      "The clothes are laid out across one reclined chair as if the person wearing them vanished out of them. The empty leather shoes point in opposite directions.",
    sceneryDescription:
      "[[newline]]Laying in one of the reclined chairs are a slimy set of clothes, laid out as if the person wearing them had vanished, leaving them behind, including a pair of empty leather shoes, toes pointing in opposite directions.",
    location: "MovieTheaterA",
    vocab: ["clothes", "slimy clothes", "shoes", "leather shoes"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 6,
    itemSize: 3,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "MovieTheaterBSeats",
    name: "reclining seats",
    description:
      "The cushioned seats sweep around the arena in curved, tiered rows, each one angled toward the dome and its enormous projected ship.",
    sceneryDescription:
      "Rows of reclining, cushioned seats are arranged in curved, tiered rows. The chairs are upholstered in soft leather, and positioned for a perfect view of the light show playing out above.",
    location: "MovieTheaterB",
    vocab: ["seat", "seats", "chair", "chairs", "recliner", "reclining"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 300,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "MovieTheaterBShipProjection",
    name: "projected vessel",
    description:
      "The ship's front hangs overhead, impossibly wide and tall. The flared horizontal ring around its center makes it look almost planetary.",
    sceneryDescription:
      "From this position you see one side of some kind of massive vessel the size of a city hanging suspended in the void above, offering a good view of what appears to be the front of the vessel. Head on, you can see just how wide and how tall it really is, the flared horizontal ring around its center giving it an almost planetary look.",
    location: "MovieTheaterB",
    vocab: ["vessel", "ship", "projection", "movie", "front", "ring"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "MovieTheaterBDeadMan",
    name: "dead man",
    description:
      "The dead man sits in one of the seats, dressed in boxers, a t-shirt, and a plush blue robe. His unshaven face is tinted blue, and his greasy hair sticks up in exhausted angles.",
    sceneryDescription:
      "[[newline]]Sitting in one of the seats is the body of a man dressed in boxers, a t-shirt, and a plush blue robe. His unshaven face is tinted blue, and his hair is greasy and unkempt.",
    location: "MovieTheaterB",
    vocab: ["body", "man", "dead man", "corpse", "robe", "blue robe"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 180,
    itemSize: 5,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "MovieTheaterTimer",
    name: "little timer",
    description:
      "It is some sort of little timer or stopwatch, stopped on a value whose importance is not obvious yet.",
    initialDescription:
      "Clutched in the dead man's hand is some sort of little timer or stopwatch.",
    location: "MovieTheaterB",
    vocab: ["timer", "stopwatch", "little timer", "watch"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    overrides: {
      take: "You work the little timer free from the dead man's hand.",
    },
  },
  {
    id: "MovieTheaterCrinkledPaper",
    name: "crinkled paper",
    description:
      "It is a crinkled piece of paper with something written on it in cramped, hurried strokes.",
    initialDescription:
      "In his lap rests a crinkled piece of paper with something written on it.",
    location: "MovieTheaterB",
    vocab: ["paper", "note", "crinkled paper", "writing"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    isReadable: true,
    readableText:
      "The writing is cramped enough that it will take a more careful pass to make sense of it.",
    overrides: {
      take: "You take the crinkled paper from the dead man's lap.",
    },
  },
  {
    id: "MovieTheaterCSeats",
    name: "reclining seats",
    description:
      "The leather seats curve around this quadrant in carefully spaced tiers. From the back rows, the dome seems to swallow the room.",
    sceneryDescription:
      "Rows of reclining, cushioned seats are arranged in curved, tiered rows. The chairs are upholstered in soft leather, and positioned for a perfect view of the light show playing out above.",
    location: "MovieTheaterC",
    vocab: ["seat", "seats", "chair", "chairs", "recliner", "reclining"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 300,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "MovieTheaterCShipProjection",
    name: "projected vessel",
    description:
      "The arc of the vessel's flared ring sweeps across the dome, smooth and bright against the artificial void.",
    sceneryDescription:
      "From this position you see one side of some kind of massive vessel the size of a city hanging suspended in the void above, the arc of the flared horizontal ring sweeping across the sky.",
    location: "MovieTheaterC",
    vocab: ["vessel", "ship", "projection", "movie", "ring", "arc"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "MovieTheaterCBackRowBodies",
    name: "back row bodies",
    description:
      "The two back-row bodies have mostly dissolved, leaving bloodied, slimy clothes behind. The jacket and skirt lean toward each other in a posture that feels horribly intimate.",
    sceneryDescription:
      "[[newline]]Up in the back row are a pair of bodies, side by side, though both have been mostly dissolved leaving only empty clothes, bloodied and slimy. The seat on the left contains stained pants, the cuffs dangling above a pair of empty boots, and a white t-shirt, now stained brown and red, nestled inside an empty leather jacket. The jacket is positioned like he had been leaning toward the other seat where an empty skirt trails wet nylon leggings, one pink pump up on the seat and the other on the floor, and a ruined blouse is plastered to the seat back.",
    location: "MovieTheaterC",
    vocab: [
      "bodies",
      "body",
      "clothes",
      "jacket",
      "skirt",
      "leggings",
      "pump",
      "pumps",
      "back row",
    ],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 80,
    itemSize: 5,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "MovieTheaterDSeats",
    name: "reclining seats",
    description:
      "The tiered seats sweep down toward the aisle, each one angled under the dome like a spectator to an impossible sky.",
    sceneryDescription:
      "Rows of reclining, cushioned seats are arranged in curved, tiered rows. The chairs are upholstered in soft leather, and positioned for a perfect view of the light show playing out above.",
    location: "MovieTheaterD",
    vocab: ["seat", "seats", "chair", "chairs", "recliner", "reclining"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 300,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 1,
    },
  },
  {
    id: "MovieTheaterDShipProjection",
    name: "projected vessel",
    description:
      "The rear of the ship dominates this side of the dome, its massive engine array bright enough to make your eyes water if you stare too long.",
    sceneryDescription:
      "From this position you see one side of some kind of massive vessel the size of a city hanging suspended in the void above, displaying what might be the rear of the ship where an array of what look like massive engines are mounted.",
    location: "MovieTheaterD",
    vocab: ["vessel", "ship", "projection", "movie", "rear", "engines"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 0,
    itemSize: 10,
    meta: {
      sceneryDescriptionOrder: 2,
    },
  },
  {
    id: "MovieTheaterDHusk",
    name: "shriveled husk",
    description:
      "The body is fused to the floor, face down, reduced to a shriveled husk with the clear outline of arms and legs. It looks like a headless molted skin.",
    sceneryDescription:
      "[[newline]]Fused to the floor is a nude body, face down, and reduced to a shriveled husk with the clear outline of arms and legs, like a headless, molted skin.",
    location: "MovieTheaterD",
    vocab: ["body", "husk", "shriveled husk", "skin", "molted skin"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 70,
    itemSize: 5,
    meta: {
      sceneryDescriptionOrder: 3,
    },
  },
  {
    id: "MovieTheaterDHead",
    name: "severed head",
    description:
      "The head has rolled down to the next tier and wedged itself near an aisle seat, blank eyes tilted toward the movie it is no longer watching.",
    sceneryDescription:
      "A trail of slime reveals the head to have rolled to the next tier down, where it stares up at you with blank eyes from where it got wedged next to an aisle seat.",
    location: "MovieTheaterD",
    vocab: ["head", "severed head", "slime", "aisle seat", "blank eyes"],
    itemClass: "solid",
    itemCategory: "scenery",
    itemWeight: 10,
    itemSize: 2,
    meta: {
      sceneryDescriptionOrder: 4,
    },
  },
];
