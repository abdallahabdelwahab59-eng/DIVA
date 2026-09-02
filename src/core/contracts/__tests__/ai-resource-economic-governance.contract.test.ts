import { describe, expect, it } from "vitest";
import type {
  EconomicAdmissionDecision,
  EconomicAdmissionRequest,
  EconomicGovernanceContract,
  MoneyAmount,
  ResourceBudget,
  ResourceConsumption,
  ResourceReservation,
} from "../ai-resource-economic-governance.contract.js";

describe("AI Resource & Economic Governance Contract Boundary", () => {
  it("defines commercial money independently from resource units", () => {
    const price: MoneyAmount = {
      amount: 4000,
      currency: "EGP",
    };

    const cost: MoneyAmount = {
      amount: 1000,
      currency: "EGP",
    };

    expect(price.currency).toBe("EGP");
    expect(cost.currency).toBe("EGP");
    expect(price.amount).toBe(4000);
    expect(cost.amount).toBe(1000);
  });

  it("defines an economic admission request with explicit policy and pricing versions", () => {
    const request: EconomicAdmissionRequest = {
      tenantId: "tenant-01",
      projectId: "project-01",
      executionId: "execution-01",
      estimatedUnits: 100,
      estimatedDirectCost: {
        amount: 1000,
        currency: "EGP",
      },
      commercialPrice: {
        amount: 4000,
        currency: "EGP",
      },
      resourceLimit: 100,
      authorizationDecisionId: "auth-01",
      policyVersion: "economic-policy-v1",
      pricingVersion: "pricing-v1",
    };

    expect(request.estimatedUnits).toBe(100);
    expect(request.estimatedDirectCost.currency).toBe("EGP");
    expect(request.commercialPrice.currency).toBe("EGP");
    expect(request.policyVersion).toBe("economic-policy-v1");
    expect(request.pricingVersion).toBe("pricing-v1");
  });

  it("defines explicit economic admission decisions", () => {
    const decisions: EconomicAdmissionDecision[] = [
      {
        decision: "ALLOW",
        reason: "within approved economic policy",
        policyVersion: "economic-policy-v1",
        calculatedGrossMargin: 0.75,
      },
      {
        decision: "DENY",
        reason: "insufficient resources",
        policyVersion: "economic-policy-v1",
      },
      {
        decision: "CONTAIN",
        reason: "consumption exceeded reservation",
        policyVersion: "economic-policy-v1",
      },
      {
        decision: "PAUSE",
        reason: "economic limit reached",
        policyVersion: "economic-policy-v1",
      },
    ];

    expect(decisions).toHaveLength(4);
    expect(decisions[0].calculatedGrossMargin).toBe(0.75);
  });

  it("defines a reservation with a stable reservation id and expiration", () => {
    const reservation: ResourceReservation = {
      reservationId: "reservation-01",
      executionId: "execution-01",
      reservedUnits: 100,
      expiresAt: Date.now() + 60_000,
    };

    expect(reservation.reservationId).toBe("reservation-01");
    expect(reservation.reservedUnits).toBe(100);
    expect(reservation.expiresAt).toBeGreaterThan(Date.now());
  });

  it("defines actual consumption independently from reserved units", () => {
    const consumption: ResourceConsumption = {
      reservationId: "reservation-01",
      consumedUnits: 63,
    };

    expect(consumption.reservationId).toBe("reservation-01");
    expect(consumption.consumedUnits).toBe(63);
  });

  it("defines the complete resource budget state", () => {
    const budget: ResourceBudget = {
      allocatedUnits: 10_000,
      reservedUnits: 500,
      consumedUnits: 7420,
      remainingUnits: 2080,
    };

    expect(budget.allocatedUnits).toBe(10_000);
    expect(budget.reservedUnits).toBe(500);
    expect(budget.consumedUnits).toBe(7420);
    expect(budget.remainingUnits).toBe(2080);
  });

  it("requires the complete governance contract surface", () => {
    const contract: EconomicGovernanceContract = {
      admit: async () => ({
        decision: "DENY",
        reason: "contract boundary test only",
        policyVersion: "economic-policy-v1",
      }),

      reserve: async () => ({
        reservationId: "reservation-01",
        executionId: "execution-01",
        reservedUnits: 0,
        expiresAt: Date.now(),
      }),

      settle: async () => ({
        allocatedUnits: 0,
        reservedUnits: 0,
        consumedUnits: 0,
        remainingUnits: 0,
      }),

      release: async () => ({
        allocatedUnits: 0,
        reservedUnits: 0,
        consumedUnits: 0,
        remainingUnits: 0,
      }),
    };

    expect(typeof contract.admit).toBe("function");
    expect(typeof contract.reserve).toBe("function");
    expect(typeof contract.settle).toBe("function");
    expect(typeof contract.release).toBe("function");
  });
});
