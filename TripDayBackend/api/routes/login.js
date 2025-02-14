/* eslint-disable import/no-extraneous-dependencies */
import { Router } from 'express';
import session from 'express-session';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import pg from 'pg';
import connectPgSimple from 'connect-pg-simple';

const SessionStore = connectPgSimple(session);

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
const { SESSION_SECRET } = process.env;

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
  ((accessToken, refreshToken, profile, callback) => {
    // fetch or create user here based on profile data
    callback(null, profile);
  }
  )
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
    res.redirect('/');
  }
);

loginRouter.get('/', (req, res) => {
  if (req.user && req.session.views) {
    req.session.views += 1;
    res.send(`Hello, ${req.user.displayName}! You are logged in. Viewed: ${req.session.views}`);
  } else {
    req.session.views = 1;
    res.send('Please log in.');
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

loginRouter.get('/', (req, res) => {
  res.send(`Hello! You are ${req.user ? `logged in as ${req.user.displayName}` : 'not logged in'}`);
});

export default loginRouter;
