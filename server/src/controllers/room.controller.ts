import { Request, Response } from 'express';
import { roomsService } from '../services/room.service';
import { ConflictError, NotFoundError } from '../errors/AppError';

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

  return res.status(200).json(updatedRoom);
}

export const roomsController = {
  createRoom,
  getAllRooms,
  getRoomById,
  joinRoom,
  leaveRoom,
};
