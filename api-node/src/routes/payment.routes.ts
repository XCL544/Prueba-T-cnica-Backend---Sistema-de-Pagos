import { IncomingMessage, ServerResponse } from 'http';
import { PaymentController } from '../controllers/payment.controller';

const paymentController = new PaymentController();

export const paymentRoutes = async (req: IncomingMessage, res: ServerResponse) => {
  const { method, url } = req;
  
  if (!url) return false;

  // Create payment
  if (url === '/payments' && method === 'POST') {
    await paymentController.handleCreatePayment(req, res);
    return true;
  }

  // Get payments by user id
  // Matches /payments/UUID
  const getPaymentsMatch = url.match(/^\/payments\/([0-9a-fA-F-]{36})$/);
  if (getPaymentsMatch && method === 'GET') {
    const userId = getPaymentsMatch[1];
    await paymentController.handleGetPayments(req, res, userId);
    return true;
  }

  return false;
};
