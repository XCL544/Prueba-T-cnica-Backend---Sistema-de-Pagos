import { PaymentRepository } from '../repositories/payment.repository';
import { UserRepository } from '../repositories/user.repository';
import { CardRepository } from '../repositories/card.repository';
import { Payment, CreatePaymentDTO } from '../types/payment';
import { NotFoundException, BadRequestException, InternalServerException } from '../exceptions/app.exceptions';
import { isValidUUID, isValidAmount, isValidCurrency } from '../utils/validators';
import { logger } from '../utils/logger';

export class PaymentService {
  private paymentRepository: PaymentRepository;
  private userRepository: UserRepository;
  private cardRepository: CardRepository;

  constructor(
    paymentRepository = new PaymentRepository(),
    userRepository = new UserRepository(),
    cardRepository = new CardRepository()
  ) {
    this.paymentRepository = paymentRepository;
    this.userRepository = userRepository;
    this.cardRepository = cardRepository;
  }

  async createPayment(paymentData: CreatePaymentDTO): Promise<Payment> {
    logger.info('Initiating new payment', { userId: paymentData.user_id, cardId: paymentData.card_id, amount: paymentData.amount });

    // Validations
    if (!isValidUUID(paymentData.user_id)) throw new BadRequestException('Invalid user_id format', 'INVALID_UUID');
    if (!isValidUUID(paymentData.card_id)) throw new BadRequestException('Invalid card_id format', 'INVALID_UUID');
    if (!isValidAmount(paymentData.amount)) throw new BadRequestException('Amount must be greater than zero', 'INVALID_AMOUNT');
    if (paymentData.currency && !isValidCurrency(paymentData.currency)) throw new BadRequestException('Currency must be exactly 3 characters', 'INVALID_CURRENCY');

    // Check User
    const user = await this.userRepository.findById(paymentData.user_id);
    if (!user) throw new NotFoundException('User not found', 'USER_NOT_FOUND');

    // Check Card
    const card = await this.cardRepository.findById(paymentData.card_id);
    if (!card) throw new NotFoundException('Card not found', 'CARD_NOT_FOUND');
    if (card.user_id !== paymentData.user_id) {
      throw new BadRequestException('Card does not belong to this user', 'CARD_OWNERSHIP_MISMATCH');
    }

    // 1. Create Pending Payment
    let payment = await this.paymentRepository.create(paymentData);
    logger.info('Payment created in pending state', { paymentId: payment.id });

    // 2. Process via external Python Service
    try {
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000/process';
      const response = await fetch(pythonServiceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paymentData.amount,
          user_id: paymentData.user_id,
          card_id: paymentData.card_id
        })
      });

      if (!response.ok) {
        throw new Error(`Python service responded with status: ${response.status}`);
      }

      const result = await response.json() as any;
      const status = result.status; // 'approved' or 'rejected'
      const providerTxId = result.transaction_id || null;

      // 3. Update payment status
      payment = await this.paymentRepository.updateStatus(payment.id, status, providerTxId);
      logger.info('Payment processed by provider', { paymentId: payment.id, status });
      return payment;

    } catch (error) {
      logger.error('Error communicating with payment provider', error);
      await this.paymentRepository.updateStatus(payment.id, 'failed', null);
      throw new InternalServerException('Payment provider unavailable or failed to process', 'PROVIDER_ERROR');
    }
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    if (!isValidUUID(userId)) throw new BadRequestException('Invalid user_id format', 'INVALID_UUID');
    
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found', 'USER_NOT_FOUND');

    return this.paymentRepository.findByUserId(userId);
  }
}
