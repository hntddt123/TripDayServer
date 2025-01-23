import express from 'express';
import dotenv from 'dotenv';
import knex from 'knex';
import morgan from 'morgan'; // logger
import helmet from 'helmet';

import knexfile from './knexfile';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const knexInstance = knex(knexfile.development);
const app = express();
const serverPort = 5400;

app.use(morgan('dev'));
app.use(helmet());

app.get('/', (req, res) => {
  knexInstance.raw('SELECT NOW()').then((result) => {
    res.send(`Hello World! The current time is ${result.rows[0].now}`);
  }).catch((error) => {
    res.status(500).json(`Error: ${error}`);
  });
});

app.listen(serverPort, () => {
  console.log(`Tripday ${process.env.NODE_ENV} server listening at http://localhost:${serverPort}`);
});
