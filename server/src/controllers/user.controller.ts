import { Request, Response } from 'express';
import { userService } from '../services/user.service';

async function getMe(req: Request, res: Response) {
  const { id } = req.user!;

  const user = await userService.getUserById(id);

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
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
    return res.status(404).json({
      message: 'User not found',
    });
  }

  return res.status(200).json(user);
}

async function updateMe(req: Request, res: Response) {
  const { id } = req.user!;
  const { bio, avatar } = req.body;

  const updated = await userService.updateUser(id, {
    bio,
    avatar,
  });

  if (!updated) {
    return res.status(404).json({
      message: 'User not found',
    });
  }

  return res.status(200).json(updated);
}

export const userController = {
  getMe,
  getAllUsers,
  getUserById,
  updateMe,
};
