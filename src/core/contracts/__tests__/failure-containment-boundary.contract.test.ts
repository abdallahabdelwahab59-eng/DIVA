import { describe, expect, it } from "vitest";

interface FailurePolicy {
  retryable: boolean;
  maxRetries: number;
}

const shouldRetry = (
  policy: FailurePolicy,
  retryCount: number
): boolean => {
  if (!policy.retryable) {
    return false;
  }

  if (policy.maxRetries < 0) {
    return false;
  }

  return retryCount < policy.maxRetries;
};

describe("FailureContainmentBoundaryContract", () => {
  it("allows retry for a retryable failure within the limit", () => {
    const policy: FailurePolicy = {
      retryable: true,
      maxRetries: 3,
    };

    expect(shouldRetry(policy, 0)).toBe(true);
    expect(shouldRetry(policy, 2)).toBe(true);
  });

  it("stops retrying when the retry limit is reached", () => {
    const policy: FailurePolicy = {
      retryable: true,
      maxRetries: 3,
    };

    expect(shouldRetry(policy, 3)).toBe(false);
    expect(shouldRetry(policy, 4)).toBe(false);
  });

  it("does not retry non-retryable failures", () => {
    const policy: FailurePolicy = {
      retryable: false,
      maxRetries: 3,
    };

    expect(shouldRetry(policy, 0)).toBe(false);
  });

  it("rejects invalid negative retry limits", () => {
    const policy: FailurePolicy = {
      retryable: true,
      maxRetries: -1,
    };

    expect(shouldRetry(policy, 0)).toBe(false);
  });
});
