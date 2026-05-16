import { pool } from '../config/database';
import { Payment, CreatePaymentDTO } from '../types/payment';

export class PaymentRepository {
  async create(paymentData: CreatePaymentDTO): Promise<Payment> {
    const query = `
      INSERT INTO payments (user_id, card_id, amount, currency, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      paymentData.user_id,
      paymentData.card_id,
      paymentData.amount,
      paymentData.currency || 'USD',
      paymentData.description || null,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async updateStatus(id: string, status: string, providerTxId: string | null): Promise<Payment> {
    const query = `
      UPDATE payments 
      SET status = $1, provider_tx_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [status, providerTxId, id]);
    return rows[0];
  }

  async findByUserId(userId: string): Promise<Payment[]> {
    const query = 'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC;';
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }
}
