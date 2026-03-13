export type TeleportPadId = string;
export type TeleportRingId = string;

export interface TeleportPadDefinition {
  autoTriggerOnEnter?: boolean;
  id: TeleportPadId;
  label: string;
  order: number;
  ringId: TeleportRingId;
  roomId: string;
}
