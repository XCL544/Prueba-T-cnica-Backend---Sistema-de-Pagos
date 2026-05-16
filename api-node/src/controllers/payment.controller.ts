import { IncomingMessage, ServerResponse } from 'http';
import { PaymentService } from '../services/payment.service';
import { parseBody } from '../utils/body-parser';
import { CreatePaymentDTO } from '../types/payment';
import { handleError } from '../utils/error-handler';
import { BadRequestException } from '../exceptions/app.exceptions';
import { logger } from '../utils/logger';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  async handleCreatePayment(req: IncomingMessage, res: ServerResponse) {
    try {
      const body = await parseBody<CreatePaymentDTO>(req);
      
      if (!body.user_id || !body.card_id || body.amount === undefined) {
        throw new BadRequestException('Missing required fields: user_id, card_id, amount', 'MISSING_FIELDS');
      }

      const payment = await this.paymentService.createPayment(body);
      
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(payment));
    } catch (error) {
      handleError(res, error);
    }
  }

  async handleGetPayments(req: IncomingMessage, res: ServerResponse, userId: string) {
    try {
      const payments = await this.paymentService.getPaymentsByUser(userId);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(payments));
    } catch (error) {
      handleError(res, error);
    }
  }
}
