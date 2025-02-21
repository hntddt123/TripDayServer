/* eslint-disable import/no-extraneous-dependencies */
import request from 'supertest';
import express from 'express';
import knex from 'knex';

const app = express();

// Mocking Knex
jest.mock('knex', () => {
  const mockKnex = {
    raw: jest.fn(),
    destroy: jest.fn(),
  };
  return jest.fn(() => mockKnex);
});

// Mock Express app setup
app.get('/', (req, res) => {
  knex().raw('SELECT NOW()')
    .then((result) => {
      res.send(`Hello World! The current time is ${result.rows[0].now}`);
    })
    .catch((error) => {
      res.status(500).json(`Database error ${error}`);
    });
});

test('Canary Test', () => {
  expect(1).toBe(1);
});

describe('GET /', () => {
  const mockNow = new Date().toISOString();
  knex().raw.mockResolvedValueOnce({ rows: [{ now: mockNow }] });

  it('should respond with the current time from the database', async () => {
    const response = await request(app).get('/');

    expect(response.text).toContain(`Hello World! The current time is ${mockNow}`);
    expect(response.status).toBe(200);
  });

  it('should handle database errors', async () => {
    const mockError = new Error('Database error');
    knex().raw.mockRejectedValueOnce(mockError);

    const response = await request(app).get('/');

    expect(response.statusCode).toBe(500);
    expect(response.text).toContain('Database error');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Ensure the mock destroy method is called if needed
    knex().destroy.mockRestore();
  });
});
