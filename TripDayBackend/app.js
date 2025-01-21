import express from 'express';
import dotenv from 'dotenv';
import knex from 'knex';
import morgan from 'morgan'; // logger
import knexfile from './knexfile';

dotenv.config({ path: '.env.development' });

const knexInstance = knex(knexfile.development);
const app = express();
const serverPort = 5400;

app.use(morgan('dev'));

app.get('/', (req, res) => {
	knexInstance.raw('SELECT NOW()').then((result) => {
		res.send(`Hello World! The current time is ${result.rows[0].now}`);
	}).catch((error) => {
		res.status(500).json(`Database error ${error}`);
	});
});

app.listen(serverPort, () => {
	console.log(`Example app listening at http://localhost:${serverPort}`);
});
