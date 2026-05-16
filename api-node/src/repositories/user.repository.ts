import { pool } from '../config/database';
import { User, CreateUserDTO } from '../types/user';

export class UserRepository {
  async create(userData: CreateUserDTO, passwordHash: string): Promise<User> {
    const query = `
      INSERT INTO users (full_name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [userData.full_name, userData.email, passwordHash];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1;';
    const { rows } = await pool.query(query, [email]);
    return rows[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1;';
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }
}
