import { Room } from '../models/Room';

async function createRoom(
  name: string,
  description: string,
  createdBy: string,
) {
  return Room.create({ name, description, createdBy, members: [createdBy] });
}

async function getAllRooms() {
  return Room.find().sort({ createdAt: -1 });
}

async function getRoomById(roomId: string) {
  return Room.findById(roomId);
}

async function getRoomByName(name: string) {
  return Room.findOne({ name });
}

async function joinRoom(roomId: string, userId: string) {
  return Room.findByIdAndUpdate(
    roomId,
    { $addToSet: { members: userId } },
    { returnDocument: 'after' },
  );
}

async function leaveRoom(roomId: string, userId: string) {
  return Room.findByIdAndUpdate(
    roomId,
    { $pull: { members: userId } },
    { returnDocument: 'after' },
  );
}

async function isRoomMember(roomId: string, userId: string) {
  const room = await Room.findById(roomId);
  return room?.members.includes(userId) ?? false;
}

export const roomsService = {
  createRoom,
  getAllRooms,
  getRoomById,
  getRoomByName,
  joinRoom,
  leaveRoom,
  isRoomMember,
};
