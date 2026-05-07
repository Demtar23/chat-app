import { User } from '../models/User';
import bcrypt from 'bcrypt';

async function findUserByUsername(username: string) {
  return User.findOne({ username });
}

async function createUser(username: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return User.create({ username, passwordHash: hashedPassword });
}

export const usersService = {
  findUserByUsername,
  createUser,
};
