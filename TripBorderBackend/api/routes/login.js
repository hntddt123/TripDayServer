/* eslint-disable import/no-extraneous-dependencies */
import { Router } from 'express';
import session from 'express-session';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import pg from 'pg';
import connectPgSimple from 'connect-pg-simple';
import fs from 'fs';
import knex from 'knex';
import knexfile from '../../knexfile';

const SessionStore = connectPgSimple(session);
const knexInstance = (process.env.NODE_ENV === 'development')
  ? knex(knexfile.development)
  : knex(knexfile.production);

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
const { DB_HOST, DB_USER, DB_NAME } = process.env;
const { SESSION_SECRET } = process.env;
const { FRONTEND_ORIGIN } = process.env;

const DB_PASSWORD = fs.readFileSync('/run/secrets/db_password', 'utf8').trim();

const loginRouter = Router();

const pgPool = new pg.Pool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: 5432,
});

loginRouter.use(session({
  store: new SessionStore({
    pool: pgPool,
    tableName: 'session'
  }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24hr
  }
}));

// Middleware for routes
loginRouter.use(passport.initialize());
loginRouter.use(passport.session());

passport.use(new GoogleStrategy(
  {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, callback) => {
    // fetch or create user here based on profile data
    try {
      let user = await knexInstance('user_accounts').where({ provider_user_id: profile.id }).first();

      if (!user) {
        user = await knexInstance('user_accounts').insert({
          provider: profile.provider,
          provider_user_id: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          profile_picture: profile.photos[0].value,
          // If storing tokens (securely)
          // access_token: accessToken,
          // refresh_token: refreshToken,
        }).returning('*').then((rows) => rows[0]);
      }
      callback(null, user);
    } catch (err) {
      callback(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Routes for Google authentication
loginRouter.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

loginRouter.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(`${FRONTEND_ORIGIN}/?auth=success`);
  }
);

loginRouter.get('/', (req, res) => {
  if (req.user && req.session.views) {
    req.session.views += 1;

    res.json({
      isLoggedIn: true,
      viewCount: req.session.views,
      user: req.user.name,
      profilePicture: req.user.profile_picture,
      message: `Welcome ${req.user.name}`
    });
  } else {
    req.session.views = 1;
    res.json({
      message: 'please login',
      isLoggedIn: false
    });
  }
});

// Logout route
loginRouter.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
      res.status(500).send('An error occurred while logging out');
    } else {
      res.clearCookie('connect.sid');
      res.redirect('/');
    }
  });
});

export default loginRouter;
