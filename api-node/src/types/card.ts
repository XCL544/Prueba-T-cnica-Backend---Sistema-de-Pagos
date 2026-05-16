export interface Card {
  id: string;
  user_id: string;
  token: string;
  brand: string | null;
  last_four: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
  created_at: Date;
}

export interface CreateCardDTO {
  user_id: string;
  token: string;
  brand: string;
  last_four: string;
  exp_month: number;
  exp_year: number;
}
