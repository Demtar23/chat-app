import { User } from '../models/User';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

async function findUserByUsername(username: string) {
  return User.findOne({ username });
}

async function findUserByEmail(email: string) {
  return User.findOne({ email });
}

async function findUserById(id: string) {
  return User.findById(id);
}

async function createUser(username: string, email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 год

  return User.create({
    username,
    email,
    passwordHash: hashedPassword,
    isEmailVerified: false,
    emailVerificationToken,
    emailVerificationExpires,
  });
}

async function verifyEmail(token: string) {
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) return null;

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  return user.save();
}

async function validatePassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

async function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string,
) {
  const user = await User.findById(userId);
  if (!user) return null;

  const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isValid) return false;

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  return true;
}

async function requestPasswordReset(email: string) {
  const user = await User.findOne({ email });
  if (!user) return null;

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

  user.passwordResetToken = resetToken;
  user.passwordResetExpires = resetExpires;
  await user.save();

  return { user, resetToken };
}

async function resetPassword(token: string, newPassword: string) {
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) return null;

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  return user;
}

async function createGoogleUser(
  email: string,
  username: string,
  avatar: string | null,
) {
  return User.create({
    username,
    email,
    passwordHash: crypto.randomBytes(32).toString('hex'),
    isEmailVerified: true,
    avatar,
  });
}

export const usersService = {
  findUserByUsername,
  findUserByEmail,
  findUserById,
  createUser,
  verifyEmail,
  validatePassword,
  changePassword,
  requestPasswordReset,
  resetPassword,
  createGoogleUser,
};
