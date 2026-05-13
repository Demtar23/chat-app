export type ActiveChat =
  | { type: 'global' }
  | { type: 'room'; roomId: string; roomName: string }
  | { type: 'private'; userId: string; username: string };