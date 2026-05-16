import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDTO, User } from '../types/user';
import { ConflictException, BadRequestException } from '../exceptions/app.exceptions';
import { isValidEmail, isValidPassword } from '../utils/validators';

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async createUser(userData: CreateUserDTO): Promise<User> {
    // Email format validation
    if (!isValidEmail(userData.email)) {
      throw new BadRequestException(
        'The provided email address is invalid',
        'INVALID_EMAIL_FORMAT'
      );
    }

    // Password strength validation
    if (!isValidPassword(userData.password)) {
      throw new BadRequestException(
        'Password must be at least 10 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'WEAK_PASSWORD'
      );
    }

    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException(
        'User with this email already exists',
        'USER_ALREADY_EXISTS',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    return this.userRepository.create(userData, passwordHash);
  }
}
