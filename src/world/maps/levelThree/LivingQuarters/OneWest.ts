import { Room } from "@game/types/roomTypes";

export const oneWestRooms: Room[] = [
  // LIVING QUARTERS ONE WEST
  {
    id: "LivingQuartersOneWest",
    name: "Living Quarters One West",
    description: `This set of living quarters is a complete wreck...as you cast the flashlight beam around to room you see a grey sofa which has been overturned, stuffing spilling from one side, a loveseat in similar condition lying on its side near the north wall, what looks like the splintered remains of a desk, and strewn all around are the smashed remnants of a television and what might have been a stereo...it looks as though someone or something deliberately trashed the place, and there is shattered glass, plastic, and small electronic components scattered everywhere. There are tears on the surface of the furniture, and what look like deep claw marks gouging the walls. You can see the shattered remains of the lighting near the ceiling. A door to the south has been pulverized, leaving only an empty doorway, and another doorway leads east.`,
    exits: [
      { direction: "east", doorId: "DOOR3AW" },
      { direction: "south", doorId: "OneWestBDoor" },
      { direction: "west", toRoomId: "OneWestBed" },
    ],
  },
  {
    id: "OneWestBath",
    name: "One West Bathroom",
    description: `This is a small bathroom which looks to have been ransacked; the flashlight beam reveals a toilet with a chunk missing from one side, a sink which has been smashed off the wall and is currently resting on the floor next to the toilet, a shattered mirror mounted above where the sink used to be, and a shredded shower curtain hanging in ribbons in front of a small shower unit. Above you, you can see the remains of the lighting fixtures which have also been destroyed. A doorway leads back out to the north.`,
    exits: [{ direction: "north", toRoomId: "LivingQuartersOneWest" }],
  },
  {
    id: "OneWestBed",
    name: "One West Bedroom",
    description: `These sleeping quarters have likewise been violently torn apart; your flashlight finds the remains of a double bed which dominates the room, the bedding torn apart and strewn everywhere. The headboard is splintered on the left side and deeply gouged with what appear to be claw marks. The mattress has been split open and tossed to one side, and the boxspring has been ripped open. An endtable and dresser have been overturned, scattering sundries across the floor to mingle with the rest of the debris. Lying on the floor is a somewhat battered message box with an integrated headset. A doorway leads back out to the west.`,
    exits: [{ direction: "east", toRoomId: "LivingQuartersOneWest" }],
  },
];
