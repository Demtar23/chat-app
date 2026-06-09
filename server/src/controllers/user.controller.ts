import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { NotFoundError, ValidationError } from '../errors/AppError';
import { deleteAvatar, uploadAvatar } from '../services/upload.service';
import { getIo } from '../socket/socketInstance';

async function getMe(req: Request, res: Response) {
  const { id } = req.user!;

  const user = await userService.getUserById(id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return res.status(200).json(user);
}

async function getAllUsers(req: Request, res: Response) {
  const users = await userService.getAllUsers();

  return res.status(200).json(users);
}

async function getUserById(req: Request, res: Response) {
  const userId = req.params.id as string;

  const user = await userService.getUserById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return res.status(200).json(user);
}

async function updateMe(req: Request, res: Response) {
  const { id } = req.user!;
  const { bio, avatar, bannerColor } = req.body;

  const updated = await userService.updateUser(id, {
    bio,
    avatar,
    bannerColor,
  });

  if (!updated) {
    throw new NotFoundError('User not found');
  }

  return res.status(200).json(updated);
}

async function uploadAvatarHandler(req: Request, res: Response) {
  const { id } = req.user!;

  if (!req.file) {
    throw new ValidationError('No file provided');
  }

  const avatarUrl = await uploadAvatar(req.file.buffer, id);

  const updated = await userService.updateUser(id, { avatar: avatarUrl });
  if (!updated) throw new NotFoundError('User not found');

  // сповістити всіх через socket
  const io = getIo();
  io?.emit('user:updated', {
    _id: updated._id.toString(),
    username: updated.username,
    bio: updated.bio,
    avatar: updated.avatar,
    lastSeen: updated.lastSeen,
    bannerColor: updated.bannerColor,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  });

  return res.status(200).json({ avatar: avatarUrl });
}

async function deleteAvatarHandler(req: Request, res: Response) {
  const { id } = req.user!;

  await deleteAvatar(id);

  const updated = await userService.updateUser(id, { avatar: null });
  if (!updated) throw new NotFoundError('User not found');

  const io = getIo();
  io?.emit('user:updated', {
    _id: updated._id.toString(),
    username: updated.username,
    bio: updated.bio,
    avatar: null,
    lastSeen: updated.lastSeen,
    bannerColor: updated.bannerColor,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  });

  return res.status(200).json({ avatar: null });
}

export const userController = {
  getMe,
  getAllUsers,
  getUserById,
  updateMe,
  uploadAvatarHandler,
  deleteAvatarHandler,
};
