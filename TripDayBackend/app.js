import express from 'express';
import dotenv from 'dotenv';
import knex from 'knex';
import morgan from 'morgan'; // logger
import helmet from 'helmet';
import https from 'https';
import fs from 'fs';

import knexfile from './knexfile';
import loginRouter from './api/routes/login';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const knexInstance = knex(knexfile.development);
const app = express();
const serverPort = 443;

app.use(morgan('dev'));
app.use(helmet());

const options = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH)
};

const httpsServer = https.createServer(options, app);

app.use(loginRouter);

app.get('/', (req, res) => {
  knexInstance.raw('SELECT NOW()').then((result) => {
    res.send(`Hello World! The current time is ${result.rows[0].now}`);
  }).catch((err) => {
    res.status(500).json(`Error: ${err}`);
  });
});

httpsServer.listen(serverPort, () => {
  console.log(`Tripday ${process.env.NODE_ENV} server listening at https://localhost:${serverPort}`);
});
