export interface User {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  full_name: string;
  email: string;
  password: string;
}
