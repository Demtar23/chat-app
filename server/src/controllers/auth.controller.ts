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

  const payload = {
    id: user._id.toString(),
    username: user.username,
  };

  const accessToken = jwt.generateAccessToken(payload);
  const refreshToken = jwt.generateRefreshToken(payload);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return res.status(201).json({
    message: 'User created',
    user: {
      id: user._id,
      username: user.username,
    },
    accessToken,
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

  res.cookie('refreshToken', refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return res.status(200).json({
    user: {
      id: user._id,
      username: user.username,
    },
    accessToken,
  });
}

async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies?.refreshToken ?? '';

  if (!refreshToken) {
    return res.status(401).json({
      message: 'No refresh token',
    });
  }

  const userData = jwt.validateRefreshToken(refreshToken);

  if (!userData) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(401).json({
      message: 'Invalid token',
    });
  }

  const user = await usersService.findUserByUsername(userData.username);

  if (!user) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(401).json({
      message: 'User not found',
    });
  }

  const payload = {
    id: user._id.toString(),
    username: user.username,
  };

  const accessToken = jwt.generateAccessToken(payload);

  return res.status(200).json({
    user: {
      id: user._id,
      username: user.username,
    },
    accessToken,
  });
}

async function logout(req: Request, res: Response) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return res.sendStatus(204);
}

export const authController = {
  register,
  login,
  refresh,
  logout,
};
