import express from 'express';
import morgan from 'morgan'; // logger
import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';

import apiRoute from './api';

const app = express();

app.set('port', (process.env.PORT || 8081));

app.use(json());
app.use(urlencoded({ extended: false }));

app.use(cors());
app.use(express.static('public'));

app.use(morgan('dev'));

app.use('/api', apiRoute);

app.use((req, res) => {
	const err = new Error('Not Found');
	err.status = 404;
	res.json(err);
});

mongoose.connect('mongodb://localhost:27017/tripday', { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', () => {
	console.error('connection error');
});

db.once('open', () => {
	console.log('Connected to MongoDB');

	app.listen(app.get('port'), () => {
		console.log(`API Server Listening on port ${app.get('port')}!`);
	});
});
