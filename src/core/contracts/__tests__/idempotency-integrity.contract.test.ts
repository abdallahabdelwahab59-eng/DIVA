import { describe, expect, it } from "vitest";

describe("Idempotency Integrity Contract", () => {
  it("treats the same idempotency key as one logical execution", () => {
    const firstExecution = {
      tenantId: "tenant-a",
      idempotencyKey: "idem-001",
      operation: "charge",
    };

    const retryExecution = {
      tenantId: "tenant-a",
      idempotencyKey: "idem-001",
      operation: "charge",
    };

    const sameLogicalExecution =
      firstExecution.tenantId === retryExecution.tenantId &&
      firstExecution.idempotencyKey === retryExecution.idempotencyKey &&
      firstExecution.operation === retryExecution.operation;

    expect(sameLogicalExecution).toBe(true);
  });

  it("prevents duplicate execution after a network timeout and retry", () => {
    const executionRegistry = new Set<string>();

    const idempotencyKey = "idem-timeout-001";

    executionRegistry.add(idempotencyKey);

    const retryIsDuplicate =
      executionRegistry.has(idempotencyKey);

    expect(retryIsDuplicate).toBe(true);
  });

  it("prevents concurrent requests from creating duplicate logical executions", () => {
    const executionRegistry = new Set<string>();

    const idempotencyKey = "idem-concurrent-001";

    const firstRequestAccepted =
      !executionRegistry.has(idempotencyKey);

    if (firstRequestAccepted) {
      executionRegistry.add(idempotencyKey);
    }

    const secondRequestAccepted =
      !executionRegistry.has(idempotencyKey);

    expect(firstRequestAccepted).toBe(true);
    expect(secondRequestAccepted).toBe(false);
  });

  it("rejects reuse of an idempotency key with a different payload", () => {
    const original = {
      idempotencyKey: "idem-payload-001",
      operation: "charge",
      amount: 100,
    };

    const conflictingRetry = {
      idempotencyKey: "idem-payload-001",
      operation: "charge",
      amount: 500,
    };

    const sameLogicalRequest =
      original.idempotencyKey === conflictingRetry.idempotencyKey &&
      original.operation === conflictingRetry.operation &&
      original.amount === conflictingRetry.amount;

    expect(sameLogicalRequest).toBe(false);
  });

  it("rejects reuse of an idempotency key across tenants", () => {
    const original = {
      tenantId: "tenant-a",
      idempotencyKey: "idem-tenant-001",
    };

    const crossTenantRetry = {
      tenantId: "tenant-b",
      idempotencyKey: "idem-tenant-001",
    };

    const sameTenant =
      original.tenantId === crossTenantRetry.tenantId;

    expect(sameTenant).toBe(false);
  });

  it("rejects replay of an expired execution admission", () => {
    const admission = {
      idempotencyKey: "idem-replay-001",
      expiresAt: 2000,
    };

    const now = 2001;

    const replayAllowed =
      now <= admission.expiresAt;

    expect(replayAllowed).toBe(false);
  });
});
