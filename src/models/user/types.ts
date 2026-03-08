export type CreateUserDTO = {
  email: string;
  username: string;
  password: string;
};

export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
};
