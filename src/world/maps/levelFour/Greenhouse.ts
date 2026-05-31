import { Item } from "@game/types/itemTypes";
import { Room } from "@game/types/roomTypes";

export const greenhouseRooms: Room[] = [
  {
    id: "Greenhouse",
    name: "Greenhouse: Exterior",
    description: `You're standing outside of a large greenhouse with a ribbed hoop frame that spans the length of the wide open space. Through the greenhouse fabric you can make out rows and rows of green plants with splotches of color scattered throughout, along with irrigation piping. There's a door on one side of the greenhouse that you could access the inside through, as well as a dirt path that leads west, the dark entrance to a cave off to the southwest, and the areas exit to the south.`,
    exits: [
      { direction: "west", toRoomId: "Apiary" },
      { direction: "south", toRoomId: "BotanicalOne" },
      { direction: "southwest", toRoomId: "FungalCave" },
      { direction: "in", toRoomId: "GreenhouseInterior" },
    ],
  },
  {
    id: "GreenhouseInterior",
    name: "Greenhouse: Interior",
    description: `You are standing inside a large greenhouse with a ribbed hoop frame arching high overhead, and covered in translucent fabric. It forms a long tunnel with a walkway down the center, while to either side are arranged rows and rows of planters, bushy with green vegetation. Irrigation pipes run the length of the greenhouse over the rows of plants, sprayers pointed downward, though none are running at the moment. The air is humid here, and has an earthy, organic smell, with a jumble of different wildflowers.

Laying prone on the floor near the far end of the walkway is the body of a young man dressed in a dirt-covered green jumpsuit, his back arched, his hands clawed, and his mouth pulled into a frozen grimace. His face is puffy to the degree that it squeezes his eyes shut, and his skin is covered in tiny red dots or hives.`,
    exits: [{ direction: "out", toRoomId: "Greenhouse" }],
  },
];

export const greenhouseItems: Item[] = [
  {
    id: "DeactivatedBee",
    name: "deactivated robo-bee",
    description:
      "At a glace it looks like a normal bumblebee, but a closer inspection reveals that it's actually made up of tiny robotics. It's a machine.",
    initialDescription:
      "Lying in the grass is what appears to be a dead bumblebee.",
    location: "Greenhouse",
    vocab: ["bee", "robo-bee", "bumblebee"],
    itemClass: "solid",
    itemCategory: "collectable",
    itemWeight: 1,
    itemSize: 1,
    meta: {
      specs: `Model:                  POL-ES991
              Version:                5.23.01   
              Uptime:                 19282322231123
              Ping freq:              550ms
              Last ping:              19234234234234
              Trips:                  207
              Total payloads:         3.105g
              Status:                 Idle
              Error Code:             AG4E
              Req Shutdown?           false
              Shutdown freq:          168.880MHz
              Swarm ID:               400190
              Hive ID:                H02
              Region:                 L
              Section:                7`,
    },
  },
];
