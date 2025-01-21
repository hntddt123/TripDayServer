// eslint-disable-next-line import/no-extraneous-dependencies
import request from 'supertest';
import { Pool } from 'pg';
import express from 'express';

const app = express();
const pool = new Pool();

jest.mock('pg', () => {
  const mPool = {
    query: jest.fn()
  };
  return { Pool: jest.fn(() => mPool) };
});

// Mock the route handler
app.get('/', (req, res) => {
  pool.query('SELECT NOW()', (err, result) => {
    if (err) {
      res.status(500).send('Database error');
    } else {
      res.send(`Hello World! The current time is ${result.rows[0].now}`);
    }
  });
});

test('Canary Test', () => {
  expect(1).toBe(1);
});

describe('GET /', () => {
  const mockNow = new Date().toISOString();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Mocking the PostgreSQL query
    const poolInstance = new Pool(); // Use the mocked Pool
    poolInstance.query.mockImplementation((query, callback) => {
      callback(null, { rows: [{ now: mockNow }] });
    });
  });

  it('should respond with the current time from the database', async () => {
    const response = await request(app).get('/');

    expect(response.text).toContain(`Hello World! The current time is ${mockNow}`);
    expect(response.status).toBe(200);
  });

  it('should handle database errors', async () => {
    new Pool().query.mockImplementationOnce((query, callback) => {
      callback(new Error(), null);
    });

    const response = await request(app).get('/');

    expect(response.statusCode).toBe(500);
    expect(response.error.text).toContain('Database error');
  });
});
