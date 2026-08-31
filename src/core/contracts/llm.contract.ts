export interface LLMRequest {
  input: unknown;
  context?: unknown;
  constraints?: unknown;
}

export interface LLMResponse {
  output: unknown;
  metadata?: unknown;
}

export interface LLMContract {
  execute(request: LLMRequest): Promise<LLMResponse>;
}
