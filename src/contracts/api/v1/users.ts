export type UsersPostRequest = {
  username: string;
  email: string;
  password: string;
};

export type UsersPostResponse = {
  id: number;
  username: string;
  email: string;
};

export type UsersUsernameGetResponse = {
  id: number;
  username: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
};
