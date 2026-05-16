export interface Payment {
  id: string;
  user_id: string;
  card_id: string;
  amount: string; // DECIMAL is parsed as string by node-pg
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'failed';
  provider_tx_id: string | null;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePaymentDTO {
  user_id: string;
  card_id: string;
  amount: number;
  currency?: string;
  description?: string;
}
