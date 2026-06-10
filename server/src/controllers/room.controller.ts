import { Request, Response } from 'express';
import { roomsService } from '../services/room.service';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../errors/AppError';
import { getIo } from '../socket/socketInstance';

async function createRoom(req: Request, res: Response) {
  const { name, description } = req.body;
  const { id: createdBy } = req.user!;

  const existingRoom = await roomsService.getRoomByName(name);

  if (existingRoom) {
    throw new ConflictError('Room already exists');
  }

  const room = await roomsService.createRoom(
    name,
    description ?? '',
    createdBy,
  );

  const io = getIo();
  io?.emit('room:created', room);

  return res.status(201).json(room);
}

async function getAllRooms(req: Request, res: Response) {
  const rooms = await roomsService.getAllRooms();
  return res.status(200).json(rooms);
}

async function getRoomById(req: Request, res: Response) {
  const roomId = req.params.roomId as string;

  const room = await roomsService.getRoomById(roomId);

  if (!room) {
    throw new NotFoundError('Room not found');
  }

  return res.status(200).json(room);
}

async function joinRoom(req: Request, res: Response) {
  const roomId = req.params.roomId as string;
  const { id: userId } = req.user!;

  const room = await roomsService.getRoomById(roomId);

  if (!room) {
    throw new NotFoundError('Room not found');
  }

  const updatedRoom = await roomsService.joinRoom(roomId, userId);

  const io = getIo();
  io?.emit('room:updated', updatedRoom);

  return res.status(200).json(updatedRoom);
}

async function leaveRoom(req: Request, res: Response) {
  const roomId = req.params.roomId as string;

  const { id: userId } = req.user!;

  const room = await roomsService.getRoomById(roomId);

  if (!room) {
    throw new NotFoundError('Room not found');
  }

  const updatedRoom = await roomsService.leaveRoom(roomId, userId);

  const io = getIo();
  io?.emit('room:updated', updatedRoom);

  return res.status(200).json(updatedRoom);
}

async function deleteRoom(req: Request, res: Response) {
  const roomId = req.params.roomId as string;
  const { id: userId } = req.user!;

  const room = await roomsService.getRoomById(roomId);
  if (!room) throw new NotFoundError('Room not found');

  if (room.createdBy !== userId) {
    throw new ForbiddenError('Only room owner can delete it');
  }

  await roomsService.deleteRoom(roomId);

  const io = getIo();
  io?.emit('room:deleted', { roomId });

  return res.status(200).json({ roomId });
}

async function updateRoom(req: Request, res: Response) {
  const roomId = req.params.roomId as string;
  const { id: userId } = req.user!;
  const { description } = req.body;

  const room = await roomsService.getRoomById(roomId);
  if (!room) throw new NotFoundError('Room not found');

  if (room.createdBy !== userId) {
    throw new ForbiddenError('Only room owner can update it');
  }

  const updatedRoom = await roomsService.updateRoom(roomId, description ?? '');

  const io = getIo();
  io?.emit('room:updated', updatedRoom);

  return res.status(200).json(updatedRoom);
}

export const roomsController = {
  createRoom,
  getAllRooms,
  getRoomById,
  joinRoom,
  leaveRoom,
  deleteRoom,
  updateRoom,
};
