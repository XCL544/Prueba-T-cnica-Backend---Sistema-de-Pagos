import { IncomingMessage, ServerResponse } from 'http';
import { CardService } from '../services/card.service';
import { parseBody } from '../utils/body-parser';
import { CreateCardDTO } from '../types/card';
import { handleError } from '../utils/error-handler';
import { BadRequestException } from '../exceptions/app.exceptions';
import { logger } from '../utils/logger';

export class CardController {
  private cardService: CardService;

  constructor() {
    this.cardService = new CardService();
  }

  async handleRegisterCard(req: IncomingMessage, res: ServerResponse) {
    try {
      const body = await parseBody<CreateCardDTO>(req);
      
      // Basic validation for required fields
      if (!body.user_id || !body.token || !body.brand || !body.last_four || !body.exp_month || !body.exp_year) {
        throw new BadRequestException('Missing required fields: user_id, token, brand, last_four, exp_month, exp_year', 'MISSING_FIELDS');
      }

      const card = await this.cardService.registerCard(body);
      
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(card));
    } catch (error) {
      logger.error('Error handling register card request', error);
      handleError(res, error);
    }
  }
}
