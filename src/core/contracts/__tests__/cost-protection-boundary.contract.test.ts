import { describe, expect, it } from "vitest";

interface CostRequest {
  estimatedCost: number;
  budgetLimit: number;
}

const isCostAuthorized = (request: CostRequest): boolean => {
  return request.estimatedCost <= request.budgetLimit;
};

describe("CostProtectionBoundaryContract", () => {
  it("allows an operation within the budget limit", () => {
    const request: CostRequest = {
      estimatedCost: 0.05,
      budgetLimit: 0.10,
    };

    expect(isCostAuthorized(request)).toBe(true);
  });

  it("rejects an operation that exceeds the budget limit", () => {
    const request: CostRequest = {
      estimatedCost: 0.15,
      budgetLimit: 0.10,
    };

    expect(isCostAuthorized(request)).toBe(false);
  });

  it("rejects negative budget limits", () => {
    const request: CostRequest = {
      estimatedCost: 0.01,
      budgetLimit: -1,
    };

    expect(isCostAuthorized(request)).toBe(false);
  });

  it("rejects invalid cost values", () => {
    const request: CostRequest = {
      estimatedCost: Number.NaN,
      budgetLimit: 1,
    };

    expect(isCostAuthorized(request)).toBe(false);
  });
});
