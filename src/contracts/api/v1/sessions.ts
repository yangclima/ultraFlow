export type SessionsPostRequest = {
  email: string;
  password: string;
};

export type SessionsPostResponse = {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
};
