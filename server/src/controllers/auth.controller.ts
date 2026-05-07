import { Request, Response } from 'express';
import { usersService } from '../services/auth.service';

async function register(req: Request, res: Response) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Missing fields',
    });
  }

  const isUserExist = await usersService.findUserByUsername(username);

  if (isUserExist) {
    return res.status(400).json({
      message: 'User already exists',
    });
  }

  const user = await usersService.createUser(username, password);

  return res.status(201).json({
    message: 'User created',
    user: {
      id: user._id,
      username: user.username,
    },
  });
}

export const authController = {
  register,
};
