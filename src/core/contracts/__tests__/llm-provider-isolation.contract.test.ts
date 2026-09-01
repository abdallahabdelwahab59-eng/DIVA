import { describe, expect, it } from "vitest";
import type { LLMContract, LLMRequest } from "../llm.contract.js";

describe("LLMProviderIsolationContract", () => {
  it("keeps provider-specific details outside the core LLM contract", async () => {
    const request: LLMRequest = {
      input: "test input",
      context: {
        organizationId: "org-1",
        workspaceId: "workspace-1",
        projectId: "project-1",
      },
      constraints: {
        maxCost: 1,
      },
    };

    const llm: LLMContract = {
      async execute(received) {
        return {
          output: received.input,
          metadata: {
            provider: "test-provider",
          },
        };
      },
    };

    const response = await llm.execute(request);

    expect(response.output).toBe("test input");
    expect(response.metadata).toEqual({
      provider: "test-provider",
    });

    expect(request).not.toHaveProperty("apiKey");
    expect(request).not.toHaveProperty("providerApiKey");
    expect(request).not.toHaveProperty("secret");
  });
});
