import { CardService } from '../src/services/card.service';
import { CardRepository } from '../src/repositories/card.repository';
import { UserRepository } from '../src/repositories/user.repository';
import { BadRequestException, NotFoundException, ConflictException } from '../src/exceptions/app.exceptions';
import { CreateCardDTO, Card } from '../src/types/card';
import { User } from '../src/types/user';

describe('CardService Unit Tests', () => {
  let cardService: CardService;
  let mockCardRepository: jest.Mocked<CardRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockCardRepository = {
      create: jest.fn(),
      findByUserIdAndToken: jest.fn(),
    } as unknown as jest.Mocked<CardRepository>;

    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    cardService = new CardService(mockCardRepository, mockUserRepository);
  });

  const validCardData: CreateCardDTO = {
    user_id: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID
    token: 'tok_visa12345',
    brand: 'Visa',
    last_four: '4242',
    exp_month: 12,
    exp_year: new Date().getFullYear() + 2, // Valid future year
  };

  const validUser: User = {
    id: validCardData.user_id,
    full_name: 'Test',
    email: 'test@example.com',
    password_hash: 'hash',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  it('should successfully register a valid card', async () => {
    const createdCard: Card = {
      id: 'card_uuid',
      ...validCardData,
      is_default: false,
      created_at: new Date(),
    };

    mockUserRepository.findById.mockResolvedValue(validUser);
    mockCardRepository.findByUserIdAndToken.mockResolvedValue(null);
    mockCardRepository.create.mockResolvedValue(createdCard);

    const result = await cardService.registerCard(validCardData);

    expect(result).toBeDefined();
    expect(result.token).toBe(validCardData.token);
    expect(mockUserRepository.findById).toHaveBeenCalledWith(validCardData.user_id);
    expect(mockCardRepository.findByUserIdAndToken).toHaveBeenCalledWith(validCardData.user_id, validCardData.token);
    expect(mockCardRepository.create).toHaveBeenCalledWith(validCardData);
  });

  it('should throw BadRequestException for invalid user_id format', async () => {
    const invalidData = { ...validCardData, user_id: 'invalid-id' };
    await expect(cardService.registerCard(invalidData)).rejects.toThrow(
      new BadRequestException('Invalid user_id format', 'INVALID_UUID')
    );
  });

  it('should throw BadRequestException for invalid exp_month', async () => {
    const invalidData = { ...validCardData, exp_month: 13 };
    await expect(cardService.registerCard(invalidData)).rejects.toThrow(
      new BadRequestException('Expiration month must be between 1 and 12', 'INVALID_EXP_MONTH')
    );
  });

  it('should throw BadRequestException for invalid exp_year (past)', async () => {
    const invalidData = { ...validCardData, exp_year: 2000 };
    await expect(cardService.registerCard(invalidData)).rejects.toThrow(
      new BadRequestException('Expiration year is invalid or in the past', 'INVALID_EXP_YEAR')
    );
  });

  it('should throw BadRequestException for invalid last_four', async () => {
    const invalidData = { ...validCardData, last_four: '424' }; // 3 digits
    await expect(cardService.registerCard(invalidData)).rejects.toThrow(
      new BadRequestException('last_four must be exactly 4 digits', 'INVALID_LAST_FOUR')
    );
  });

  it('should throw BadRequestException for empty brand', async () => {
    const invalidData = { ...validCardData, brand: '   ' };
    await expect(cardService.registerCard(invalidData)).rejects.toThrow(
      new BadRequestException('brand is required and must be under 20 characters', 'INVALID_BRAND')
    );
  });

  it('should throw NotFoundException if user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(cardService.registerCard(validCardData)).rejects.toThrow(
      new NotFoundException('User not found', 'USER_NOT_FOUND')
    );
    expect(mockUserRepository.findById).toHaveBeenCalledWith(validCardData.user_id);
  });

  it('should throw ConflictException if card token is already registered for this user', async () => {
    mockUserRepository.findById.mockResolvedValue(validUser);
    const existingCard: Card = {
      id: 'card_uuid',
      ...validCardData,
      is_default: false,
      created_at: new Date(),
    };
    mockCardRepository.findByUserIdAndToken.mockResolvedValue(existingCard);

    await expect(cardService.registerCard(validCardData)).rejects.toThrow(
      new ConflictException('Card is already registered for this user', 'CARD_ALREADY_REGISTERED')
    );
  });
});
