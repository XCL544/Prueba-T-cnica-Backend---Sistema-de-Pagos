import { UserService } from '../src/services/user.service';
import { UserRepository } from '../src/repositories/user.repository';
import { BadRequestException, ConflictException } from '../src/exceptions/app.exceptions';
import { CreateUserDTO, User } from '../src/types/user';

describe('UserService Unit Tests', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Creating a mock UserRepository
    mockUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    // Injecting the mock repository into our service
    userService = new UserService(mockUserRepository);
  });

  const validUserData: CreateUserDTO = {
    full_name: 'Test User',
    email: 'test@example.com',
    password: 'Password123!', // Valid strong password: >=10 chars, upper, lower, number, symbol
  };

  it('should successfully create a new user', async () => {
    const createdUser: User = {
      id: 'uuid-1234',
      full_name: validUserData.full_name,
      email: validUserData.email,
      password_hash: '$2b$10$hashedpassword',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(createdUser);

    const result = await userService.createUser(validUserData);

    expect(result).toBeDefined();
    expect(result.email).toBe(validUserData.email);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validUserData.email);
    expect(mockUserRepository.create).toHaveBeenCalled();
  });

  it('should throw BadRequestException for invalid email format', async () => {
    const invalidEmailData = { ...validUserData, email: 'invalid-email' };

    await expect(userService.createUser(invalidEmailData)).rejects.toThrow(
      new BadRequestException('The provided email address is invalid', 'INVALID_EMAIL_FORMAT')
    );

    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException for a weak password', async () => {
    const weakPasswordData = { ...validUserData, password: 'short' }; // < 10 characters

    await expect(userService.createUser(weakPasswordData)).rejects.toThrow(
      new BadRequestException(
        'Password must be at least 10 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'WEAK_PASSWORD'
      )
    );

    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it('should throw ConflictException if the email is already registered', async () => {
    const existingUser: User = {
      id: 'uuid-existing',
      full_name: 'Existing User',
      email: validUserData.email,
      password_hash: 'hashed',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockUserRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(userService.createUser(validUserData)).rejects.toThrow(
      new ConflictException('User with this email already exists', 'USER_ALREADY_EXISTS')
    );

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validUserData.email);
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });
});
