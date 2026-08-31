import { describe, expect, it } from "vitest";
import type {
  LLMContract,
  LLMRequest,
  LLMResponse,
} from "../llm.contract.js";

describe("LLMContract", () => {
  it("executes an LLM request and returns an LLM response", async () => {
    const request: LLMRequest = {
      input: { prompt: "test" },
      context: { projectId: "project-1" },
      constraints: { maxCost: 1 },
    };

    const response: LLMResponse = {
      output: { text: "test response" },
      metadata: { model: "test-model" },
    };

    const llm: LLMContract = {
      execute: async (receivedRequest) => {
        expect(receivedRequest).toEqual(request);
        return response;
      },
    };

    const result = await llm.execute(request);

    expect(result).toEqual(response);
  });
});
