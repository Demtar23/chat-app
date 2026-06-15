import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User';

const SERVER_URL = process.env.SERVER_URL!;

passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${SERVER_URL}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email from Google'));

        const avatar = profile.photos?.[0]?.value ?? null;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
          if (!existingUser.isEmailVerified) {
            existingUser.isEmailVerified = true;
            await existingUser.save();
          }
          return done(null, {
            isNewGoogleUser: false,
            _id: existingUser._id.toString(),
            username: existingUser.username,
          });
        }

        return done(null, { isNewGoogleUser: true, email, avatar });
      } catch (err) {
        return done(err as Error);
      }
    },
  ),
);

passport.use(
  'google-register',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${SERVER_URL}/api/auth/google/register/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email from Google'));

        const avatar = profile.photos?.[0]?.value ?? null;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
          return done(null, { isNewGoogleUser: false, alreadyExists: true });
        }

        return done(null, { isNewGoogleUser: true, email, avatar });
      } catch (err) {
        return done(err as Error);
      }
    },
  ),
);

export default passport;
