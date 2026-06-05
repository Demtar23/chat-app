import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User';

// стратегія для логіну — якщо не існує, редірект на setup
passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
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

        // не знайшли — редірект на setup
        return done(null, { isNewGoogleUser: true, email, avatar });
      } catch (err) {
        return done(err as Error);
      }
    },
  ),
);

// стратегія для реєстрації — якщо вже існує, повертає помилку
passport.use(
  'google-register',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.SERVER_URL}/api/auth/google/register/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email from Google'));

        const avatar = profile.photos?.[0]?.value ?? null;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
          // акаунт вже існує — повертаємо спеціальний флаг
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
