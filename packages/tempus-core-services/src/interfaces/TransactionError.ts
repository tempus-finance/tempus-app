export interface TransactionError extends Error {
  data?: {
    code: number;
    message: string;
  };
}
