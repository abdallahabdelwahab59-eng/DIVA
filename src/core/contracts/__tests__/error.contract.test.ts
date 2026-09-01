import { describe, expect, it } from "vitest";
import type { ErrorContract } from "../error.contract.js";

describe("ErrorContract", () => {
  it("represents a retryable operational error", () => {
    const error: ErrorContract = {
      code: "PROVIDER_TIMEOUT",
      message: "Provider request timed out",
      category: "provider",
      retryable: true,
      correlationId: "error-test-1",
    };

    expect(error.code).toBe("PROVIDER_TIMEOUT");
    expect(error.category).toBe("provider");
    expect(error.retryable).toBe(true);
    expect(error.correlationId).toBe("error-test-1");
  });

  it("represents a non-retryable error", () => {
    const error: ErrorContract = {
      code: "INVALID_REQUEST",
      message: "Request is invalid",
      category: "validation",
      retryable: false,
      correlationId: "error-test-2",
    };

    expect(error.retryable).toBe(false);
    expect(error.category).toBe("validation");
  });
});
