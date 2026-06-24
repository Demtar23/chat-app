import { usersService } from '../services/auth.service';
import { jwt } from '../utils/jwt';
import './setup';

describe('usersService', () => {
  describe('createUser', () => {
    it('creates user with hashed password', async () => {
      const user = await usersService.createUser(
        'testuser',
        'test@example.com',
        'Password123!',
      );
      expect(user.username).toBe('testuser');
      expect(user.passwordHash).not.toBe('Password123!');
      expect(user.isEmailVerified).toBe(false);
    });

    it('generates email verification token', async () => {
      const user = await usersService.createUser(
        'testuser2',
        'test2@example.com',
        'Password123!',
      );
      expect(user.emailVerificationToken).toBeTruthy();
    });
  });

  describe('validatePassword', () => {
    it('returns true for correct password', async () => {
      const user = await usersService.createUser(
        'testuser3',
        'test3@example.com',
        'Password123!',
      );
      const result = await usersService.validatePassword(
        'Password123!',
        user.passwordHash,
      );
      expect(result).toBe(true);
    });

    it('returns false for incorrect password', async () => {
      const user = await usersService.createUser(
        'testuser4',
        'test4@example.com',
        'Password123!',
      );
      const result = await usersService.validatePassword(
        'WrongPassword!',
        user.passwordHash,
      );
      expect(result).toBe(false);
    });
  });

  describe('findUserByEmail', () => {
    it('returns user when found', async () => {
      await usersService.createUser(
        'testuser5',
        'test5@example.com',
        'Password123!',
      );
      const found = await usersService.findUserByEmail('test5@example.com');
      expect(found?.email).toBe('test5@example.com');
    });

    it('returns null when not found', async () => {
      const found = await usersService.findUserByEmail('notexist@example.com');
      expect(found).toBeNull();
    });
  });
});

describe('jwt', () => {
  const payload = { id: 'user123', username: 'testuser' };

  describe('access token', () => {
    it('generates and validates access token', () => {
      const token = jwt.generateAccessToken(payload);
      const decoded = jwt.validateAccessToken(token);
      expect(decoded?.id).toBe(payload.id);
      expect(decoded?.username).toBe(payload.username);
    });

    it('returns null for invalid token', () => {
      expect(jwt.validateAccessToken('invalid.token')).toBeNull();
    });
  });

  describe('refresh token', () => {
    it('generates and validates refresh token', () => {
      const token = jwt.generateRefreshToken(payload);
      const decoded = jwt.validateRefreshToken(token);
      expect(decoded?.id).toBe(payload.id);
    });

    it('returns null for invalid refresh token', () => {
      expect(jwt.validateRefreshToken('invalid.token')).toBeNull();
    });
  });
});
