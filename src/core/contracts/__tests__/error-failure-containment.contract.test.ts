import { describe, expect, it } from "vitest";
import type { ErrorContract } from "../error.contract.js";

describe("ErrorFailureContainmentContract", () => {
  it("requires retryable failures to remain explicitly classified", () => {
    const error: ErrorContract = {
      code: "RATE_LIMIT",
      message: "Rate limit exceeded",
      category: "provider",
      retryable: true,
      correlationId: "failure-test-1",
    };

    expect(error.retryable).toBe(true);
    expect(error.category).toBe("provider");
    expect(error.correlationId).toBe("failure-test-1");
  });

  it("does not allow a non-retryable failure to be treated as retryable", () => {
    const error: ErrorContract = {
      code: "INVALID_CONFIGURATION",
      message: "Invalid configuration",
      category: "configuration",
      retryable: false,
      correlationId: "failure-test-2",
    };

    expect(error.retryable).toBe(false);
  });
});
