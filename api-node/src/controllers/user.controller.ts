import { IncomingMessage, ServerResponse } from 'http';
import { UserService } from '../services/user.service';
import { parseBody } from '../utils/body-parser';
import { CreateUserDTO } from '../types/user';
import { handleError } from '../utils/error-handler';
import { BadRequestException } from '../exceptions/app.exceptions';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async handleCreateUser(req: IncomingMessage, res: ServerResponse) {
    try {
      const body = await parseBody<CreateUserDTO>(req);

      // Basic validation
      if (!body.email || !body.password || !body.full_name) {
        throw new BadRequestException(
          'Missing required fields: email, password, full_name',
          'MISSING_FIELDS',
        );
      }

      const user = await this.userService.createUser(body);

      // Remove password hash from response
      const { password_hash, ...userResponse } = user;

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(userResponse));
    } catch (error) {
      handleError(res, error);
    }
  }
}
