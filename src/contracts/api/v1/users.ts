export type UsersPostRequest = {
  username: string;
  email: string;
  password: string;
};

export type UsersPostResponse = {
  id: string;
  username: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
};

export type UsersUsernameGetResponse = {
  id: string;
  username: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
};
