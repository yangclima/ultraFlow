export type ErrorResponse = {
  name: string;
  message: string;
  action: string;
  status_code: number;
  [key: string]: unknown;
};
