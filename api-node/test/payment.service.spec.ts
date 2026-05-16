import { PaymentService } from '../src/services/payment.service';
import { PaymentRepository } from '../src/repositories/payment.repository';
import { UserRepository } from '../src/repositories/user.repository';
import { CardRepository } from '../src/repositories/card.repository';
import { CreatePaymentDTO, Payment } from '../src/types/payment';
import { BadRequestException, NotFoundException, InternalServerException } from '../src/exceptions/app.exceptions';

// Mock fetch for external API calls
global.fetch = jest.fn();

describe('PaymentService Unit Tests', () => {
  let paymentService: PaymentService;
  let mockPaymentRepository: jest.Mocked<PaymentRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockCardRepository: jest.Mocked<CardRepository>;

  beforeEach(() => {
    mockPaymentRepository = {
      create: jest.fn(),
      updateStatus: jest.fn(),
      findByUserId: jest.fn(),
    } as unknown as jest.Mocked<PaymentRepository>;

    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    mockCardRepository = {
      findById: jest.fn(),
      findByUserIdAndToken: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<CardRepository>;

    paymentService = new PaymentService(mockPaymentRepository, mockUserRepository, mockCardRepository);
    jest.clearAllMocks();
  });

  const validPaymentData: CreatePaymentDTO = {
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    card_id: '123e4567-e89b-12d3-a456-426614174001',
    amount: 150.50,
  };

  const mockUser = { id: validPaymentData.user_id, full_name: 'Test' } as any;
  const mockCard = { id: validPaymentData.card_id, user_id: validPaymentData.user_id } as any;
  const mockPendingPayment = { id: 'payment-uuid', ...validPaymentData, status: 'pending' } as any;

  describe('createPayment', () => {
    it('should successfully create and process a payment', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockCardRepository.findById.mockResolvedValue(mockCard);
      mockPaymentRepository.create.mockResolvedValue(mockPendingPayment);
      
      const approvedPayment = { ...mockPendingPayment, status: 'approved', provider_tx_id: 'tx-123' };
      mockPaymentRepository.updateStatus.mockResolvedValue(approvedPayment);

      // Mock successful fetch
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'approved', transaction_id: 'tx-123' }),
      });

      const result = await paymentService.createPayment(validPaymentData);

      expect(result.status).toBe('approved');
      expect(mockPaymentRepository.create).toHaveBeenCalledWith(validPaymentData);
      expect(global.fetch).toHaveBeenCalled();
      expect(mockPaymentRepository.updateStatus).toHaveBeenCalledWith('payment-uuid', 'approved', 'tx-123');
    });

    it('should fail and mark payment as failed if Python service throws an error', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockCardRepository.findById.mockResolvedValue(mockCard);
      mockPaymentRepository.create.mockResolvedValue(mockPendingPayment);

      // Mock failed fetch
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(paymentService.createPayment(validPaymentData)).rejects.toThrow(
        new InternalServerException('Payment provider unavailable or failed to process', 'PROVIDER_ERROR')
      );

      expect(mockPaymentRepository.updateStatus).toHaveBeenCalledWith('payment-uuid', 'failed', null);
    });

    it('should throw BadRequestException if amount is <= 0', async () => {
      await expect(paymentService.createPayment({ ...validPaymentData, amount: 0 })).rejects.toThrow(
        new BadRequestException('Amount must be greater than zero', 'INVALID_AMOUNT')
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);
      await expect(paymentService.createPayment(validPaymentData)).rejects.toThrow(
        new NotFoundException('User not found', 'USER_NOT_FOUND')
      );
    });

    it('should throw BadRequestException if card does not belong to user', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockCardRepository.findById.mockResolvedValue({ id: validPaymentData.card_id, user_id: 'another-user-uuid' } as any);

      await expect(paymentService.createPayment(validPaymentData)).rejects.toThrow(
        new BadRequestException('Card does not belong to this user', 'CARD_OWNERSHIP_MISMATCH')
      );
    });
  });

  describe('getPaymentsByUser', () => {
    it('should return a list of payments for a valid user', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockPaymentRepository.findByUserId.mockResolvedValue([mockPendingPayment]);

      const result = await paymentService.getPaymentsByUser(validPaymentData.user_id);

      expect(result).toHaveLength(1);
      expect(mockPaymentRepository.findByUserId).toHaveBeenCalledWith(validPaymentData.user_id);
    });

    it('should throw BadRequestException if user_id format is invalid in GET', async () => {
      await expect(paymentService.getPaymentsByUser('invalid-uuid')).rejects.toThrow(
        new BadRequestException('Invalid user_id format', 'INVALID_UUID')
      );
    });
  });
});
