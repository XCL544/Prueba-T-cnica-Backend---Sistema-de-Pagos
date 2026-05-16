import { IncomingMessage, ServerResponse } from 'http';
import { UserController } from '../controllers/user.controller';

const userController = new UserController();

export const userRoutes = async (req: IncomingMessage, res: ServerResponse) => {
  const { method, url } = req;

  if (url === '/users' && method === 'POST') {
    await userController.handleCreateUser(req, res);
    return true;
  }

  return false;
};
