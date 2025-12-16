export type TeleportPadId = string;
export type TeleportRingId = string;

export interface TeleportPadDefinition {
  id: TeleportPadId;
  ringId: TeleportRingId;
  order: number;
  roomId: string;
  label: string;
  autoTriggerOnEnter?: boolean;
}
