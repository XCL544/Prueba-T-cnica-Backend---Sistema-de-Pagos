import { IncomingMessage } from 'http';
import { BadRequestException } from '../exceptions/app.exceptions';

export const parseBody = <T>(req: IncomingMessage): Promise<T> => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        if (!body) {
          resolve({} as T);
        } else {
          resolve(JSON.parse(body));
        }
      } catch (error) {
        reject(new BadRequestException('Invalid JSON payload', 'INVALID_JSON'));
      }
    });
    req.on('error', (err) => {
      reject(err);
    });
  });
};
