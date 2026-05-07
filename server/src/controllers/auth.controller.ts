import { Request, Response } from 'express';
import { usersService } from '../services/auth.service';
import { jwt } from '../utils/jwt';

async function register(req: Request, res: Response) {
  const { username, password } = req.body;

  const isUserExist = await usersService.findUserByUsername(username);

  if (isUserExist) {
    return res.status(409).json({
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

async function login(req: Request, res: Response) {
  const { username, password } = req.body;

  const user = await usersService.findUserByUsername(username);

  if (!user) {
    return res.status(401).json({
      message: 'Invalid credentials',
    });
  }

  const isPasswordValid = await usersService.validatePassword(
    password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    return res.status(401).json({
      message: 'Invalid credentials',
    });
  }

  const payload = {
    id: user._id.toString(),
    username: user.username,
  };

  const accessToken = jwt.generateAccessToken(payload);
  const refreshToken = jwt.generateRefreshToken(payload);

  return res.status(200).json({
    user: {
      id: user._id,
      username: user.username,
    },
    accessToken,
    refreshToken,
  });
}

export const authController = {
  register,
  login,
};
