export type TeleportPadId = string;
export type TeleportRingId = string;

export interface TeleportPadDefinition {
  id: TeleportPadId;
  ringId: TeleportRingId; // "green-disk", "red-disk", etc
  order: number; // 0, 1, 2… within the ring
  roomId: string; // where this pad lives
  label: string; // "green disk", for messaging
  autoTriggerOnEnter?: boolean; // optional: pad fires when you enter the room
}
