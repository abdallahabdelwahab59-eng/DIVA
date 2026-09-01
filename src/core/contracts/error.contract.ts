export interface ErrorContract {
  code: string;
  message: string;
  category: string;
  retryable: boolean;
  correlationId: string;
}
