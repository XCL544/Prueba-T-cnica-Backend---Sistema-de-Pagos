import { IncomingMessage, ServerResponse } from 'http';
import { userRoutes } from './user.routes';
import { pool } from '../config/database';
import { NotFoundException } from '../exceptions/app.exceptions';

export const router = async (req: IncomingMessage, res: ServerResponse) => {
  const { method, url } = req;

  // Health check
  if (url === '/health' && method === 'GET') {
    await pool.query('SELECT 1');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'UP',
        service: 'Payment API (Pure Node.js)',
        database: 'CONNECTED',
      }),
    );
    return;
  }

  // User Routes
  const handledByUser = await userRoutes(req, res);
  if (handledByUser) return;

  // If no route matches
  throw new NotFoundException(
    `Route ${method} ${url} not found`,
    'ROUTE_NOT_FOUND',
  );
};
