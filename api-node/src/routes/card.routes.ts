import { IncomingMessage, ServerResponse } from 'http';
import { CardController } from '../controllers/card.controller';

const cardController = new CardController();

export const cardRoutes = async (req: IncomingMessage, res: ServerResponse) => {
  const { method, url } = req;

  if (url === '/cards' && method === 'POST') {
    await cardController.handleRegisterCard(req, res);
    return true;
  }

  return false;
};
