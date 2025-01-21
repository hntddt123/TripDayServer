import express from 'express';
import { Client } from 'pg';
import dotenv from 'dotenv';
import morgan from 'morgan'; // logger

dotenv.config({ path: '.env.development' });

const app = express();
const serverPort = 5400;

const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

client.connect((err) => {
  if (err) {
    console.error('connection error', err.stack);
  } else {
    console.log('connected');
  }
});

app.get('/', (req, res) => {
  client.query('SELECT NOW()', (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(`Hello World! The current time is ${result.rows[0].now}`);
    }
  });
});

app.listen(serverPort, () => {
  console.log(`Example app listening at http://localhost:${serverPort}`);
});
