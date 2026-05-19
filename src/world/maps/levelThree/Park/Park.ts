import type { Item } from "@game/types/itemTypes";
import { parkCenterItems } from "./parkCenterItems";
import { parkEastItems } from "./parkEastItems";
import { parkMaintenanceItems } from "./parkMaintenanceItems";
import { parkNorthItems } from "./parkNorthItems";
import { parkRooms } from "./parkRooms";
import { parkSouthItems } from "./parkSouthItems";
import { parkWestItems } from "./parkWestItems";

export { parkRooms };

export const parkItems: Item[] = [
  ...parkEastItems,
  ...parkSouthItems,
  ...parkWestItems,
  ...parkNorthItems,
  ...parkMaintenanceItems,
  ...parkCenterItems,
];
