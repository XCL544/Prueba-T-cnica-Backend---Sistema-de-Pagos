import { pool } from '../config/database';
import { Card, CreateCardDTO } from '../types/card';

export class CardRepository {
  async create(cardData: CreateCardDTO): Promise<Card> {
    const query = `
      INSERT INTO cards (user_id, token, brand, last_four, exp_month, exp_year)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      cardData.user_id,
      cardData.token,
      cardData.brand,
      cardData.last_four,
      cardData.exp_month,
      cardData.exp_year,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async findByUserIdAndToken(userId: string, token: string): Promise<Card | null> {
    const query = 'SELECT * FROM cards WHERE user_id = $1 AND token = $2;';
    const { rows } = await pool.query(query, [userId, token]);
    return rows[0] || null;
  }
}
