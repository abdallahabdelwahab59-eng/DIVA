import type { EconomicPolicyResolver } from "../contracts/ai-resource-economic-governance.contract.js";
import { describe, expect, it } from "vitest";
import { EconomicResourceGovernor } from "./economic-resource-governor.js";

const request = (overrides = {}) => ({
  tenantId: "tenant-1",
  projectId: "project-1",
  executionId: "execution-1",
  estimatedUnits: 100,
  estimatedDirectCost: {
    amount: 25,
    currency: "EGP",
  },
  commercialPrice: {
    amount: 100,
    currency: "EGP",
  },
  resourceLimit: 100,
  authorizationDecisionId: "auth-1",
  policyVersion: "policy-v1",
  pricingVersion: "pricing-v1",
  ...overrides,
});

describe("EconomicResourceGovernor", () => {
  it("allows a valid economic admission", async () => {
    const governor = new EconomicResourceGovernor(1000);

    const decision = await governor.admit(request());

    expect(decision.decision).toBe("ALLOW");
    expect(decision.calculatedGrossMargin).toBe(0.75);
  });

  it("denies a request above its resource limit", async () => {
    const governor = new EconomicResourceGovernor(1000);

    const decision = await governor.admit(
      request({
        estimatedUnits: 101,
        resourceLimit: 100,
      }),
    );

    expect(decision.decision).toBe("DENY");
    expect(decision.reason).toBe(
      "ESTIMATED_UNITS_EXCEED_RESOURCE_LIMIT",
    );
  });

  it("denies when global available resources are insufficient", async () => {
    const governor = new EconomicResourceGovernor(100);

    const decision = await governor.admit(request());

    expect(decision.decision).toBe("ALLOW");

    const reservation = await governor.reserve(request());

    expect(reservation.reservedUnits).toBe(100);

    const secondDecision = await governor.admit(
      request({
        executionId: "execution-2",
        estimatedUnits: 1,
        resourceLimit: 1,
      }),
    );

    expect(secondDecision.decision).toBe("DENY");
    expect(secondDecision.reason).toBe(
      "INSUFFICIENT_GLOBAL_RESOURCE",
    );
  });

  it("prevents global oversubscription", async () => {
    const governor = new EconomicResourceGovernor(100);

    const first = await governor.reserve(request());

    expect(first.reservedUnits).toBe(100);

    await expect(
      governor.reserve(
        request({
          executionId: "execution-2",
          estimatedUnits: 1,
          resourceLimit: 1,
        }),
      ),
    ).rejects.toThrow("INSUFFICIENT_GLOBAL_RESOURCE");
  });

  it("settles actual consumption and releases unused reservation", async () => {
    const governor = new EconomicResourceGovernor(1000);

    const reservation = await governor.reserve(request());

    const budget = await governor.settle({
      reservationId: reservation.reservationId,
      consumedUnits: 63,
    });

    expect(budget.allocatedUnits).toBe(1000);
    expect(budget.reservedUnits).toBe(0);
    expect(budget.consumedUnits).toBe(63);
    expect(budget.remainingUnits).toBe(937);
  });

  it("rejects consumption above the reservation", async () => {
    const governor = new EconomicResourceGovernor(1000);

    const reservation = await governor.reserve(request());

    await expect(
      governor.settle({
        reservationId: reservation.reservationId,
        consumedUnits: 101,
      }),
    ).rejects.toThrow("CONSUMPTION_EXCEEDS_RESERVATION");
  });

  it("does not double-consume an already settled reservation", async () => {
    const governor = new EconomicResourceGovernor(1000);

    const reservation = await governor.reserve(request());

    const first = await governor.settle({
      reservationId: reservation.reservationId,
      consumedUnits: 63,
    });

    const second = await governor.settle({
      reservationId: reservation.reservationId,
      consumedUnits: 63,
    });

    expect(first.consumedUnits).toBe(63);
    expect(second.consumedUnits).toBe(63);
    expect(second.remainingUnits).toBe(937);
  });

  it("rejects a replay with a different consumption amount", async () => {
    const governor = new EconomicResourceGovernor(1000);

    const reservation = await governor.reserve(request());

    await governor.settle({
      reservationId: reservation.reservationId,
      consumedUnits: 63,
    });

    await expect(
      governor.settle({
        reservationId: reservation.reservationId,
        consumedUnits: 64,
      }),
    ).rejects.toThrow("RESERVATION_ALREADY_SETTLED");
  });

  it("releases an active reservation", async () => {
    const governor = new EconomicResourceGovernor(1000);

    const reservation = await governor.reserve(request());

    const budget = await governor.release(reservation.reservationId);

    expect(budget.reservedUnits).toBe(0);
    expect(budget.consumedUnits).toBe(0);
    expect(budget.remainingUnits).toBe(1000);
  });

  it("fails closed for an unknown reservation", async () => {
    const governor = new EconomicResourceGovernor(1000);

    await expect(
      governor.settle({
        reservationId: "unknown",
        consumedUnits: 1,
      }),
    ).rejects.toThrow("UNKNOWN_RESERVATION");

    await expect(
      governor.release("unknown"),
    ).rejects.toThrow("UNKNOWN_RESERVATION");
  });


  it("denies when tenant quota is exceeded", async () => {
    const governor = new EconomicResourceGovernor({
      allocatedUnits: 1000,
      tenantLimits: {
        "tenant-1": 50,
      },
    });

    const decision = await governor.admit(
      request({
        estimatedUnits: 100,
      }),
    );

    expect(decision.decision).toBe("DENY");
    expect(decision.reason).toBe("TENANT_QUOTA_EXCEEDED");
  });

  it("denies when project quota is exceeded", async () => {
    const governor = new EconomicResourceGovernor({
      allocatedUnits: 1000,
      projectLimits: {
        "project-1": 50,
      },
    });

    const decision = await governor.admit(
      request({
        estimatedUnits: 100,
      }),
    );

    expect(decision.decision).toBe("DENY");
    expect(decision.reason).toBe("PROJECT_QUOTA_EXCEEDED");
  });

  it("fails closed when authorization is unknown", async () => {
    const governor = new EconomicResourceGovernor(1000);

    await expect(
      governor.admit(
        request({
          authorizationDecisionId: "",
        }),
      ),
    ).rejects.toThrow("UNKNOWN_AUTHORIZATION");
  });
});

  it("fails closed when the economic policy version is unknown", async () => {
    const policyResolver: EconomicPolicyResolver = {
      async resolve(policyVersion: string) {
        if (policyVersion === "economic-policy-v1") {
          return {
            policyVersion: "economic-policy-v1",
            minimumGrossMargin: 0.75,
          };
        }
        return undefined;
      },
    };

    const governor = new EconomicResourceGovernor({
      allocatedUnits: 1000,
      policyResolver,
    });

    const decision = await governor.admit(
      request({
        policyVersion: "unknown-policy",
        estimatedUnits: 100,
      }),
    );

    expect(decision.decision).toBe("DENY");
    expect(decision.reason).toBe("UNKNOWN_ECONOMIC_POLICY");
  });
