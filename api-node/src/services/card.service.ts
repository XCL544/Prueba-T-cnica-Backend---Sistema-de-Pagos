import { CardRepository } from '../repositories/card.repository';
import { UserRepository } from '../repositories/user.repository';
import { Card, CreateCardDTO } from '../types/card';
import { NotFoundException, BadRequestException, ConflictException } from '../exceptions/app.exceptions';
import { isValidUUID, isValidExpMonth, isValidExpYear, isValidLastFour, isValidBrand } from '../utils/validators';
import { logger } from '../utils/logger';

export class CardService {
  private cardRepository: CardRepository;
  private userRepository: UserRepository;

  constructor(
    cardRepository = new CardRepository(),
    userRepository = new UserRepository()
  ) {
    this.cardRepository = cardRepository;
    this.userRepository = userRepository;
  }

  async registerCard(cardData: CreateCardDTO): Promise<Card> {
    logger.info('Registering new card', { userId: cardData.user_id, lastFour: cardData.last_four });

    // Validate User ID format
    if (!isValidUUID(cardData.user_id)) {
      throw new BadRequestException('Invalid user_id format', 'INVALID_UUID');
    }

    // Validate Expiration Month
    if (!isValidExpMonth(cardData.exp_month)) {
      throw new BadRequestException('Expiration month must be between 1 and 12', 'INVALID_EXP_MONTH');
    }

    // Validate Expiration Year
    if (!isValidExpYear(cardData.exp_year)) {
      throw new BadRequestException('Expiration year is invalid or in the past', 'INVALID_EXP_YEAR');
    }

    // Validate Last Four
    if (!isValidLastFour(cardData.last_four)) {
      throw new BadRequestException('last_four must be exactly 4 digits', 'INVALID_LAST_FOUR');
    }

    // Validate Brand
    if (!isValidBrand(cardData.brand)) {
      throw new BadRequestException('brand is required and must be under 20 characters', 'INVALID_BRAND');
    }

    // Check if user exists
    const user = await this.userRepository.findById(cardData.user_id);
    if (!user) {
      throw new NotFoundException('User not found', 'USER_NOT_FOUND');
    }

    // Check if the card token is already registered for this user
    const existingCard = await this.cardRepository.findByUserIdAndToken(cardData.user_id, cardData.token);
    if (existingCard) {
      throw new ConflictException('Card is already registered for this user', 'CARD_ALREADY_REGISTERED');
    }

    const newCard = await this.cardRepository.create(cardData);
    logger.info('Card registered successfully', { cardId: newCard.id, userId: newCard.user_id });
    
    return newCard;
  }
}
