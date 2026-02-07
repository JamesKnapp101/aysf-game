import { Room } from "@game/types/roomTypes";

// 7-room layout for the bull charge puzzle:
//
//        PresA --- PresB --- PresC
//          |                 |
//        PresD --- PresE --- PresF
//                    |
//                  PresG

export const preserveRooms: Room[] = [
  {
    id: "PresA",
    name: "Preserve: West Gate",
    description:
      "A weathered gate marks the western edge of the preserve. The ground is hard-packed from old hoofprints, and the wind carries the dry scent of grass.",
    descriptionShort: "At the west gate.",
    exits: [
      { direction: "east", toRoomId: "PresB" },
      { direction: "south", toRoomId: "PresD" },
    ],
  },
  {
    id: "PresB",
    name: "Preserve: Ridge Path",
    description:
      "A narrow ridge path runs east-west here, slightly elevated above the surrounding field. From up here you can see movement in the grass.",
    descriptionShort: "On the ridge path.",
    exits: [
      { direction: "west", toRoomId: "PresA" },
      { direction: "east", toRoomId: "PresC" },
      { direction: "north", toRoomId: "Pond" },
      { direction: "south", toRoomId: "PresE" },
    ],
  },
  {
    id: "PresC",
    name: "Preserve: Broken Fence",
    description:
      "The fence is split and sagging, with snapped boards scattered in the weeds. It’s an awkward corner of the field—easy to get pinned if something big decides to rush you.",
    descriptionShort: "By the broken fence.",
    exits: [
      { direction: "west", toRoomId: "PresB" },
      { direction: "south", toRoomId: "PresF" },
    ],
  },
  {
    id: "PresD",
    name: "Preserve: Shallow Ditch",
    description:
      "A shallow ditch cuts through the grass, more a wrinkle in the terrain than a barrier. Footing is tricky; you’d rather not be here if you needed to sprint.",
    descriptionShort: "At the shallow ditch.",
    exits: [
      { direction: "north", toRoomId: "PresA" },
      { direction: "east", toRoomId: "PresE" },
      { direction: "south", toRoomId: "VeterinaryCenter" },
    ],
  },
  {
    id: "PresE",
    name: "Preserve: Open Field",
    description:
      "The field opens wide here, with multiple paths out in every direction. The grass is flattened in long streaks, as if something heavy has charged through more than once.",
    descriptionShort: "In the open field.",
    exits: [
      { direction: "west", toRoomId: "PresD" },
      { direction: "east", toRoomId: "PresF" },
      { direction: "north", toRoomId: "PresB" },
      { direction: "south", toRoomId: "PresG" },
    ],
  },
  {
    id: "PresF",
    name: "Preserve: Stone Wall",
    description:
      "A low stone wall borders the field. It’s solid enough to stop a charge cold. If something came barreling in, it would have to slow down—or crash.",
    descriptionShort: "Beside the stone wall.",
    exits: [
      { direction: "west", toRoomId: "PresE" },
      { direction: "north", toRoomId: "PresC" },
    ],
  },
  {
    id: "PresG",
    name: "Preserve: Narrow Run",
    description:
      "The grass gives way to a narrow run between rough posts and old wire. It’s a straight shot with little room to sidestep—useful if you’re trying to control where something ends up.",
    descriptionShort: "In the narrow run.",
    exits: [{ direction: "north", toRoomId: "PresE" }],
  },
];
