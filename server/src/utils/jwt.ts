import jsonwebtoken from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error('JWT secrets are not defined in environment variables');
}

const accessSecret: string = ACCESS_SECRET;
const refreshSecret: string = REFRESH_SECRET;

type UserPayload = {
  id: string;
  username: string;
};

function generateAccessToken(user: UserPayload): string {
  return jsonwebtoken.sign(user, accessSecret, {
    expiresIn: '10m',
  });
}

function generateRefreshToken(user: UserPayload): string {
  return jsonwebtoken.sign(user, refreshSecret, {
    expiresIn: '7d',
  });
}

function validateAccessToken(token: string): UserPayload | null {
  try {
    return jsonwebtoken.verify(token, accessSecret) as UserPayload;
  } catch {
    return null;
  }
}

function validateRefreshToken(token: string): UserPayload | null {
  try {
    return jsonwebtoken.verify(token, refreshSecret) as UserPayload;
  } catch {
    return null;
  }
}

export const jwt = {
  generateAccessToken,
  generateRefreshToken,
  validateAccessToken,
  validateRefreshToken,
};
