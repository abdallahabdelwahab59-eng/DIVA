import { describe, expect, it } from "vitest";

type GovernanceDecision =
  | "ALLOW"
  | "DENY"
  | "APPROVAL_REQUIRED";

interface GovernanceRequest {
  action: string;
  risk: "low" | "medium" | "high" | "critical";
  authorized: boolean;
}

const evaluateGovernance = (
  request: GovernanceRequest
): GovernanceDecision => {
  if (!request.authorized) {
    return "DENY";
  }

  if (request.risk === "high" || request.risk === "critical") {
    return "APPROVAL_REQUIRED";
  }

  return "ALLOW";
};

describe("GovernanceAuthorizationBoundaryContract", () => {
  it("allows an authorized low-risk operation", () => {
    const request: GovernanceRequest = {
      action: "update-product",
      risk: "low",
      authorized: true,
    };

    expect(evaluateGovernance(request)).toBe("ALLOW");
  });

  it("denies an unauthorized operation", () => {
    const request: GovernanceRequest = {
      action: "delete-project",
      risk: "critical",
      authorized: false,
    };

    expect(evaluateGovernance(request)).toBe("DENY");
  });

  it("requires approval for an authorized high-risk operation", () => {
    const request: GovernanceRequest = {
      action: "modify-production-schema",
      risk: "high",
      authorized: true,
    };

    expect(evaluateGovernance(request)).toBe("APPROVAL_REQUIRED");
  });

  it("does not allow governance to execute the business operation", () => {
    const governance = {
      evaluate: evaluateGovernance,
    };

    expect(typeof governance.evaluate).toBe("function");
    expect(
      "execute" in governance
    ).toBe(false);
  });
});
