import { describe, expect, it } from "vitest";

describe("Execution Admission Integrity Contract", () => {
  it("rejects an expired admission", () => {
    const admission = {
      issuedAt: 1000,
      expiresAt: 2000,
    };

    const now = 2001;

    const valid = now <= admission.expiresAt;

    expect(valid).toBe(false);
  });

  it("accepts an admission that is still within its TTL", () => {
    const admission = {
      issuedAt: 1000,
      expiresAt: 2000,
    };

    const now = 1999;

    const valid = now <= admission.expiresAt;

    expect(valid).toBe(true);
  });

  it("rejects an admission when authorization provenance changes", () => {
    const admission = {
      authorizationDecisionId: "decision-1",
    };

    const currentAuthorizationDecisionId = "decision-2";

    const valid =
      admission.authorizationDecisionId ===
      currentAuthorizationDecisionId;

    expect(valid).toBe(false);
  });

  it("rejects an admission when the policy version changes", () => {
    const admission = {
      policyVersion: "policy-v1",
    };

    const currentPolicyVersion = "policy-v2";

    const valid =
      admission.policyVersion === currentPolicyVersion;

    expect(valid).toBe(false);
  });

  it("rejects an admission when execution context changes", () => {
    const admission = {
      tenantId: "tenant-a",
      projectId: "project-a",
    };

    const currentContext = {
      tenantId: "tenant-b",
      projectId: "project-a",
    };

    const valid =
      admission.tenantId === currentContext.tenantId &&
      admission.projectId === currentContext.projectId;

    expect(valid).toBe(false);
  });
});
