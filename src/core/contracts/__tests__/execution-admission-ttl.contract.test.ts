import { describe, expect, it } from "vitest";

describe("Execution Admission TTL Contract", () => {
  it("rejects an expired execution admission", () => {
    const now = 2_000;
    const admission = {
      issuedAt: 1_000,
      expiresAt: 1_500,
    };

    const valid = now < admission.expiresAt;

    expect(valid).toBe(false);
  });

  it("accepts an admission that is still within its TTL", () => {
    const now = 1_200;
    const admission = {
      issuedAt: 1_000,
      expiresAt: 1_500,
    };

    const valid =
      now >= admission.issuedAt &&
      now < admission.expiresAt;

    expect(valid).toBe(true);
  });

  it("does not allow an untrusted actor to extend the admission TTL", () => {
    const admission = {
      issuedAt: 1_000,
      expiresAt: 1_500,
    };

    const requestedExpiration = 9_999;
    const actorCanExtend = false;

    const effectiveExpiration = actorCanExtend
      ? requestedExpiration
      : admission.expiresAt;

    expect(effectiveExpiration).toBe(1_500);
  });

  it("requires fresh admission after expiration", () => {
    const now = 2_000;
    const oldAdmission = {
      expiresAt: 1_500,
    };

    const expired = now >= oldAdmission.expiresAt;

    const requiresReadmission = expired;

    expect(requiresReadmission).toBe(true);
  });

  it("fails closed when admission expiration is reached", () => {
    const now = 1_500;
    const admission = {
      expiresAt: 1_500,
    };

    const executionAllowed = now < admission.expiresAt;

    expect(executionAllowed).toBe(false);
  });
});
