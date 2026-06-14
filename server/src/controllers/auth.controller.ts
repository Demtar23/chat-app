import { Request, Response } from 'express';
import { usersService } from '../services/auth.service';
import { jwt } from '../utils/jwt';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/AppError';
import { mailer } from '../utils/mailer';
import { IUser } from '../models/User';
import { getIo } from '../socket/socketInstance';

const COOKIE_OPTIONS = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
} as const;

async function register(req: Request, res: Response) {
  const { username, email, password } = req.body;
  const locale = req.body.locale === 'uk' ? 'uk' : 'en';

  const isExistUsername = await usersService.findUserByUsername(username);

  if (isExistUsername) {
    throw new ConflictError('Username already taken');
  }

  const isExistEmail = await usersService.findUserByEmail(email);

  if (isExistEmail) {
    throw new ConflictError('Email already registered');
  }

  const user = await usersService.createUser(username, email, password);

  await mailer.sendActivationLink(email, user.emailVerificationToken!, locale);

  return res.status(201).json({
    message:
      'Registration successful. Please check your email to verify your account.',
  });
}

async function login(req: Request, res: Response) {
  console.log('========== NORMAL LOGIN ==========');
  const { email, password } = req.body;

  const user = await usersService.findUserByEmail(email);

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isPasswordValid = await usersService.validatePassword(
    password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  if (!user.isEmailVerified) {
    throw new UnauthorizedError('Please verify your email before logging in');
  }

  const payload = {
    id: user._id.toString(),
    username: user.username,
  };

  const accessToken = jwt.generateAccessToken(payload);
  const refreshToken = jwt.generateRefreshToken(payload);

  console.log('COOKIE_OPTIONS:', COOKIE_OPTIONS);

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  console.log('SET-COOKIE HEADER:', res.getHeader('Set-Cookie'));

  console.log('COOKIE SET IN LOGIN');

  return res.status(200).json({
    user: {
      id: user._id,
      username: user.username,
    },
    accessToken,
  });
}

async function verifyEmail(req: Request, res: Response) {
  const token = req.params.token as string;

  const user = await usersService.verifyEmail(token);
  if (!user) throw new NotFoundError('Invalid or expired verification token');

  const payload = { id: user._id.toString(), username: user.username };
  const accessToken = jwt.generateAccessToken(payload);
  const refreshToken = jwt.generateRefreshToken(payload);

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  return res.status(200).json({
    message: 'Email verified successfully.',
    user: { id: user._id, username: user.username },
    accessToken,
  });
}

async function changePassword(req: Request, res: Response) {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user!.id;

  const result = await usersService.changePassword(
    userId,
    oldPassword,
    newPassword,
  );

  if (result === null) {
    throw new NotFoundError('User not found');
  }
  if (result === false) {
    throw new UnauthorizedError('Old password is incorrect');
  }

  return res.status(200).json({ message: 'Password changed successfully' });
}

async function refresh(req: Request, res: Response) {
  console.log('========== REFRESH ==========');

  console.log('HEADERS COOKIE:', req.headers.cookie);

  console.log('PARSED COOKIES:', req.cookies);

  console.log('ORIGIN:', req.headers.origin);

  console.log('REFERER:', req.headers.referer);

  console.log('HOST:', req.headers.host);

  const refreshToken = req.cookies?.refreshToken ?? '';

  console.log('HAS REFRESH TOKEN:', !!refreshToken);

  if (!refreshToken) {
    console.log('NO REFRESH TOKEN FOUND');
    throw new UnauthorizedError('No refresh token');
  }

  console.log('TOKEN LENGTH:', refreshToken.length);

  const userData = jwt.validateRefreshToken(refreshToken);

  if (!userData) {
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    throw new UnauthorizedError('Invalid token');
  }

  const user = await usersService.findUserByUsername(userData.username);

  if (!user) {
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    throw new UnauthorizedError('User not found');
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
  res.clearCookie('refreshToken', COOKIE_OPTIONS);

  return res.sendStatus(204);
}

async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;

  const locale = req.body.locale === 'uk' ? 'uk' : 'en';

  const result = await usersService.requestPasswordReset(email);

  if (result) {
    await mailer.sendResetLink(result.user.email, result.resetToken, locale);
  }

  return res.status(200).json({
    message: 'If this email exists, you will receive a reset link shortly.',
  });
}

async function resetPassword(req: Request, res: Response) {
  const token = req.params.token as string;
  const { newPassword } = req.body;

  const user = await usersService.resetPassword(token, newPassword);
  if (!user) throw new NotFoundError('Invalid or expired reset token');

  return res
    .status(200)
    .json({ message: 'Password reset successfully. You can now log in.' });
}

async function googleCallback(req: Request, res: Response) {
  console.log('========== GOOGLE CALLBACK ==========');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('CLIENT_URL:', process.env.CLIENT_URL);
  console.log('req.user:', req.user);
  const data = req.user as unknown as
    | { isNewGoogleUser: false; _id: string; username: string }
    | { isNewGoogleUser: true; email: string; avatar: string | null };

  console.log('isNewGoogleUser:', data.isNewGoogleUser);

  if (data.isNewGoogleUser) {
    const setupToken = jwt.generateSetupToken({
      email: data.email,
      avatar: data.avatar,
    });
    return res.redirect(
      `${process.env.CLIENT_URL}/auth/setup-profile?setup_token=${setupToken}`,
    );
  }

  const payload = { id: data._id.toString(), username: data.username };
  const accessToken = jwt.generateAccessToken(payload);
  const refreshToken = jwt.generateRefreshToken(payload);

  console.log('COOKIE_OPTIONS:', COOKIE_OPTIONS);
  console.log('REFRESH TOKEN LENGTH:', refreshToken.length);

  console.log('SETTING COOKIE NOW');

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  console.log('COOKIE SET');
  console.log('SET-COOKIE HEADER:', res.getHeader('Set-Cookie'));

  const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?token=${accessToken}&refresh=${refreshToken}`;

  console.log('REDIRECT URL:', redirectUrl);

  return res.redirect(redirectUrl);
}

async function setupProfile(req: Request, res: Response) {
  const { setup_token, username } = req.body;

  const tokenData = jwt.validateSetupToken(setup_token);
  if (!tokenData) throw new UnauthorizedError('Invalid or expired setup token');

  const existingUsername = await usersService.findUserByUsername(username);
  if (existingUsername) throw new ConflictError('Username already taken');

  const existingEmail = await usersService.findUserByEmail(tokenData.email);
  if (existingEmail) throw new ConflictError('Email already registered');

  const user = await usersService.createGoogleUser(
    tokenData.email,
    username,
    tokenData.avatar,
  );

  const io = getIo();
  io?.emit('user:new', {
    _id: user._id.toString(),
    username: user.username,
    bio: user.bio ?? '',
    avatar: user.avatar ?? null,
    lastSeen: user.lastSeen ?? null,
    bannerColor: user.bannerColor ?? null,
    createdAt: user.createdAt,
  });

  const payload = { id: user._id.toString(), username: user.username };
  const accessToken = jwt.generateAccessToken(payload);
  const refreshToken = jwt.generateRefreshToken(payload);

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  return res.status(201).json({
    user: { id: user._id, username: user.username },
    accessToken,
  });
}

async function googleRegisterCallback(req: Request, res: Response) {
  const data = req.user as unknown as
    | { isNewGoogleUser: false; alreadyExists: true }
    | { isNewGoogleUser: true; email: string; avatar: string | null };

  if (!data.isNewGoogleUser) {
    return res.redirect(
      `${process.env.CLIENT_URL}/register?error=google_account_exists`,
    );
  }

  const setupToken = jwt.generateSetupToken({
    email: data.email,
    avatar: data.avatar,
  });

  return res.redirect(
    `${process.env.CLIENT_URL}/auth/setup-profile?setup_token=${setupToken}`,
  );
}

async function setRefreshToken(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new UnauthorizedError('No refresh token');

  const userData = jwt.validateRefreshToken(refreshToken);
  if (!userData) throw new UnauthorizedError('Invalid refresh token');

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  return res.status(200).json({ ok: true });
}
export const authController = {
  register,
  login,
  verifyEmail,
  changePassword,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  googleCallback,
  setupProfile,
  googleRegisterCallback,
  setRefreshToken,
};
