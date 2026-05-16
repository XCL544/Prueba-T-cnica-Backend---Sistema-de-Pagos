import http from 'http';
import dotenv from 'dotenv';
import { router } from './routes';
import { handleError } from './utils/error-handler';
import { logger } from './utils/logger';

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  const start = Date.now();
  const { method, url } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    if (statusCode >= 500) {
      logger.error(`[${method}] ${url} - ${statusCode} - ${duration}ms`);
    } else if (statusCode >= 400) {
      logger.warn(`[${method}] ${url} - ${statusCode} - ${duration}ms`);
    } else {
      logger.info(`[${method}] ${url} - ${statusCode} - ${duration}ms`);
    }
  });

  try {
    await router(req, res);
  } catch (error) {
    handleError(res, error);
  }
});

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} (Pure Node.js)`);
});
